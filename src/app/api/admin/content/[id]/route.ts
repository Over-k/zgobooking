import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { isAdmin } from '@/lib/admin'
import { redis } from '@/lib/redis'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions)
    if (!isAdmin(session)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const contentId = id
    const { action } = await request.json()

    if (!['approve', 'reject'].includes(action)) {
      return new NextResponse('Invalid action', { status: 400 })
    }

    // Get the content first to determine its type
    const content = await prisma.listing.findUnique({
      where: { id: contentId },
      include: {
        reviews: true,
      },
    })

    if (!content) {
      return new NextResponse('Content not found', { status: 404 })
    }

    await prisma.$transaction(async (tx) => {
      if (content.reviews.length > 0) {
        if (action === 'approve') {
          await tx.review.update({
            where: { id: content.reviews[0].id },
            data: { isPublic: true },
          })
        } else {
          await tx.review.delete({
            where: { id: content.reviews[0].id },
          })
        }
      } else if (content.reviews.length === 0) {
        if (action === 'approve') {
          await tx.listing.update({
            where: { id: content.id },
            data: { status: 'active' },
          })
        } else {
          await tx.listing.delete({
            where: { id: content.id },
          })
        }
      }

      // Mark the flagged content as resolved
      await tx.listing.update({
        where: { id: contentId },
        data: {
          status: 'active'
        },
      })
    })

    // Invalidate relevant caches
    if (redis) {
      await Promise.all([
        redis.del('admin:stats'),
        redis.del(`content:${contentId}`),
      ])
    }
    

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Failed to process content:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 