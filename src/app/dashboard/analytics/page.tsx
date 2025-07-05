"use client"
import { useEffect, useState } from "react";
import { Breadcrumb } from "@/components/dashboard/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from "recharts";

export default function AnalyticsPage() {
  const [monthlyBookings, setMonthlyBookings] = useState<any[]>([]);
  const [listingPerformance, setListingPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch("/api/analytics/monthly-bookings").then(res => res.json()),
      fetch("/api/analytics/listing-performance").then(res => res.json()),
    ])
      .then(([monthly, listing]) => {
        setMonthlyBookings(Array.isArray(monthly) ? monthly : []);
        setListingPerformance(Array.isArray(listing) ? listing : []);
      })
      .catch((err) => {
        setError("Failed to load analytics data");
        setMonthlyBookings([]);
        setListingPerformance([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb />
        <h1 className="mt-2 text-3xl font-bold">Analytics</h1>
      </div>
      {loading ? (
        <div className="text-center py-10 text-muted-foreground">Loading analytics...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">{error}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Bookings & Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyBookings}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line yAxisId="left" type="monotone" dataKey="bookings" stroke="#8884d8" name="Bookings" />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#82ca9d" name="Revenue" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Listing Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={listingPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#8884d8" name="Bookings" />
                    <Bar dataKey="revenue" fill="#82ca9d" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}