import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'
import prisma from '@/lib/prisma'
import { ADMIN_PAGE_SIZE } from '@/lib/admin'

interface RequestStats {
  time: string
  requests: number
  errors: number
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!isAdmin(session)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const range = searchParams.get('range') as '1h' | '24h' | '7d' | '30d' | null
    const includeStats = searchParams.get('stats') === 'true'
    const skip = (page - 1) * ADMIN_PAGE_SIZE
    

    // Calculate date range filter
    const now = new Date()
    let timestampFilter = {}

    if (range === '1h') {
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
      timestampFilter = { gte: oneHourAgo }
    } else if (range === '24h') {
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      timestampFilter = { gte: oneDayAgo }
    } else if (range === '7d') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      timestampFilter = { gte: sevenDaysAgo }
    } else if (range === '30d') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      timestampFilter = { gte: thirtyDaysAgo }
    }

    // Build the where clause
    const whereClause: any = {
      AND: []
    }

    // Add search conditions if search term exists
    if (search) {
      whereClause.AND.push({
        OR: [
          { path: { contains: search, mode: 'insensitive' as const } },
          { method: { contains: search, mode: 'insensitive' as const } },
          { userId: { contains: search, mode: 'insensitive' as const } },
          { ipAddress: { contains: search, mode: 'insensitive' as const } }
        ]
      })
    }

    // Add timestamp filter if range exists
    if (range) {
      whereClause.AND.push({
        timestamp: timestampFilter
      })
    }

    // If no search and no range, we need to provide an empty where clause
    if (whereClause.AND.length === 0) {
      delete whereClause.AND
    }

    // If stats are requested, calculate them
    if (includeStats) {
      const statsWhereClause = range ? { timestamp: timestampFilter } : {}

      const [
        allLogs,
        totalRequests,
        errorCount,
        avgResponseTime,
        hotPaths,
        errorsByPath
      ] = await Promise.all([
        // Get all logs for time-based calculations
        prisma.apiLog.findMany({
          where: statsWhereClause,
          orderBy: { timestamp: 'asc' },
          select: {
            timestamp: true,
            status: true,
            responseTime: true,
            path: true,
            method: true
          }
        }),
        // Total requests
        prisma.apiLog.count({
          where: statsWhereClause
        }),
        // Error count
        prisma.apiLog.count({
          where: {
            ...statsWhereClause,
            status: { gte: 400 }
          }
        }),
        // Average response time
        prisma.apiLog.aggregate({
          where: statsWhereClause,
          _avg: {
            responseTime: true
          }
        }),
        // Hot paths (most requested)
        prisma.apiLog.groupBy({
          by: ['path'],
          where: statsWhereClause,
          _count: {
            path: true
          },
          _avg: {
            responseTime: true
          },
          orderBy: {
            _count: {
              path: 'desc'
            }
          },
          take: 10
        }),
        // Errors by path
        prisma.apiLog.groupBy({
          by: ['path', 'status'],
          where: {
            ...statsWhereClause,
            status: { gte: 400 }
          },
          _count: {
            path: true
          },
          orderBy: {
            _count: {
              path: 'desc'
            }
          },
          take: 10
        })
      ])

      // Calculate requests over time (hourly buckets)
      const requestsOverTime: RequestStats[] = []
      const hourlyBuckets = new Map<string, { requests: number; errors: number }>()

      // Initialize hourly buckets for the last 24 hours
      for (let i = 23; i >= 0; i--) {
        const hour = new Date(now.getTime() - i * 60 * 60 * 1000)
        const hourKey = hour.getHours().toString().padStart(2, '0') + ':00'
        hourlyBuckets.set(hourKey, { requests: 0, errors: 0 })
      }

      // Fill buckets with actual data
      allLogs.forEach(log => {
        const hour = new Date(log.timestamp).getHours().toString().padStart(2, '0') + ':00'
        const bucket = hourlyBuckets.get(hour)
        if (bucket) {
          bucket.requests++
          if (log.status >= 400) {
            bucket.errors++
          }
        }
      })

      // Convert to array format for chart
      hourlyBuckets.forEach((data, time) => {
        requestsOverTime.push({ time, ...data })
      })

      const stats = {
        totalRequests,
        errorRate: totalRequests > 0 ? Math.round((errorCount / totalRequests) * 1000) / 10 : 0,
        avgResponseTime: Math.round(avgResponseTime._avg.responseTime || 0),
        hotPaths: hotPaths.map(item => ({
          path: item.path,
          count: item._count.path,
          avgResponseTime: Math.round(item._avg.responseTime || 0)
        })),
        errorsByPath: errorsByPath.map(item => ({
          path: item.path,
          errorCount: item._count.path,
          status: item.status
        })),
        requestsOverTime
      }

      return NextResponse.json({ stats })
    }

    // Regular logs fetch
    const [logs, total] = await Promise.all([
      prisma.apiLog.findMany({
        take: range ? undefined : ADMIN_PAGE_SIZE,
        skip: range ? undefined : skip,
        where: whereClause,
        orderBy: {
          timestamp: range ? 'asc' : 'desc'
        },
        select: {
          id: true,
          path: true,
          method: true,
          status: true,
          responseTime: true,
          timestamp: true,
          userId: true,
          userAgent: true,
          ipAddress: true,
          error: true
        }
      }),
      prisma.apiLog.count({
        where: whereClause
      })
    ])

    return NextResponse.json({
      logs,
      total,
      pages: range ? 1 : Math.ceil(total / ADMIN_PAGE_SIZE),
      currentPage: page
    })
  } catch (error) {
    console.error('Failed to fetch logs:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const log = await prisma.apiLog.create({
      data: {
        path: data.path,
        method: data.method,
        status: data.status,
        responseTime: data.responseTime,
        userId: data.userId,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        error: data.error,
        timestamp: new Date()
      }
    })

    return NextResponse.json(log)
  } catch (error) {
    console.error('Failed to create log:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}