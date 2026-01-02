/**
 * Caretaker Property Details Modal
 * Displays detailed property information including units and tenants
 */

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  MapPin,
  Home,
  User,
  Phone,
  Mail,
  Bed,
  Bath,
  Maximize,
  DollarSign,
  AlertCircle,
  Users,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { caretakerPropertyService } from "@/lib/services";
import type { CaretakerProperty, CaretakerUnit } from "@/lib/api-types";

interface PropertyDetailsModalProps {
  propertyId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PropertyDetailsModal({
  propertyId,
  open,
  onOpenChange,
}: PropertyDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch property details
  const { data: propertyData, isLoading: propertyLoading, error: propertyError } = useQuery({
    queryKey: ["caretaker-property", propertyId],
    queryFn: () => caretakerPropertyService.getProperty(propertyId!),
    enabled: !!propertyId && open,
  });

  // Fetch property units
  const { data: unitsData, isLoading: unitsLoading, error: unitsError } = useQuery({
    queryKey: ["caretaker-property-units", propertyId],
    queryFn: () => caretakerPropertyService.getPropertyUnits(propertyId!),
    enabled: !!propertyId && open,
  });

  const property = propertyData?.data as CaretakerProperty | undefined;
  const units = unitsData?.data || [];

  // Debug logging
  if (open && propertyId) {
    console.log("PropertyDetailsModal - Property Data:", {
      propertyData,
      property,
      propertyId,
      propertyError,
    });
    console.log("PropertyDetailsModal - Units Data:", {
      unitsData,
      units,
      unitsError,
    });
  }

  const isLoading = propertyLoading || unitsLoading;

  // Use actual units data if available, otherwise use property summary stats
  const totalUnitsCount = units.length > 0 ? units.length : (property?.total_units || 0);
  const occupiedUnitsCount = units.length > 0 
    ? units.filter((unit) => unit.is_occupied || (unit as any).is_occupied).length 
    : (property?.occupied_units || 0);
  const vacantUnitsCount = totalUnitsCount - occupiedUnitsCount;
  
  const occupiedUnits = units.filter((unit) => unit.is_occupied || (unit as any).is_occupied);
  const vacantUnits = units.filter((unit) => !(unit.is_occupied || (unit as any).is_occupied));
  const activeUnits = units.filter((unit) => unit.is_active !== false);
  const inactiveUnits = units.filter((unit) => unit.is_active === false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Building2 className="h-6 w-6 text-primary" />
            {property?.name || "Property Details"}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : propertyError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load property details: {propertyError instanceof Error ? propertyError.message : 'Unknown error'}
            </AlertDescription>
          </Alert>
        ) : !property ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load property details. No data received from server.</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-2">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{totalUnitsCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">Total Units</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{occupiedUnitsCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">Occupied</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{vacantUnitsCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">Vacant</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{inactiveUnits.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">Inactive</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="units">Units ({units.length})</TabsTrigger>
                <TabsTrigger value="tenants">Tenants ({occupiedUnits.length})</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Property Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Property Type</p>
                        <p className="font-medium capitalize">
                          {property.property_type?.replace(/_/g, " ")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge variant={property.is_active ? "default" : "secondary"}>
                          {property.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <div className="flex items-start gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">Address</p>
                          <p className="font-medium">
                            {property.address || 
                             (property as any).street_address || 
                             'Address not available'}
                          </p>
                          {(property.city || property.region || property.country) && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {[property.city, property.region, property.country]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                          )}
                          {(property as any).ghana_post_gps_address && (
                            <p className="text-xs text-muted-foreground mt-1">
                              GPS: {(property as any).ghana_post_gps_address}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {(property.description || (property as any).description) && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Description</p>
                          <p className="text-sm">
                            {property.description || (property as any).description || 'No description available'}
                          </p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Landlord Info */}
                {property.landlord && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Landlord Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{property.landlord.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{property.landlord.phone}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{property.landlord.email}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Units Tab */}
              <TabsContent value="units" className="space-y-4">
                {units.length === 0 && totalUnitsCount === 0 ? (
                  <Alert>
                    <Home className="h-4 w-4" />
                    <AlertDescription>
                      No units found for this property. {property?.total_units ? `Expected ${property.total_units} units.` : ''}
                    </AlertDescription>
                  </Alert>
                ) : units.length === 0 && totalUnitsCount > 0 ? (
                  <Alert>
                    <Home className="h-4 w-4" />
                    <AlertDescription>
                      Unit details are not available, but this property has {totalUnitsCount} {totalUnitsCount === 1 ? 'unit' : 'units'}.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {units.map((unit) => (
                      <Card
                        key={unit.id}
                        className={`${
                          !unit.is_active ? "opacity-60 border-dashed" : ""
                        }`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-base">
                              Unit {unit.unit_number}
                            </CardTitle>
                            <div className="flex gap-2">
                              <Badge
                                variant={unit.is_occupied ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {unit.is_occupied ? "Occupied" : "Vacant"}
                              </Badge>
                              {!unit.is_active && (
                                <Badge variant="outline" className="text-xs">
                                  Inactive
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground capitalize">
                            {unit.unit_type?.replace(/_/g, " ")} • Floor {unit.floor}
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="flex items-center gap-1">
                              <Bed className="h-3 w-3 text-muted-foreground" />
                              <span>{unit.bedrooms || 0} Bed</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Bath className="h-3 w-3 text-muted-foreground" />
                              <span>{unit.bathrooms || 0} Bath</span>
                            </div>
                            {unit.square_footage && (
                              <div className="flex items-center gap-1">
                                <Maximize className="h-3 w-3 text-muted-foreground" />
                                <span>{unit.square_footage} sqft</span>
                              </div>
                            )}
                          </div>

                          {(unit.rental_amount || unit.monthly_rent) && (
                            <div className="pt-2 border-t">
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <span className="font-semibold">
                                  GH₵{" "}
                                  {(
                                    (unit as any).rental_amount ||
                                    (unit as any).monthly_rent ||
                                    0
                                  ).toLocaleString()}
                                  /month
                                </span>
                              </div>
                            </div>
                          )}

                          {unit.is_occupied && unit.tenant && (
                            <div className="pt-2 border-t">
                              <p className="text-xs text-muted-foreground mb-1">
                                Current Tenant
                              </p>
                              <div className="flex items-center gap-2">
                                <User className="h-3 w-3 text-muted-foreground" />
                                <p className="text-sm font-medium">{unit.tenant.name}</p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Tenants Tab */}
              <TabsContent value="tenants" className="space-y-4">
                {occupiedUnits.length === 0 && occupiedUnitsCount === 0 ? (
                  <Alert>
                    <Users className="h-4 w-4" />
                    <AlertDescription>
                      No tenants currently residing in this property.
                    </AlertDescription>
                  </Alert>
                ) : occupiedUnits.length === 0 && occupiedUnitsCount > 0 ? (
                  <Alert>
                    <Users className="h-4 w-4" />
                    <AlertDescription>
                      Tenant details are not available, but this property has {occupiedUnitsCount} occupied {occupiedUnitsCount === 1 ? 'unit' : 'units'}.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-3">
                    {occupiedUnits.map((unit) => (
                      unit.tenant && (
                        <Card key={unit.id}>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-6 w-6 text-primary" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-lg">
                                      {unit.tenant.name}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      Unit {unit.unit_number} • Floor {unit.floor}
                                    </p>
                                  </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-3 ml-15">
                                  <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{unit.tenant.phone}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>{unit.tenant.email}</span>
                                  </div>
                                </div>

                                <div className="mt-3 pt-3 border-t">
                                  <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1">
                                      <Bed className="h-4 w-4 text-muted-foreground" />
                                      <span>{unit.bedrooms || 0} Bedrooms</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Bath className="h-4 w-4 text-muted-foreground" />
                                      <span>{unit.bathrooms || 0} Bathrooms</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <DollarSign className="h-4 w-4 text-green-600" />
                                      <span className="font-medium">
                                        GH₵{" "}
                                        {(
                                          (unit as any).rental_amount ||
                                          (unit as any).monthly_rent ||
                                          0
                                        ).toLocaleString()}
                                        /mo
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
