"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/lib/hooks"
import { MainLayout } from "@/components/main-layout"

export default function TenantDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { currentUser } = useAppSelector((state) => state.users)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    console.log("TenantDashboardLayout - Checking authorization...")
    
    if (!currentUser) {
      console.log("TenantDashboardLayout - No user found, redirecting to login")
      router.replace("/login")
      return
    }
    
    if (currentUser.role !== "tenant") {
      console.log("TenantDashboardLayout - Invalid role, redirecting to dashboard")
      router.replace("/dashboard")
      return
    }

    console.log("TenantDashboardLayout - User authorized")
    setIsAuthorized(true)
  }, [currentUser, router])

  if (!isAuthorized) {
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

  return children
}
