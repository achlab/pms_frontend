/**
 * Property Info Card Component
 * Displays property information associated with a unit
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MapPin, Map, Globe } from "lucide-react";
import type { Property } from "@/lib/api-types";

interface PropertyInfoCardProps {
  property: Property;
}

export function PropertyInfoCard({ property }: PropertyInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Property Information</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Property Name */}
        <div>
          <h3 className="text-xl font-semibold mb-1">{property.name}</h3>
          <p className="text-sm text-muted-foreground capitalize">
            {property.property_type.replace(/_/g, ' ')}
          </p>
        </div>

        {/* Description */}
        {property.description && (
          <div>
            <p className="text-sm text-muted-foreground">{property.description}</p>
          </div>
        )}

        {/* Address */}
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground">Address</p>
            <p className="font-medium">{property.address}</p>
            {(property.city || property.region || property.country) && (
              <p className="text-sm text-muted-foreground">
                {[property.city, property.region, property.country]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            )}
          </div>
        </div>

        {/* GPS Code */}
        {property.gps_code && (
          <div className="flex items-start gap-3">
            <Map className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">GPS Code</p>
              <p className="font-medium font-mono">{property.gps_code}</p>
            </div>
          </div>
        )}

        {/* Status */}
        {property.is_active !== undefined && (
          <div className="flex items-center gap-2 pt-2">
            <div className={`h-2 w-2 rounded-full ${
              property.is_active ? 'bg-green-500' : 'bg-gray-400'
            }`} />
            <span className="text-sm text-muted-foreground">
              {property.is_active ? 'Active Property' : 'Inactive Property'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

