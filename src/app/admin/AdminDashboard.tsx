"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, RefreshCw } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface TrafficDataPoint {
  timestamp: string;
  count: number;
}

interface TrafficResponse {
  data: TrafficDataPoint[];
  summary: {
    totalRequests: number;
    timeRange: string;
    intervalType: string;
  };
}

interface SystemStatus {
  redis: {
    connected: boolean;
    memory: {
      used: number;
      total: number;
    };
  };
  database: {
    connected: boolean;
    size: number;
    lastBackup: string | null;
  };
  api: {
    requests: number;
    errors: number;
    avgResponseTime: number;
  };
}

interface LogEntry {
  id: number;
  path: string;
  method: string;
  status: number;
  responseTime: number;
  timestamp: string;
}

type TimeRange = "1h" | "24h" | "7d" | "30d";

const formatDate = (dateString: string | null) => {
  if (!dateString) return "Never";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";

    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return "just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${diffInDays}d ago`;
  } catch (error) {
    return `Invalid date, ${error instanceof Error ? error.message : "Unknown error"}`;
  }
};

const formatChartDate = (dateString: string, timeRange: TimeRange) => {
  const date = new Date(dateString);

  switch (timeRange) {
    case "1h":
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    case "24h":
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    case "7d":
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    case "30d":
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    default:
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
  }
};

// Enhanced icons
const ActivityIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
    />
  </svg>
);

const AlertTriangleIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.924-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
    />
  </svg>
);

const ClockIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const DatabaseIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
    />
  </svg>
);

