/**
 * Maintenance Analytics Dashboard Component
 * Displays comprehensive analytics for maintenance requests
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Download,
  Calendar,
} from "lucide-react";
import type { MaintenanceStatistics } from "@/lib/api-types";
import { formatCurrency, formatDate } from "@/lib/api-utils";
import { exportMaintenanceAnalytics, formatDateForFilename } from "@/lib/utils/export-utils";

interface MaintenanceAnalyticsDashboardProps {
  statistics: MaintenanceStatistics | null;
  isLoading?: boolean;
  onExport?: () => void;
}

export function MaintenanceAnalyticsDashboard({
  statistics,
  isLoading = false,
  onExport,
}: MaintenanceAnalyticsDashboardProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No analytics data available</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate metrics
  const totalRequests = statistics.total_requests || 0;
  const openRequests = (statistics as any).open_requests || (statistics.by_status?.assigned || 0) + (statistics.by_status?.in_progress || 0);
  const resolvedRequests = (statistics as any).resolved_requests || (statistics.by_status?.resolved || 0) + (statistics.by_status?.closed || 0);
  const averageResolutionTime = (statistics as any).average_resolution_time || statistics.average_resolution_time_hours || 0;
  const totalCost = (statistics as any).total_cost || 0;
  const averageCost = (statistics as any).average_cost || 0;

  // Calculate percentages
  const resolutionRate = totalRequests > 0 
    ? ((resolvedRequests / totalRequests) * 100).toFixed(1) 
    : "0";
  const openRate = totalRequests > 0 
    ? ((openRequests / totalRequests) * 100).toFixed(1) 
    : "0";

  // Status breakdown
  const statusBreakdown = statistics.by_status || {};
  const priorityBreakdown = statistics.by_priority || {};

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Maintenance Analytics</h2>
          <p className="text-muted-foreground">Comprehensive insights into maintenance operations</p>
        </div>
        <Button
          onClick={() => {
            if (statistics) {
              exportMaintenanceAnalytics(
                statistics,
                `maintenance-analytics-${formatDateForFilename()}`
              );
              onExport?.();
            }
          }}
          variant="outline"
          disabled={!statistics}
        >
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open Requests</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {openRate}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {resolutionRate}% resolution rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageResolutionTime > 0 
                ? `${averageResolutionTime.toFixed(1)} ${averageResolutionTime < 24 ? 'h' : 'days'}`
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Time to complete</p>
          </CardContent>
        </Card>
      </div>

      {/* Cost Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Cost Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Cost</span>
              <span className="text-lg font-bold">{formatCurrency(totalCost)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Average Cost per Request</span>
              <span className="text-lg font-semibold">{formatCurrency(averageCost)}</span>
            </div>
            {statistics.cost_by_category && Object.keys(statistics.cost_by_category).length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium mb-2">Cost by Category</p>
                <div className="space-y-2">
                  {Object.entries(statistics.cost_by_category).map(([category, cost]) => (
                    <div key={category} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground capitalize">{category}</span>
                      <span className="font-medium">{formatCurrency(cost as number)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(statusBreakdown).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${totalRequests > 0 ? (count as number / totalRequests) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {count as number}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Priority Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(priorityBreakdown).map(([priority, count]) => (
              <div
                key={priority}
                className="p-4 border rounded-lg text-center"
              >
                <p className="text-2xl font-bold mb-1">{count as number}</p>
                <p className="text-sm text-muted-foreground capitalize">{priority}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalRequests > 0
                    ? `${((count as number / totalRequests) * 100).toFixed(1)}%`
                    : "0%"}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SLA Compliance */}
      {(statistics as any).sla_compliance && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              SLA Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Response SLA</p>
                <p className="text-2xl font-bold">
                  {(statistics as any).sla_compliance?.response_rate || 0}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(statistics as any).sla_compliance?.response_met || 0} / {(statistics as any).sla_compliance?.response_total || 0} met
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Assignment SLA</p>
                <p className="text-2xl font-bold">
                  {(statistics as any).sla_compliance?.assignment_rate || 0}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(statistics as any).sla_compliance?.assignment_met || 0} / {(statistics as any).sla_compliance?.assignment_total || 0} met
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Completion SLA</p>
                <p className="text-2xl font-bold">
                  {(statistics as any).sla_compliance?.completion_rate || 0}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(statistics as any).sla_compliance?.completion_met || 0} / {(statistics as any).sla_compliance?.completion_total || 0} met
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

