import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'
import prisma from '@/lib/prisma'
import fs from 'fs'
import path from 'path'
import { createClient } from 'redis'

const redisClient = createClient({
  url: process.env.REDIS_URL
})

redisClient.on('error', (err) => console.error('Redis Client Error', err))

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!isAdmin(session)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get Redis status
    const redisStatus = {
      connected: false,
      memory: {
        used: 0,
        total: 0
      }
    }

    try {
      await redisClient.connect()
      await redisClient.ping()
      redisStatus.connected = true
      
      // Get Redis memory info
      const info = await redisClient.info('memory')
      const usedMatch = info.match(/used_memory:(\d+)/)
      const totalMatch = info.match(/maxmemory:(\d+)/)
      
      if (usedMatch) {
        redisStatus.memory.used = Math.round(parseInt(usedMatch[1]) / (1024 * 1024)) // Convert to MB
      }
      if (totalMatch) {
        redisStatus.memory.total = Math.round(parseInt(totalMatch[1]) / (1024 * 1024)) // Convert to MB
      }
    } catch (error) {
      console.error('Redis connection error:', error)
    } finally {
      await redisClient.disconnect()
    }

    // Get database status
    const dbStatus = {
      connected: false,
      size: 0,
      lastBackup: null as string | null
    }

    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`
      dbStatus.connected = true

      // Get database size
      const dbSize = await prisma.$queryRaw<[{ size: bigint }]>`
        SELECT pg_database_size(current_database()) as size
      `
      dbStatus.size = Math.round(Number(dbSize[0].size) / (1024 * 1024)) // Convert to MB

      // Get last backup time using fs module
      const backupDir = path.join(process.cwd(), 'backups')
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true })
      }

      const files = fs.readdirSync(backupDir)
        .filter(file => file.startsWith('backup-'))
        .map(file => ({
          name: file,
          time: fs.statSync(path.join(backupDir, file)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time)

      if (files.length > 0) {
        dbStatus.lastBackup = files[0].name
      }
    } catch (error) {
      console.error('Database connection error:', error)
      throw error // Re-throw to handle in the outer catch block
    }

    // Get API stats (last 24 hours)
    const apiStats = {
      requests: 0,
      errors: 0,
      avgResponseTime: 0
    }

    try {
      const [requests, errors, responseTimes] = await Promise.all([
        prisma.apiLog.count({
          where: {
            timestamp: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          }
        }),
        prisma.apiLog.count({
          where: {
            timestamp: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            },
            status: {
              gte: 400
            }
          }
        }),
        prisma.apiLog.aggregate({
          where: {
            timestamp: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          },
          _avg: {
            responseTime: true
          }
        })
      ])

      apiStats.requests = requests
      apiStats.errors = errors
      apiStats.avgResponseTime = Math.round(responseTimes._avg.responseTime || 0)
    } catch (error) {
      console.error('API stats error:', error)
    }

    return NextResponse.json({
      redis: redisStatus,
      database: dbStatus,
      api: apiStats
    })
  } catch (error) {
    console.error('System status error:', error)
    return new NextResponse('Failed to get system status', { status: 500 })
  }
} 