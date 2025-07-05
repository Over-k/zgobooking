'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface AnalyticsData {
  month: string;
  revenue?: number;
  bookings?: number;
}

interface AnalyticsChartProps {
  type?: 'revenue' | 'bookings';
}

export function AnalyticsChart({ type = 'revenue' }: AnalyticsChartProps) {
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('/api/analytics/monthly-bookings')
      .then((res) => res.json())
      .then((analyticsData) => {
        setData(Array.isArray(analyticsData) ? analyticsData : []);
      })
      .catch(() => {
        setError('Failed to load analytics data');
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [type]);

  if (loading) {
    return (
      <div className="h-[300px] w-full">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis
            tickFormatter={(value) =>
              type === 'revenue' ? `$${value}` : value.toString()
            }
          />
          <Tooltip
            formatter={(value: number) =>
              type === 'revenue' ? [`$${value}`, 'Revenue'] : [value, 'Bookings']
            }
            labelFormatter={(label) => label}
          />
          <Line
            type="monotone"
            dataKey={type === 'revenue' ? 'revenue' : 'bookings'}
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 