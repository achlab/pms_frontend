"use client"

import { useEffect, useMemo } from "react"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import { AnimatedCard } from "@/components/animated-card"
import { PropertyModal } from "@/components/property-modal"
import { LoadingSpinner } from "@/components/loading-spinner"
import { PropertyFilters } from "@/components/properties/property-filters"
import { BulkActionsToolbar } from "@/components/properties/bulk-actions-toolbar"
import { PropertyCard } from "@/components/properties/property-card"
import { PropertyListView } from "@/components/properties/property-list-view"
import { Building2, Users, DollarSign, Grid3X3, List, TrendingUp, MapPin, Eye, Phone } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchProperties, setViewMode, setFilters } from "@/lib/slices/propertiesSlice"
import { formatCurrency } from "@/lib/localization"

export default function PropertiesPage() {
  const dispatch = useAppDispatch()
  const { properties, loading, error, filters, viewMode } = useAppSelector((state) => state.properties)
  const { currentUser } = useAppSelector((state) => state.users)

  useEffect(() => {
    dispatch(fetchProperties())
  }, [dispatch])

  const filteredProperties = useMemo(() => {
    let baseProperties = properties

    // If caretaker, show only assigned properties
    if (currentUser?.role === "caretaker") {
      baseProperties = properties.filter((property) => currentUser.assignedProperties?.includes(property.id))
    }

    return baseProperties.filter((property) => {
      const matchesSearch =
        !filters.search ||
        property.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        property.address.toLowerCase().includes(filters.search.toLowerCase()) ||
        (property.region && property.region.toLowerCase().includes(filters.search.toLowerCase())) ||
        (property.gpsAddress && property.gpsAddress.toLowerCase().includes(filters.search.toLowerCase()))

      const matchesStatus = filters.status === "all" || property.status === filters.status

      const matchesLocation =
        filters.location === "all" ||
        property.address.toLowerCase().includes(filters.location.toLowerCase()) ||
        (property.region && property.region.toLowerCase().includes(filters.location.toLowerCase()))

      const matchesRevenue = property.monthlyRevenue >= filters.minRevenue

      return matchesSearch && matchesStatus && matchesLocation && matchesRevenue
    })
  }, [properties, filters, currentUser])

  const totalProperties = filteredProperties.length
  const totalUnits = filteredProperties.reduce((sum, prop) => sum + prop.units, 0)
  const totalOccupied = filteredProperties.reduce((sum, prop) => sum + prop.occupied, 0)
  const totalRevenue = filteredProperties.reduce((sum, prop) => sum + prop.monthlyRevenue, 0)
  const occupancyRate = totalUnits > 0 ? Math.round((totalOccupied / totalUnits) * 100) : 0

  const isCaretaker = currentUser?.role === "caretaker"

  const assignedPropertiesData = [
    {
      id: "1",
      name: "Sunset Apartments",
      address: "123 Independence Avenue, Accra",
      gpsAddress: "GA-123-4567",
      region: "Greater Accra",
      landlordName: "Kwame Asante",
      landlordPhone: "+233 24 123 4567",
      units: [
        {
          id: "1a",
          name: "Unit A1",
          type: "Bedsitter",
          status: "occupied",
          tenant: "Kofi Mensah",
          tenantPhone: "+233 20 111 2222",
        },
        {
          id: "1b",
          name: "Unit A2",
          type: "Chamber & Hall",
          status: "occupied",
          tenant: "Ama Serwaa",
          tenantPhone: "+233 24 333 4444",
        },
        { id: "1c", name: "Unit A3", type: "Bedsitter", status: "vacant", tenant: null, tenantPhone: null },
        {
          id: "1d",
          name: "Unit A4",
          type: "Chamber & Hall",
          status: "occupied",
          tenant: "Yaw Osei",
          tenantPhone: "+233 26 555 6666",
        },
      ],
    },
    {
      id: "2",
      name: "Golden Heights",
      address: "456 Ring Road, Kumasi",
      gpsAddress: "AK-789-0123",
      region: "Ashanti",
      landlordName: "Akosua Mensah",
      landlordPhone: "+233 24 987 6543",
      units: [
        {
          id: "2a",
          name: "Unit B1",
          type: "Single Room",
          status: "occupied",
          tenant: "Kwaku Boateng",
          tenantPhone: "+233 20 777 8888",
        },
        { id: "2b", name: "Unit B2", type: "Chamber & Hall", status: "vacant", tenant: null, tenantPhone: null },
        {
          id: "2c",
          name: "Unit B3",
          type: "Single Room",
          status: "occupied",
          tenant: "Efua Asante",
          tenantPhone: "+233 24 999 0000",
        },
        {
          id: "2d",
          name: "Unit B4",
          type: "Bedsitter",
          status: "occupied",
          tenant: "Kojo Antwi",
          tenantPhone: "+233 26 111 2222",
        },
      ],
    },
  ]

  if (loading && properties.length === 0) {
    return (
      <MainLayout>
        <div className="p-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout>
        <div className="p-8">
          <div className="text-center py-12 animate-in fade-in-0 zoom-in-95 duration-300">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <Button
              onClick={() => dispatch(fetchProperties())}
              className="mt-4 transition-all duration-200 hover:scale-105"
            >
              Try Again
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start animate-in fade-in-0 slide-in-from-top-4 duration-500">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              {isCaretaker ? "Assigned Properties" : "Property Portfolio"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {isCaretaker
                ? "View properties and units you are responsible for managing."
                : "Manage your properties across Ghana with manual tracking and oversight."}
            </p>
          </div>
          {!isCaretaker && <PropertyModal />}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <AnimatedCard delay={100} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {isCaretaker ? "Assigned Properties" : "Total Properties"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalProperties}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 dark:text-green-400">
                      {isCaretaker
                        ? "Under your care"
                        : filteredProperties.length !== properties.length
                          ? "Filtered view"
                          : "All properties"}
                    </span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-indigo-100 to-cyan-100 dark:from-indigo-900 dark:to-cyan-900 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={200} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Units</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalUnits}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{totalOccupied} occupied</span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={300} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Occupancy Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{occupancyRate}%</p>
                  <div className="flex items-center mt-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 w-16">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-2 rounded-full"
                        style={{ width: `${occupancyRate}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={400} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {isCaretaker ? "Units to Manage" : "Monthly Revenue"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isCaretaker ? totalUnits : formatCurrency(totalRevenue)}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 dark:text-green-400">
                      {isCaretaker ? "Your responsibility" : "Expected total"}
                    </span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-emerald-100 to-cyan-100 dark:from-emerald-900 dark:to-cyan-900 rounded-lg flex items-center justify-center">
                  {isCaretaker ? (
                    <Building2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  )}
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>

        {!isCaretaker && (
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-300">
            <PropertyFilters />

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => dispatch(setViewMode("grid"))}
                className="min-h-[44px]"
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => dispatch(setViewMode("list"))}
                className="min-h-[44px]"
              >
                <List className="h-4 w-4 mr-2" />
                List
              </Button>
            </div>
          </div>
        )}

        {isCaretaker ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {assignedPropertiesData.map((property, index) => (
              <AnimatedCard
                key={property.id}
                delay={100 + index * 100}
                className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Property Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{property.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{property.address}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">GPS: {property.gpsAddress}</p>
                      </div>
                      <Button variant="outline" size="sm" className="min-h-[44px] bg-transparent">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>

                    {/* Landlord Contact */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Landlord Contact</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{property.landlordName}</span>
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          <Phone className="h-4 w-4 mr-1" />
                          {property.landlordPhone}
                        </Button>
                      </div>
                    </div>

                    {/* Units Summary */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Units Overview</span>
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {property.units.filter((u) => u.status === "occupied").length}/{property.units.length}{" "}
                          Occupied
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {property.units.map((unit) => (
                          <div
                            key={unit.id}
                            className={`p-2 rounded border text-xs ${
                              unit.status === "occupied"
                                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                            }`}
                          >
                            <div className="font-medium text-gray-900 dark:text-white">{unit.name}</div>
                            <div className="text-gray-600 dark:text-gray-400">{unit.type}</div>
                            {unit.status === "occupied" && unit.tenant && (
                              <div className="text-green-600 dark:text-green-400 mt-1">{unit.tenant}</div>
                            )}
                            {unit.status === "vacant" && (
                              <div className="text-gray-500 dark:text-gray-500 mt-1">Vacant</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </AnimatedCard>
            ))}
          </div>
        ) : (
          <>
            {/* Properties Display for Landlords */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProperties.map((property, index) => (
                  <PropertyCard key={property.id} property={property} index={index} />
                ))}
              </div>
            ) : (
              <PropertyListView properties={filteredProperties} />
            )}
          </>
        )}

        {filteredProperties.length === 0 && !loading && (
          <div className="text-center py-12 animate-in fade-in-0 zoom-in-95 duration-300">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {isCaretaker ? "No properties assigned to you yet." : "No properties found matching your filters."}
            </p>
            {!isCaretaker && (
              <Button
                variant="outline"
                onClick={() => dispatch(setFilters({ search: "", status: "all", location: "all", minRevenue: 0 }))}
                className="mt-4"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {loading && (
          <div className="text-center py-4">
            <LoadingSpinner />
          </div>
        )}

        {!isCaretaker && <BulkActionsToolbar />}
      </div>
    </MainLayout>
  )
}
