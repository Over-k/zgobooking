import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'
import prisma from '@/lib/prisma'

// Type definitions
interface TrafficDataPoint {
    timestamp: string
    count: number
}

interface TrafficResponse {
    data: TrafficDataPoint[]
    summary: {
        totalRequests: number
        timeRange: string
        intervalType: string
    }
}

type TimeRange = '1h' | '24h' | '7d' | '30d'
type IntervalType = 'minute' | 'hour' | 'day'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!isAdmin(session)) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const searchParams = request.nextUrl.searchParams
        const range = (searchParams.get('range') as TimeRange) || '24h'

        // Validate range parameter
        if (!['1h', '24h', '7d', '30d'].includes(range)) {
            return new NextResponse('Invalid range parameter', { status: 400 })
        }

        // Calculate date range with more precise timing
        const now = new Date()
        const startDate = getStartDate(now, range)
        const interval = getInterval(range)

        try {
            // Enhanced query with better error handling and performance
            const trafficData = await prisma.$queryRaw<Array<{
                time_period: Date
                count: bigint
            }>>`
                SELECT 
                    date_trunc(${interval}, "timestamp") as time_period,
                    COUNT(*) as count
                FROM "api_logs"
                WHERE "timestamp" >= ${startDate}
                    AND "timestamp" <= ${now}
                GROUP BY time_period
                ORDER BY time_period ASC
            `

            // Fill gaps in data to ensure consistent time series
            const filledData = fillTimeGaps(
                trafficData.map(item => ({
                    timestamp: item.time_period.toISOString(),
                    count: Number(item.count)
                })),
                startDate,
                now,
                interval
            )

            // Calculate summary statistics
            const totalRequests = trafficData.reduce((sum, item) => sum + Number(item.count), 0)

            const response: TrafficResponse = {
                data: filledData,
                summary: {
                    totalRequests,
                    timeRange: range,
                    intervalType: interval
                }
            }

            // Set cache headers for better performance
            return new NextResponse(JSON.stringify(response), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'public, max-age=60',
                }
            })

        } catch (dbError) {
            console.error('Database query failed:', dbError)
            return new NextResponse('Database query failed', { status: 500 })
        }

    } catch (error) {
        console.error('Failed to fetch traffic data:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}

/**
 * Calculate start date based on time range
 */
function getStartDate(now: Date, range: TimeRange): Date {
    const startDate = new Date(now)

    switch (range) {
        case '1h':
            startDate.setHours(now.getHours() - 1)
            break
        case '24h':
            startDate.setDate(now.getDate() - 1)
            break
        case '7d':
            startDate.setDate(now.getDate() - 7)
            break
        case '30d':
            startDate.setDate(now.getDate() - 30)
            break
    }

    return startDate
}

/**
 * Determine interval type based on range
 */
function getInterval(range: TimeRange): IntervalType {
    switch (range) {
        case '1h':
            return 'minute'
        case '24h':
            return 'hour'
        case '7d':
            return 'hour'
        case '30d':
            return 'hour'
        default:
            return 'hour'
    }
}

/**
 * Fill gaps in time series data to ensure consistent intervals
 */
function fillTimeGaps(
    data: TrafficDataPoint[],
    startDate: Date,
    endDate: Date,
    interval: IntervalType
): TrafficDataPoint[] {
    if (data.length === 0) return []

    const filledData: TrafficDataPoint[] = []
    const dataMap = new Map(data.map(item => [item.timestamp, item.count]))

    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
        const timestamp = getIntervalTimestamp(currentDate, interval)
        const count = dataMap.get(timestamp) || 0

        filledData.push({
            timestamp,
            count
        })

        // Increment by interval
        incrementDate(currentDate, interval)
    }

    return filledData
}

/**
 * Get timestamp string for interval
 */
function getIntervalTimestamp(date: Date, interval: IntervalType): string {
    const d = new Date(date)

    switch (interval) {
        case 'minute':
            d.setSeconds(0, 0)
            break
        case 'hour':
            d.setMinutes(0, 0, 0)
            break
        case 'day':
            d.setHours(0, 0, 0, 0)
            break
    }

    return d.toISOString()
}

/**
 * Increment date by interval
 */
function incrementDate(date: Date, interval: IntervalType): void {
    switch (interval) {
        case 'minute':
            date.setMinutes(date.getMinutes() + 1)
            break
        case 'hour':
            date.setHours(date.getHours() + 1)
            break
        case 'day':
            date.setDate(date.getDate() + 1)
            break
    }
}