import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const createBookingSchema = z.object({
  listingId: z.string(),
  checkInDate: z.string().datetime(),
  checkOutDate: z.string().datetime(),
  adults: z.number().min(1),
  children: z.number().min(0),
  infants: z.number().min(0),
  pets: z.number().min(0),
  nightlyRate: z.number().positive(),
  cleaningFee: z.number().min(0),
  serviceFee: z.number().min(0),
  taxes: z.number().min(0),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email(),
  specialRequests: z.string().optional(),
  paymentMethodId: z.string().nullable().optional(), // <-- added
  paymentType: z.enum(["card", "paypal", "p2p"]).optional(), // <-- added
});

// GET /api/bookings - Get all bookings for the authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
      const bookings = await prisma.booking.findMany({
        where: { 
          OR: [
            { guestId: session.user.id },
            { hostId: session.user.id }
          ]
         },
        include: {
          listing: {
            include: {
              location: true,
              images: {
                take: 1,
              },
            },
          },
          host: true,
          guest: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create a new booking
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const body = await request.json();
    const validatedData = createBookingSchema.parse(body);
    if(!session.user.email){
      return NextResponse.json(
        {error: "try to logout"}
      );
    }
    const user = await prisma.user.findUnique({ where: { email: session.user.email || "" } });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const listing = await prisma.listing.findUnique({
      where: { id: validatedData.listingId },
      select: { hostId: true }
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Prevent double bookings: check for overlapping bookings
    const overlappingBooking = await prisma.booking.findFirst({
      where: {
        listingId: validatedData.listingId,
        status: { not: "cancelled" }, // ignore cancelled bookings
        checkInDate: { lte: new Date(validatedData.checkOutDate) },
        checkOutDate: { gte: new Date(validatedData.checkInDate) },
      },
    });
    if (overlappingBooking) {
      return NextResponse.json(
        { error: "This listing is already booked for the selected dates." },
        { status: 409 }
      );
    }

    const nights = Math.ceil(
      (new Date(validatedData.checkOutDate).getTime() -
        new Date(validatedData.checkInDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Payment method validation
    let paymentMethodId: string | null = null;
    if (validatedData.paymentType === "p2p" || !validatedData.paymentMethodId) {
      paymentMethodId = null;
    } else if (validatedData.paymentMethodId) {
      // Validate the payment method belongs to the user
      const paymentMethod = await prisma.paymentMethod.findUnique({
        where: { id: validatedData.paymentMethodId },
      });
      if (!paymentMethod || paymentMethod.userId !== user.id) {
        return NextResponse.json(
          { error: "Invalid payment method" },
          { status: 400 }
        );
      }
      paymentMethodId = validatedData.paymentMethodId;
    }

    const bookingData = {
      listingId: validatedData.listingId,
      guestId: user.id,
      hostId: listing.hostId,
      checkInDate: new Date(validatedData.checkInDate),
      checkOutDate: new Date(validatedData.checkOutDate),
      adults: validatedData.adults,
      children: validatedData.children,
      infants: validatedData.infants,
      pets: validatedData.pets,
      nightlyRate: validatedData.nightlyRate,
      nights,
      cleaningFee: validatedData.cleaningFee,
      serviceFee: validatedData.serviceFee,
      taxes: validatedData.taxes,
      total: validatedData.nightlyRate * nights +
        validatedData.cleaningFee +
        validatedData.serviceFee +
        validatedData.taxes,
      currency: "USD",
      specialRequests: validatedData.specialRequests || "",
      status: "pending",
      paymentStatus: validatedData.paymentType === "p2p" ? "pending" : "pending", // can be extended for paid
      contactPhone: validatedData.contactPhone || "",
      contactEmail: validatedData.contactEmail,
      paymentMethodId: paymentMethodId, // <-- added
    };

    const booking = await prisma.booking.create({
      data: bookingData,
      include: {
        listing: {
          include: {
            location: true,
            images: true,
          },
        },
      },
    });
    await prisma.notification.create({
      data: {
        userId: booking.hostId,
        type: 'booking_request',
        message: `You have received a new booking request from ${session?.user?.firstName} for ${booking.listing.title}.`,
        isRead: false,
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}