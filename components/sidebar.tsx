"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { useRoleAccess } from "@/lib/hooks/use-role-access"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import {
  LayoutDashboard,
  Building2,
  FileText,
  DollarSign,
  Users,
  Wrench,
  UserCheck,
  Shield,
  Settings,
  Activity,
  CreditCard,
  Scale,
  BarChart3,
  Zap,
  Phone,
  Home,
  Receipt,
  PenTool as Tool,
  User,
  LogOut,
} from "lucide-react"

const getNavigationForRole = (role: string) => {
  const baseNavigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
  ]

  if (role === "super_admin") {
    return [
      {
        name: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
      },
      {
        name: "User Management",
        href: "/admin/users",
        icon: Users,
      },
      {
        name: "Properties",
        href: "/admin/properties",
        icon: Building2,
      },
      {
        name: "Disputes",
        href: "/admin/disputes",
        icon: Scale,
      },
      {
        name: "Activity Log",
        href: "/admin/activity",
        icon: Activity,
      },
      {
        name: "Settings",
        href: "/admin/settings",
        icon: Settings,
      },
      {
        name: "Profile",
        href: "/profile",
        icon: User,
      },
    ]
  }

  if (role === "caretaker") {
    return [
      {
        name: "Dashboard",
        href: "/caretaker/dashboard",
        icon: LayoutDashboard,
      },
      {
        name: "Invoices",
        href: "/invoices",
        icon: FileText,
      },
      {
        name: "Maintenance",
        href: "/maintenance",
        icon: Wrench,
      },
      {
        name: "My Unit",
        href: "/my-unit",
        icon: Home,
      },
      {
        name: "Profile",
        href: "/profile",
        icon: User,
      },
      {
        name: "Settings",
        href: "/settings",
        icon: Settings,
      },
    ]
  }

  if (role === "tenant") {
    return [
      {
        name: "Dashboard",
        href: "/tenant/dashboard",
        icon: LayoutDashboard,
      },
      {
        name: "My Lease",
        href: "/my-lease",
        icon: Home,
      },
      {
        name: "My Unit",
        href: "/my-unit",
        icon: Building2,
      },
      {
        name: "Pay Rent",
        href: "/pay-rent",
        icon: CreditCard,
      },
      {
        name: "Invoices",
        href: "/invoices",
        icon: Receipt,
      },
      {
        name: "Maintenance",
        href: "/maintenance/create",
        icon: Wrench,
      },
      {
        name: "My Requests",
        href: "/maintenance-requests",
        icon: Tool,
      },
      {
        name: "Meter Readings",
        href: "/meter-readings",
        icon: Zap,
      },
      {
        name: "Profile",
        href: "/profile",
        icon: User,
      },
      {
        name: "Settings",
        href: "/settings",
        icon: Settings,
      },
    ]
  }

  // Landlord navigation
  return [
    {
      name: "Dashboard",
      href: "/landlord/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Properties",
      href: "/properties",
      icon: Building2,
    },
    {
      name: "Tenants",
      href: "/tenants",
      icon: UserCheck,
    },
    {
      name: "Invoices",
      href: "/invoices",
      icon: FileText,
    },
    {
      name: "Payments",
      href: "/payments",
      icon: CreditCard,
    },
    {
      name: "Rent Roll",
      href: "/rent-roll",
      icon: Users,
    },
    {
      name: "Maintenance",
      href: "/maintenance",
      icon: Wrench,
    },
    {
      name: "Reports",
      href: "/reports",
      icon: BarChart3,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ]
}

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout, isLoading } = useAuth()
  const { roleName, canAccessRoute } = useRoleAccess()
  const router = useRouter()

  const currentUserRole = user?.role || "landlord"
  const navigation = getNavigationForRole(currentUserRole)

  const handleLogout = async () => {
    try {
      await logout()
      // Auth context will handle redirect to /login
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of PropertyHub",
      })
    } catch (error) {
      // Even if logout fails, user will be redirected
      console.error("Logout error:", error)
    }
  }

  return (
  <div className="hidden lg:flex h-screen w-64 flex-col overflow-y-auto hide-scrollbar bg-gradient-to-b from-indigo-600 to-cyan-500 border-r border-indigo-500/20">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center px-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Building2 className="h-8 w-8 text-white" />
          <span className="font-heading font-bold text-xl text-white">
            {currentUserRole === "super_admin"
              ? "PropertyHub Admin"
              : currentUserRole === "caretaker"
                ? "PropertyHub Care"
                : currentUserRole === "tenant"
                  ? "PropertyHub Tenant"
                  : "PropertyHub"}
          </span>
        </div>
      </div>

      {/* Role Badge */}
      <div className="px-6 py-4">
        <Badge variant="secondary" className="w-full justify-center bg-white/20 text-white hover:bg-white/30">
          {roleName || "User"}
        </Badge>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          // Only show links user can access
          if (!canAccessRoute(item.href)) {
            return null
          }
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 min-h-[44px]",
                isActive 
                  ? "bg-white text-indigo-700 shadow-lg" 
                  : "text-white/90 hover:bg-white/10 hover:text-white",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-white/10 space-y-3">
        <div className="flex items-center gap-3 px-3 py-2 min-h-[44px]">
          <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            {user?.avatar ? (
              <img src={user.avatar || "/placeholder.svg"} alt={user.name} className="h-8 w-8 rounded-full" />
            ) : currentUserRole === "super_admin" ? (
              <Shield className="h-4 w-4 text-white" />
            ) : currentUserRole === "caretaker" ? (
              <Wrench className="h-4 w-4 text-white" />
            ) : currentUserRole === "tenant" ? (
              <User className="h-4 w-4 text-white" />
            ) : (
              <span className="text-sm font-medium text-white">
                {user?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("") || "U"}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name || "User"}</p>
            <p className="text-xs text-white/70 truncate capitalize">{currentUserRole.replace("_", " ")}</p>
          </div>
        </div>

        <Button
          onClick={handleLogout}
          disabled={isLoading}
          variant="ghost"
          className="w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white min-h-[44px]"
        >
          <LogOut className="h-5 w-5" />
          {isLoading ? "Signing out..." : "Sign Out"}
        </Button>
      </div>
    </div>
  )
}
