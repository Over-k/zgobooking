import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { redis } from '@/lib/redis'
import { isAdmin } from '@/lib/admin'

const CACHE_KEY = 'admin:stats'
const CACHE_TTL = 60 * 5 // 5 minutes

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!isAdmin(session)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Try to get cached stats
    const cached = await redis?.get(CACHE_KEY)
    if (cached) {
      return NextResponse.json(JSON.parse(cached))
    }

    // Fetch fresh stats
    const [
      totalUsers,
      totalListings,
      totalBookings,
      pendingReviews,
      pendingListings,
      activeUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.booking.count(),
      prisma.review.count(),
      prisma.listing.count({
        where: { status: 'pending' }
      }),
      prisma.user.count({
        where: {
          joinDate: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      })
    ])

    const stats = {
      totalUsers,
      totalListings,
      totalBookings,
      pendingReviews,
      pendingListings,
      activeUsers,
    }

    // Cache the stats
    await redis?.set(CACHE_KEY, JSON.stringify(stats), 'EX', CACHE_TTL)

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Failed to fetch admin stats:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 