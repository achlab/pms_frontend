"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Building2,
  Search,
  Filter,
  Eye,
  Power,
  Home,
  Users,
  MapPin,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from "lucide-react";
import {
  useSuperAdminProperties,
  useSuperAdminProperty,
  useSuperAdminPropertyStatistics,
  useSuperAdminLandlords,
  useTogglePropertyStatus,
  useToggleUnitStatus,
} from "@/lib/hooks/use-super-admin-properties";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function SuperAdminPropertiesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [landlordFilter, setLandlordFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  // Fetch data
  const { data: propertiesData, isLoading: propertiesLoading } = useSuperAdminProperties({
    page: currentPage,
    per_page: 15,
    search: search || undefined,
    status: statusFilter !== "all" ? (statusFilter as "active" | "inactive") : undefined,
    landlord_id: landlordFilter !== "all" ? landlordFilter : undefined,
  });

  const { data: statistics, isLoading: statsLoading } = useSuperAdminPropertyStatistics();
  const { data: landlords } = useSuperAdminLandlords();
  const { data: selectedProperty } = useSuperAdminProperty(selectedPropertyId || "");

  const togglePropertyStatus = useTogglePropertyStatus();
  const toggleUnitStatus = useToggleUnitStatus();

  const properties = propertiesData?.data || [];
  const meta = propertiesData?.meta;

  const handleToggleProperty = async (propertyId: string) => {
    try {
      await togglePropertyStatus.mutateAsync(propertyId);
    } catch (error) {
      console.error("Error toggling property:", error);
    }
  };

  const handleToggleUnit = async (unitId: string) => {
    try {
      await toggleUnitStatus.mutateAsync(unitId);
    } catch (error) {
      console.error("Error toggling unit:", error);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-500">{" Active"}</Badge>
    ) : (
      <Badge variant="destructive">Inactive</Badge>
    );
  };

  return (
      <div className="container mx-auto py-6 space-y-6">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 dark:from-cyan-900 dark:via-blue-900 dark:to-indigo-900 shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 px-8 py-12 md:px-12">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Building2 className="h-10 w-10 text-white" />
                  <Badge className="bg-white/20 text-white border-white/30">
                    Property Management
                  </Badge>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  All Properties
                </h1>
                
                <p className="text-cyan-100 text-lg max-w-2xl">
                  Manage all properties across the platform. View landlords, caretakers, 
                  units, and enable/disable properties as needed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {!statsLoading && statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Properties</p>
                    <p className="text-3xl font-bold">{statistics.total_properties}</p>
                    <p className="text-xs text-green-600 mt-1">
                      {statistics.active_properties} active
                    </p>
                  </div>
                  <Building2 className="h-12 w-12 text-blue-500 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Units</p>
                    <p className="text-3xl font-bold">{statistics.total_units}</p>
                    <p className="text-xs text-blue-600 mt-1">
                      {statistics.active_units} active
                    </p>
                  </div>
                  <Home className="h-12 w-12 text-green-500 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Occupancy</p>
                    <p className="text-3xl font-bold">
                      {statistics.total_units > 0
                        ? Math.round((statistics.occupied_units / statistics.total_units) * 100)
                        : 0}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {statistics.occupied_units}/{statistics.total_units} occupied
                    </p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-purple-500 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Vacant Units</p>
                    <p className="text-3xl font-bold">{statistics.vacant_units}</p>
                    <p className="text-xs text-orange-600 mt-1">
                      Available for lease
                    </p>
                  </div>
                  <TrendingDown className="h-12 w-12 text-orange-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search properties by name, address, or city..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>

              <Select value={landlordFilter} onValueChange={setLandlordFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by landlord" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Landlords</SelectItem>
                  {landlords?.map((landlord) => (
                    <SelectItem key={landlord.id} value={landlord.id}>
                      {landlord.name} ({landlord.properties_count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Properties Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Properties List
              {meta && (
                <Badge variant="outline" className="ml-auto">
                  {meta.total} total
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {propertiesLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No properties found
                </p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your filters or search terms
                </p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Landlord</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Units</TableHead>
                      <TableHead>Occupancy</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {properties.map((property: any) => (
                      <TableRow key={property.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{property.name}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {property.city}, {property.state}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{property.landlord.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {property.landlord.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{property.property_type}</Badge>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{property.units_count}</p>
                          <p className="text-xs text-muted-foreground">
                            {property.occupied_units_count} occupied
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-500"
                                  style={{
                                    width: `${property.units_count > 0
                                      ? (property.occupied_units_count / property.units_count) * 100
                                      : 0}%`,
                                  }}
                                />
                              </div>
                            </div>
                            <span className="text-xs font-medium">
                              {property.units_count > 0
                                ? Math.round((property.occupied_units_count / property.units_count) * 100)
                                : 0}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(property.is_active)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedPropertyId(property.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={property.is_active ? "destructive" : "default"}
                              onClick={() => handleToggleProperty(property.id)}
                              disabled={togglePropertyStatus.isPending}
                            >
                              <Power className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {meta && meta.last_page > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Page {meta.current_page} of {meta.last_page}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={meta.current_page === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPage((p) => Math.min(meta.last_page, p + 1))}
                        disabled={meta.current_page === meta.last_page}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Property Details Modal */}
        <Dialog open={!!selectedPropertyId} onOpenChange={(open) => !open && setSelectedPropertyId(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Property Details
              </DialogTitle>
              <DialogDescription>
                View and manage units for this property
              </DialogDescription>
            </DialogHeader>

            {selectedProperty && (
              <div className="space-y-6">
                {/* Property Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Property Name</p>
                    <p className="font-medium">{selectedProperty.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium">{selectedProperty.property_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Landlord</p>
                    <p className="font-medium">{selectedProperty.landlord.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Caretaker</p>
                    <p className="font-medium">
                      {selectedProperty.caretaker?.name || "Not assigned"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{selectedProperty.address}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedProperty.city}, {selectedProperty.state} {selectedProperty.postal_code}
                    </p>
                  </div>
                </div>

                {/* Units */}
                <div>
                  <h3 className="font-medium mb-4">Units ({selectedProperty.units?.length || 0})</h3>
                  <div className="space-y-2">
                    {selectedProperty.units?.map((unit: any) => (
                      <Card key={unit.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium">Unit {unit.unit_number}</p>
                              <p className="text-sm text-muted-foreground">
                                {unit.number_of_bedrooms} bed, {unit.number_of_bathrooms} bath
                                {unit.tenant && ` • Tenant: ${unit.tenant.name}`}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {unit.is_occupied ? (
                                <Badge className="bg-blue-500">Occupied</Badge>
                              ) : (
                                <Badge variant="outline">Vacant</Badge>
                              )}
                              {getStatusBadge(unit.is_active)}
                              <Button
                                size="sm"
                                variant={unit.is_active ? "destructive" : "default"}
                                onClick={() => handleToggleUnit(unit.id)}
                                disabled={toggleUnitStatus.isPending}
                              >
                                <Power className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
  );
}
