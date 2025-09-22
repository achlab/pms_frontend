 "use client"

import { useEffect } from "react"
import { MainLayout } from "@/components/main-layout"
import { TenantDashboard } from "@/components/dashboard/tenant-dashboard"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchDashboardStats, fetchActivities } from "@/lib/slices/dashboardSlice"


export default function TenantDashboardPage() {
  const dispatch = useAppDispatch()
  const { tenantStats, activities, loading } = useAppSelector((state) => state.dashboard)
  const { currentUser } = useAppSelector((state) => state.users)

  useEffect(() => {
    console.log("Tenant Dashboard - Fetching data...")
    const fetchData = async () => {
      try {
        await dispatch(fetchDashboardStats()).unwrap()
        await dispatch(fetchActivities()).unwrap()
        console.log("Tenant Dashboard - Data fetched successfully")
      } catch (error) {
        console.error("Tenant Dashboard - Error fetching data:", error)
      }
    }
    fetchData()
  }, [dispatch])

  if (!currentUser || currentUser.role !== "tenant") {
    return (
      <MainLayout>
        <div className="p-8">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-2 text-gray-600">You do not have permission to access this page.</p>
        </div>
      </MainLayout>
    )
  }

  console.log("Dashboard State:", { loading, tenantStats, activities })

  if (loading || !tenantStats) {
    return (
      <MainLayout>
        <div className="p-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    )
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
          
          <div className="relative z-10 p-8 space-y-12">
            {/* Spectacular Header */}
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-full border border-white/20 dark:border-slate-700/50 shadow-xl">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Live Dashboard</span>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-slate-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent leading-tight">
                  My Tenancy
                  <br />
                  <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Dashboard
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 font-medium max-w-3xl mx-auto leading-relaxed">
                  Experience premium property management with real-time insights, 
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold"> seamless payments</span>, and 
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold"> instant support</span>
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

        <TenantDashboard
          stats={
            tenantStats || {
              unitAddress: "Property ABC, Unit B12",
              moveInDate: "Jan 15, 2023",
              currentBalance: 925.0,
              status: "overdue",
              nextRentDue: "Nov 5, 2023",
              nextRentAmount: 800.0,
              lastPaymentDate: "Sep 28, 2023",
              lastPaymentAmount: 800.0,
            }
          }
          activities={activities || []}
        />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
