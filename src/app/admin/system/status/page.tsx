'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, Database, Server, Activity, RefreshCw, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface SystemStatus {
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

export default function SystemStatusPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const flushCache = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/system/cache/flush", {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to flush cache");

      toast.success("Redis cache flushed successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to flush Redis cache");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/admin/system/status");
        if (!response.ok) throw new Error("Failed to fetch system status");
        const data = await response.json();
        setStatus(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      </div>
    )
  }

  if (!status) return null

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">System Status</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Redis Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Redis Status</CardTitle>
            <Server
              className={`h-4 w-4 ${
                status.redis.connected ? "text-green-500" : "text-red-500"
              }`}
            />
          </CardHeader>

          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Memory Usage</span>
                <span>
                  {status.redis.memory.used}MB / {status.redis.memory.total}MB
                </span>
              </div>
              <Progress
                value={
                  (status.redis.memory.used / status.redis.memory.total) * 100
                }
                className="h-2"
              />
              <div className="text-sm text-muted-foreground">
                Status: {status.redis.connected ? "Connected" : "Disconnected"}
              </div>

              <div className="pt-4">
                <Button
                  variant="outline"
                  onClick={flushCache}
                  disabled={loading}
                  className="w-full"
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  />
                  {loading ? "Flushing..." : "Flush Cache"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Database Status
            </CardTitle>
            <Database
              className={`h-4 w-4 ${
                status.database.connected ? "text-green-500" : "text-red-500"
              }`}
            />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm">
                <div className="flex justify-between">
                  <span>Database Size</span>
                  <span>{status.database.size}MB</span>
                </div>
                <div className="text-muted-foreground mt-2">
                  Last Backup:{" "}
                  {status.database.lastBackup || "No backups found"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              API Status (24h)
            </CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium">Requests</div>
                  <div className="text-2xl font-bold">
                    {status.api.requests}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Errors</div>
                  <div className="text-2xl font-bold text-red-500">
                    {status.api.errors}
                  </div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Avg Response Time: {status.api.avgResponseTime}ms
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 