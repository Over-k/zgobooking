import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
import { pipeline } from 'stream/promises'
import { createGzip, createGunzip } from 'zlib'

const execAsync = promisify(exec)
const MAX_BACKUPS = 5 
const BACKUP_DIR = path.join(process.cwd(), 'backups')

interface BackupInfo {
  filename: string
  size: number
  timestamp: string
  compressed: boolean
}


export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!isAdmin(session)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true })
    }

    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup-'))
      .map(file => {
        const stats = fs.statSync(path.join(BACKUP_DIR, file))
        return {
          filename: file,
          size: stats.size,
          timestamp: stats.mtime.toISOString(),
          compressed: file.endsWith('.gz')
        }
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({ backups: files })
  } catch (error) {
    console.error('Failed to list backups:', error)
    return new NextResponse('Failed to list backups', { status: 500 })
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!isAdmin(session)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true })
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.sql`)
    const compressedFile = `${backupFile}.gz`

    // Create backup using a temporary file in the container
    const tempBackupFile = `/tmp/backup-${timestamp}.sql`
    await execAsync(`docker exec zgobooking-postgres-dev pg_dump -U postgres -F p -f "${tempBackupFile}"`)
    
    // Copy the backup file from the container to the host
    await execAsync(`docker cp zgobooking-postgres-dev:${tempBackupFile} "${backupFile}"`)
    
    // Clean up the temporary file in the container
    await execAsync(`docker exec zgobooking-postgres-dev rm ${tempBackupFile}`)

    // Compress backup
    await pipeline(
      fs.createReadStream(backupFile),
      createGzip(),
      fs.createWriteStream(compressedFile)
    )

    // Verify backup
    try {
      const tempVerifyFile = `/tmp/verify-${timestamp}.sql`
      await execAsync(`docker cp "${backupFile}" zgobooking-postgres-dev:${tempVerifyFile}`)
      await execAsync(`docker exec zgobooking-postgres-dev psql -U postgres -c "SELECT 1" -f "${tempVerifyFile}"`)
      await execAsync(`docker exec zgobooking-postgres-dev rm ${tempVerifyFile}`)
    } catch (error) {
      console.error('Backup verification failed:', error)
      // Clean up failed backup
      if (fs.existsSync(backupFile)) {
        fs.unlinkSync(backupFile)
      }
      if (fs.existsSync(compressedFile)) {
        fs.unlinkSync(compressedFile)
      }
      throw new Error('Backup verification failed')
    }

    // Clean up uncompressed file
    if (fs.existsSync(backupFile)) {
      fs.unlinkSync(backupFile)
    }

    // Rotate old backups
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup-'))
      .sort((a, b) => {
        const timeA = fs.statSync(path.join(BACKUP_DIR, a)).mtime.getTime()
        const timeB = fs.statSync(path.join(BACKUP_DIR, b)).mtime.getTime()
        return timeB - timeA
      })

    // Keep only the latest MAX_BACKUPS backups
    for (let i = MAX_BACKUPS; i < files.length; i++) {
      fs.unlinkSync(path.join(BACKUP_DIR, files[i]))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to create backup:', error)
    return new NextResponse('Failed to create backup', { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!isAdmin(session)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { backupFile } = await request.json()
    if (!backupFile) {
      return new NextResponse('Backup file not specified', { status: 400 })
    }

    const backupPath = path.join(BACKUP_DIR, backupFile)
    if (!fs.existsSync(backupPath)) {
      return new NextResponse('Backup file not found', { status: 404 })
    }

    // Create a temporary file for decompression
    const tempFile = path.join(BACKUP_DIR, `temp-${Date.now()}.sql`)
    const containerTempFile = `/tmp/restore-${Date.now()}.sql`

    try {
      // Decompress if needed
      if (backupFile.endsWith('.gz')) {
        await pipeline(
          fs.createReadStream(backupPath),
          createGunzip(),
          fs.createWriteStream(tempFile)
        )
      } else {
        fs.copyFileSync(backupPath, tempFile)
      }

      // Copy the file to the container first
      await execAsync(`docker cp "${tempFile}" zgobooking-postgres-dev:${containerTempFile}`)

      // Restore backup using the container's path
      await execAsync(`docker exec zgobooking-postgres-dev psql -U postgres -f "${containerTempFile}"`)

      // Clean up
      await execAsync(`docker exec zgobooking-postgres-dev rm ${containerTempFile}`)
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile)
      }

      return NextResponse.json({ success: true })
    } catch (error) {
      // Clean up on error
      try {
        await execAsync(`docker exec zgobooking-postgres-dev rm ${containerTempFile}`)
      } catch (e) {
        // Ignore cleanup errors
      }
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile)
      }
      throw error
    }
  } catch (error) {
    console.error('Failed to restore backup:', error)
    return new NextResponse('Failed to restore backup', { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!isAdmin(session)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    const { backupFile } = await request.json()
    if (!backupFile) {
      return new NextResponse('Backup file not specified', { status: 400 })
    }

    const backupPath = path.join(BACKUP_DIR, backupFile)
    if (!fs.existsSync(backupPath)) {
      return new NextResponse('Backup file not found', { status: 404 })
    }

    fs.unlinkSync(backupPath)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete backup:', error)
    return new NextResponse('Failed to delete backup', { status: 500 })
  }
}