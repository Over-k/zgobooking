import { Breadcrumb } from "@/components/dashboard/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Home, Users, TrendingUp, DollarSign, Star } from "lucide-react";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecentBookings } from "@/components/dashboard/recent-bookings";
import { RecentListings } from "@/components/dashboard/recent-listings";
import { AnalyticsChart } from "@/components/dashboard/analytics-chart";

async function getStats(userId: string) {
  const [
    totalBookings,
    totalListings,
    activeUsers,
    userBookings,
    userListings,
    totalRevenue,
    averageRating
  ] = await Promise.all([
    prisma.booking.count({
      where: {
        OR: [
          { guestId: userId },
          { hostId: userId }
        ]
      }
    }),
    prisma.listing.count({
      where: {
        hostId: userId
      }
    }),
    prisma.user.count({
      where: {
        isVerified: true,
      },
    }),
    prisma.booking.count({
      where: {
        OR: [
          { guestId: userId },
          { hostId: userId }
        ]
      }
    }),
    prisma.listing.count({
      where: {
        hostId: userId
      }
    }),
    prisma.booking.aggregate({
      where: {
        hostId: userId,
        status: "completed",
        paymentStatus: "paid"
      },
      _sum: {
        total: true
      }
    }),
    prisma.review.aggregate({
      where: {
        receiverId: userId,
        reviewType: "guest_to_host"
      },
      _avg: {
        rating: true
      }
    })
  ]);

  return {
    totalBookings,
    totalListings,
    activeUsers,
    userBookings,
    userListings,
    totalRevenue: totalRevenue._sum.total || 0,
    averageRating: averageRating._avg.rating || 0
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const stats = await getStats(session.user.id);
  const isHost = await prisma.user.findUnique({ where: { id: session.user.id }, select: { isHost: true } });

  return (
    <div className="space-y-6">
      <Breadcrumb />
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {!isHost && (
          <a 
            href="/listings/new" 
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Become a Host
          </a>
        )}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.userBookings}</div>
            <p className="text-xs text-muted-foreground">
              Total bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Listings</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.userListings}</div>
            <p className="text-xs text-muted-foreground">
              Active listings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From completed bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              From guest reviews
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="listings">Listings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <AnalyticsChart />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <RecentBookings/>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Your Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentBookings/>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="listings">
          <Card>
            <CardHeader>
              <CardTitle>Your Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentListings/>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Booking Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <AnalyticsChart type="bookings" />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
