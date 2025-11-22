"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
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
import { StatCard } from "@/components/ui/stat-card";
import { useGetDashboardCardDataQuery, useGetDashboardStatsQuery, useTotalRevenueQuery } from "@/lib/store";
import {
  Baby,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

// API data interfaces are defined in the API files
type TimeFilter = "6months" | "1month" | "3months" | "1year";

// Get the current year and generate previous years
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 6 }, (_, i) => currentYear - (i + 1));

export default function DashboardOverview() {  
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectRevYear, setSelectRevYear] = useState(currentYear)

  const { data: card, isLoading: cardLoading } = useGetDashboardCardDataQuery({ year: selectedYear });
  const cardData = card?.data;

  const { data: stats, isLoading: statsLoading } = useGetDashboardStatsQuery({ year: selectedYear });
  const userData = stats?.data;

  const { data: revenueData } = useTotalRevenueQuery({ year: selectRevYear } );
  const revenue = revenueData?.data;

  console.log('selectRevYear', selectRevYear.toString())
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600">Welcome back! Here`s what`s happening with your platform.</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value={`$${cardData?.totalRevenue?.toLocaleString() || '0'}`}
            changeType="increase"
            icon={DollarSign}
          />
          <StatCard
            title="Total Bookings"
            value={cardData?.totalBookings?.toLocaleString() || '0'}
            changeType="increase"
            icon={Calendar}
          />
          <StatCard
            title="Total Parents"
            value={cardData?.totalParents?.toLocaleString() || '0'}
            changeType="increase"
            icon={Users}
          />
          <StatCard
            title="Total Nannies"
            value={cardData?.totalNannies?.toString() || '0'}
            changeType="increase"
            icon={Baby}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6">
          {/* User Distribution Chart */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Users Overview
                  </CardTitle>
                  <CardDescription>
                    Monthly distribution of mothers and nannies
                  </CardDescription>
                </div>

                <div>
                  <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number(value))}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={currentYear.toString()}>{`Current Year (${new Date().getFullYear()})`}</SelectItem>
                      {years?.map((year) => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={userData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="totalParents" fill="#CD671C" name="Mothers" />
                  <Bar dataKey="totalNannies" fill="#F59E0B" name="Nannies" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue Trend Chart */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="">
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Revenue & Bookings Trend
                  </CardTitle>
                  <CardDescription>
                    Monthly revenue and booking trends
                  </CardDescription>
                </div>
                <Select value={selectRevYear.toString()} onValueChange={(value) => setSelectRevYear(Number(value))}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={currentYear.toString()}>{`Current Year (${new Date().getFullYear()})`}</SelectItem>
                    {years?.map((year) => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={revenue || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="totalRevenue"
                    stroke="#CD671C"
                    fill="#CD671C"
                    fillOpacity={0.1}
                    name="Revenue ($)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="totalBookings"
                    stroke="#CD671C"
                    strokeWidth={2}
                    name="Bookings"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
