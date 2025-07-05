'use client'

import { useState, useEffect } from 'react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Search, RefreshCw } from 'lucide-react'

export default function SystemLogsPage() {
  const [security, setSecurity] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')


  const fetchSecurity = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/system/security`)
      if (!response.ok) throw new Error('Failed to fetch security ')
      const data = await response.json()
      setSecurity(data.security || [])
    } catch (error) {
      console.error('Error fetching security:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    //fetchSecurity()
  }, [searchQuery])

  if (loading && security.length === 0) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Security</h1>
        <Button variant="outline" onClick={fetchSecurity}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Security Logs</h2>
          <p className="text-muted-foreground">
            COMING SOON: This page will display security logs and events related to the system.
          </p>
        </div>
        {/* {security.length > 0 ? (
          <ul className="divide-y">
            {security.map((item) => (
              <li key={item.id} className="p-4">
                <div className="flex justify-between items-center">
                  <span>{item.message}</span>
                  <span className="text-sm text-muted-foreground">{new Date(item.timestamp).toLocaleString()}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4 text-center text-muted-foreground">No security logs found</div>
        )} */}
      </div>
    </div>
  )
} 