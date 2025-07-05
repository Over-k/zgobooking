import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    await prisma.apiLog.create({
      data: {
        path: data.path,
        method: data.method,
        status: data.status,
        responseTime: data.responseTime,
        userId: data.userId,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        error: data.error
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to log API request:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
} 