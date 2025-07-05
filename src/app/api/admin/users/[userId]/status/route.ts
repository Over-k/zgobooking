import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'
import prisma from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!isAdmin(session)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { userId } = await params;

    const { isActive } = await request.json()
    if (typeof isActive !== 'boolean') {
      return new NextResponse('Invalid status', { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isVerified: isActive },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isVerified: true
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating user status:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 