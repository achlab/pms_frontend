import { Activity } from "@/types/dashboard"
import { StatsCard } from "./stats-card"
import { ActivityFeed } from "./activity-feed"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedCard } from "@/components/animated-card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/localization"
import {
  Home,
  CreditCard,
  Wrench,
  Zap,
  FileText,
  Calendar,
  Phone,
  MapPin,
  Clock,
  TrendingUp,
  Shield,
  Star,
} from "lucide-react"

interface TenantStats {
  unitAddress: string
  moveInDate: string
  currentBalance: number
  status: "paid" | "pending" | "overdue"
  nextRentDue: string
  nextRentAmount: number
  lastPaymentDate: string
  lastPaymentAmount: number
}

interface TenantDashboardProps {
  stats: TenantStats
  activities: Activity[]
}

export function TenantDashboard({ stats, activities }: TenantDashboardProps) {
  return (
    <div className="space-y-12">
      {/* Premium Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Financial Status - Premium Card */}
        <AnimatedCard delay={100} className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 dark:from-emerald-400/20 dark:via-teal-400/20 dark:to-cyan-400/20"></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-cyan-400/20 to-blue-400/20 rounded-full translate-y-8 -translate-x-8 group-hover:scale-125 transition-transform duration-700"></div>
          
          <CardContent className="relative z-10 p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-4 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-xl group-hover:shadow-2xl transition-shadow duration-300">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className={`relative px-3 py-2 rounded-full font-bold text-xs shadow-lg backdrop-blur-sm ${
                stats.status === "paid" 
                  ? "bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                  : stats.status === "pending"
                    ? "bg-amber-100/80 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                    : "bg-red-100/80 text-red-700 dark:bg-red-900/40 dark:text-red-300"
              }`}>
                <div className="absolute inset-0 bg-white/20 rounded-full"></div>
                <span className="relative">
                  {stats.status === "paid" ? "✓ Paid" : stats.status === "pending" ? "⏳ Pending" : "⚠ Overdue"}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-black bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                {formatCurrency(stats.currentBalance)}
              </h3>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Current Balance</p>
            </div>
          </CardContent>
        </AnimatedCard>

        {/* Next Payment - Premium Card */}
        <AnimatedCard delay={200} className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 dark:from-blue-400/20 dark:via-indigo-400/20 dark:to-purple-400/20"></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full translate-y-8 -translate-x-8 group-hover:scale-125 transition-transform duration-700"></div>
          
          <CardContent className="relative z-10 p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-4 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl shadow-xl group-hover:shadow-2xl transition-shadow duration-300">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="px-3 py-2 bg-blue-100/80 dark:bg-blue-900/40 rounded-full font-bold text-xs text-blue-700 dark:text-blue-300 shadow-lg backdrop-blur-sm">
                <div className="absolute inset-0 bg-white/20 rounded-full"></div>
                <span className="relative">Due Soon</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-black bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                {formatCurrency(stats.nextRentAmount)}
              </h3>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Due {stats.nextRentDue}</p>
            </div>
          </CardContent>
        </AnimatedCard>

        {/* Lease Status - Premium Card */}
        <AnimatedCard delay={300} className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 dark:from-violet-400/20 dark:via-purple-400/20 dark:to-fuchsia-400/20"></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-violet-400/20 to-purple-400/20 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-fuchsia-400/20 to-pink-400/20 rounded-full translate-y-8 -translate-x-8 group-hover:scale-125 transition-transform duration-700"></div>
          
          <CardContent className="relative z-10 p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-4 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl shadow-xl group-hover:shadow-2xl transition-shadow duration-300">
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="px-3 py-2 bg-emerald-100/80 dark:bg-emerald-900/40 rounded-full font-bold text-xs text-emerald-700 dark:text-emerald-300 shadow-lg backdrop-blur-sm">
                <div className="absolute inset-0 bg-white/20 rounded-full"></div>
                <span className="relative">✓ Active</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-black bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                Lease
              </h3>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Expires Dec 31, 2023</p>
            </div>
          </CardContent>
        </AnimatedCard>

        {/* Property Rating - Premium Card */}
        <AnimatedCard delay={400} className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 dark:from-amber-400/20 dark:via-orange-400/20 dark:to-red-400/20"></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-red-400/20 to-pink-400/20 rounded-full translate-y-8 -translate-x-8 group-hover:scale-125 transition-transform duration-700"></div>
          
          <CardContent className="relative z-10 p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-4 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-xl group-hover:shadow-2xl transition-shadow duration-300">
                  <Star className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="px-3 py-2 bg-amber-100/80 dark:bg-amber-900/40 rounded-full font-bold text-xs text-amber-700 dark:text-amber-300 shadow-lg backdrop-blur-sm">
                <div className="absolute inset-0 bg-white/20 rounded-full"></div>
                <span className="relative">⭐ Excellent</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-black bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                4.8/5
              </h3>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Property Rating</p>
            </div>
          </CardContent>
        </AnimatedCard>
      </div>

      {/* Premium Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Luxury Property Information */}
        <AnimatedCard delay={500} className="group relative overflow-hidden bg-white dark:bg-slate-800 border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1">
          {/* Decorative Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-indigo-600/5 to-purple-600/5 dark:from-blue-400/10 dark:via-indigo-400/10 dark:to-purple-400/10"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full translate-y-12 -translate-x-12"></div>
          
          <CardHeader className="relative z-10 pb-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30 border-b-0">
            <CardTitle className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl blur-sm opacity-75"></div>
                <div className="relative p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl">
                  <Home className="h-7 w-7 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  My Property
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Your exclusive living space</p>
              </div>
              <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-xs font-bold text-blue-700 dark:text-blue-300">
                Premium
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="relative z-10 p-8 space-y-6">
            {/* Featured Property Showcase */}
            <div className="relative p-6 bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-700/50 dark:to-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/30 shadow-lg">
              <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{stats.unitAddress}</h4>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-medium">Residence since {stats.moveInDate}</span>
              </div>
            </div>
            
            {/* Sophisticated Details */}
            <div className="space-y-4">
              <div className="group relative p-5 bg-gradient-to-r from-white to-blue-50/30 dark:from-slate-700/30 dark:to-blue-900/10 rounded-xl border border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl group-hover:from-blue-500 group-hover:to-indigo-500 group-hover:shadow-lg transition-all duration-300">
                    <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400 group-hover:text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 dark:text-white mb-2">Property Complex</p>
                    <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">East Legon Heights</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-md text-xs font-medium text-blue-700 dark:text-blue-300">Unit B12</span>
                      <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-md text-xs font-medium text-amber-700 dark:text-amber-300">Premium Location</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="group relative p-5 bg-gradient-to-r from-white to-emerald-50/30 dark:from-slate-700/30 dark:to-emerald-900/10 rounded-xl border border-slate-200 dark:border-slate-600 hover:border-emerald-300 dark:hover:border-emerald-500 hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl group-hover:from-emerald-500 group-hover:to-teal-500 group-hover:shadow-lg transition-all duration-300">
                    <Phone className="h-5 w-5 text-emerald-600 dark:text-emerald-400 group-hover:text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 dark:text-white mb-2">Landlord Contact</p>
                    <p className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Mr. Kwame Mensah</p>
                    <Button variant="link" size="sm" className="p-0 h-auto text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold text-base hover:underline">
                      +233 24 123 4567
                    </Button>
                  </div>
                  <div className="px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full text-xs font-bold text-green-700 dark:text-green-300">
                    Available 24/7
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </AnimatedCard>

        {/* Premium Financial Dashboard */}
        <AnimatedCard delay={600} className="group relative overflow-hidden bg-white dark:bg-slate-800 border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1">
          {/* Decorative Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 via-teal-600/5 to-cyan-600/5 dark:from-emerald-400/10 dark:via-teal-400/10 dark:to-cyan-400/10"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-500/10 to-blue-500/10 rounded-full translate-y-12 -translate-x-12"></div>
          
          <CardHeader className="relative z-10 pb-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/30 dark:via-teal-900/30 dark:to-cyan-900/30 border-b-0">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-cyan-600 rounded-2xl blur-sm opacity-75"></div>
                  <div className="relative p-4 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-2xl shadow-xl">
                    <TrendingUp className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                    Financial Dashboard
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Your payment overview</p>
                </div>
              </div>
              <div className={`relative px-4 py-2 rounded-full font-bold text-sm shadow-xl ${
                stats.status === "paid"
                  ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                  : stats.status === "pending"
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                    : "bg-gradient-to-r from-red-500 to-pink-500 text-white"
              }`}>
                <div className="absolute inset-0 bg-white/20 rounded-full"></div>
                <span className="relative">
                  {stats.status === "paid" ? "✓ All Paid" : stats.status === "pending" ? "⏳ Processing" : "⚠ Action Required"}
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="relative z-10 p-8 space-y-6">
            {/* Spectacular Balance Display */}
            <div className="relative overflow-hidden p-8 bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 dark:from-slate-700/50 dark:via-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 shadow-lg">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="relative text-center">
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-3 uppercase tracking-wider">Current Balance</p>
                <p className="text-5xl font-black bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-200 bg-clip-text text-transparent mb-3">
                  {formatCurrency(stats.currentBalance)}
                </p>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm shadow-lg ${
                  stats.status === "paid" 
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                    : stats.status === "pending"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                }`}>
                  <div className={`w-2 h-2 rounded-full ${stats.status === "paid" ? "bg-emerald-500" : stats.status === "pending" ? "bg-amber-500" : "bg-red-500"} animate-pulse`}></div>
                  {stats.status === "paid" ? "All payments current" : stats.status === "pending" ? "Payment in progress" : "Payment action needed"}
                </div>
              </div>
            </div>
            
            {/* Premium Payment Cards */}
            <div className="grid grid-cols-1 gap-5">
              <div className="group relative overflow-hidden p-6 bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-700/30 dark:to-blue-900/10 rounded-xl border border-slate-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg group-hover:from-blue-500 group-hover:to-indigo-500 group-hover:shadow-lg transition-all duration-300">
                      <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:text-white" />
                    </div>
                    <span className="font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-sm">Next Payment</span>
                  </div>
                  <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-xs font-bold text-blue-700 dark:text-blue-300">
                    Upcoming
                  </div>
                </div>
                <p className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                  {formatCurrency(stats.nextRentAmount)}
                </p>
                <p className="text-slate-600 dark:text-slate-400 font-medium">Due on {stats.nextRentDue}</p>
              </div>
              
              <div className="group relative overflow-hidden p-6 bg-gradient-to-br from-white to-emerald-50/50 dark:from-slate-700/30 dark:to-emerald-900/10 rounded-xl border border-slate-200 dark:border-slate-600 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg group-hover:from-emerald-500 group-hover:to-teal-500 group-hover:shadow-lg transition-all duration-300">
                      <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400 group-hover:text-white" />
                    </div>
                    <span className="font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-sm">Last Payment</span>
                  </div>
                  <div className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    Completed
                  </div>
                </div>
                <p className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                  {formatCurrency(stats.lastPaymentAmount)}
                </p>
                <p className="text-slate-600 dark:text-slate-400 font-medium">Paid on {stats.lastPaymentDate}</p>
              </div>
            </div>
          </CardContent>
        </AnimatedCard>
      </div>

      {/* Spectacular Quick Actions */}
      <AnimatedCard delay={700} className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 dark:from-indigo-400/10 dark:via-purple-400/10 dark:to-pink-400/10"></div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full -translate-y-20 translate-x-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full translate-y-16 -translate-x-16"></div>
        
        <CardHeader className="relative z-10 pb-8 bg-gradient-to-r from-indigo-50/80 via-purple-50/80 to-pink-50/80 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 backdrop-blur-sm border-b-0">
          <CardTitle className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl blur-lg opacity-75"></div>
              <div className="relative p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl">
                <Zap className="h-7 w-7 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Quick Actions
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Instant access to essential services</p>
            </div>
            <div className="px-4 py-2 bg-indigo-100/80 dark:bg-indigo-900/30 rounded-full text-xs font-bold text-indigo-700 dark:text-indigo-300 backdrop-blur-sm">
              2 Available
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="relative z-10 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pay Rent - Premium Action */}
            <Button
              size="lg"
              className="group relative h-28 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 hover:from-blue-600 hover:via-cyan-600 hover:to-teal-600 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 overflow-hidden"
              onClick={() => (window.location.href = "/pay-rent")}
            >
              {/* Animated Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="relative flex flex-col items-center gap-3 text-white">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 rounded-2xl blur-sm"></div>
                  <div className="relative p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                    <CreditCard className="h-8 w-8" />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-black">Pay Rent</div>
                  <div className="text-sm opacity-90 font-medium">Secure & Instant Payment</div>
                </div>
              </div>
            </Button>
            
            {/* Maintenance Request - Premium Action */}
            <Button
              size="lg"
              className="group relative h-28 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 overflow-hidden"
              onClick={() => (window.location.href = "/maintenance")}
            >
              {/* Animated Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="relative flex flex-col items-center gap-3 text-white">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 rounded-2xl blur-sm"></div>
                  <div className="relative p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                    <Wrench className="h-8 w-8" />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-black">Maintenance</div>
                  <div className="text-sm opacity-90 font-medium">24/7 Support Request</div>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </AnimatedCard>

      {/* Premium Activity Feed */}
      <AnimatedCard delay={800} className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5 dark:from-emerald-400/10 dark:via-teal-400/10 dark:to-cyan-400/10"></div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full -translate-y-20 translate-x-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-teal-400/10 to-cyan-400/10 rounded-full translate-y-16 -translate-x-16"></div>
        
        <CardHeader className="relative z-10 pb-8 bg-gradient-to-r from-emerald-50/80 via-teal-50/80 to-cyan-50/80 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/20 backdrop-blur-sm border-b-0">
          <CardTitle className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl blur-lg opacity-75"></div>
              <div className="relative p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl">
                <Clock className="h-7 w-7 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Recent Activity & Alerts
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Stay updated with real-time notifications</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="px-3 py-1 bg-emerald-100/80 dark:bg-emerald-900/30 rounded-full text-xs font-bold text-emerald-700 dark:text-emerald-300 backdrop-blur-sm">
                Live Updates
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="relative z-10 p-8">
          <div className="space-y-6">
            {activities && activities.length > 0 ? (
              activities.map((activity, index) => (
                <div key={index} className="group relative p-6 bg-gradient-to-r from-white/50 to-emerald-50/30 dark:from-slate-700/30 dark:to-emerald-900/10 rounded-xl border border-slate-200/50 dark:border-slate-600/50 hover:border-emerald-300 dark:hover:border-emerald-500 hover:shadow-lg transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl group-hover:from-emerald-500 group-hover:to-teal-500 group-hover:shadow-lg transition-all duration-300">
                      <div className="h-5 w-5 bg-emerald-600 dark:bg-emerald-400 group-hover:bg-white rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                          {activity.title}
                        </h4>
                        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                          {activity.timestamp}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {activity.description}
                      </p>
                      {activity.status && (
                        <div className="mt-3">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                            activity.status === 'completed' 
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                              : activity.status === 'pending'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              activity.status === 'completed' ? 'bg-emerald-500' : 
                              activity.status === 'pending' ? 'bg-amber-500' : 'bg-blue-500'
                            }`}></div>
                            {activity.status}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-400 to-slate-500 rounded-2xl blur-lg opacity-20"></div>
                  <div className="relative p-6 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-2xl">
                    <Clock className="h-12 w-12 text-slate-400 mx-auto" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Recent Activity</h3>
                <p className="text-slate-600 dark:text-slate-400">Your recent activities and alerts will appear here</p>
              </div>
            )}
          </div>
        </CardContent>
      </AnimatedCard>

      {/* Clean Lease Information */}
      <AnimatedCard delay={800} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
        <CardHeader className="border-b border-slate-100 dark:border-slate-700">
          <CardTitle className="flex items-center gap-3 text-slate-900 dark:text-white">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            Lease Agreement
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                <span className="font-medium text-slate-900 dark:text-white">Lease Start</span>
              </div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">Jan 1, 2023</p>
            </div>
            
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                <span className="font-medium text-slate-900 dark:text-white">Lease End</span>
              </div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">Dec 31, 2023</p>
            </div>
            
            <div className="flex items-center justify-center">
              <Button
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200"
                onClick={() => window.location.href = "/lease-agreement"}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">View Agreement</div>
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </CardContent>
      </AnimatedCard>
    </div>
  )
}
