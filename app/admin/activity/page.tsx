"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedCard } from "@/components/animated-card"
import {
  Activity,
  Building2,
  DollarSign,
  Wrench,
  UserPlus,
  Settings,
  Search,
  Download,
  Shield,
  AlertTriangle,
  Eye,
  Lock,
} from "lucide-react"
import { formatDateTime } from "@/lib/localization"
import { useState } from "react"

const systemActivities = [
  {
    id: 1,
    type: "security_alert",
    title: "Multiple Failed Login Attempts",
    description: "5 failed login attempts from IP 192.168.1.100",
    userId: null,
    timestamp: "2024-02-15T11:45:00Z",
    status: "critical",
    severity: "high",
    details: { ip: "192.168.1.100", attempts: 5, email: "suspicious@email.com" },
    category: "security",
  },
  {
    id: 2,
    type: "user_registration",
    title: "New Landlord Registration",
    description: "Kwame Asante registered as a landlord",
    userId: 3,
    timestamp: "2024-02-15T10:30:00Z",
    status: "pending",
    severity: "low",
    details: { email: "kwame.asante@gmail.com", role: "landlord", ghanaCard: "GHA-123456789-0" },
    category: "user_management",
  },
  {
    id: 3,
    type: "property_added",
    title: "Property Added",
    description: "Sunset Apartments added by Kofi Mensah",
    userId: 1,
    propertyId: 1,
    timestamp: "2024-02-15T09:15:00Z",
    status: "completed",
    severity: "low",
    details: { propertyName: "Sunset Apartments", units: 12, location: "Accra, Greater Accra" },
    category: "property_management",
  },
  {
    id: 4,
    type: "payment_recorded",
    title: "Large Payment Recorded",
    description: "Rent payment of ₵25,000 recorded for Unit 101",
    userId: 1,
    amount: 25000,
    timestamp: "2024-02-15T08:45:00Z",
    status: "flagged",
    severity: "medium",
    details: { unit: "101", method: "Bank Transfer", amount: "₵25,000" },
    category: "financial",
  },
  {
    id: 5,
    type: "admin_action",
    title: "User Account Suspended",
    description: "Landlord account suspended due to policy violation",
    userId: 4,
    timestamp: "2024-02-15T08:00:00Z",
    status: "completed",
    severity: "high",
    details: { suspendedUser: "john.doe@email.com", reason: "Fraudulent property listing", adminUser: "Super Admin" },
    category: "security",
  },
  {
    id: 6,
    type: "data_export",
    title: "Data Export Request",
    description: "User data exported by admin",
    userId: 1,
    timestamp: "2024-02-14T16:20:00Z",
    status: "completed",
    severity: "medium",
    details: { exportType: "User Reports", recordCount: 150, adminUser: "Super Admin" },
    category: "data_management",
  },
  {
    id: 7,
    type: "system_config",
    title: "System Settings Modified",
    description: "Payment gateway configuration updated",
    userId: 1,
    timestamp: "2024-02-14T14:10:00Z",
    status: "completed",
    severity: "high",
    details: { setting: "Payment Gateway", oldValue: "MTN Mobile Money", newValue: "Multiple Gateways" },
    category: "system_management",
  },
]

