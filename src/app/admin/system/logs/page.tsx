"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Search,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Activity,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  LineChart,
  Line,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

interface ApiLog {
  id: string;
  path: string;
  method: string;
  status: number;
  responseTime: number;
  userId: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  error: string | null;
  timestamp: string;
}

interface DashboardStats {
  totalRequests: number;
  errorRate: number;
  avgResponseTime: number;
  hotPaths: Array<{
    path: string;
    count: number;
    avgResponseTime: number;
  }>;
  errorsByPath: Array<{
    path: string;
    errorCount: number;
    status: number;
  }>;
  requestsOverTime: Array<{
    time: string;
    requests: number;
    errors: number;
  }>;
}

const chartConfig = {
  requests: {
    label: "Requests",
    color: "hsl(var(--chart-1))",
  },
  errors: {
    label: "Errors",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export default function SystemLogsPage() {
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await fetch(
        "/api/admin/system/logs?range=24h&stats=true"
      );
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };



  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);

        const limit = 20;
        const currentPage = page || 1;
        const offset = (currentPage - 1) * limit;

        const response = await fetch(
          `/api/admin/system/log?offset=${offset}&limit=${limit}&search=${encodeURIComponent(
            searchQuery
          )}`
        );

        if (!response.ok) throw new Error("Failed to fetch logs");

        const data = await response.json();
        setLogs(data.logs);
        setTotalPages(Math.ceil(data.total / limit));
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [page, searchQuery]);

  useEffect(() => {
    fetchStats();
  }, []);

  const getStatusColor = (status: number) => {
    if (status >= 500) return "text-red-500";
    if (status >= 400) return "text-orange-500";
    if (status >= 300) return "text-blue-500";
    return "text-green-500";
  };

  const handleRefresh = () => {
    fetchStats();
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">System Logs</h1>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Requests
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                stats?.totalRequests?.toLocaleString() || "0"
              )}
            </div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                `${(stats?.errorRate || 0).toFixed(1)}%`
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.errorRate && stats.errorRate > 5 ? (
                <span className="text-red-500">Above threshold</span>
              ) : (
                "Within normal range"
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Response Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                `${stats?.avgResponseTime || 0}ms`
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.avgResponseTime && stats.avgResponseTime > 1000 ? (
                <span className="text-orange-500">Slow response</span>
              ) : (
                "Good performance"
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Errors</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                stats?.errorsByPath?.length || "0"
              )}
            </div>
            <p className="text-xs text-muted-foreground">Unique error paths</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requests Over Time Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Requests Over Time</CardTitle>
            <CardDescription>
              Request volume and errors in the last 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex justify-center items-center h-[200px]">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats?.requestsOverTime || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="requests"
                      stroke="var(--color-requests)"
                      strokeWidth={2}
                      dot={{ fill: "var(--color-requests)" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="errors"
                      stroke="var(--color-errors)"
                      strokeWidth={2}
                      dot={{ fill: "var(--color-errors)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Hot Paths Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Hot Paths</CardTitle>
            <CardDescription>
              Most frequently requested endpoints
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex justify-center items-center h-[200px]">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.hotPaths?.slice(0, 5) || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="path"
                      tick={{ fontSize: 10 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(value, name) => [
                        `${value} requests`,
                        name === "count" ? "Requests" : name,
                      ]}
                    />
                    <Bar
                      dataKey="count"
                      fill="var(--color-requests)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hot Paths Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Requested Paths</CardTitle>
          <CardDescription>
            Most active API endpoints with performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Path</TableHead>
                    <TableHead>Requests</TableHead>
                    <TableHead>Avg Response Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats?.hotPaths?.slice(0, 10).map((path, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm">
                        {path.path}
                      </TableCell>
                      <TableCell>{path.count.toLocaleString()}</TableCell>
                      <TableCell>
                        <span
                          className={
                            path.avgResponseTime > 1000
                              ? "text-orange-500"
                              : "text-green-500"
                          }
                        >
                          {path.avgResponseTime}ms
                        </span>
                      </TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground"
                      >
                        No data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Summary */}
      {stats?.errorsByPath && stats.errorsByPath.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Recent Errors
            </CardTitle>
            <CardDescription>
              Paths with recent error occurrences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Path</TableHead>
                    <TableHead>Error Count</TableHead>
                    <TableHead>Status Code</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.errorsByPath.slice(0, 10).map((error, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm">
                        {error.path}
                      </TableCell>
                      <TableCell>
                        <span className="text-red-500 font-medium">
                          {error.errorCount}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={getStatusColor(error.status)}>
                          {error.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Logs</CardTitle>
          <CardDescription>Detailed API request logs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Path</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Response Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {formatDistanceToNow(new Date(log.timestamp), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.path}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          log.method === "GET"
                            ? "bg-blue-100 text-blue-700"
                            : log.method === "POST"
                            ? "bg-green-100 text-green-700"
                            : log.method === "PUT"
                            ? "bg-yellow-100 text-yellow-700"
                            : log.method === "DELETE"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {log.method}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={getStatusColor(log.status)}>
                        {log.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          log.responseTime > 1000 ? "text-orange-500" : ""
                        }
                      >
                        {log.responseTime}ms
                      </span>
                    </TableCell>
                    <TableCell>{log.userId || "Anonymous"}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.ipAddress || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setPage((page) => Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage((page) => Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
