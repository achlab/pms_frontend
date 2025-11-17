"use client";

import { MainLayout } from "@/components/main-layout";
import { useDashboard } from "@/lib/hooks/use-dashboard";
import { DashboardSkeleton } from "@/components/ui/loading-skeleton";
import { DashboardStatsOverview } from "@/components/dashboard/dashboard-stats-overview";
import { CurrentLeaseCard } from "@/components/dashboard/current-lease-card";
import { MaintenanceOverviewCard } from "@/components/dashboard/maintenance-overview-card";
import { RecentPaymentsCard } from "@/components/dashboard/recent-payments-card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TenantDashboardPage() {
  const { data, isLoading, error, refetch } = useDashboard();

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-8">
          <DashboardSkeleton />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Failed to Load Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We couldn't load your dashboard data. Please try again.
            </p>
            <Button onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const dashboardData = data?.data;

  if (!dashboardData) {
    return (
      <MainLayout>
        <div className="p-8">
          <div className="text-center py-12 text-muted-foreground">
            <p>No dashboard data available</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30">
        {/* Premium Hero Section */}
        <div className="relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
            <div className="absolute top-20 right-1/4 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-gradient-to-tr from-cyan-400/10 to-teal-400/10 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 p-8 space-y-8">
            {/* Spectacular Header */}
            <div className="text-center space-y-6 mb-12">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-full border border-white/20 dark:border-slate-700/50 shadow-xl">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Live Dashboard
                </span>
              </div>

              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-slate-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent leading-tight">
                  My Tenancy
                  <br />
                  <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Dashboard
                  </span>
                </h1>

                <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium max-w-3xl mx-auto leading-relaxed">
                  Experience premium property management with real-time insights,
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
                    {" "}seamless payments
                  </span>
                  , and
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">
                    {" "}instant support
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <div className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                  ✓ Verified Tenant
                </div>
                <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-300 font-bold text-sm">
                  🏠 Premium Location
                </div>
                <div className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-700 dark:text-purple-300 font-bold text-sm">
                  ⚡ Instant Support
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            <DashboardStatsOverview overview={dashboardData.overview} />

            {/* Main Dashboard Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
              {/* Current Lease - Spans 2 columns on large screens */}
              <div className="lg:col-span-2">
                <CurrentLeaseCard lease={dashboardData.current_lease} />
              </div>

              {/* Maintenance Overview */}
              <div>
                <MaintenanceOverviewCard maintenance={dashboardData.maintenance_requests} />
              </div>

              {/* Recent Payments - Spans full width on mobile, 3 columns on large screens */}
              <div className="md:col-span-2 lg:col-span-3">
                <RecentPaymentsCard
                  payments={dashboardData.recent_payments}
                  upcomingDueDate={dashboardData.upcoming_due_date}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

