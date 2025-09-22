"use client"

import { useEffect } from "react"
import { MainLayout } from "@/components/main-layout"
import { LandlordDashboard } from "@/components/dashboard/landlord-dashboard"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchDashboardStats, fetchActivities } from "@/lib/slices/dashboardSlice"
import { fetchProperties } from "@/lib/slices/propertiesSlice"

export default function LandlordDashboardPage() {
  const dispatch = useAppDispatch()
  const { stats, activities, loading: dashboardLoading } = useAppSelector((state) => state.dashboard)
  const { properties, loading: propertiesLoading } = useAppSelector((state) => state.properties)
  const { currentUser } = useAppSelector((state) => state.users)

  useEffect(() => {
    dispatch(fetchDashboardStats())
    dispatch(fetchActivities())
    dispatch(fetchProperties())
  }, [dispatch])

  if (!currentUser || currentUser.role !== "landlord") {
    return (
      <MainLayout>
        <div className="p-8">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-2 text-gray-600">You do not have permission to access this page.</p>
        </div>
      </MainLayout>
    )
  }

  if (dashboardLoading || propertiesLoading) {
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
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              Property Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your properties with clear task tracking and simple data overview.
            </p>
          </div>
        </div>

        <LandlordDashboard
          stats={stats}
          activities={activities}
          properties={properties}
          tasks={[]} // Add tasks from your state management
          onTaskAction={(taskId, action) => {
            // Handle task actions
            console.log('Task action:', taskId, action)
          }}
        />
      </div>
    </MainLayout>
  )
}
