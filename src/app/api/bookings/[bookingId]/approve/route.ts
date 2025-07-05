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

    try {
        const existingBooking = await prisma.booking.findUnique({
            where: { id: bookingId },
            select: {
                hostId: true,
                guestId: true,
                status: true
            }
        });

        if (!existingBooking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        if (existingBooking.hostId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        if (!['pending'].includes(existingBooking.status)) {
            return NextResponse.json(
                { error: "Booking cannot be approved in its current status" },
                { status: 400 }
            );
        }

        await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: 'confirmed',
            },
        });

        await prisma.notification.create({
            data: {
                userId: existingBooking.guestId,
                type: '',
                message: `Your booking with ID ${bookingId} has been approved.`,
                isRead: false
            }
        });
        return NextResponse.json({ message: "Booking approved successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error approving booking:", error);
        return NextResponse.json({ error: "Failed to approve booking" }, { status: 500 });
    }
}