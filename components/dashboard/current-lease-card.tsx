/**
 * Current Lease Card Component
 * Displays tenant's current lease information
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Calendar, DollarSign, Home, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import type { CurrentLeaseInfo } from "@/lib/api-types";
import { formatCurrency, formatDate } from "@/lib/api-utils";

interface CurrentLeaseCardProps {
  lease: CurrentLeaseInfo | null;
}

export function CurrentLeaseCard({ lease }: CurrentLeaseCardProps) {
  const router = useRouter();

  if (!lease) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Lease</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Home className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No active lease found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isExpiringSoon = lease.days_until_expiration <= 60;
  const statusColor = {
    active: "bg-green-100 text-green-800",
    expired: "bg-gray-100 text-gray-800",
    terminated: "bg-red-100 text-red-800",
  }[lease.status] || "bg-gray-100 text-gray-800";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Current Lease</CardTitle>
          <Badge className={statusColor}>
            {lease.status.charAt(0).toUpperCase() + lease.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Property & Unit Info */}
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">{lease.property.name}</p>
              <p className="text-sm text-muted-foreground">
                {lease.property.address}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Home className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                Unit {lease.unit.unit_number}
              </p>
              <p className="text-sm text-muted-foreground">
                {lease.unit.bedrooms} Bed · {lease.unit.bathrooms} Bath
              </p>
            </div>
          </div>
        </div>

        <div className="border-t pt-4 space-y-3">
          {/* Lease Duration */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Lease Period</span>
            </div>
            <div className="text-sm font-medium text-right">
              <p>{formatDate(lease.start_date)}</p>
              <p className="text-muted-foreground">to {formatDate(lease.end_date)}</p>
            </div>
          </div>

          {/* Monthly Rent */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Monthly Rent</span>
            </div>
            <p className="text-sm font-medium">
              {formatCurrency(lease.monthly_rent)}
            </p>
          </div>

          {/* Days Until Expiration */}
          {lease.status === "active" && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Days Remaining</span>
              </div>
              <div className="flex items-center gap-2">
                {isExpiringSoon && (
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                )}
                <p className={`text-sm font-medium ${isExpiringSoon ? "text-orange-600" : ""}`}>
                  {lease.days_until_expiration} days
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Expiring Soon Warning */}
        {isExpiringSoon && lease.status === "active" && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-900">
                  Lease Expiring Soon
                </p>
                <p className="text-xs text-orange-700 mt-1">
                  Your lease will expire in {lease.days_until_expiration} days. Please contact your landlord about renewal.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* View Details Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push("/my-lease")}
        >
          View Full Lease Details
        </Button>
      </CardContent>
    </Card>
  );
}