const TimeRangeButton = ({
  range,
  currentRange,
  onClick,
  children,
}: {
  range: TimeRange;
  currentRange: TimeRange;
  onClick: (range: TimeRange) => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={() => onClick(range)}
    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
      currentRange === range
        ? "bg-blue-600 text-white shadow-sm"
        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400"
    }`}
  >
    {children}
  </button>
);

export default function AdminDashboard() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [trafficData, setTrafficData] = useState<TrafficResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");

  const fetchData = useCallback(
    async (showRefreshing = false) => {
      if (showRefreshing) setIsRefreshing(true);
      setError(null);

      try {
        const [statusRes, logsRes, trafficRes] = await Promise.all([
          fetch("/api/admin/system/status"),
          fetch(`/api/admin/system/logs?range=${timeRange}`),
          fetch(`/api/admin/system/logs/traffic?range=${timeRange}`),
        ]);

        // Check if any requests failed
        if (!statusRes.ok)
          throw new Error(`Status API error: ${statusRes.status}`);
        if (!logsRes.ok) throw new Error(`Logs API error: ${logsRes.status}`);
        if (!trafficRes.ok)
          throw new Error(`Traffic API error: ${trafficRes.status}`);

        const [statusData, logsData, trafficDataResponse] = await Promise.all([
          statusRes.json(),
          logsRes.json(),
          trafficRes.json(),
        ]);

        setStatus(statusData);
        setLogs(logsData.logs || []);
        setTrafficData(trafficDataResponse);
        setLastUpdate(new Date());
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch data"
        );
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [timeRange]
  );

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleTimeRangeChange = (newRange: TimeRange) => {
    setTimeRange(newRange);
  };

  const handleManualRefresh = () => {
    fetchData(true);
  };

  const getHealthStatus = (status: SystemStatus) => {
    const issues = [];
    if (!status.redis.connected) issues.push("Redis disconnected");
    if (!status.database.connected) issues.push("Database disconnected");
    if (status.api.errors / status.api.requests > 0.05)
      issues.push("High error rate");

    return {
      isHealthy: issues.length === 0,
      issues,
    };
  };

  if (loading && !status) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !status) {
    return (
      <div className="min-h-screen p-6">
        <Alert className="max-w-md mx-auto mt-8">
          <AlertTriangleIcon />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="text-center py-8 min-h-screen flex items-center justify-center">
        <div>
          <AlertTriangleIcon />
          <p className="mt-2">Failed to load system status</p>
          <Button
            variant="outline"
            disabled={isRefreshing}
            onClick={handleManualRefresh}
            className="mt-4 px-4 py-2 transition-colors"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const health = getHealthStatus(status);

  return (
    <div className="space-y-6 p-6 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Dashboard</h1>
          {lastUpdate && (
            <p className="text-sm mt-1">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {/* Health indicator */}
          <div
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium ${
              health.isHealthy
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                health.isHealthy ? "bg-green-500" : "bg-red-500"
              }`}
            />
            {health.isHealthy
              ? "All Systems Operational"
              : `${health.issues.length} Issues`}
          </div>

          {/* Refresh button */}
          <Button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-3 py-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span className="text-sm">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangleIcon />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-sm font-medium ">
                Total Requests
              </h3>
              <ActivityIcon />
            </div>
            <div className="text-2xl font-bold ">
              {trafficData?.summary.totalRequests.toLocaleString() ||
                status.api.requests.toLocaleString()}
            </div>
            <p className="text-xs ">
              Last {trafficData?.summary.timeRange || "24h"}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-sm font-medium ">Error Rate</h3>
              <AlertTriangleIcon />
            </div>
            <div
              className={`text-2xl font-bold ${
                status.api.requests > 0 &&
                status.api.errors / status.api.requests > 0.05
                  ? "text-red-600"
                  : ""
              }`}
            >
              {status.api.requests > 0
                ? ((status.api.errors / status.api.requests) * 100).toFixed(1)
                : 0}
              %
            </div>
            <p className="text-xs ">
              {status.api.errors.toLocaleString()} errors
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-sm font-medium ">
                Avg Response Time
              </h3>
              <ClockIcon />
            </div>
            <div
              className={`text-2xl font-bold ${
                status.api.avgResponseTime > 1000
                  ? "text-yellow-600"
                  : ""
              }`}
            >
              {status.api.avgResponseTime}ms
            </div>
            <p className="text-xs ">Average response time</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-sm font-medium ">
                Database Size
              </h3>
              <DatabaseIcon />
            </div>
            <div className="text-2xl font-bold ">
              {status.database.size}MB
            </div>
            <p className="text-xs ">
              Backup: {formatDate(status.database.lastBackup) || "Never"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Chart */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold">API Traffic</CardTitle>
            <div className="flex space-x-1">
              {(["1h", "24h", "7d", "30d"] as TimeRange[]).map((range) => (
                <TimeRangeButton
                  key={range}
                  range={range}
                  currentRange={timeRange}
                  onClick={handleTimeRangeChange}
                >
                  {range}
                </TimeRangeButton>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            {!trafficData || trafficData.data.length === 0 ? (
              <div className="flex items-center justify-center h-full ">
                <div className="text-center">
                  <ActivityIcon />
                  <p className="mt-2">No traffic data available</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trafficData.data}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#3b82f6"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => formatChartDate(value, timeRange)}
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    labelFormatter={(value) =>
                      formatChartDate(value, timeRange)
                    }
                    formatter={(value: number) => [
                      value.toLocaleString(),
                      "Requests",
                    ]}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Response Time Chart */}
      {logs.length > 0 && (
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Response Times
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={logs.slice(-50)}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => formatChartDate(value, timeRange)}
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    labelFormatter={(value) =>
                      formatChartDate(value, timeRange)
                    }
                    formatter={(value: number) => [
                      `${value}ms`,
                      "Response Time",
                    ]}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="responseTime"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Status Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  status.redis.connected ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span>Redis Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Connection</span>
                <span
                  className={`text-sm font-medium ${
                    status.redis.connected ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {status.redis.connected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Memory Usage</span>
                <span className="text-sm font-medium">
                  {status.redis.memory.used}MB / {status.redis.memory.total}MB
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      (status.redis.memory.used / status.redis.memory.total) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  status.database.connected ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span>Database Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Connection</span>
                <span
                  className={`text-sm font-medium ${
                    status.database.connected
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {status.database.connected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Size</span>
                <span className="text-sm font-medium">
                  {status.database.size}MB
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Backup</span>
                <span className="text-sm font-medium">
                  {formatDate(status.database.lastBackup) || "Never"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
