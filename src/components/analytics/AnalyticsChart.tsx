// components/analytics/AnalyticsChart.tsx
"use client";

import { TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface AnalyticsChartProps {
  data: any[];
  title: string;
  description: string;
  dataKeys: string[];
  colors: string[];
  className?: string;
}

export function AnalyticsChart({
  data,
  title,
  description,
  dataKeys,
  colors,
  className,
}: AnalyticsChartProps) {
  // Create chart config dynamically
  const chartConfig: ChartConfig = dataKeys.reduce((config, key, index) => {
    config[key] = {
      label: key.charAt(0).toUpperCase() + key.slice(1),
      color: colors[index] || `hsl(var(--chart-${index + 1}))`,
    };
    return config;
  }, {} as ChartConfig);

  // Calculate trend
  const calculateTrend = () => {
    if (data.length < 2) return 0;

    const lastMonth = data[data.length - 1];
    const previousMonth = data[data.length - 2];

    const lastTotal = dataKeys.reduce(
      (sum, key) => sum + (lastMonth[key] || 0),
      0
    );
    const previousTotal = dataKeys.reduce(
      (sum, key) => sum + (previousMonth[key] || 0),
      0
    );

    if (previousTotal === 0) return 0;
    return ((lastTotal - previousTotal) / previousTotal) * 100;
  };

  const trend = calculateTrend();
  const isPositive = trend >= 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={data}
              margin={{
                left: 12,
                right: 12,
                top: 12,
                bottom: 12,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <defs>
                {dataKeys.map((key, index) => (
                  <linearGradient
                    key={key}
                    id={`fill${key}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={
                        colors[index] || `hsl(var(--chart-${index + 1}))`
                      }
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={
                        colors[index] || `hsl(var(--chart-${index + 1}))`
                      }
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                ))}
              </defs>
              {dataKeys.map((key, index) => (
                <Area
                  key={key}
                  dataKey={key}
                  type="monotone"
                  fill={`url(#fill${key})`}
                  fillOpacity={0.4}
                  stroke={colors[index] || `hsl(var(--chart-${index + 1}))`}
                  strokeWidth={2}
                  stackId={dataKeys.length > 1 ? "a" : undefined}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              {isPositive ? (
                <>
                  Trending up by {Math.abs(trend).toFixed(1)}% this month
                  <TrendingUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Trending down by {Math.abs(trend).toFixed(1)}% this month
                  <TrendingUp className="h-4 w-4 rotate-180" />
                </>
              )}
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Last 12 months data
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
