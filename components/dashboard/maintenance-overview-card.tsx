/**
 * Maintenance Overview Card Component
 * Displays maintenance requests summary
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wrench, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import type { MaintenanceRequestsOverview } from "@/lib/api-types";

interface MaintenanceOverviewCardProps {
  maintenance: MaintenanceRequestsOverview;
}

export function MaintenanceOverviewCard({ maintenance }: MaintenanceOverviewCardProps) {
  const router = useRouter();
  const { user } = useAuth();

  const stats = [
    {
      label: "Received",
      value: maintenance.received,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: "In Progress",
      value: maintenance.in_progress,
      icon: Wrench,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      label: "Resolved",
      value: maintenance.resolved,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Maintenance Requests</CardTitle>
          {maintenance.urgent_count > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {maintenance.urgent_count} Urgent
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Count */}
        <div className="text-center pb-4 border-b">
          <p className="text-3xl font-bold">{maintenance.total}</p>
          <p className="text-sm text-muted-foreground">Total Requests</p>
        </div>

        {/* Status Breakdown */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="text-center p-3 rounded-lg border"
              >
                <div className={`inline-flex p-2 rounded-full ${stat.bgColor} mb-2`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Urgent Warning */}
        {maintenance.urgent_count > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">
                  {maintenance.urgent_count} Urgent {maintenance.urgent_count === 1 ? "Request" : "Requests"}
                </p>
                <p className="text-xs text-red-700 mt-1">
                  These requests require immediate attention.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className={`grid gap-2 ${user?.role === "tenant" ? "grid-cols-2" : "grid-cols-1"}`}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/maintenance-requests")}
          >
            View All
          </Button>
          {user?.role === "tenant" && (
            <Button
              size="sm"
              onClick={() => router.push("/maintenance-requests?action=create")}
            >
              New Request
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

