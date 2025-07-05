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

    const nights = Math.ceil(
      (new Date(validatedData.checkOutDate).getTime() -
        new Date(validatedData.checkInDate).getTime()) / (1000 * 60 * 60 * 24)
    );

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
      paymentStatus: "pending",
      contactPhone: validatedData.contactPhone || "",
      contactEmail: validatedData.contactEmail
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