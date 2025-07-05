import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const sessionId = request.headers.get("x-session-id");
    
    if (!session?.user?.id || session.user.id !== sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);

    // Get the last 30 days of data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const bookings = await prisma.booking.findMany({
      where: {
        hostId: session.user.id,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        createdAt: true,
        total: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Group data by date
    const groupedData = bookings.reduce((acc: any, booking) => {
      const date = booking.createdAt.toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          revenue: 0,
          bookings: 0,
        };
      }
      acc[date].revenue += booking.total || 0;
      acc[date].bookings += 1;
      return acc;
    }, {});

    // Convert to array and fill in missing dates
    const data = Object.values(groupedData);
    const dates = Object.keys(groupedData);
    const allDates = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split("T")[0];
    }).reverse();

    // Fill in missing dates with zero values
    const completeData = allDates.map((date) => {
      if (dates.includes(date)) {
        return groupedData[date];
      }
      return {
        date,
        revenue: 0,
        bookings: 0,
      };
    });

    return NextResponse.json(completeData);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
} 