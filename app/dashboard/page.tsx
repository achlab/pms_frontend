"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/main-layout"
import { useAppSelector } from "@/lib/hooks"

export default function DashboardPage() {
  const router = useRouter()
  const { currentUser } = useAppSelector((state) => state.users)

  useEffect(() => {
    console.log("Dashboard page - Current user:", currentUser)
    
    if (currentUser) {
      console.log("Redirecting based on role:", currentUser.role)
      
      const redirectPath = (() => {
        switch (currentUser.role) {
          case "super_admin":
            return "/admin/dashboard"
          case "landlord":
            return "/landlord/dashboard"
          case "caretaker":
            return "/caretaker/dashboard"
          case "tenant":
            return "/tenant/dashboard"
          default:
            console.error("Unknown user role:", currentUser.role)
            return null
        }
      })()

      if (redirectPath && window.location.pathname === "/dashboard") {
        console.log("Redirecting to:", redirectPath)
        router.replace(redirectPath)
      } else {
        console.log("Already on correct dashboard or no redirect needed")
      }
    } else {
      console.log("No user found, waiting for auth state...")
    }
  }, [currentUser, router])

  // Show loading state while redirecting
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