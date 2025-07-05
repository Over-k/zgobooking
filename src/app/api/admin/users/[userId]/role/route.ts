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

    const { role } = await request.json()
    if (!role || !['USER', 'HOST', 'ADMIN'].includes(role)) {
      return new NextResponse('Invalid role', { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isAdmin: role === 'ADMIN',
        isHost: role === 'HOST'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isAdmin: true,
        isHost: true
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating user role:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 