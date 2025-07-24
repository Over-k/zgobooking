import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { redis } from '@/lib/redis'

const CACHE_TTL = 3600 // 1 hour in seconds

interface AnalyticsData {
  users: MonthlyData[]
  bookings: MonthlyData[]
  hostRequests: MonthlyData[]
  reviews: MonthlyData[]
  favorites: MonthlyData[]
  messages: MonthlyData[]
  listings: MonthlyData[]
}

interface MonthlyData {
  month: string
  count: number
  date: string
}

interface QueryResult {
  month: Date
  count: number
}

type TimeRange = 'month' | 'year' | 'lifetime'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange: TimeRange = (searchParams.get('range') as TimeRange) || 'year'

    const CACHE_KEY = `analytics_data_${timeRange}`

    // Try to get cached data first
    const cachedData = await redis?.get(CACHE_KEY)
    if (cachedData) {
      return NextResponse.json({
        success: true,
        data: JSON.parse(cachedData),
        cached: true,
        timeRange
      })
    }

    // Calculate date range based on filter
    const endDate = new Date()
    const startDate = new Date()

    let months: string[] = []
    let groupByFormat = 'month'

    switch (timeRange) {
      case 'month':
        // Last 30 days, group by day
        startDate.setDate(endDate.getDate() - 29)
        groupByFormat = 'day'

        // Generate all days in the range
        const currentDate = new Date(startDate)
        while (currentDate <= endDate) {
          months.push(currentDate.toISOString().slice(0, 10)) // YYYY-MM-DD format
          currentDate.setDate(currentDate.getDate() + 1)
        }
        break

      case 'year':
        // Last 12 months
        startDate.setMonth(endDate.getMonth() - 11)
        startDate.setDate(1)
        groupByFormat = 'month'

        // Generate all months in the range
        const monthDate = new Date(startDate)
        while (monthDate <= endDate) {
          months.push(monthDate.toISOString().slice(0, 7)) // YYYY-MM format
          monthDate.setMonth(monthDate.getMonth() + 1)
        }
        break

      case 'lifetime':
        // Get the earliest record to determine start date
        const earliestUser = await prisma.user.findFirst({
          orderBy: { joinDate: 'asc' },
          select: { joinDate: true }
        })

        if (earliestUser) {
          startDate.setTime(earliestUser.joinDate.getTime())
          startDate.setDate(1) // Start from beginning of month
        } else {
          // Fallback to 2 years ago if no users found
          startDate.setFullYear(endDate.getFullYear() - 2)
          startDate.setMonth(0)
          startDate.setDate(1)
        }

        groupByFormat = 'month'

        // Generate all months from start to end
        const lifetimeDate = new Date(startDate)
        while (lifetimeDate <= endDate) {
          months.push(lifetimeDate.toISOString().slice(0, 7)) // YYYY-MM format
          lifetimeDate.setMonth(lifetimeDate.getMonth() + 1)
        }
        break
    }

    // Fetch data for each model with dynamic date truncation
    const [
      usersData,
      bookingsData,
      hostRequestsData,
      reviewsData,
      favoritesData,
      messagesData,
      listingsData
    ] = await Promise.all([

      prisma.$queryRawUnsafe(`
              SELECT 
                DATE_TRUNC('${groupByFormat}', "joinDate") as month,
                COUNT(*)::int as count
              FROM users
              WHERE "joinDate" >= '${startDate.toISOString()}'
                AND "joinDate" <= '${endDate.toISOString()}'
              GROUP BY DATE_TRUNC('${groupByFormat}', "joinDate")
              ORDER BY month
            `) as Promise<QueryResult[]>,

      prisma.$queryRawUnsafe(`
              SELECT 
                DATE_TRUNC('${groupByFormat}', "createdAt") as month,
                COUNT(*)::int as count
              FROM bookings
              WHERE "createdAt" >= '${startDate.toISOString()}'
                AND "createdAt" <= '${endDate.toISOString()}'
              GROUP BY DATE_TRUNC('${groupByFormat}', "createdAt")
              ORDER BY month
            `) as Promise<QueryResult[]>,

      prisma.$queryRawUnsafe(`
              SELECT 
                DATE_TRUNC('${groupByFormat}', "createdAt") as month,
                COUNT(*)::int as count
              FROM host_requests
              WHERE "createdAt" >= '${startDate.toISOString()}'
                AND "createdAt" <= '${endDate.toISOString()}'
              GROUP BY DATE_TRUNC('${groupByFormat}', "createdAt")
              ORDER BY month
            `) as Promise<QueryResult[]>,

      prisma.$queryRawUnsafe(`
              SELECT 
                DATE_TRUNC('${groupByFormat}', "createdAt") as month,
                COUNT(*)::int as count
              FROM reviews
              WHERE "createdAt" >= '${startDate.toISOString()}'
                AND "createdAt" <= '${endDate.toISOString()}'
              GROUP BY DATE_TRUNC('${groupByFormat}', "createdAt")
              ORDER BY month
            `) as Promise<QueryResult[]>,

      prisma.$queryRawUnsafe(`
              SELECT 
                DATE_TRUNC('${groupByFormat}', "createdAt") as month,
                COUNT(*)::int as count
              FROM favorites
              WHERE "createdAt" >= '${startDate.toISOString()}'
                AND "createdAt" <= '${endDate.toISOString()}'
              GROUP BY DATE_TRUNC('${groupByFormat}', "createdAt")
              ORDER BY month
            `) as Promise<QueryResult[]>,

      prisma.$queryRawUnsafe(`
              SELECT 
                DATE_TRUNC('${groupByFormat}', "createdAt") as month,
                COUNT(*)::int as count
              FROM messages
              WHERE "createdAt" >= '${startDate.toISOString()}'
                AND "createdAt" <= '${endDate.toISOString()}'
              GROUP BY DATE_TRUNC('${groupByFormat}', "createdAt")
              ORDER BY month
            `) as Promise<QueryResult[]>,

      prisma.$queryRawUnsafe(`
              SELECT 
                DATE_TRUNC('${groupByFormat}', "createdAt") as month,
                COUNT(*)::int as count
              FROM listings
              WHERE "createdAt" >= '${startDate.toISOString()}'
                AND "createdAt" <= '${endDate.toISOString()}'
              GROUP BY DATE_TRUNC('${groupByFormat}', "createdAt")
              ORDER BY month
            `) as Promise<QueryResult[]>
    ])


    // Helper function to format data
    const formatData = (rawData: QueryResult[]): MonthlyData[] => {
      const dataMap = new Map<string, number>()

      // Fill map with actual data
      rawData.forEach((item: QueryResult) => {
        let key: string
        if (groupByFormat === 'day') {
          key = new Date(item.month).toISOString().slice(0, 10) // YYYY-MM-DD
        } else {
          key = new Date(item.month).toISOString().slice(0, 7) // YYYY-MM
        }
        dataMap.set(key, item.count)
      })

      // Generate complete dataset with all time periods
      return months.map(period => {
        let displayLabel: string
        if (groupByFormat === 'day') {
          const date = new Date(period + 'T00:00:00')
          displayLabel = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          })
        } else {
          const date = new Date(period + '-01')
          displayLabel = date.toLocaleDateString('en-US', {
            month: 'short',
            year: timeRange === 'lifetime' ? 'numeric' : '2-digit'
          })
        }

        return {
          month: displayLabel,
          count: dataMap.get(period) || 0,
          date: period
        }
      })
    }

    const analyticsData: AnalyticsData = {
      users: formatData(usersData),
      bookings: formatData(bookingsData),
      hostRequests: formatData(hostRequestsData),
      reviews: formatData(reviewsData),
      favorites: formatData(favoritesData),
      messages: formatData(messagesData),
      listings: formatData(listingsData)
    }

    // Cache the data
    await redis?.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(analyticsData))

    return NextResponse.json({
      success: true,
      data: analyticsData,
      cached: false,
      timeRange
    })

  } catch (error) {
    console.error('Analytics API Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch analytics data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}