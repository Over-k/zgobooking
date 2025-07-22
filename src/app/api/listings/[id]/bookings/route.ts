import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "Listing id is required" }, { status: 400 });
    }
    const bookings = await prisma.booking.findMany({
      where: {
        listingId: id,
        status: { not: "cancelled" },
      },
      select: {
        id: true,
        checkInDate: true,
        checkOutDate: true,
        status: true,
      },
      orderBy: {
        checkInDate: "asc",
      },
    });
    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Error fetching bookings for listing:", error);
    return NextResponse.json({ error: "Failed to fetch bookings for listing" }, { status: 500 });
  }
} 