import prisma from '@/lib/prisma'

// Cache for API stats with a 1-minute TTL
let statsCache = {
  data: null as any,
  timestamp: 0
}

const CACHE_TTL = 60 * 1000 // 1 minute

export async function logApiRequest(data: {
  path: string
  method: string
  status: number
  responseTime: number
  userId?: string
  userAgent?: string
  ipAddress?: string
  error?: string | null
}) {
  try {
    // Use Promise.race to add a timeout
    await Promise.race([
      prisma.apiLog.create({ data }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Logging timeout')), 1000)
      )
    ])
    
    // Invalidate cache when new data is logged
    statsCache.data = null
  } catch (error) {
    console.error('Failed to log API request:', error)
  }
}

export async function getApiStats() {
  const now = Date.now()
  
  // Return cached data if it's still valid
  if (statsCache.data && (now - statsCache.timestamp) < CACHE_TTL) {
    return statsCache.data
  }

  try {
    const [requests, errors, responseTimes] = await Promise.all([
      prisma.apiLog.count({
        where: {
          timestamp: {
            gte: new Date(now - 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.apiLog.count({
        where: {
          timestamp: {
            gte: new Date(now - 24 * 60 * 60 * 1000)
          },
          status: {
            gte: 400
          }
        }
      }),
      prisma.apiLog.aggregate({
        where: {
          timestamp: {
            gte: new Date(now - 24 * 60 * 60 * 1000)
          }
        },
        _avg: {
          responseTime: true
        }
      })
    ])

    const stats = {
      requests,
      errors,
      avgResponseTime: Math.round(responseTimes._avg.responseTime || 0)
    }

    // Update cache
    statsCache = {
      data: stats,
      timestamp: now
    }

    return stats
  } catch (error) {
    console.error('Failed to get API stats:', error)
    return {
      requests: 0,
      errors: 0,
      avgResponseTime: 0
    }
  }
} 