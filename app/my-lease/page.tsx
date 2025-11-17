"use client";

import { useState } from "react";
import { MainLayout } from "@/components/main-layout";
import { useActiveLeases } from "@/lib/hooks/use-lease";
import { LeaseDetailsCard } from "@/components/lease/lease-details-card";
import { UtilitiesBreakdown } from "@/components/lease/utilities-breakdown";
import { LeaseCardSkeleton, PageHeaderSkeleton } from "@/components/ui/loading-skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, RefreshCw } from "lucide-react";
import { getErrorMessage } from "@/lib/api-utils";

export default function MyLeasePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, error, refetch, isFetching } = useActiveLeases({
    page: currentPage,
    per_page: 10,
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6 space-y-6">
          <PageHeaderSkeleton />
          <LeaseCardSkeleton />
          <LeaseCardSkeleton />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6">
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Failed to Load Lease Information
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-center max-w-md">
              {getErrorMessage(error)}
            </p>
            <Button onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
              {isFetching ? "Retrying..." : "Retry"}
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const leases = data?.data || [];
  const currentLease = leases[0]; // Get the first active lease

  if (!currentLease) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6">
          <div className="flex flex-col items-center justify-center py-12">
            <Home className="h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              No Active Lease Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
              You don't currently have an active lease agreement. Please contact your landlord
              if you believe this is an error.
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30">
        <div className="container mx-auto p-6 space-y-6">
          {/* Page Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              My Lease Agreement
            </h1>
            <p className="text-lg text-muted-foreground">
              View your current lease details, terms, and conditions
            </p>
          </div>

          {/* Lease Details */}
          <LeaseDetailsCard lease={currentLease} />

          {/* Utilities Breakdown */}
          <UtilitiesBreakdown utilities={currentLease.utilities_responsibility} />

          {/* Additional Information */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-6 bg-white dark:bg-slate-800 rounded-lg border">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Important Reminders
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Rent is due on day {currentLease.payment_due_day} of each month</li>
                <li>
                  • Late payments incur a {currentLease.late_payment_penalty_percentage}% penalty after{" "}
                  {currentLease.late_payment_grace_days} grace days
                </li>
                <li>
                  • Provide {currentLease.termination_notice_days} days notice for lease termination
                </li>
                {currentLease.is_expiring_soon && (
                  <li className="text-orange-600 font-medium">
                    • Your lease expires in {currentLease.days_until_expiration} days - contact
                    landlord about renewal
                  </li>
                )}
              </ul>
            </div>

            <div className="p-6 bg-white dark:bg-slate-800 rounded-lg border">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" />
                Lease Type & Status
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Lease Type</p>
                  <p className="font-semibold capitalize">{currentLease.lease_type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Current Status</p>
                  <p className="font-semibold capitalize">{currentLease.status}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Security Deposit Status</p>
                  <p className="font-semibold capitalize">
                    {currentLease.security_deposit_status.replace("_", " ")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Refresh Button */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
              {isFetching ? "Refreshing..." : "Refresh Data"}
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
