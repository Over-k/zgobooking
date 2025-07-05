import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export async function GET() {
  try {
    const year = new Date().getFullYear();
    // Get all bookings for the current year
    const bookings = await prisma.booking.findMany({
      where: {
        checkInDate: {
          gte: new Date(`${year}-01-01T00:00:00.000Z`),
          lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
        },
      },
      select: {
        checkInDate: true,
        total: true,
      },
    });

    // Aggregate bookings and revenue by month
    const monthly = Array(12).fill(0).map((_, i) => ({
      month: MONTHS[i],
      bookings: 0,
      revenue: 0,
    }));

    bookings.forEach((b) => {
      const monthIdx = new Date(b.checkInDate).getMonth();
      monthly[monthIdx].bookings += 1;
      monthly[monthIdx].revenue += Number(b.total) || 0;
    });

    return NextResponse.json(monthly);
  } catch (error) {
    console.error('Error fetching monthly bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch monthly bookings' }, { status: 500 });
  }
}
