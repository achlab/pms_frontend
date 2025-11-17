/**
 * Lease Details Card Component
 * Displays comprehensive lease information
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Home,
  Calendar,
  DollarSign,
  FileText,
  Shield,
  AlertTriangle,
  Download,
  User,
  Phone,
  Mail,
} from "lucide-react";
import type { Lease } from "@/lib/api-types";
import { formatCurrency, formatDate, formatStatus } from "@/lib/api-utils";

interface LeaseDetailsCardProps {
  lease: Lease;
  onDownloadDocument?: () => void;
}

export function LeaseDetailsCard({ lease, onDownloadDocument }: LeaseDetailsCardProps) {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      expired: "bg-gray-100 text-gray-800",
      terminated: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const isExpiringSoon = lease.is_expiring_soon;
  const daysLeft = lease.days_until_expiration;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">Lease Agreement</CardTitle>
              <p className="text-sm text-muted-foreground">
                Contract ID: {lease.id.substring(0, 8).toUpperCase()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(lease.status)}>
                {formatStatus(lease.status)}
              </Badge>
              {lease.ghana_rent_act_compliant && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Shield className="h-3 w-3 mr-1" />
                  Ghana Rent Act Compliant
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Expiring Warning */}
      {isExpiringSoon && lease.status === "active" && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <p className="font-semibold text-orange-900">Lease Expiring Soon</p>
                <p className="text-sm text-orange-700 mt-1">
                  Your lease will expire in {daysLeft} days on {formatDate(lease.end_date)}.
                  Please contact your landlord to discuss renewal options.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Property & Unit Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Property & Unit Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Property</p>
                  <p className="font-semibold">{lease.property.name}</p>
                  <p className="text-sm text-muted-foreground">{lease.property.address}</p>
                  {lease.property.gps_code && (
                    <p className="text-xs text-muted-foreground mt-1">
                      GPS: {lease.property.gps_code}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Home className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Unit</p>
                  <p className="font-semibold">Unit {lease.unit.unit_number}</p>
                  <p className="text-sm text-muted-foreground">
                    {lease.unit.floor} • {lease.unit.bedrooms} Bed • {lease.unit.bathrooms} Bath
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {lease.unit.square_footage} sq ft
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lease Terms */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lease Terms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Lease Period
              </div>
              <div>
                <p className="font-semibold">{formatDate(lease.start_date)}</p>
                <p className="text-sm text-muted-foreground">to</p>
                <p className="font-semibold">{formatDate(lease.end_date)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {daysLeft} days remaining
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                Monthly Rent
              </div>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(lease.monthly_rent)}
              </p>
              <p className="text-xs text-muted-foreground">
                Due on day {lease.payment_due_day} of each month
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                Security Deposit
              </div>
              <p className="text-xl font-bold">
                {formatCurrency(lease.security_deposit)}
              </p>
              <Badge variant="outline" className={
                lease.security_deposit_status === "held"
                  ? "bg-blue-50 text-blue-700"
                  : lease.security_deposit_status === "returned"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }>
                {formatStatus(lease.security_deposit_status)}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                Advance Rent
              </div>
              <p className="font-semibold">
                {lease.advance_rent_months} months
              </p>
              <p className="text-sm text-muted-foreground">
                Total: {formatCurrency(lease.total_advance_rent)}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4" />
                Late Payment
              </div>
              <p className="font-semibold">
                {lease.late_payment_penalty_percentage}% penalty
              </p>
              <p className="text-sm text-muted-foreground">
                {lease.late_payment_grace_days} days grace period
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Termination Notice
              </div>
              <p className="font-semibold">
                {lease.termination_notice_days} days
              </p>
              <p className="text-sm text-muted-foreground">
                Required notice period
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Landlord</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <p className="font-semibold">{lease.landlord.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`mailto:${lease.landlord.email}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {lease.landlord.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`tel:${lease.landlord.phone}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {lease.landlord.phone}
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Tenant</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <p className="font-semibold">{lease.tenant.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{lease.tenant.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Special Terms */}
      {lease.special_terms && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Special Terms & Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {lease.special_terms}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Lease Document */}
      {lease.document_url && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Lease Agreement Document</p>
                  <p className="text-sm text-muted-foreground">
                    Signed lease agreement (PDF)
                  </p>
                </div>
              </div>
              <Button onClick={onDownloadDocument || (() => window.open(lease.document_url, '_blank'))}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

