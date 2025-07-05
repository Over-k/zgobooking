import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'
import prisma from '@/lib/prisma'

// GET /api/admin/host-requests
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!isAdmin(session)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const requests = await prisma.hostRequest.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ requests })
  } catch (error) {
    console.error('Failed to fetch host requests:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}