export default function AdminActivityPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterSeverity, setFilterSeverity] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const filteredActivities = systemActivities.filter((activity) => {
    const matchesSearch =
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || activity.category === filterCategory
    const matchesSeverity = filterSeverity === "all" || activity.severity === filterSeverity
    const matchesStatus = filterStatus === "all" || activity.status === filterStatus

    return matchesSearch && matchesCategory && matchesSeverity && matchesStatus
  })

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "security_alert":
        return <Shield className="h-5 w-5" />
      case "admin_action":
        return <Lock className="h-5 w-5" />
      case "user_registration":
      case "user_approval":
        return <UserPlus className="h-5 w-5" />
      case "property_added":
        return <Building2 className="h-5 w-5" />
      case "payment_recorded":
        return <DollarSign className="h-5 w-5" />
      case "maintenance_request":
        return <Wrench className="h-5 w-5" />
      case "data_export":
        return <Download className="h-5 w-5" />
      case "system_config":
        return <Settings className="h-5 w-5" />
      default:
        return <Activity className="h-5 w-5" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "security_alert":
      case "admin_action":
        return "from-red-100 to-pink-100 dark:from-red-900 dark:to-pink-900"
      case "user_registration":
      case "user_approval":
        return "from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900"
      case "property_added":
        return "from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900"
      case "payment_recorded":
        return "from-emerald-100 to-cyan-100 dark:from-emerald-900 dark:to-cyan-900"
      case "maintenance_request":
        return "from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900"
      case "data_export":
        return "from-purple-100 to-violet-100 dark:from-purple-900 dark:to-violet-900"
      case "system_config":
        return "from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900"
      default:
        return "from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "medium":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "pending":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "flagged":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const totalActivities = systemActivities.length
  const securityAlerts = systemActivities.filter((a) => a.category === "security").length
  const criticalEvents = systemActivities.filter((a) => a.severity === "high").length
  const todayActivities = systemActivities.filter(
    (a) => new Date(a.timestamp).toDateString() === new Date().toDateString(),
  ).length

  const handleExportLogs = () => {
    // Mock export functionality
    console.log("[v0] Exporting audit logs...")
    alert("Audit logs exported successfully!")
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
        <div className="flex justify-between items-start animate-in fade-in-0 slide-in-from-top-4 duration-500">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              Audit Logs & Security Tracking
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Monitor all system activities, security events, and user actions with comprehensive audit trails.
            </p>
          </div>
          <Button onClick={handleExportLogs} className="bg-indigo-600 hover:bg-indigo-700">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>

        {/* Enhanced Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <AnimatedCard delay={100} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Activities</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalActivities}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">All time</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-lg flex items-center justify-center">
                  <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={200} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Security Alerts</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{securityAlerts}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Require attention</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900 dark:to-pink-900 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={300} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Critical Events</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{criticalEvents}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">High priority</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={400} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Today's Events</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{todayActivities}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Logged today</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-lg flex items-center justify-center">
                  <Eye className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>

        <AnimatedCard delay={500} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Filter & Search Audit Logs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="user_management">User Management</SelectItem>
                  <SelectItem value="property_management">Property Management</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="system_management">System Management</SelectItem>
                  <SelectItem value="data_management">Data Management</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger>
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </AnimatedCard>

        {/* Enhanced Activity Feed */}
        <AnimatedCard delay={600} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Audit Trail ({filteredActivities.length} events)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredActivities.map((activity, index) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-600 rounded-lg animate-in fade-in-0 slide-in-from-left-4 duration-300 border border-gray-200 dark:border-gray-500"
                style={{ animationDelay: `${700 + index * 100}ms` }}
              >
                <div
                  className={`h-10 w-10 rounded-full bg-gradient-to-br ${getActivityColor(activity.type)} flex items-center justify-center`}
                >
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</h4>
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(activity.severity)}>{activity.severity}</Badge>
                      <Badge className={getStatusColor(activity.status)}>{activity.status.replace("_", " ")}</Badge>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDateTime(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{activity.description}</p>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-medium">Category:</span> {activity.category.replace("_", " ")}
                    {activity.userId && (
                      <span className="ml-4">
                        <span className="font-medium">User ID:</span> {activity.userId}
                      </span>
                    )}
                  </div>
                  {activity.details && (
                    <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-500 rounded text-xs text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Details:</span>
                      <div className="mt-1 space-y-1">
                        {Object.entries(activity.details).map(([key, value]) => (
                          <div key={key}>
                            <span className="font-medium">{key}:</span> {value}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </AnimatedCard>
    </div>
  )
}
