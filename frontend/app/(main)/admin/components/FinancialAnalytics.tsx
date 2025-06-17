"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { axiosHeaders } from "@/lib/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  DollarSign,
  Package,
  Percent,
  Calculator,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ComposedChart,
  Legend,
} from "recharts";
import { format, parseISO } from "date-fns";

interface TimeSeriesData {
  date: string;
  revenue: number;
  orders: number;
  tax: number;
  discounts: number;
  shipping: number;
  deliveryCost?: number;
  subtotal: number;
  cost: number;
  profit: number;
}

interface FinancialMetrics {
  totalRevenue: number;
  totalTax: number;
  totalDiscounts: number;
  totalShipping: number;
  totalDeliveryCost?: number;
  subtotal: number;
  totalCost: number;
  grossProfit: number;
  orderCount: number;
  averageOrderValue: number;
  timeSeriesData: TimeSeriesData[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  formatter?: (value: number) => string;
  timeframe: string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
  formatter,
  timeframe,
}: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const formattedDate = (() => {
      try {
        const date = parseISO(label || "");
        switch (timeframe) {
          case "daily":
            return format(date, "EEEE, MMM d");
          case "weekly":
            return `Week ${format(date, "w")}, ${format(date, "yyyy")}`;
          case "monthly":
            return format(date, "MMMM yyyy");
          default:
            return format(date, "PPP");
        }
      } catch {
        return label;
      }
    })();

    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border">
        <p className="font-medium mb-2">{formattedDate}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-medium">
              {formatter ? formatter(entry.value) : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const getTimeframeFormat = (timeframe: string) => {
  switch (timeframe) {
    case "daily":
      return "EEE";
    case "weekly":
      return "'W'w";
    case "monthly":
      return "MMM";
    default:
      return "EEE";
  }
};

const formatChartDate = (dateStr: string, timeframe: string) => {
  try {
    const date = parseISO(dateStr);
    return format(date, getTimeframeFormat(timeframe));
  } catch {
    return dateStr;
  }
};

const formatYAxisTick = (value: number) => {
  if (value === 0) return "$ 0";
  if (value >= 1000000) return `$ ${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$ ${(value / 1000).toFixed(1)}K`;
  return `$ ${value}`;
};

export function FinancialAnalytics() {
  const [timeframe, setTimeframe] = useState("daily");

  const {
    data: metrics,
    isLoading,
    error,
  } = useQuery<FinancialMetrics>({
    queryKey: ["financial-metrics", timeframe],
    queryFn: async () => {
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/analytics/financial?timeframe=${timeframe}`,
          await axiosHeaders()
        );

        const transformedData = {
          ...data,
          timeSeriesData: data.timeSeriesData.map((item: TimeSeriesData) => {
            const netAmount = item.revenue / 1.16;
            const tax = item.revenue - netAmount;

            const totalCosts =
              (item.cost || 0) +
              tax +
              (item.shipping || 0) +
              (item.deliveryCost || 0);

            const profit = item.revenue - totalCosts;

            return {
              ...item,
              tax,
              profit,
            };
          }),
          grossProfit: (() => {
            const netRevenue = data.totalRevenue / 1.16;
            const totalTax = data.totalRevenue - netRevenue;

            return (
              data.totalRevenue -
              (data.totalCost +
                totalTax +
                data.totalShipping +
                (data.totalDeliveryCost || 0))
            );
          })(),
        };

        return transformedData;
      } catch (error) {
        console.error("Error fetching financial metrics:", error);
        throw error;
      }
    },
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-red-500 font-medium">
          Error loading financial metrics
        </div>
        <div className="text-sm text-gray-500">
          Please try again later or contact support
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const cards = [
    {
      title: "Total Revenue",
      value: formatPrice(metrics.totalRevenue),
      description: "Total revenue from orders",
      icon: DollarSign,
      color: "text-primary",
      bgColor: "bg-primary/10",
      trend: "+12.5%",
      trendUp: true,
    },
    {
      title: "Net Profit",
      value: formatPrice(metrics.grossProfit),
      description: "Revenue minus all costs (ABP, VAT, Shipping, Delivery)",
      icon: Calculator,
      color: "text-primary",
      bgColor: "bg-primary/10",
      trend: "+8.2%",
      trendUp: true,
    },
    {
      title: "Total Orders",
      value: metrics.orderCount,
      description: "Number of orders",
      icon: Package,
      color: "text-primary",
      bgColor: "bg-primary/10",
      trend: "+15.3%",
      trendUp: true,
    },
    {
      title: "Total Discounts",
      value: formatPrice(metrics.totalDiscounts),
      description: "Total discounts applied",
      icon: Percent,
      color: "text-primary",
      bgColor: "bg-primary/10",
      trend: "-2.4%",
      trendUp: false,
    },
  ];

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--primary))",
    },
    profit: {
      label: "Profit",
      color: "hsl(var(--primary)/0.8)",
    },
    cost: {
      label: "Cost",
      color: "hsl(var(--primary)/0.6)",
    },
    subtotal: {
      label: "Net Sales",
      color: "hsl(var(--primary)/0.9)",
    },
    tax: {
      label: "Tax",
      color: "hsl(var(--primary)/0.7)",
    },
    shipping: {
      label: "Shipping",
      color: "hsl(var(--primary)/0.5)",
    },
    discounts: {
      label: "Discounts",
      color: "hsl(var(--primary)/0.4)",
    },
  } as const;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">
          Financial Overview
        </h2>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Last 7 Days</SelectItem>
            <SelectItem value="weekly">Last 4 Weeks</SelectItem>
            <SelectItem value="monthly">Last 6 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Card key={card.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${card.bgColor}`}>
                <card.icon
                  className={`h-5 w-5 ${card.color}`}
                  aria-hidden="true"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{card.value}</div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-medium ${
                    card.trendUp ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {card.trend}
                </span>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Tax Breakdown</CardTitle>
            <CardDescription>Tax collected from orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Total Tax</span>
                <span className="text-lg font-bold text-primary">
                  {formatPrice(metrics.totalTax)}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Tax Rate</span>
                <span className="text-lg font-bold text-primary">16%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Revenue & Profit Comparison</CardTitle>
            <CardDescription>
              Monthly revenue and profit analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => formatChartDate(date, timeframe)}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickFormatter={formatYAxisTick}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  width={80}
                />
                <Tooltip
                  content={
                    <CustomTooltip
                      timeframe={timeframe}
                      formatter={formatPrice}
                    />
                  }
                />
                <Legend />
                <Bar
                  dataKey="revenue"
                  name="Revenue"
                  fill={chartConfig.revenue.color}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="profit"
                  name="Profit"
                  fill={chartConfig.profit.color}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Revenue Components</CardTitle>
            <CardDescription>
              Detailed breakdown of revenue streams
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={metrics.timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => formatChartDate(date, timeframe)}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickFormatter={formatYAxisTick}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  width={80}
                />
                <Tooltip
                  content={
                    <CustomTooltip
                      timeframe={timeframe}
                      formatter={formatPrice}
                    />
                  }
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="subtotal"
                  name={chartConfig.subtotal.label}
                  stackId="1"
                  stroke={chartConfig.subtotal.color}
                  fill={chartConfig.subtotal.color}
                  fillOpacity={0.2}
                />
                <Area
                  type="monotone"
                  dataKey="tax"
                  name={chartConfig.tax.label}
                  stackId="1"
                  stroke={chartConfig.tax.color}
                  fill={chartConfig.tax.color}
                  fillOpacity={0.2}
                />
                <Area
                  type="monotone"
                  dataKey="shipping"
                  name={chartConfig.shipping.label}
                  stackId="1"
                  stroke={chartConfig.shipping.color}
                  fill={chartConfig.shipping.color}
                  fillOpacity={0.2}
                />
                <Area
                  type="monotone"
                  dataKey="discounts"
                  name={chartConfig.discounts.label}
                  stackId="1"
                  stroke={chartConfig.discounts.color}
                  fill={chartConfig.discounts.color}
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Profit Analysis</CardTitle>
            <CardDescription>
              Revenue, costs, and profit breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={metrics.timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => formatChartDate(date, timeframe)}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickFormatter={formatYAxisTick}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  width={80}
                />
                <Tooltip
                  content={
                    <CustomTooltip
                      timeframe={timeframe}
                      formatter={formatPrice}
                    />
                  }
                />
                <Legend />
                <Bar
                  dataKey="revenue"
                  name="Revenue"
                  fill={chartConfig.revenue.color}
                  opacity={0.8}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="cost"
                  name="Product Cost"
                  fill={chartConfig.cost.color}
                  opacity={0.8}
                  stackId="costs"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="tax"
                  name="Tax"
                  fill={chartConfig.tax.color}
                  opacity={0.8}
                  stackId="costs"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="shipping"
                  name="Shipping"
                  fill={chartConfig.shipping.color}
                  opacity={0.8}
                  stackId="costs"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="deliveryCost"
                  name="Delivery"
                  fill={chartConfig.shipping.color}
                  opacity={0.6}
                  stackId="costs"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  name="Net Profit"
                  stroke={chartConfig.profit.color}
                  strokeWidth={3}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
