import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ bookingId: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId } = await params;
    const body = await request.json();
    const { cancellationReason, refundAmount } = body;

    try {
        // First, verify the booking belongs to the user and can be cancelled
        const existingBooking = await prisma.booking.findUnique({
            where: { id: bookingId },
            select: {
                guestId: true,
                status: true,
                total: true,
                checkInDate: true,
                paymentStatus: true
            }
        });

        if (!existingBooking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        if (existingBooking.guestId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Only allow cancellation for pending or approved bookings
        if (!['pending', 'approved'].includes(existingBooking.status)) {
            return NextResponse.json(
                { error: "Booking cannot be cancelled in its current status" },
                { status: 400 }
            );
        }

        // Calculate refund amount based on cancellation policy
        const calculateRefund = (checkInDate: Date, total: number) => {
            const now = new Date();
            const daysUntilCheckIn = Math.ceil((checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            if (daysUntilCheckIn >= 14) {
                return total; // Full refund
            } else if (daysUntilCheckIn >= 7) {
                return total * 0.5; // 50% refund
            } else if (daysUntilCheckIn >= 1) {
                return total * 0.1; // 10% refund (fees only)
            } else {
                return 0; // No refund
            }
        };

        const calculatedRefund = calculateRefund(existingBooking.checkInDate, existingBooking.total);
        const finalRefundAmount = refundAmount !== undefined ? refundAmount : calculatedRefund;

        // Determine new payment status
        let newPaymentStatus = existingBooking.paymentStatus;
        if (finalRefundAmount > 0) {
            if (finalRefundAmount >= existingBooking.total) {
                newPaymentStatus = 'refunded';
            } else {
                newPaymentStatus = 'partially_refunded';
            }
        }

        const cancelledBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: 'cancelled',
                cancelledBy: 'guest',
                cancelledAt: new Date(),
                cancellationReason: cancellationReason || 'No reason provided',
                refundAmount: finalRefundAmount,
                paymentStatus: newPaymentStatus,
                updatedAt: new Date()
            },
            include: {
                listing: {
                    include: {
                        images: true,
                        location: true
                    }
                },
                guest: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                host: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });

        // Here you would typically integrate with a payment processor
        // to handle the actual refund process
        // Example: await processRefund(finalRefundAmount, existingBooking.paymentMethodId);
        await prisma.notification.create({
            data: {
                userId: cancelledBooking.hostId,
                type: 'booking_cancelled',
                message: `Your booking with ${cancelledBooking.guest.firstName} has been cancelled. Reason: ${cancellationReason}. Refund amount: $${finalRefundAmount.toFixed(2)}. Booking ID: ${cancelledBooking.id}`,
                isRead: false
            }
        });
        return NextResponse.json({
            booking: cancelledBooking,
            refundAmount: finalRefundAmount,
            message: finalRefundAmount > 0
                ? `Booking cancelled successfully. Refund of $${finalRefundAmount.toFixed(2)} will be processed.`
                : 'Booking cancelled successfully.'
        });
    } catch (error) {
        console.error("Error cancelling booking:", error);
        return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 });
    }
}