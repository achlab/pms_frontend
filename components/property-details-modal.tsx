"use client"

import { useState, useEffect } from "react"
import { landlordPropertyService, landlordUnitService, landlordUserService } from "@/lib/services"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Building2,
  Home,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  UserPlus,
  UserMinus,
  Power,
  PowerOff,
  Loader2,
  Mail,
  Phone,
  Calendar,
  BarChart3,
  ToggleLeft,
  ToggleRight,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { LandlordProperty, PropertyFinancials, AvailableTenant, CreateUnitRequest, UnitType } from "@/lib/api-types"

interface PropertyDetailsModalProps {
  property: LandlordProperty
  isOpen: boolean
  onClose: () => void
  onPropertyUpdate: () => void
}

const UNIT_TYPES: { value: UnitType; label: string }[] = [
  { value: "studio", label: "Studio" },
  { value: "one_bedroom", label: "1 Bedroom" },
  { value: "two_bedroom", label: "2 Bedrooms" },
  { value: "three_bedroom", label: "3 Bedrooms" },
  { value: "four_bedroom", label: "4 Bedrooms" },
  { value: "penthouse", label: "Penthouse" },
  { value: "shop", label: "Shop" },
  { value: "office", label: "Office" },
]

export function PropertyDetailsModal({ property, isOpen, onClose, onPropertyUpdate }: PropertyDetailsModalProps) {
  const { toast } = useToast()
  
  // State
  const [loading, setLoading] = useState(false)
  const [propertyDetails, setPropertyDetails] = useState<LandlordProperty>(property)
  const [financials, setFinancials] = useState<PropertyFinancials | null>(null)
  const [availableTenants, setAvailableTenants] = useState<AvailableTenant[]>([])
  
  // Modal states
  const [isCreateUnitOpen, setIsCreateUnitOpen] = useState(false)
  const [isAssignTenantOpen, setIsAssignTenantOpen] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<any>(null)
  const [selectedTenantId, setSelectedTenantId] = useState("")
  
  // Form states
  const [unitFormData, setUnitFormData] = useState<CreateUnitRequest>({
    property_id: property.id,
    unit_number: "",
    unit_type: "studio",
    rental_amount: 0,
    description: "",
    floor_number: undefined,
  })

  // Load data when modal opens - OPTIMIZED: Single batch load
  useEffect(() => {
    if (isOpen) {
      loadAllData()
    }
  }, [isOpen, property.id])

  // SENIOR DEV OPTIMIZATION: Batch all API calls to prevent rate limiting
  const loadAllData = async () => {
    try {
      setLoading(true)
      // Execute all API calls in parallel for better performance
      const [propertyResponse, statisticsResponse, financialsResponse, tenantsResponse] = await Promise.allSettled([
        landlordPropertyService.getProperty(property.id),
        landlordPropertyService.getPropertyStatistics(property.id),
        landlordPropertyService.getPropertyFinancials(property.id),
        landlordUserService.getAvailableTenants()
      ])

      // Handle property details
      if (propertyResponse.status === 'fulfilled' && propertyResponse.value.data) {
        const propertyData = propertyResponse.value.data;
        setPropertyDetails(propertyData);
        
        // If statistics failed, calculate fallback from units data
        if (statisticsResponse.status === 'rejected' && propertyData.units) {
          const fallbackStats = calculateFallbackStatistics(propertyData.units);
          if (fallbackStats) {
            setPropertyDetails(prev => ({ ...prev, ...fallbackStats }));
          }
        }
      }

      // Handle real-time statistics
      if (statisticsResponse.status === 'fulfilled' && statisticsResponse.value.data) {
        const stats = statisticsResponse.value.data
        console.log('Statistics loaded:', stats) // Debug log
        
        // Update property details with real statistics
        setPropertyDetails(prev => ({
          ...prev,
          total_units: stats.units.total,
          occupied_units: stats.units.occupied,
          vacant_units: stats.units.vacant,
          disabled_units: stats.units.disabled,
          occupancy_rate: stats.units.occupancy_rate,
          monthly_revenue: stats.revenue.monthly_revenue,
          analytics: {
            monthly_revenue: stats.revenue.monthly_revenue,
            potential_revenue: stats.revenue.potential_revenue,
            lost_revenue: stats.revenue.lost_revenue,
            revenue_efficiency: stats.revenue.revenue_efficiency,
            total_tenants: stats.tenants.total,
          }
        }))
      } else if (statisticsResponse.status === 'rejected') {
        console.error('Statistics loading failed:', statisticsResponse.reason)
        // Set fallback statistics
        setPropertyDetails(prev => ({
          ...prev,
          total_units: prev.units?.length || 0,
          occupied_units: prev.units?.filter(u => u.is_occupied).length || 0,
          vacant_units: prev.units?.filter(u => !u.is_occupied).length || 0,
          disabled_units: prev.units?.filter(u => !u.is_active).length || 0,
          occupancy_rate: prev.units?.length > 0 ? 
            Math.round((prev.units.filter(u => u.is_occupied).length / prev.units.length) * 100) : 0,
          monthly_revenue: prev.units?.filter(u => u.is_occupied).reduce((sum, u) => sum + (u.rental_amount || 0), 0) || 0,
        }))
      }

      // Handle financials with fallback
      if (financialsResponse.status === 'fulfilled' && financialsResponse.value.data) {
        setFinancials(financialsResponse.value.data)
      } else {
        // Set default structure to prevent undefined errors
        setFinancials({
          monthly_revenue: 0,
          net_income: 0,
          expenses: {
            total: 0,
            maintenance: 0,
            utilities: 0,
            management: 0,
          }
        })
      }

      // Handle available tenants
      if (tenantsResponse.status === 'fulfilled' && tenantsResponse.value.data) {
        setAvailableTenants(tenantsResponse.value.data)
      }

    } catch (error: any) {
      console.error('Load all data error:', error)
      toast({
        title: "Error",
        description: "Failed to load property details.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Helper function to calculate statistics from units data
  const calculateFallbackStatistics = (units: any[]) => {
    if (!units || units.length === 0) return null;
    
    const totalUnits = units.length;
    const occupiedUnits = units.filter(u => u.is_occupied).length;
    const vacantUnits = totalUnits - occupiedUnits;
    const disabledUnits = units.filter(u => !u.is_active).length;
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
    const monthlyRevenue = units.filter(u => u.is_occupied).reduce((sum, u) => sum + (u.rental_amount || 0), 0);
    
    return {
      total_units: totalUnits,
      occupied_units: occupiedUnits,
      vacant_units: vacantUnits,
      disabled_units: disabledUnits,
      occupancy_rate: occupancyRate,
      monthly_revenue: monthlyRevenue,
    };
  }

  // SENIOR DEV: Consolidated individual functions into optimized batch loader above
  // Individual functions removed to prevent multiple API calls

  const handleDisableProperty = async () => {
    if (loading) return // Prevent double clicks
    
    try {
      setLoading(true)
      await landlordPropertyService.disableProperty(property.id)
      toast({
        title: "Success!",
        description: "Property disabled successfully.",
      })
      onPropertyUpdate()
      setTimeout(() => loadAllData(), 500)
      onClose()
    } catch (error: any) {
      console.error("Disable property error:", error)
      
      let errorMessage = "Failed to disable property."
      if (error?.message?.includes("Too many requests")) {
        errorMessage = "Too many requests. Please wait a moment and try again."
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEnableProperty = async () => {
    if (loading) return // Prevent double clicks
    
    try {
      setLoading(true)
      await landlordPropertyService.enableProperty(property.id)
      toast({
        title: "Success!",
        description: "Property enabled successfully.",
      })
      onPropertyUpdate()
      setTimeout(() => loadAllData(), 500)
      onClose()
    } catch (error: any) {
      console.error("Enable property error:", error)
      
      let errorMessage = "Failed to enable property."
      if (error?.message?.includes("Too many requests")) {
        errorMessage = "Too many requests. Please wait a moment and try again."
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleProperty = async (enable: boolean) => {
    if (loading) return
    
    try {
      setLoading(true)
      if (enable) {
        await landlordPropertyService.enableProperty(property.id)
      } else {
        await landlordPropertyService.disableProperty(property.id)
      }
      
      toast({
        title: "Success!",
        description: `Property ${enable ? 'enabled' : 'disabled'} successfully.`,
      })
      
      onPropertyUpdate()
      setTimeout(() => loadAllData(), 500)
    } catch (error: any) {
      console.error(`${enable ? 'Enable' : 'Disable'} property error:`, error)
      
      let errorMessage = `Failed to ${enable ? 'enable' : 'disable'} property.`
      if (error?.message?.includes("Too many requests")) {
        errorMessage = "Too many requests. Please wait a moment and try again."
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUnit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!unitFormData.unit_number || !unitFormData.rental_amount) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    // Prevent double submission
    if (loading) return

    try {
      setLoading(true)
      const response = await landlordUnitService.createUnit(unitFormData)
      
      if (response.data) {
        setIsCreateUnitOpen(false)
        setUnitFormData({
          property_id: property.id,
          unit_number: "",
          unit_type: "studio",
          rental_amount: 0,
          description: "",
          floor_number: undefined,
        })
        
        toast({
          title: "Success!",
          description: `Unit ${response.data.unit_number} created successfully.`,
        })
        
        // Notify parent component to refresh
        onPropertyUpdate()
        
        // OPTIMIZED: Single batch reload instead of multiple API calls
        setTimeout(() => {
          loadAllData()
        }, 500) // Reduced timeout for better UX
      }
    } catch (error: any) {
      console.error("Create unit error:", error)
      
      let errorMessage = "Failed to create unit."
      
      // Handle specific error types
      if (error?.message?.includes("Too many requests")) {
        errorMessage = "Too many requests. Please wait a moment and try again."
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAssignTenant = async () => {
    if (!selectedUnit || !selectedTenantId) {
      toast({
        title: "Validation Error",
        description: "Please select a tenant.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      await landlordUnitService.assignTenant(property.id, selectedUnit.id, selectedTenantId)
      
      setIsAssignTenantOpen(false)
      setSelectedUnit(null)
      setSelectedTenantId("")
      
      const tenant = availableTenants.find(t => t.id === selectedTenantId)
      toast({
        title: "Success!",
        description: `${tenant?.name} assigned to Unit ${selectedUnit.unit_number}.`,
      })
      
      // OPTIMIZED: Use batch loader instead of multiple API calls
      onPropertyUpdate()
      setTimeout(() => loadAllData(), 500)
    } catch (error: any) {
      console.error("Assign tenant error:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to assign tenant.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveTenant = async (unit: any) => {
    try {
      setLoading(true)
      await landlordUnitService.removeTenant(property.id, unit.id)
      
      toast({
        title: "Success!",
        description: `Tenant removed from Unit ${unit.unit_number}.`,
      })
      
      // OPTIMIZED: Use batch loader instead of multiple API calls
      onPropertyUpdate()
      setTimeout(() => loadAllData(), 500)
    } catch (error: any) {
      console.error("Remove tenant error:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to remove tenant.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDisableUnit = async (unit: any) => {
    try {
      setLoading(true)
      await landlordUnitService.disableUnit(property.id, unit.id, "Disabled by landlord")
      
      toast({
        title: "Success!",
        description: `Unit ${unit.unit_number} disabled successfully.`,
      })
      
      // OPTIMIZED: Use batch loader and notify parent
      onPropertyUpdate()
      setTimeout(() => loadAllData(), 500)
    } catch (error: any) {
      console.error("Disable unit error:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to disable unit.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEnableUnit = async (unit: any) => {
    try {
      setLoading(true)
      await landlordUnitService.enableUnit(property.id, unit.id)
      
      toast({
        title: "Success!",
        description: `Unit ${unit.unit_number} enabled successfully.`,
      })
      
      // OPTIMIZED: Use batch loader and notify parent
      onPropertyUpdate()
      setTimeout(() => loadAllData(), 500)
    } catch (error: any) {
      console.error("Enable unit error:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to enable unit.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleUnit = async (unit: any, enable: boolean) => {
    try {
      setLoading(true)
      if (enable) {
        await landlordUnitService.enableUnit(property.id, unit.id)
      } else {
        await landlordUnitService.disableUnit(property.id, unit.id, "Disabled by landlord")
      }
      
      toast({
        title: "Success!",
        description: `Unit ${unit.unit_number} ${enable ? 'enabled' : 'disabled'} successfully.`,
      })
      
      onPropertyUpdate()
      setTimeout(() => loadAllData(), 500)
    } catch (error: any) {
      console.error(`${enable ? 'Enable' : 'Disable'} unit error:`, error)
      
      let errorMessage = `Failed to ${enable ? 'enable' : 'disable'} unit.`
      if (error?.message?.includes("disabled property")) {
        errorMessage = "Cannot assign units from a disabled property."
      } else if (error?.message?.includes("disabled unit")) {
        errorMessage = "Cannot assign a disabled unit."
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const units = propertyDetails.units || []

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl">{propertyDetails.name}</DialogTitle>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Property Status:</span>
                {propertyDetails.is_active ? (
                  <button
                    onClick={() => handleToggleProperty(false)}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50 border border-green-300"
                  >
                    <ToggleRight className="w-5 h-5" />
                    <span className="text-sm font-medium">Active</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleToggleProperty(true)}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50 border border-red-300"
                  >
                    <ToggleLeft className="w-5 h-5" />
                    <span className="text-sm font-medium">Disabled</span>
                  </button>
                )}
              </div>
            </div>
          </DialogHeader>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">
                <Building2 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="units">
                <Home className="h-4 w-4 mr-2" />
                Units ({units.length})
              </TabsTrigger>
              <TabsTrigger value="financials">
                <BarChart3 className="h-4 w-4 mr-2" />
                Financials
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Property Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Property Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Address</Label>
                      <p className="text-sm">{propertyDetails.street_address}</p>
                    </div>
                    {propertyDetails.ghana_post_gps_address && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Ghana Post GPS</Label>
                        <p className="text-sm">{propertyDetails.ghana_post_gps_address}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Caretaker</Label>
                      <p className="text-sm">
                        {propertyDetails.caretaker 
                          ? `${propertyDetails.caretaker.name} (${propertyDetails.caretaker.email})`
                          : "No caretaker assigned"
                        }
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Status</Label>
                      <Badge className={propertyDetails.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                        {propertyDetails.is_active ? "Active" : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                  {propertyDetails.description && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Description</Label>
                      <p className="text-sm">{propertyDetails.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Real-Time Analytics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Units</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {propertyDetails.total_units ?? propertyDetails.units?.length ?? 0}
                        </p>
                      </div>
                      <Building2 className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Occupied</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {propertyDetails.occupied_units ?? 
                           propertyDetails.units?.filter(u => u.is_occupied).length ?? 0}
                        </p>
                        <p className="text-xs text-gray-500">
                          {propertyDetails.vacant_units ?? 
                           propertyDetails.units?.filter(u => !u.is_occupied).length ?? 0} vacant
                        </p>
                      </div>
                      <Users className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {Math.round(propertyDetails.occupancy_rate ?? 
                            (propertyDetails.units?.length > 0 ? 
                              (propertyDetails.units.filter(u => u.is_occupied).length / propertyDetails.units.length) * 100 
                              : 0))}%
                        </p>
                        {(propertyDetails.disabled_units ?? propertyDetails.units?.filter(u => !u.is_active).length ?? 0) > 0 && (
                          <p className="text-xs text-red-500">
                            {propertyDetails.disabled_units ?? propertyDetails.units?.filter(u => !u.is_active).length ?? 0} disabled
                          </p>
                        )}
                      </div>
                      <TrendingUp className="w-8 h-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">
                          ₵{(propertyDetails.monthly_revenue ?? 
                             propertyDetails.units?.filter(u => u.is_occupied)
                               .reduce((sum, u) => sum + (u.rental_amount || 0), 0) ?? 0).toLocaleString()}
                        </p>
                        {propertyDetails.analytics?.potential_revenue && (
                          <p className="text-xs text-gray-500">
                            Potential: ₵{propertyDetails.analytics.potential_revenue.toLocaleString()}
                          </p>
                        )}
                      </div>
                      <DollarSign className="w-8 h-8 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Units Tab */}
            <TabsContent value="units" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Units Management</h3>
                <Button
                  onClick={() => setIsCreateUnitOpen(true)}
                  className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Unit
                </Button>
              </div>

              {units.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No units yet. Click "Add Unit" to create your first unit.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {units.map((unit) => (
                    <Card key={unit.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Unit {unit.unit_number}</CardTitle>
                          <div className="flex gap-1">
                            <Badge className={unit.is_occupied ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}>
                              {unit.is_occupied ? "Occupied" : "Available"}
                            </Badge>
                            <Badge className={unit.is_active ? "bg-gray-100 text-gray-700" : "bg-red-100 text-red-700"}>
                              {unit.is_active ? "Active" : "Disabled"}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-sm text-gray-600">
                          <p><strong>Type:</strong> {unit.unit_type}</p>
                          <p><strong>Rent:</strong> ₵{(unit.rental_amount || 0).toLocaleString()}/month</p>
                        </div>

                        {unit.tenant && (
                          <div className="pt-2 border-t">
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                              <Users className="w-4 h-4 mr-2" />
                              <span className="font-medium">{unit.tenant.name}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Mail className="w-4 h-4 mr-2" />
                              <span>{unit.tenant.email}</span>
                            </div>
                          </div>
                        )}

                        <div className="pt-3 border-t flex gap-2">
                          {unit.tenant ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-red-600 hover:text-red-700"
                              onClick={() => handleRemoveTenant(unit)}
                              disabled={loading}
                            >
                              <UserMinus className="w-3 h-3 mr-1" />
                              Remove Tenant
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => {
                                setSelectedUnit(unit)
                                setIsAssignTenantOpen(true)
                              }}
                              disabled={loading || availableTenants.length === 0}
                            >
                              <UserPlus className="w-3 h-3 mr-1" />
                              Assign Tenant
                            </Button>
                          )}
                          
                          {unit.is_active ? (
                            <button
                              onClick={() => handleToggleUnit(unit, false)}
                              disabled={loading}
                              className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50 text-xs border border-green-300"
                              title="Click to disable unit"
                            >
                              <ToggleRight className="w-3 h-3" />
                              <span>Active</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleUnit(unit, true)}
                              disabled={loading}
                              className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50 text-xs border border-red-300"
                              title="Click to enable unit"
                            >
                              <ToggleLeft className="w-3 h-3" />
                              <span>Disabled</span>
                            </button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Financials Tab */}
            <TabsContent value="financials" className="space-y-6">
              {financials ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">₵{(financials.monthly_revenue || 0).toLocaleString()}</p>
                          </div>
                          <DollarSign className="w-8 h-8 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                            <p className="text-2xl font-bold text-gray-900">₵{(financials.expenses?.total || 0).toLocaleString()}</p>
                          </div>
                          <TrendingUp className="w-8 h-8 text-red-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Net Income</p>
                            <p className="text-2xl font-bold text-gray-900">₵{(financials.net_income || 0).toLocaleString()}</p>
                          </div>
                          <BarChart3 className="w-8 h-8 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Expense Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Maintenance:</span>
                          <span>₵{(financials.expenses?.maintenance || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Utilities:</span>
                          <span>₵{(financials.expenses?.utilities || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Management:</span>
                          <span>₵{(financials.expenses?.management || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Financial data not available yet.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Create Unit Modal */}
      <Dialog open={isCreateUnitOpen} onOpenChange={setIsCreateUnitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Unit</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateUnit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="unit_number">Unit Number *</Label>
                <Input
                  id="unit_number"
                  value={unitFormData.unit_number}
                  onChange={(e) => setUnitFormData({ ...unitFormData, unit_number: e.target.value })}
                  placeholder="e.g., A101, B205"
                  required
                />
              </div>
              <div>
                <Label htmlFor="unit_type">Unit Type *</Label>
                <Select
                  value={unitFormData.unit_type}
                  onValueChange={(value: UnitType) => setUnitFormData({ ...unitFormData, unit_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="rental_amount">Monthly Rent (₵) *</Label>
                <Input
                  id="rental_amount"
                  type="number"
                  value={unitFormData.rental_amount}
                  onChange={(e) => setUnitFormData({ ...unitFormData, rental_amount: parseFloat(e.target.value) || 0 })}
                  placeholder="1200.00"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <Label htmlFor="floor_number">Floor Number</Label>
                <Input
                  id="floor_number"
                  type="number"
                  value={unitFormData.floor_number || ""}
                  onChange={(e) => setUnitFormData({ ...unitFormData, floor_number: parseInt(e.target.value) || undefined })}
                  placeholder="1"
                  min="0"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={unitFormData.description}
                onChange={(e) => setUnitFormData({ ...unitFormData, description: e.target.value })}
                placeholder="Additional details about the unit..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setIsCreateUnitOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Unit"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Tenant Modal */}
      <Dialog open={isAssignTenantOpen} onOpenChange={setIsAssignTenantOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Tenant to Unit {selectedUnit?.unit_number}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tenant-select">Select Tenant *</Label>
              <Select
                value={selectedTenantId}
                onValueChange={setSelectedTenantId}
              >
                <SelectTrigger id="tenant-select">
                  <SelectValue placeholder="Choose an available tenant" />
                </SelectTrigger>
                <SelectContent>
                  {availableTenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name} - {tenant.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableTenants.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  No available tenants. Create tenants first or check if all tenants are already assigned.
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsAssignTenantOpen(false)
                  setSelectedUnit(null)
                  setSelectedTenantId("")
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700"
                onClick={handleAssignTenant}
                disabled={loading || !selectedTenantId}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  "Assign Tenant"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
