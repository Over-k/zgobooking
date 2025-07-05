import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'
import { redis } from '@/lib/redis'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!isAdmin(session)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    await redis?.flushall()
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to flush cache:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 