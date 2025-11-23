"use client";

import { MainLayout } from "@/components/main-layout";
import { useAuth } from "@/contexts/auth-context";
import { useCaretakerStatistics, useEmergencyRequests, useInProgressRequests } from "@/lib/hooks/use-caretaker-maintenance";
import { useCaretakerProperties } from "@/lib/hooks/use-caretaker-properties";
import { StatsCard } from "@/components/dashboard/stats-card";
import { AnimatedCard } from "@/components/animated-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Wrench, CheckCircle, AlertTriangle, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function CaretakerDashboardPage() {
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
    );
  }

  // Access check
  if (!currentUser || currentUser.role !== "caretaker") {
    return (
      <MainLayout>
        <div className="p-8">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-2 text-gray-600">You do not have permission to access this page.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              Welcome back, {currentUser?.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage maintenance requests and oversee your assigned properties.
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Requests"
            value={statistics?.total || 0}
            subtitle={`${statistics?.this_month || 0} this month`}
            icon={Wrench}
            delay={100}
          />
          <StatsCard
            title="In Progress"
            value={statistics?.by_status.in_progress || 0}
            subtitle={`${statistics?.by_status.assigned || 0} assigned`}
            icon={Clock}
            iconColorClass="text-orange-600 dark:text-orange-400"
            gradientFromClass="from-orange-100"
            gradientToClass="to-red-100"
            delay={200}
          />
          <StatsCard
            title="Completed"
            value={statistics?.by_status.resolved || 0}
            subtitle={`Avg: ${statistics?.average_resolution_time?.toFixed(1) || 0}h`}
            icon={CheckCircle}
            iconColorClass="text-green-600 dark:text-green-400"
            gradientFromClass="from-green-100"
            gradientToClass="to-emerald-100"
            delay={300}
          />
          <StatsCard
            title="Emergency"
            value={statistics?.by_priority.emergency || 0}
            subtitle={`${statistics?.by_priority.high || 0} high priority`}
            icon={AlertTriangle}
            iconColorClass="text-red-600 dark:text-red-400"
            gradientFromClass="from-red-100"
            gradientToClass="to-orange-100"
            delay={400}
          />
        </div>

        {/* Priority Overview */}
        <AnimatedCard delay={500} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Request Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Received</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {statistics?.by_status.received || 0}
              </p>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Assigned</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {statistics?.by_status.assigned || 0}
              </p>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">In Progress</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {statistics?.by_status.in_progress || 0}
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Pending Approval</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {statistics?.by_status.pending_approval || 0}
              </p>
            </div>
          </CardContent>
        </AnimatedCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Emergency Requests */}
          <Card className="bg-white dark:bg-gray-700">
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
                <p className="text-gray-500 text-center py-4">No emergency requests</p>
              ) : (
                <div className="space-y-3">
                  {emergencyRequests.slice(0, 5).map((request) => (
                    <Link
                      key={request.id}
                      href={`/caretaker/maintenance/${request.id}`}
                      className="block p-3 bg-red-50 dark:bg-red-900/10 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{request.title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {request.property.name} - Unit {request.unit.unit_number}
                          </p>
                        </div>
                        <Badge variant="destructive">{request.status}</Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              <Button asChild className="w-full mt-4" variant="outline">
                <Link href="/caretaker/maintenance?priority=emergency">View All Emergency</Link>
              </Button>
            </CardContent>
          </Card>

          {/* In Progress Requests */}
          <Card className="bg-white dark:bg-gray-700">
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
                <p className="text-gray-500 text-center py-4">No requests in progress</p>
              ) : (
                <div className="space-y-3">
                  {inProgressRequests.slice(0, 5).map((request) => (
                    <Link
                      key={request.id}
                      href={`/caretaker/maintenance/${request.id}`}
                      className="block p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{request.title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {request.property.name} - Unit {request.unit.unit_number}
                          </p>
                        </div>
                        <Badge>{request.priority}</Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              <Button asChild className="w-full mt-4" variant="outline">
                <Link href="/caretaker/maintenance?status=in_progress">View All In Progress</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Assigned Properties */}
        <Card className="bg-white dark:bg-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-indigo-600" />
                Assigned Properties
              </span>
              <Badge variant="secondary">{properties.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white">{property.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{property.address}</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {property.occupied_units}/{property.total_units} occupied
                    </span>
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/properties/${property.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
