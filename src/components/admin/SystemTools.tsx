'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Loader2, AlertCircle, MoreVertical, Download, RotateCcw, Trash2, Check, X } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from 'date-fns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type SystemStatus = {
  redis: {
    connected: boolean
    memory: {
      used: number
      total: number
    }
  }
  database: {
    connected: boolean
    size: number
    lastBackup: string | null
  }
  api: {
    requests: number
    errors: number
    avgResponseTime: number
  }
}

type BackupInfo = {
  filename: string
  size: number
  timestamp: string
  compressed: boolean
}

type HostRequest = {
  id: string
  hostname: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
}

export function SystemTools() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [showBackupDialog, setShowBackupDialog] = useState(false)
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedBackup, setSelectedBackup] = useState<BackupInfo | null>(null)
  const [backups, setBackups] = useState<BackupInfo[]>([])
  const [backupLoading, setBackupLoading] = useState(false)
  const [hostRequests, setHostRequests] = useState<HostRequest[]>([])
  const { toast } = useToast()

  const fetchStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/system/status')
      if (!response.ok) throw new Error('Failed to fetch system status')
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error('Failed to fetch system status:', error)
      toast({
        title: "Error",
        description: "Failed to load system status",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchBackups = async () => {
    try {
      const response = await fetch('/api/admin/system/backup')
      if (!response.ok) throw new Error('Failed to fetch backups')
      const data = await response.json()
      setBackups(data.backups || [])
    } catch (error) {
      console.error('Failed to fetch backups:', error)
      toast({
        title: "Error",
        description: "Failed to load backups",
        variant: "destructive",
      })
    }
  }

  const fetchHostRequests = async () => {
    try {
      const response = await fetch('/api/admin/host-requests')
      if (!response.ok) throw new Error('Failed to fetch host requests')
      const data = await response.json()
      setHostRequests(data.requests || [])
    } catch (error) {
      console.error('Failed to fetch host requests:', error)
      toast({
        title: "Error",
        description: "Failed to load host requests",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchStatus()
    fetchBackups()
    fetchHostRequests()
    const interval = setInterval(fetchStatus, 30 * 1000)
    return () => clearInterval(interval)
  }, [])

  const handleBackup = async () => {
    setBackupLoading(true)
    try {
      const response = await fetch('/api/admin/system/backup', {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to create backup')
      await fetchBackups()
      toast({
        title: "Success",
        description: "Database backup created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create backup",
        variant: "destructive",
      })
    } finally {
      setBackupLoading(false)
      setShowBackupDialog(false)
    }
  }

  const handleRestore = async () => {
    if (!selectedBackup) return
    setBackupLoading(true)
    try {
      const response = await fetch('/api/admin/system/backup', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupFile: selectedBackup.filename })
      })
      if (!response.ok) throw new Error('Failed to restore backup')
      toast({
        title: "Success",
        description: "Database restored successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to restore backup",
        variant: "destructive",
      })
    } finally {
      setBackupLoading(false)
      setShowRestoreDialog(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedBackup) return
    setBackupLoading(true)
    try {
      const response = await fetch(`/api/admin/system/backup/${selectedBackup.filename}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete backup')
      setBackups(backups.filter(b => b.filename !== selectedBackup.filename))
      toast({
        title: "Success",
        description: "Backup deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete backup",
        variant: "destructive",
      })
    } finally {
      setBackupLoading(false)
      setShowDeleteDialog(false)
    }
  }

  const handleHostRequest = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/admin/host-requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      if (!response.ok) throw new Error(`Failed to ${action} host request`)
      await fetchHostRequests()
      toast({
        title: "Success",
        description: `Host request ${action}d successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} host request`,
        variant: "destructive",
      })
    }
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

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-[100px]" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-8 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!status) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="h-5 w-5" />
          <span>Failed to load system status</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Redis Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={status.redis.connected ? "text-green-500" : "text-red-500"}>
                  {status.redis.connected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Memory Usage:</span>
                <span>
                  {status.redis.memory.used}MB / {status.redis.memory.total}MB
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={status.database.connected ? "text-green-500" : "text-red-500"}>
                  {status.database.connected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Size:</span>
                <span>{formatFileSize(status.database.size * 1024 * 1024)}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setShowBackupDialog(true)}
                disabled={!status.database.connected || backupLoading}
              >
                {backupLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Backup...
                  </>
                ) : (
                  'Create Backup'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Requests (24h):</span>
                <span className="font-medium">{status.api.requests.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Errors (24h):</span>
                <span className={`font-medium ${status.api.errors > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {status.api.errors.toLocaleString()}
                  {status.api.requests > 0 && (
                    <span className="text-sm text-muted-foreground ml-2">
                      ({((status.api.errors / status.api.requests) * 100).toFixed(1)}%)
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Avg Response Time:</span>
                <span className={`font-medium ${
                  status.api.avgResponseTime > 1000 ? 'text-red-500' :
                  status.api.avgResponseTime > 500 ? 'text-yellow-500' :
                  'text-green-500'
                }`}>
                  {status.api.avgResponseTime.toLocaleString()}ms
                </span>
              </div>
              <div className="flex justify-between">
                <span>Success Rate:</span>
                <span className={`font-medium ${
                  status.api.requests > 0 && (status.api.errors / status.api.requests) > 0.1 ? 'text-red-500' :
                  status.api.requests > 0 && (status.api.errors / status.api.requests) > 0.05 ? 'text-yellow-500' :
                  'text-green-500'
                }`}>
                  {status.api.requests > 0
                    ? `${(100 - (status.api.errors / status.api.requests) * 100).toFixed(1)}%`
                    : '100%'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Database Backups</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Filename</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No backups found
                  </TableCell>
                </TableRow>
              ) : (
                backups.map((backup) => (
                  <TableRow key={backup.filename}>
                    <TableCell>{backup.filename}</TableCell>
                    <TableCell>{formatFileSize(backup.size)}</TableCell>
                    <TableCell>
                      {new Date(backup.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span className={backup.compressed ? "text-green-500" : "text-yellow-500"}>
                        {backup.compressed ? "Compressed" : "Uncompressed"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedBackup(backup)
                              setShowRestoreDialog(true)
                            }}
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Restore
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedBackup(backup)
                              setShowDeleteDialog(true)
                            }}
                            className="text-red-500"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create Database Backup</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a full backup of the database. The process may take
              several minutes depending on the database size.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBackup}>
              Create Backup
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Database</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the database from the selected backup. All current data will be
              replaced with the backup data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore} className="bg-red-500 hover:bg-red-600">
              Restore Database
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Backup</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the selected backup. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete Backup
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 