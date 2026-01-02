"use client";

import { MainLayout } from "@/components/main-layout";
import { useAuth } from "@/contexts/auth-context";
import { useCaretakerStatistics, useEmergencyRequests, useInProgressRequests } from "@/lib/hooks/use-caretaker-maintenance";
import { useCaretakerProperties } from "@/lib/hooks/use-caretaker-properties";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Building2, Wrench, CheckCircle, AlertTriangle, Clock, TrendingUp, Award, Target, Zap, Activity, Home, Users, Calendar, Eye, ArrowRight, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn, formatDate } from "@/lib/utils";

export default function CaretakerDashboardPage() {
  const router = useRouter();
  const { user: currentUser, isLoading: authLoading } = useAuth();

  // Fetch caretaker statistics
  const { data: statisticsData, isLoading: statsLoading } = useCaretakerStatistics({
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch emergency requests
  const { data: emergencyData, isLoading: emergencyLoading } = useEmergencyRequests({
    per_page: 5,
  });

  // Fetch in-progress requests
  const { data: inProgressData, isLoading: inProgressLoading } = useInProgressRequests({
    per_page: 5,
  });

  // Fetch properties
  const { data: propertiesData, isLoading: propertiesLoading } = useCaretakerProperties();

  const statistics = statisticsData?.data;
  const emergencyRequests = emergencyData?.data || [];
  const inProgressRequests = inProgressData?.data || [];
  const properties = propertiesData?.data || [];

  const isLoading = statsLoading || emergencyLoading || inProgressLoading || propertiesLoading || authLoading;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-100 dark:from-slate-900 dark:via-emerald-900/20 dark:to-teal-900/20 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Access check
  if (!currentUser || currentUser.role !== "caretaker") {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-100 dark:from-slate-900 dark:via-emerald-900/20 dark:to-teal-900/20 p-8">
          <div className="max-w-7xl mx-auto">
            <Alert variant="destructive">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription>
                Access Denied. This page is restricted to caretakers only.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Calculate performance metrics
  const totalResolved = statistics?.by_status?.resolved || 0;
  const totalRequests = statistics?.total || 0;
  const completionRate = totalRequests > 0 ? (totalResolved / totalRequests) * 100 : 0;
  const avgResolutionTime = statistics?.average_resolution_time || 0;
  
  const getPerformanceColor = (rate: number) => {
    if (rate >= 90) return "from-green-500 to-emerald-600";
    if (rate >= 75) return "from-blue-500 to-cyan-600";
    if (rate >= 60) return "from-orange-500 to-amber-600";
    return "from-red-500 to-pink-600";
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-100 dark:from-slate-900 dark:via-emerald-900/20 dark:to-teal-900/20">
        <div className="max-w-7xl mx-auto p-8 space-y-8">
          {/* Hero Header */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 dark:from-emerald-900 dark:via-teal-900 dark:to-cyan-900 shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 px-8 py-12 md:px-12">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <Badge className="bg-white/20 text-white border-white/30">
                      <Wrench className="h-3 w-3 mr-1" />
                      Maintenance Specialist
                    </Badge>
                    <Badge className={cn(
                      "bg-gradient-to-r text-white border-0",
                      getPerformanceColor(completionRate)
                    )}>
                      <Award className="h-3 w-3 mr-1" />
                      {completionRate.toFixed(0)}% Complete
                    </Badge>
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    Welcome, {currentUser?.name}!
                  </h1>
                  
                  <p className="text-emerald-100 text-lg max-w-2xl">
                    Your maintenance hub for managing work orders, tracking performance metrics, 
                    and ensuring properties are well-maintained.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    className="bg-white text-emerald-600 hover:bg-emerald-50"
                    onClick={() => router.push("/maintenance")}
                  >
                    <Wrench className="mr-2 h-4 w-4" />
                    All Requests
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                    onClick={() => router.push("/properties")}
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    My Properties
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Alerts */}
          {emergencyRequests.length > 0 && (
            <Alert className="border-2 border-red-500 bg-red-50 dark:bg-red-950 shadow-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 animate-pulse" />
              <AlertDescription className="text-red-700 dark:text-red-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">
                      {emergencyRequests.length} Emergency {emergencyRequests.length === 1 ? 'Request' : 'Requests'}
                    </p>
                    <p className="text-sm">Immediate attention required</p>
                  </div>
                  <Link href="/maintenance?priority=emergency">
                    <Button variant="destructive" size="sm">
                      View Emergencies →
                    </Button>
                  </Link>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Performance Metrics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Requests */}
            <Card className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Wrench className="h-8 w-8 text-white/60" />
                  <Badge className="bg-white/20 text-white border-white/30">
                    {statistics?.this_month || 0} this month
                  </Badge>
                </div>
                <div>
                  <p className="text-white/80 text-sm font-medium">Total Requests</p>
                  <p className="text-3xl font-bold">{statistics?.total || 0}</p>
                  <p className="text-white/70 text-xs mt-1">
                    All time assignments
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* In Progress */}
            <Card className="bg-gradient-to-r from-orange-500 to-amber-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Clock className="h-8 w-8 text-white/60" />
                  <Badge className="bg-white/20 text-white border-white/30">
                    {statistics?.by_status?.assigned || 0} assigned
                  </Badge>
                </div>
                <div>
                  <p className="text-white/80 text-sm font-medium">In Progress</p>
                  <p className="text-3xl font-bold">{statistics?.by_status?.in_progress || 0}</p>
                  <p className="text-white/70 text-xs mt-1">
                    Active work orders
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Completed */}
            <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <CheckCircle className="h-8 w-8 text-white/60" />
                  <Badge className="bg-white/20 text-white border-white/30">
                    {completionRate.toFixed(0)}% rate
                  </Badge>
                </div>
                <div>
                  <p className="text-white/80 text-sm font-medium">Completed</p>
                  <p className="text-3xl font-bold">{statistics?.by_status?.resolved || 0}</p>
                  <p className="text-white/70 text-xs mt-1">
                    Avg: {avgResolutionTime.toFixed(1)}h resolution
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Requests */}
            <Card className={cn(
              "text-white border-0 shadow-lg hover:shadow-xl transition-shadow",
              emergencyRequests.length > 0 
                ? "bg-gradient-to-r from-red-500 to-pink-600" 
                : "bg-gradient-to-r from-purple-500 to-indigo-600"
            )}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <AlertTriangle className={cn(
                    "h-8 w-8",
                    emergencyRequests.length > 0 ? "text-white animate-pulse" : "text-white/60"
                  )} />
                  <Badge className={cn(
                    "border-white/30",
                    emergencyRequests.length > 0 
                      ? "bg-red-700 text-white border-0" 
                      : "bg-white/20 text-white"
                  )}>
                    {statistics?.by_priority?.high || 0} high
                  </Badge>
                </div>
                <div>
                  <p className="text-white/80 text-sm font-medium">Emergency</p>
                  <p className="text-3xl font-bold">{statistics?.by_priority?.emergency || 0}</p>
                  <p className="text-white/70 text-xs mt-1">
                    Urgent attention needed
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Overview */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Work Status Breakdown */}
            <Card className="lg:col-span-2 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-emerald-600" />
                  Work Status Overview
                </CardTitle>
                <CardDescription>Current status of all assigned maintenance requests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Received */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Received
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {statistics?.by_status?.received || 0} requests
                    </span>
                  </div>
                  <Progress 
                    value={(statistics?.by_status?.received || 0) / (statistics?.total || 1) * 100} 
                    className="h-3 bg-blue-100"
                  />
                </div>

                {/* Assigned */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Assigned
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {statistics?.by_status?.assigned || 0} requests
                    </span>
                  </div>
                  <Progress 
                    value={(statistics?.by_status?.assigned || 0) / (statistics?.total || 1) * 100} 
                    className="h-3"
                    style={{ backgroundColor: '#FEF3C7' }}
                  />
                </div>

                {/* In Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      In Progress
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {statistics?.by_status?.in_progress || 0} requests
                    </span>
                  </div>
                  <Progress 
                    value={(statistics?.by_status?.in_progress || 0) / (statistics?.total || 1) * 100} 
                    className="h-3"
                    style={{ backgroundColor: '#FED7AA' }}
                  />
                </div>

                {/* Resolved */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Resolved
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {statistics?.by_status?.resolved || 0} requests
                    </span>
                  </div>
                  <Progress 
                    value={(statistics?.by_status?.resolved || 0) / (statistics?.total || 1) * 100} 
                    className="h-3"
                    style={{ backgroundColor: '#BBF7D0' }}
                  />
                </div>

                <Separator />

                {/* Performance Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Completion Rate</p>
                    <p className="text-2xl font-bold text-emerald-600">{completionRate.toFixed(0)}%</p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Avg Resolution</p>
                    <p className="text-2xl font-bold text-blue-600">{avgResolutionTime.toFixed(1)}h</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Score & Quick Actions */}
            <div className="space-y-6">
              {/* Performance Score */}
              <Card className={cn(
                "shadow-lg border-0 bg-gradient-to-r text-white",
                getPerformanceColor(completionRate)
              )}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-6xl font-bold mb-2">{completionRate.toFixed(0)}%</p>
                    <p className="text-white/80 mb-4">
                      {completionRate >= 90 ? "Outstanding!" : 
                       completionRate >= 75 ? "Great Work!" :
                       completionRate >= 60 ? "Good Progress" : "Keep Going!"}
                    </p>
                    <div className="flex justify-center gap-2">
                      <Badge className="bg-white/20 text-white border-white/30">
                        <Award className="h-3 w-3 mr-1" />
                        Top Performer
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="shadow-lg border-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
                    onClick={() => router.push("/maintenance?status=in_progress")}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    My Active Work
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
                    onClick={() => router.push("/maintenance?priority=emergency")}
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Emergencies
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
                    onClick={() => router.push("/properties")}
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    My Properties
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Current Work */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Emergency Requests */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Emergency Requests
                  </span>
                  <Badge variant="destructive">{emergencyRequests.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {emergencyRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-3" />
                    <p className="text-gray-500 font-medium">No emergency requests!</p>
                    <p className="text-sm text-gray-400">Great job staying on top of urgent issues</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {emergencyRequests.slice(0, 5).map((request) => (
                      <Link
                        key={request.id}
                        href={`/maintenance?requestId=${request.id}`}
                        className="block p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border-2 border-red-200 hover:border-red-300 dark:hover:border-red-700 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{request.title}</h3>
                          <Badge variant="destructive" className="animate-pulse">URGENT</Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {request.property?.name} - Unit {request.unit?.unit_number}
                        </p>
                        <p className="text-xs text-gray-500">
                          Submitted: {formatDate(request.created_at)}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
                {emergencyRequests.length > 0 && (
                  <Button 
                    variant="destructive" 
                    className="w-full mt-4"
                    onClick={() => router.push("/maintenance?priority=emergency")}
                  >
                    View All Emergency Requests
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* In Progress Work */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    In Progress
                  </span>
                  <Badge variant="secondary">{inProgressRequests.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {inProgressRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Wrench className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500 font-medium">No active work</p>
                    <p className="text-sm text-gray-400">Check for new assignments</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {inProgressRequests.slice(0, 5).map((request) => (
                      <Link
                        key={request.id}
                        href={`/maintenance?requestId=${request.id}`}
                        className="block p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200 hover:border-orange-300 dark:hover:border-orange-700 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{request.title}</h3>
                          <Badge className="bg-orange-100 text-orange-700 capitalize">
                            {request.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {request.property?.name} - Unit {request.unit?.unit_number}
                        </p>
                        <p className="text-xs text-gray-500">
                          Started: {formatDate(request.created_at)}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
                {inProgressRequests.length > 0 && (
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => router.push("/maintenance?status=in_progress")}
                  >
                    View All In Progress
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Assigned Properties */}
          {properties && properties.length > 0 && (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-indigo-600" />
                    Assigned Properties
                  </span>
                  <Badge variant="secondary">{properties.length}</Badge>
                </CardTitle>
                <CardDescription>Properties under your maintenance responsibility</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {properties.map((property) => (
                    <div
                      key={property.id}
                      className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer"
                      onClick={() => router.push(`/properties/${property.id}`)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{property.name}</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {property.address}
                          </p>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {property.occupied_units}/{property.total_units} occupied
                        </span>
                        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/20">
                          {property.total_units} units
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
