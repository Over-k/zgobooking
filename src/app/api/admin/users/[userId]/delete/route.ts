import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { isAdmin } from '@/lib/admin'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!isAdmin(session)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { userId } = await params;

    // Use a transaction to ensure all related data is deleted
    await prisma.$transaction(async (tx) => {
      // Delete user's bookings
      await tx.booking.deleteMany({
        where: {
          OR: [
            { guestId: userId },
            { hostId: userId }
          ]
        }
      })

      // Delete user's reviews
      await tx.review.deleteMany({
        where: { userId },
      })

      // Delete user's listings
      await tx.listing.deleteMany({
        where: { hostId: userId },
      })

      // Delete user's host info if exists
      await tx.hostInfo.deleteMany({
        where: { userId },
      })

      // Finally, delete the user
      await tx.user.delete({
        where: { id: userId },
      })
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Failed to delete user:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 