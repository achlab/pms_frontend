"use client"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedCard } from "@/components/animated-card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import {
  FileText,
  Download,
  CalendarIcon,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building2,
  AlertCircle,
} from "lucide-react"
import { useAppSelector } from "@/lib/hooks"
import { formatCurrency } from "@/lib/localization"
import { format } from "date-fns"

// Mock data for reports
const rentCollectionData = [
  { unit: "Unit 101", expected: 2500, collected: 2500, status: "paid", tenant: "Kofi Mensah", dueDate: "2024-01-01" },
  { unit: "Unit 102", expected: 2300, collected: 2300, status: "paid", tenant: "Ama Serwaa", dueDate: "2024-01-01" },
  { unit: "Unit 103", expected: 2800, collected: 0, status: "overdue", tenant: "Kwame Asante", dueDate: "2024-01-01" },
  {
    unit: "Unit 201",
    expected: 2600,
    collected: 2600,
    status: "paid",
    tenant: "Akosua Boateng",
    dueDate: "2024-01-01",
  },
  { unit: "Unit 202", expected: 2400, collected: 1200, status: "partial", tenant: "Yaw Osei", dueDate: "2024-01-01" },
]

const occupancyTrendData = [
  { month: "Jan", occupancyRate: 85, vacantUnits: 3, totalUnits: 20 },
  { month: "Feb", occupancyRate: 90, vacantUnits: 2, totalUnits: 20 },
  { month: "Mar", occupancyRate: 95, vacantUnits: 1, totalUnits: 20 },
  { month: "Apr", occupancyRate: 90, vacantUnits: 2, totalUnits: 20 },
  { month: "May", occupancyRate: 85, vacantUnits: 3, totalUnits: 20 },
  { month: "Jun", occupancyRate: 95, vacantUnits: 1, totalUnits: 20 },
]

const propertyPerformanceData = [
  { name: "Sunrise Apartments", occupancy: 95, revenue: 12500, units: 5 },
  { name: "Downtown Complex", occupancy: 80, revenue: 18000, units: 8 },
  { name: "Garden View", occupancy: 100, revenue: 8400, units: 3 },
  { name: "City Heights", occupancy: 75, revenue: 9600, units: 4 },
]

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#6366f1"]

