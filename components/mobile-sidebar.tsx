"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import {
  LayoutDashboard,
  Building2,
  FileText,
  DollarSign,
  Users,
  Wrench,
  UserCheck,
  Menu,
  X,
  Shield,
  Settings,
  Activity,
  CreditCard,
  Scale,
  Home,
  Receipt,
  User,
  BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const getNavigationForRole = (role: string) => {
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
        name: "My Unit",
        href: "/my-unit",
        icon: Home,
      },
      {
        name: "Maintenance",
        href: "/maintenance-requests",
        icon: Wrench,
      },
      {
        name: "Profile",
        href: "/profile",
        icon: User,
      },
    ]
  }

  if (role === "tenant") {
    return [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        name: "My Unit",
        href: "/my-unit",
        icon: Home,
      },
      {
        name: "My Lease",
        href: "/my-lease",
        icon: FileText,
      },
      {
        name: "Pay Rent",
        href: "/pay-rent",
        icon: DollarSign,
      },
      {
        name: "Maintenance",
        href: "/maintenance-requests",
        icon: Wrench,
      },
      {
        name: "Payments",
        href: "/payments-invoices",
        icon: Receipt,
      },
      {
        name: "Profile",
        href: "/profile",
        icon: User,
      },
    ]
  }

  // Landlord navigation
  return [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
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
      name: "Reports",
      href: "/reports",
      icon: BarChart3,
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
      name: "Profile",
      href: "/profile",
      icon: User,
    },
  ]
}

export function MobileSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()

  const currentUserRole = user?.role || "landlord"
  const navigation = getNavigationForRole(currentUserRole)

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="h-11 w-11 bg-white/90 backdrop-blur-sm border-indigo-200 shadow-lg hover:bg-white"
        >
          <Menu className="h-5 w-5 text-indigo-600" />
        </Button>
      </div>

      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <div
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-indigo-600 to-cyan-500 border-r border-indigo-500/20 transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Close button */}
        <div className="flex justify-end p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Logo/Brand */}
        <div className="flex h-16 items-center px-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-white" />
            <span className="font-heading font-bold text-xl text-white">
              {currentUserRole === "super_admin" ? "PropertyHub Admin" : "PropertyHub"}
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
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 min-h-[44px]",
                  isActive ? "bg-white text-indigo-600 shadow-lg" : "text-white/90 hover:bg-white/10 hover:text-white",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 min-h-[44px]">
            <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              {currentUserRole === "super_admin" ? (
                <Shield className="h-4 w-4 text-white" />
              ) : (
                <span className="text-sm font-medium text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-white/70 truncate capitalize">
                {currentUserRole?.replace("_", " ") || "User"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
