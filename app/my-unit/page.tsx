/**
 * My Unit Page
 * Displays tenant's unit information, property details, and caretaker contact
 */

"use client";

import { useEffect, useState } from "react";
import { UnitDetailsCard } from "@/components/unit/unit-details-card";
import { PropertyInfoCard } from "@/components/unit/property-info-card";
import { CaretakerContactCard } from "@/components/unit/caretaker-contact-card";
import { useMyUnit } from "@/lib/hooks/use-unit";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, RefreshCw } from "lucide-react";
import { tokenManager } from "@/lib/api-client";

export default function MyUnitPage() {
  const [userId, setUserId] = useState<string | null>(null);

  // Get user ID from token or auth context
  useEffect(() => {
    // In a real app, get this from auth context or decode token
    // For now, we'll use a placeholder
    const getUserId = () => {
      // Try to get from localStorage or decode token
      const token = tokenManager.getToken();
      if (token) {
        try {
          // In production, properly decode the JWT token
          // For now, we'll use a placeholder
          // You might want to store user ID separately or in auth context
          const storedUserId = localStorage.getItem("user_id");
          if (storedUserId) {
            return storedUserId;
          }
        } catch (error) {
          console.error("Error getting user ID:", error);
        }
      }
      return null;
    };

    setUserId(getUserId());
  }, []);

  const { data, isLoading, error, refetch } = useMyUnit(userId || "", {
    enabled: !!userId,
  });

  const units = data?.data || [];
  const unit = units.length > 0 ? units[0] : null;

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        {/* Header Skeleton */}
        <div>
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>

        {/* Content Skeleton */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-96" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load unit information. Please try again.
            <Button
              variant="outline"
              size="sm"
              className="ml-4"
              onClick={() => refetch()}
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="container mx-auto py-6">
        <Alert>
          <Home className="h-4 w-4" />
          <AlertDescription>
            No unit information available. Please contact your property manager if you believe this is an error.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Unit</h1>
        <p className="text-muted-foreground mt-1">
          View your unit details, property information, and caretaker contact
        </p>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - Left Side (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Unit Details */}
          <UnitDetailsCard unit={unit} />
        </div>

        {/* Sidebar - Right Side (1/3) */}
        <div className="space-y-6">
          {/* Property Information */}
          {unit.property && <PropertyInfoCard property={unit.property} />}

          {/* Caretaker Contact */}
          {unit.caretaker && (
            <CaretakerContactCard caretaker={unit.caretaker} />
          )}
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Home className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <h3 className="font-semibold mb-1">Need Help?</h3>
            <p className="text-sm text-muted-foreground">
              If you have questions about your unit or need to report an issue, you can:
            </p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li>• Contact the property caretaker using the contact card above</li>
              <li>• Submit a maintenance request through the maintenance portal</li>
              <li>• Review your lease agreement for specific terms and conditions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

