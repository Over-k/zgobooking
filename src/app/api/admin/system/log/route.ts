import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!isAdmin(session)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const [logs, total] = await Promise.all([
      prisma.apiLog.findMany({
        take: limit,
        skip: offset,
        orderBy: {
          timestamp: 'desc'
        }
      }),
      prisma.apiLog.count()
    ])

    return NextResponse.json({
      logs,
      total,
      limit,
      offset
    })
  } catch (error) {
    console.error('Failed to fetch API logs:', error)
    return new NextResponse('Failed to fetch logs', { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    if (!data.path || !data.method || typeof data.status !== 'number') {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    await prisma.apiLog.create({
      data: {
        path: data.path,
        method: data.method,
        status: data.status,
        responseTime: data.responseTime || 0,
        userId: data.userId || null,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        error: data.error
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to log API request:', error)
    return new NextResponse('Failed to log request', { status: 500 })
  }
}