export default function ReportsPage() {
  const { properties } = useAppSelector((state) => state.properties)

  const [selectedMonth, setSelectedMonth] = useState("2024-01")
  const [reportType, setReportType] = useState("rent-collection")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: new Date(2024, 0, 1),
    to: new Date(2024, 11, 31),
  })

  // Calculate summary metrics
  const totalExpected = rentCollectionData.reduce((sum, item) => sum + item.expected, 0)
  const totalCollected = rentCollectionData.reduce((sum, item) => sum + item.collected, 0)
  const collectionRate = Math.round((totalCollected / totalExpected) * 100)
  const overdueAmount = rentCollectionData
    .filter((item) => item.status === "overdue")
    .reduce((sum, item) => sum + item.expected, 0)

  const currentOccupancy = occupancyTrendData[occupancyTrendData.length - 1]?.occupancyRate || 0
  const avgOccupancy = Math.round(
    occupancyTrendData.reduce((sum, item) => sum + item.occupancyRate, 0) / occupancyTrendData.length,
  )

  const exportToExcel = () => {
    alert("Exporting report to Excel... (This would download an Excel file in a real implementation)")
  }

  return (
    <MainLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start animate-in fade-in-0 slide-in-from-top-4 duration-500">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              Reports & Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Comprehensive financial and occupancy reports for your property portfolio.
            </p>
          </div>
          <Button onClick={exportToExcel} className="min-h-[44px]">
            <Download className="h-4 w-4 mr-2" />
            Export to Excel
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-200">
          <div className="flex gap-4">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-[200px] border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="Select Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rent-collection">Rent Collection Report</SelectItem>
                <SelectItem value="occupancy">Occupancy Report</SelectItem>
                <SelectItem value="property-performance">Property Performance</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[150px] border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024-01">January 2024</SelectItem>
                <SelectItem value="2024-02">February 2024</SelectItem>
                <SelectItem value="2024-03">March 2024</SelectItem>
                <SelectItem value="2024-04">April 2024</SelectItem>
                <SelectItem value="2024-05">May 2024</SelectItem>
                <SelectItem value="2024-06">June 2024</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="min-h-[44px] border-gray-200 dark:border-gray-700 bg-transparent">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {dateRange.from && dateRange.to
                    ? `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd")}`
                    : "Select Date Range"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => setDateRange(range || { from: undefined, to: undefined })}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <AnimatedCard delay={100} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Collection Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{collectionRate}%</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 dark:text-green-400">+5% vs last month</span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={200} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Collected</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalCollected)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    of {formatCurrency(totalExpected)} expected
                  </p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={300} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Current Occupancy</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentOccupancy}%</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{avgOccupancy}% avg this year</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={400} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Overdue Amount</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(overdueAmount)}</p>
                  <div className="flex items-center mt-2">
                    <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                    <span className="text-sm text-red-600 dark:text-red-400">Needs attention</span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900 dark:to-orange-900 rounded-lg flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Report Content */}
        {reportType === "rent-collection" && (
          <div className="space-y-8">
            {/* Rent Collection Chart */}
            <AnimatedCard delay={500} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Rent Collection Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={rentCollectionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="unit" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="expected" fill="#e5e7eb" name="Expected" />
                    <Bar dataKey="collected" fill="#10b981" name="Collected" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </AnimatedCard>

            {/* Rent Collection Table */}
            <AnimatedCard delay={600} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Detailed Rent Collection Report</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200 dark:border-gray-600">
                      <TableHead>Unit</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Expected</TableHead>
                      <TableHead>Collected</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rentCollectionData.map((item, index) => (
                      <TableRow key={index} className="border-gray-200 dark:border-gray-600">
                        <TableCell className="font-medium">{item.unit}</TableCell>
                        <TableCell>{item.tenant}</TableCell>
                        <TableCell>{formatCurrency(item.expected)}</TableCell>
                        <TableCell>{formatCurrency(item.collected)}</TableCell>
                        <TableCell>{format(new Date(item.dueDate), "MMM dd, yyyy")}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.status === "paid"
                                ? "default"
                                : item.status === "overdue"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className={
                              item.status === "paid"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : item.status === "overdue"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            }
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </AnimatedCard>
          </div>
        )}

        {reportType === "occupancy" && (
          <div className="space-y-8">
            {/* Occupancy Trend Chart */}
            <AnimatedCard delay={500} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Occupancy Rate Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={occupancyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Line
                      type="monotone"
                      dataKey="occupancyRate"
                      stroke="#10b981"
                      strokeWidth={3}
                      name="Occupancy Rate"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </AnimatedCard>

            {/* Vacancy Analysis */}
            <AnimatedCard delay={600} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Vacancy Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200 dark:border-gray-600">
                      <TableHead>Month</TableHead>
                      <TableHead>Occupancy Rate</TableHead>
                      <TableHead>Vacant Units</TableHead>
                      <TableHead>Total Units</TableHead>
                      <TableHead>Revenue Impact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {occupancyTrendData.map((item, index) => (
                      <TableRow key={index} className="border-gray-200 dark:border-gray-600">
                        <TableCell className="font-medium">{item.month}</TableCell>
                        <TableCell>{item.occupancyRate}%</TableCell>
                        <TableCell>{item.vacantUnits}</TableCell>
                        <TableCell>{item.totalUnits}</TableCell>
                        <TableCell>{formatCurrency(item.vacantUnits * 2500)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </AnimatedCard>
          </div>
        )}

        {reportType === "property-performance" && (
          <div className="space-y-8">
            {/* Property Performance Chart */}
            <AnimatedCard delay={500} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Property Performance Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={propertyPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="occupancy" fill="#10b981" name="Occupancy %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </AnimatedCard>

            {/* Property Performance Table */}
            <AnimatedCard delay={600} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Property Performance Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200 dark:border-gray-600">
                      <TableHead>Property</TableHead>
                      <TableHead>Units</TableHead>
                      <TableHead>Occupancy Rate</TableHead>
                      <TableHead>Monthly Revenue</TableHead>
                      <TableHead>Revenue per Unit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {propertyPerformanceData.map((item, index) => (
                      <TableRow key={index} className="border-gray-200 dark:border-gray-600">
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.units}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{item.occupancy}%</span>
                            <div className="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                              <div className="h-2 bg-green-500 rounded-full" style={{ width: `${item.occupancy}%` }} />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(item.revenue)}</TableCell>
                        <TableCell>{formatCurrency(Math.round(item.revenue / item.units))}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </AnimatedCard>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
