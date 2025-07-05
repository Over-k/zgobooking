'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Check, X, Loader2, RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

type HostRequest = {
  id: string
  hostname: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
  reason?: string
}

export function HostRequests() {
  const [hostRequests, setHostRequests] = useState<HostRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { toast } = useToast()

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
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchHostRequests()
  }, [])

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

  const handleRefresh = () => {
    setRefreshing(true)
    fetchHostRequests()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-[200px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Host Requests</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="ml-2">Refresh</span>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hostname</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hostRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No host requests found
                </TableCell>
              </TableRow>
            ) : (
              hostRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.hostname}</TableCell>
                  <TableCell>
                    <span className={
                      request.status === 'approved' ? "text-green-500" :
                      request.status === 'rejected' ? "text-red-500" :
                      "text-yellow-500"
                    }>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(request.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{new Date(request.updatedAt).toLocaleString()}</TableCell>
                  <TableCell>{request.reason || '-'}</TableCell>
                  <TableCell>
                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleHostRequest(request.id, 'approve')}
                        >
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleHostRequest(request.id, 'reject')}
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
} 