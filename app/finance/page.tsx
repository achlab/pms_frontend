"use client"

import { useEffect } from "react"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedCard } from "@/components/animated-card"
import { RevenueTrendChart } from "@/components/charts/revenue-trend-chart"
import { PropertyRevenueChart } from "@/components/charts/property-revenue-chart"
import { CashFlowProjection } from "@/components/finance/cash-flow-projection"
import { ExpenseTracker } from "@/components/finance/expense-tracker"
import { FinancialSummary } from "@/components/finance/financial-summary"
import { DollarSign, TrendingUp, TrendingDown, Calculator, FileText, BarChart3 } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchDashboardStats } from "@/lib/slices/dashboardSlice"
import { fetchProperties } from "@/lib/slices/propertiesSlice"
import Link from "next/link"

export default function FinancePage() {
  const dispatch = useAppDispatch()
  const { stats, loading } = useAppSelector((state) => state.dashboard)
  const { properties } = useAppSelector((state) => state.properties)
  const { invoices } = useAppSelector((state) => state.invoices)

  useEffect(() => {
    dispatch(fetchDashboardStats())
    dispatch(fetchProperties())
  }, [dispatch])

  // Calculate financial metrics
  const totalRevenue = properties.reduce((sum, prop) => sum + prop.monthlyRevenue, 0)
  const pendingInvoices = invoices.filter((inv) => inv.status === "pending").length
  const overdueInvoices = invoices.filter((inv) => inv.status === "overdue").length
  const totalInvoiceAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0)

  return (
    <MainLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start animate-in fade-in-0 slide-in-from-top-4 duration-500">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              Financial Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Comprehensive financial overview and management tools for your property portfolio.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/invoices">
              <Button variant="outline" className="min-h-[44px] bg-transparent">
                <FileText className="h-4 w-4 mr-2" />
                Manage Invoices
              </Button>
            </Link>
            <Link href="/rent-roll">
              <Button className="min-h-[44px]">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Rent Roll
              </Button>
            </Link>
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatedCard delay={100} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalRevenue.toLocaleString()}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 dark:text-green-400">+12% this month</span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={200} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Invoices</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingInvoices}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      $
                      {invoices
                        .filter((inv) => inv.status === "pending")
                        .reduce((sum, inv) => sum + inv.amount, 0)
                        .toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={300} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue Payments</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{overdueInvoices}</p>
                  <div className="flex items-center mt-2">
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    <span className="text-sm text-red-600 dark:text-red-400">Needs attention</span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900 dark:to-orange-900 rounded-lg flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={400} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Profit</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">$45,230</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 dark:text-green-400">+8% vs last month</span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-emerald-100 to-cyan-100 dark:from-emerald-900 dark:to-cyan-900 rounded-lg flex items-center justify-center">
                  <Calculator className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnimatedCard delay={500} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <RevenueTrendChart />
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={600} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Revenue by Property</CardTitle>
            </CardHeader>
            <CardContent>
              <PropertyRevenueChart />
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Financial Management Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <AnimatedCard delay={700} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <CashFlowProjection />
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={800} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <ExpenseTracker />
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={900} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <FinancialSummary />
            </CardContent>
          </AnimatedCard>
        </div>
      </div>
    </MainLayout>
  )
}
