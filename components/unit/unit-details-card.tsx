/**
 * Unit Details Card Component
 * Displays comprehensive unit information
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Home, 
  Bed, 
  Bath, 
  Maximize, 
  DollarSign, 
  MapPin,
  CheckCircle,
  XCircle,
  Star
} from "lucide-react";
import type { Unit } from "@/lib/api-types";

interface UnitDetailsCardProps {
  unit: Unit;
}

export function UnitDetailsCard({ unit }: UnitDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">Unit {unit.unit_number}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{unit.floor}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant={unit.is_available ? "outline" : "default"}>
              {unit.is_available ? "Available" : "Occupied"}
            </Badge>
            {unit.is_active && (
              <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                Active
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Description */}
        {unit.description && (
          <div>
            <p className="text-muted-foreground">{unit.description}</p>
          </div>
        )}

        <Separator />

        {/* Key Details Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Unit Type */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
              <Home className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unit Type</p>
              <p className="font-medium capitalize">{unit.unit_type.replace(/([A-Z])/g, ' $1').trim()}</p>
            </div>
          </div>

          {/* Bedrooms */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
              <Bed className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bedrooms</p>
              <p className="font-medium">{unit.bedrooms} {unit.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</p>
            </div>
          </div>

          {/* Bathrooms */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900/20">
              <Bath className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bathrooms</p>
              <p className="font-medium">{unit.bathrooms} {unit.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}</p>
            </div>
          </div>

          {/* Square Footage */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
              <Maximize className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Square Footage</p>
              <p className="font-medium">{unit.square_footage.toLocaleString()} sq ft</p>
            </div>
          </div>

          {/* Monthly Rent */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly Rent</p>
              <p className="font-medium text-lg">
                GH₵ {unit.monthly_rent.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </p>
            </div>
          </div>

          {/* Availability Status */}
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
              unit.is_available 
                ? 'bg-green-100 dark:bg-green-900/20' 
                : 'bg-red-100 dark:bg-red-900/20'
            }`}>
              {unit.is_available ? (
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium">{unit.is_available ? 'Available' : 'Occupied'}</p>
            </div>
          </div>
        </div>

        {/* Features */}
        {unit.features && unit.features.length > 0 && (
          <>
            <Separator />
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-5 w-5 text-amber-500" />
                <h3 className="font-semibold">Features & Amenities</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {unit.features.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Tenant Information */}
        {unit.tenant && (
          <>
            <Separator />
            <div>
              <h3 className="font-semibold mb-3">Current Tenant</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{unit.tenant.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{unit.tenant.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{unit.tenant.phone}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

