'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { Loader2, Trash2, RotateCcw } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Backup {
  filename: string
  size: number
  timestamp: string
  compressed: boolean
}

export default function BackupsPage() {
  const [backups, setBackups] = useState<Backup[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [restoring, setRestoring] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [backupToDelete, setBackupToDelete] = useState<string | null>(null)

  const fetchBackups = async () => {
    try {
      const response = await fetch('/api/admin/system/backup')
      if (!response.ok) throw new Error('Failed to fetch backups')
      const data = await response.json()
      setBackups(data.backups)
    } catch (error) {
      console.error('Error fetching backups:', error)
      toast.error('Failed to fetch backups')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBackups()
  }, [])

  const handleCreateBackup = async () => {
    setCreating(true)
    try {
      const response = await fetch('/api/admin/system/backup', {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Failed to create backup')
      toast.success('Backup created successfully')
      fetchBackups()
    } catch (error) {
      console.error('Error creating backup:', error)
      toast.error('Failed to create backup')
    } finally {
      setCreating(false)
    }
  }

  const handleRestoreBackup = async (filename: string) => {
    setRestoring(filename)
    try {
      const response = await fetch('/api/admin/system/backup', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ backupFile: filename })
      })
      if (!response.ok) throw new Error('Failed to restore backup')
      toast.success('Backup restored successfully')
    } catch (error) {
      console.error('Error restoring backup:', error)
      toast.error('Failed to restore backup')
    } finally {
      setRestoring(null)
    }
  }

  const handleDeleteBackup = async (filename: string) => {
    setDeleting(filename)
    try {
      const response = await fetch(`/api/admin/system/backup`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ backupFile: filename })
      })
      if (!response.ok) throw new Error('Failed to delete backup')
      toast.success('Backup deleted successfully')
      fetchBackups()
    } catch (error) {
      console.error('Error deleting backup:', error)
      toast.error('Failed to delete backup')
    } finally {
      setDeleting(null)
      setDeleteDialogOpen(false)
      setBackupToDelete(null)
    }
  }

  const confirmDelete = (filename: string) => {
    setBackupToDelete(filename)
    setDeleteDialogOpen(true)
  }

  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Database Backups</h1>
        <Button 
          onClick={handleCreateBackup} 
          disabled={creating}
        >
          {creating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Backup'
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : backups.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No backups found
            </div>
          ) : (
            <div className="max-h-[600px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead>Filename</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backups.map((backup) => (
                    <TableRow key={backup.filename}>
                      <TableCell className="font-mono text-sm">
                        {backup.filename}
                      </TableCell>
                      <TableCell>{formatFileSize(backup.size)}</TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(backup.timestamp), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestoreBackup(backup.filename)}
                            disabled={restoring === backup.filename}
                          >
                            {restoring === backup.filename ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RotateCcw className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => confirmDelete(backup.filename)}
                            disabled={deleting === backup.filename}
                          >
                            {deleting === backup.filename ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the backup file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => backupToDelete && handleDeleteBackup(backupToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 