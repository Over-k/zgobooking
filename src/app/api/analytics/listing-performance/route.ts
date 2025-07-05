import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const year = new Date().getFullYear();
    // Get all bookings for the current year, including listing info
    const bookings = await prisma.booking.findMany({
      where: {
        checkInDate: {
          gte: new Date(`${year}-01-01T00:00:00.000Z`),
          lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
        },
      },
      select: {
        total: true,
        listing: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Aggregate bookings and revenue by listing
    const performanceMap = new Map();
    bookings.forEach((b) => {
      if (!b.listing) return;
      const key = b.listing.id;
      if (!performanceMap.has(key)) {
        performanceMap.set(key, {
          name: b.listing.title,
          bookings: 0,
          revenue: 0,
        });
      }
      const entry = performanceMap.get(key);
      entry.bookings += 1;
      entry.revenue += Number(b.total) || 0;
    });

    const result = Array.from(performanceMap.values());
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching listing performance:', error);
    return NextResponse.json({ error: 'Failed to fetch listing performance' }, { status: 500 });
  }
} 