"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { getDefaultRoute } from "@/lib/constants/routes"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        // Not authenticated, redirect to login
        router.replace("/login")
      } else {
        // Authenticated, redirect to role-specific dashboard
        const targetRoute = getDefaultRoute(user.role)
        router.replace(targetRoute)
      }
    }
  }, [user, isLoading, isAuthenticated, router])

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <p className="text-lg text-muted-foreground">Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}
