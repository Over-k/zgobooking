'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Loader2, AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

type FlaggedContent = {
  id: string
  type: 'review' | 'listing'
  content: string
  reason: string
  reportedBy: string
  createdAt: Date
  status: 'pending' | 'resolved' | 'dismissed'
}

export function ContentModeration() {
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchFlaggedContent = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/content/flagged')
      if (!response.ok) {
        throw new Error('Failed to fetch flagged content')
      }
      const data = await response.json()
      setFlaggedContent(data)
    } catch (error) {
      console.error('Failed to fetch flagged content:', error)
      toast({
        title: "Error",
        description: "Failed to load flagged content",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFlaggedContent()
    // Refresh content every minute
    const interval = setInterval(fetchFlaggedContent, 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/admin/content/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      })

      if (!response.ok) throw new Error('Failed to process content')

      setFlaggedContent(flaggedContent.filter(item => item.id !== id))
      toast({
        title: "Success",
        description: `Content ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process content",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (flaggedContent.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">No flagged content to review</p>
        </div>
      </div>
    )
  }

  return (
    <Tabs defaultValue="reviews" className="space-y-4">
      <TabsList>
        <TabsTrigger value="reviews">Flagged Reviews</TabsTrigger>
        <TabsTrigger value="listings">Pending Listings</TabsTrigger>
      </TabsList>

      <TabsContent value="reviews">
        <Card>
          <CardHeader>
            <CardTitle>Flagged Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Content</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Reported By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flaggedContent
                  .filter(item => item.type === 'review')
                  .map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="max-w-md truncate">{item.content}</TableCell>
                      <TableCell>{item.reason}</TableCell>
                      <TableCell>{item.reportedBy}</TableCell>
                      <TableCell>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction(item.id, 'approve')}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleAction(item.id, 'reject')}
                          >
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="listings">
        <Card>
          <CardHeader>
            <CardTitle>Pending Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Host</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flaggedContent
                  .filter(item => item.type === 'listing')
                  .map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="max-w-md truncate">{item.content}</TableCell>
                      <TableCell>{item.reportedBy}</TableCell>
                      <TableCell>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction(item.id, 'approve')}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleAction(item.id, 'reject')}
                          >
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
} 