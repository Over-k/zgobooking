import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const listings = await prisma.listing.findMany({
      where: { hostId: id },
      include: {
        host: {
          include: {
            hostInfo: true
          }
        },
        location: true,
        images: true,
        amenities: true,
        reviews: {
          include: {
            user: true
          }
        },
        houseRules: true,
        safetyFeatures: true,
        availableDates: true,
        cancellationPolicy: true,
      }
    });

    return NextResponse.json(listings);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
} 