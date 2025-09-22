"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
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
      ...baseNavigation,
      {
        name: "User Management",
        href: "/admin/users",
        icon: Users,
      },
      {
        name: "Property Oversight",
        href: "/admin/properties",
        icon: Building2,
      },
      {
        name: "Verification Queue",
        href: "/admin/verification",
        icon: Shield,
      },
      {
        name: "Reports & Analytics",
        href: "/admin/reports",
        icon: FileText,
      },
      {
        name: "Dispute Resolution",
        href: "/admin/disputes",
        icon: Scale,
      },
      {
        name: "System Activity",
        href: "/admin/activity",
        icon: Activity,
      },
      {
        name: "System Settings",
        href: "/admin/settings",
        icon: Settings,
      },
    ]
  }

  if (role === "caretaker") {
    return [
      ...baseNavigation,
      {
        name: "Properties & Units",
        href: "/properties",
        icon: Building2,
      },
      {
        name: "Tenant Directory",
        href: "/tenants",
        icon: Phone,
      },
      {
        name: "Maintenance Requests",
        href: "/maintenance",
        icon: Wrench,
      },
      {
        name: "Meter Readings",
        href: "/meter-readings",
        icon: Zap,
      },
      {
        name: "Profile & Settings",
        href: "/profile",
        icon: Settings,
      },
    ]
  }

  if (role === "tenant") {
    return [
      ...baseNavigation,
      {
        name: "My Lease",
        href: "/my-lease",
        icon: Home,
      },
      {
        name: "Payments & Invoices",
        href: "/payments-invoices",
        icon: Receipt,
      },
      {
        name: "Pay Rent",
        href: "/pay-rent",
        icon: CreditCard,
      },
      {
        name: "Maintenance Requests",
        href: "/maintenance-requests",
        icon: Tool,
      },
      {
        name: "Profile & Settings",
        href: "/profile",
        icon: User,
      },
    ]
  }

  // Landlord navigation
  return [
    ...baseNavigation,
    {
      name: "Properties",
      href: "/properties",
      icon: Building2,
    },
    {
      name: "Finance",
      href: "/finance",
      icon: DollarSign,
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
      name: "Tenants",
      href: "/tenants",
      icon: UserCheck,
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
      name: "Profile & Settings",
      href: "/profile",
      icon: Settings,
    },
  ]
}

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()

  const currentUserRole = user?.role || "landlord"
  const navigation = getNavigationForRole(currentUserRole)

  const handleLogout = async () => {
    try {
      await logout()
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of PropertyHub",
      })
      router.push("/login")
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error signing you out",
        variant: "destructive",
      })
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

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 min-h-[44px]",
                isActive ? "bg-indigo-100 text-indigo-700 shadow-lg" : "text-white/90 hover:bg-white/10 hover:text-white",
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
