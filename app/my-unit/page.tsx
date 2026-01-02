/**
 * My Unit Page
 * Displays tenant's unit information or caretaker's managed properties
 */

"use client";

import { useState } from "react";
import { UnitDetailsCard } from "@/components/unit/unit-details-card";
import { PropertyInfoCard } from "@/components/unit/property-info-card";
import { CaretakerContactCard } from "@/components/unit/caretaker-contact-card";
import { PropertyDetailsModal } from "@/components/caretaker/property-details-modal";
import { useAuth } from "@/contexts/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Home, RefreshCw, Building2, MapPin } from "lucide-react";
import { MainLayout } from "@/components/main-layout";
import { useQuery } from "@tanstack/react-query";
import { tenantPropertyService, caretakerPropertyService } from "@/lib/services";

export default function MyUnitPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // For tenants: fetch their unit
  const { data: tenantData, isLoading: tenantLoading, error: tenantError, refetch: refetchTenant } = useQuery({
    queryKey: ["tenant-unit"],
    queryFn: () => tenantPropertyService.getTenantUnit(),
    enabled: !!user && !authLoading && user.role === "tenant",
  });

  // For caretakers: fetch their managed properties
  const { data: caretakerData, isLoading: caretakerLoading, error: caretakerError, refetch: refetchCaretaker } = useQuery({
    queryKey: ["caretaker-properties"],
    queryFn: () => caretakerPropertyService.getProperties(),
    enabled: !!user && !authLoading && user.role === "caretaker",
  });

  const isLoading = tenantLoading || caretakerLoading;
  const error = tenantError || caretakerError;
  const refetch = user?.role === "tenant" ? refetchTenant : refetchCaretaker;

  const unitData = tenantData?.data;
  const unit = unitData?.unit;
  const property = unitData?.property;
  const caretakerProperties = caretakerData?.data || [];

  const handleViewDetails = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    setModalOpen(true);
  };

  if (authLoading || isLoading) {
    return (
      <MainLayout>
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
      </MainLayout>
    );
  }

  if (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to load unit information. Please try again.';
    
    return (
      <MainLayout>
        <div className="container mx-auto py-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {errorMessage}
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
      </MainLayout>
    );
  }

  // Handle caretaker view - show their managed properties
  if (user?.role === "caretaker") {
    if (!caretakerProperties || caretakerProperties.length === 0) {
      return (
        <MainLayout>
          <div className="container mx-auto py-6">
            <Alert>
              <Building2 className="h-4 w-4" />
              <AlertDescription>
                You are not currently assigned to manage any properties. Please contact your landlord if you believe this is an error.
              </AlertDescription>
            </Alert>
          </div>
        </MainLayout>
      );
    }

    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header Section */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-2">My Properties</h1>
            <p className="text-muted-foreground text-lg">
              Managing {caretakerProperties?.length || 0} {(caretakerProperties?.length || 0) === 1 ? 'property' : 'properties'} with excellence
            </p>
          </div>

          {/* Quick Stats Overview */}
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Properties</p>
                    <p className="text-3xl font-bold mt-2">{caretakerProperties?.length || 0}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Units</p>
                    <p className="text-3xl font-bold mt-2">
                      {caretakerProperties?.reduce((sum, p) => sum + (p?.total_units || 0), 0) || 0}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Home className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Occupied Units</p>
                    <p className="text-3xl font-bold mt-2">
                      {caretakerProperties?.reduce((sum, p) => sum + (p?.occupied_units || 0), 0) || 0}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Home className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Properties Grid */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-6">Assigned Properties</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {caretakerProperties?.map((property) => {
                // Use actual property data from backend
                const totalUnits = property?.total_units ?? (property as any)?.total_units ?? 0;
                const occupiedUnits = property?.occupied_units ?? (property as any)?.occupied_units ?? 0;
                const vacantUnits = Math.max(0, totalUnits - occupiedUnits);
                const occupancyRate = totalUnits > 0 
                  ? Math.round((occupiedUnits / totalUnits) * 100)
                  : 0;
                
                return (
                  <Card key={property?.id || `property-${Math.random()}`} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <CardTitle className="text-xl group-hover:text-primary transition-colors">
                            {property?.name || (property as any)?.name || 'Unnamed Property'}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1.5 capitalize font-medium">
                            {(property?.property_type || (property as any)?.property_type)?.replace(/_/g, ' ') || 'Property'}
                          </p>
                        </div>
                        <Badge 
                          variant={(property?.is_active !== false && property?.is_active !== undefined) || (property as any)?.is_active ? "default" : "secondary"}
                          className="ml-2"
                        >
                          {(property?.is_active !== false && property?.is_active !== undefined) || (property as any)?.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Address */}
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div className="text-sm flex-1">
                          <p className="font-medium">
                            {property?.address || 
                             (property as any)?.street_address || 
                             'Address not available'}
                          </p>
                          {(property?.city || property?.region || property?.country) && (
                            <p className="text-muted-foreground mt-0.5">
                              {[property?.city, property?.region, property?.country]
                                .filter(Boolean)
                                .join(', ')}
                            </p>
                          )}
                          {(property as any)?.ghana_post_gps_address && (
                            <p className="text-xs text-muted-foreground mt-1">
                              GPS: {(property as any).ghana_post_gps_address}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Stats - 2x2 Grid */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/10">
                          <p className="text-xl font-bold text-blue-600">{totalUnits}</p>
                          <p className="text-xs text-muted-foreground font-medium">Total</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-green-500/5 border border-green-500/10">
                          <p className="text-xl font-bold text-green-600">{occupiedUnits}</p>
                          <p className="text-xs text-muted-foreground font-medium">Occupied</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-orange-500/5 border border-orange-500/10">
                          <p className="text-xl font-bold text-orange-600">{vacantUnits}</p>
                          <p className="text-xs text-muted-foreground font-medium">Vacant</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-gray-500/5 border border-gray-500/10">
                          <p className="text-xl font-bold text-gray-600">
                            {totalUnits - (property.total_units || 0) === 0 ? 0 : '?'}
                          </p>
                          <p className="text-xs text-muted-foreground font-medium">Inactive</p>
                        </div>
                      </div>

                      {/* Occupancy Rate */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground font-medium">Occupancy Rate</span>
                          <span className="font-bold">{occupancyRate}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                            style={{ width: `${occupancyRate}%` }}
                          />
                        </div>
                      </div>

                      {/* View Details Button */}
                      <Button 
                        variant="outline" 
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        onClick={() => property?.id && handleViewDetails(property.id)}
                        disabled={!property?.id}
                      >
                        View Details
                        <Home className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Property Details Modal */}
            <PropertyDetailsModal
              propertyId={selectedPropertyId}
              open={modalOpen}
              onOpenChange={setModalOpen}
            />
          </div>

          {/* Additional Info for Caretakers */}
          <Card className="bg-gradient-to-br from-primary/5 via-primary/3 to-background border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-3">Your Caretaker Responsibilities</h3>
                  <p className="text-muted-foreground mb-4">
                    As a dedicated property caretaker, you play a vital role in maintaining property excellence and tenant satisfaction.
                  </p>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                      <p className="text-sm">View and manage maintenance requests efficiently</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                      <p className="text-sm">Monitor unit occupancy and tenant information</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                      <p className="text-sm">Facilitate communication between tenants and landlords</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                      <p className="text-sm">Access comprehensive property and unit details</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  // Handle tenant view - show their unit
  if (!unit) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6">
          <Alert>
            <Home className="h-4 w-4" />
            <AlertDescription>
              No unit information available. Please contact your property manager if you believe this is an error.
            </AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
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
            {unit && <UnitDetailsCard unit={unit} />}
            {!unit && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-center">Unit details not available</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Right Side (1/3) */}
          <div className="space-y-6">
            {/* Property Information */}
            {property && <PropertyInfoCard property={property} />}

            {/* Caretaker Contact */}
            {property && (property as any)?.caretaker && (
              <CaretakerContactCard caretaker={(property as any).caretaker} />
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
    </MainLayout>
  );
}

