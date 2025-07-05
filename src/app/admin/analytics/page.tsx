// app/admin/analytics/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  RefreshCw,
  Users,
  Calendar,
  MessageSquare,
  Heart,
  Star,
  Home,
  UserCheck,
} from "lucide-react";
import { AnalyticsChart } from "@/components/analytics/AnalyticsChart";

interface AnalyticsData {
  users: MonthlyData[];
  bookings: MonthlyData[];
  hostRequests: MonthlyData[];
  reviews: MonthlyData[];
  favorites: MonthlyData[];
  messages: MonthlyData[];
  listings: MonthlyData[];
}

interface MonthlyData {
  month: string;
  count: number;
  date: string;
}

interface ApiResponse {
  success: boolean;
  data: AnalyticsData;
  cached: boolean;
  timeRange: TimeRange;
  error?: string;
}

type TimeRange = "month" | "year" | "lifetime";

const timeRangeLabels: Record<TimeRange, string> = {
  month: "Last Month",
  year: "Last Year",
  lifetime: "Lifetime",
};

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isCached, setIsCached] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("year");

  const fetchAnalytics = async (
    showRefreshing = false,
    range: TimeRange = timeRange
  ) => {
    try {
      if (showRefreshing) setIsRefreshing(true);
      else setLoading(true);

      setError(null);

      const response = await fetch(`/api/admin/system/analytic?range=${range}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.status}`);
      }

      const result: ApiResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch analytics");
      }

      setAnalytics(result.data);
      setIsCached(result.cached);
      setTimeRange(result.timeRange);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setError(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    fetchAnalytics(true, timeRange);
  };

  const handleTimeRangeChange = (newRange: TimeRange) => {
    setTimeRange(newRange);
    fetchAnalytics(false, newRange);
  };

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Calculate totals for stats cards
  const calculateTotal = (data: MonthlyData[]) => {
    return data.reduce((sum, item) => sum + item.count, 0);
  };

  const statsCards = analytics
    ? [
        {
          title: "Total Users",
          value: calculateTotal(analytics.users),
          icon: Users,
          description: "Registered users",
          color: "text-blue-600",
        },
        {
          title: "Total Bookings",
          value: calculateTotal(analytics.bookings),
          icon: Calendar,
          description: "All bookings",
          color: "text-green-600",
        },
        {
          title: "Total Listings",
          value: calculateTotal(analytics.listings),
          icon: Home,
          description: "Active listings",
          color: "text-purple-600",
        },
        {
          title: "Total Reviews",
          value: calculateTotal(analytics.reviews),
          icon: Star,
          description: "User reviews",
          color: "text-yellow-600",
        },
        {
          title: "Total Messages",
          value: calculateTotal(analytics.messages),
          icon: MessageSquare,
          description: "Messages sent",
          color: "text-indigo-600",
        },
        {
          title: "Total Favorites",
          value: calculateTotal(analytics.favorites),
          icon: Heart,
          description: "Favorited items",
          color: "text-red-600",
        },
        {
          title: "Host Requests",
          value: calculateTotal(analytics.hostRequests),
          icon: UserCheck,
          description: "Host applications",
          color: "text-orange-600",
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6 min-h-screen">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Analytics</h1>
          <Button variant="outline" onClick={() => fetchAnalytics()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="text-red-600 font-medium">
              Error loading analytics
            </div>
            <div className="text-red-500 text-sm mt-1">{error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <h1 className="text-3xl font-bold">Analytics</h1>
          {isCached && (
            <Badge variant="secondary" className="text-xs">
              Cached Data
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {timeRangeLabels[timeRange]}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          {/* Time Range Filter Buttons */}
          <div className="flex items-center space-x-1 p-1 bg-muted rounded-lg">
            {(Object.keys(timeRangeLabels) as TimeRange[]).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "ghost"}
                size="sm"
                onClick={() => handleTimeRangeChange(range)}
                disabled={loading || isRefreshing}
                className="text-xs px-3 py-1"
              >
                {timeRangeLabels[range]}
              </Button>
            ))}
          </div>
          <Button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stat.value.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="listings">Listings</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="hosts">Host Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnalyticsChart
              data={analytics?.users || []}
              title="User Growth"
              description={`New user registrations - ${timeRangeLabels[
                timeRange
              ].toLowerCase()}`}
              dataKeys={["count"]}
              colors={["hsl(var(--chart-1))"]}
            />
            <AnalyticsChart
              data={analytics?.bookings || []}
              title="Booking Trends"
              description={`Booking activity - ${timeRangeLabels[
                timeRange
              ].toLowerCase()}`}
              dataKeys={["count"]}
              colors={["hsl(var(--chart-2))"]}
            />
            <AnalyticsChart
              data={analytics?.listings || []}
              title="Listing Growth"
              description={`New listings created - ${timeRangeLabels[
                timeRange
              ].toLowerCase()}`}
              dataKeys={["count"]}
              colors={["hsl(var(--chart-3))"]}
            />
            <AnalyticsChart
              data={analytics?.reviews || []}
              title="Review Activity"
              description={`Reviews submitted - ${timeRangeLabels[
                timeRange
              ].toLowerCase()}`}
              dataKeys={["count"]}
              colors={["hsl(var(--chart-4))"]}
            />
          </div>
        </TabsContent>

        <TabsContent value="users">
          <AnalyticsChart
            data={analytics?.users || []}
            title="User Registration Analytics"
            description={`Detailed view of user registrations - ${timeRangeLabels[
              timeRange
            ].toLowerCase()}`}
            dataKeys={["count"]}
            colors={["hsl(var(--chart-1))"]}
          />
        </TabsContent>

        <TabsContent value="bookings">
          <AnalyticsChart
            data={analytics?.bookings || []}
            title="Booking Analytics"
            description={`Detailed view of booking activity - ${timeRangeLabels[
              timeRange
            ].toLowerCase()}`}
            dataKeys={["count"]}
            colors={["hsl(var(--chart-2))"]}
          />
        </TabsContent>

        <TabsContent value="listings">
          <AnalyticsChart
            data={analytics?.listings || []}
            title="Listing Analytics"
            description={`Detailed view of new listings - ${timeRangeLabels[
              timeRange
            ].toLowerCase()}`}
            dataKeys={["count"]}
            colors={["hsl(var(--chart-3))"]}
          />
        </TabsContent>

        <TabsContent value="reviews">
          <AnalyticsChart
            data={analytics?.reviews || []}
            title="Review Analytics"
            description={`Detailed view of review activity - ${timeRangeLabels[
              timeRange
            ].toLowerCase()}`}
            dataKeys={["count"]}
            colors={["hsl(var(--chart-4))"]}
          />
        </TabsContent>

        <TabsContent value="messages">
          <AnalyticsChart
            data={analytics?.messages || []}
            title="Message Analytics"
            description={`Detailed view of messaging activity - ${timeRangeLabels[
              timeRange
            ].toLowerCase()}`}
            dataKeys={["count"]}
            colors={["hsl(var(--chart-5))"]}
          />
        </TabsContent>

        <TabsContent value="favorites">
          <AnalyticsChart
            data={analytics?.favorites || []}
            title="Favorites Analytics"
            description={`Detailed view of favorite activity - ${timeRangeLabels[
              timeRange
            ].toLowerCase()}`}
            dataKeys={["count"]}
            colors={["hsl(var(--chart-6))"]}
          />
        </TabsContent>

        <TabsContent value="hosts">
          <AnalyticsChart
            data={analytics?.hostRequests || []}
            title="Host Request Analytics"
            description={`Detailed view of host applications - ${timeRangeLabels[
              timeRange
            ].toLowerCase()}`}
            dataKeys={["count"]}
            colors={["hsl(var(--chart-7))"]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
