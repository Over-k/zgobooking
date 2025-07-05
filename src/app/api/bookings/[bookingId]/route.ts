// api/bookings/[bookingId]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ bookingId: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId } = await params;
    const body = await request.json();

    try {
        // First, verify the booking belongs to the user
        const existingBooking = await prisma.booking.findUnique({
            where: { id: bookingId },
            select: {
                guestId: true,
                status: true,
                nightlyRate: true,
                cleaningFee: true,
                serviceFee: true,
                taxes: true
            }
        });

        if (!existingBooking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        if (existingBooking.guestId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Only allow editing for pending or approved bookings
        if (!['pending', 'approved'].includes(existingBooking.status)) {
            return NextResponse.json(
                { error: "Booking cannot be edited in its current status" },
                { status: 400 }
            );
        }

        // Calculate new pricing if dates changed
        let updatedData = { ...body };

        if (body.checkInDate && body.checkOutDate) {
            const checkIn = new Date(body.checkInDate);
            const checkOut = new Date(body.checkOutDate);
            const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

            const subtotal = existingBooking.nightlyRate * nights;
            const total = subtotal + existingBooking.cleaningFee + existingBooking.serviceFee + existingBooking.taxes;

            updatedData = {
                ...updatedData,
                nights,
                total,
                status: 'pending', // Reset to pending for host approval
                updatedAt: new Date()
            };
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: updatedData,
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
        await prisma.notification.create({
            data:{
                userId: updatedBooking.listing.hostId,
                type: 'booking_updated',
                message: `Booking #${updatedBooking.id} has been updated by ${updatedBooking.guest.firstName} ${updatedBooking.guest.lastName}.`,
                isRead: false
            }
        })
        return NextResponse.json(updatedBooking);
    } catch (error) {
        console.error("Error updating booking:", error);
        return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
    }
}