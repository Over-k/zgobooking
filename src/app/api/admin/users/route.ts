import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { isAdmin } from '@/lib/admin'
import { ADMIN_PAGE_SIZE } from '@/lib/admin'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!isAdmin(session)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const skip = (page - 1) * ADMIN_PAGE_SIZE

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        take: ADMIN_PAGE_SIZE,
        skip,
        where: {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
        include: {
          hostInfo: true,
          _count: {
            select: {
              listings: true,
              reviewsGiven: true,
              reviewsReceived: true,
              guestBookings: true,
              hostBookings: true,
            },
          },
        },
        orderBy: {
          joinDate: 'desc',
        },
      }),
      prisma.user.count({
        where: {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
      }),
    ])

    return NextResponse.json({
      users,
      total,
      pages: Math.ceil(total / ADMIN_PAGE_SIZE),
      currentPage: page,
    })
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 