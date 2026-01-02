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
  const [availableCaretakers, setAvailableCaretakers] = useState<User[]>([])
  
  // Modal states
  const [isCreateUnitOpen, setIsCreateUnitOpen] = useState(false)
  const [isAssignTenantOpen, setIsAssignTenantOpen] = useState(false)
  const [isAssignCaretakerOpen, setIsAssignCaretakerOpen] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<any>(null)
  const [selectedTenantId, setSelectedTenantId] = useState("")
  const [selectedCaretakerId, setSelectedCaretakerId] = useState("")
  
  // Form states
  const [unitFormData, setUnitFormData] = useState<CreateUnitRequest>({
    property_id: property.id,
    unit_number: "",
    unit_type: "studio",
    rental_amount: 0,
    description: "",
    floor_number: undefined,
    bedrooms: undefined,
    bathrooms: undefined,
    is_furnished: false,
    utilities_included: false,
  })

  // Sync propertyDetails when property prop changes
  useEffect(() => {
    setPropertyDetails(property)
  }, [property])

  // Load data when modal opens - OPTIMIZED: Single batch load
  useEffect(() => {
    console.log('🚪 Modal state changed:', { isOpen, propertyId: property.id })
    if (isOpen) {
      console.log('✅ Modal is OPEN - Loading data...')
      loadAllData()
    } else {
      console.log('❌ Modal is CLOSED - Not loading data')
    }
  }, [isOpen, property.id])

  // SENIOR DEV OPTIMIZATION: Batch all API calls to prevent rate limiting
  const loadAllData = async () => {
    try {
      setLoading(true)
      console.log('🔄 Loading data for property:', property.id)
      // Execute all API calls in parallel for better performance
      const [propertyResponse, statisticsResponse, financialsResponse, tenantsResponse, caretakersResponse] = await Promise.allSettled([
        landlordPropertyService.getProperty(property.id),
        landlordPropertyService.getPropertyStatistics(property.id),
        landlordPropertyService.getPropertyFinancials(property.id),
        landlordUserService.getAvailableTenants(),
        landlordUserService.getAvailableCaretakers()
      ])
      
      console.log('📥 All Responses:', {
        property: propertyResponse,
        statistics: statisticsResponse,
        financials: financialsResponse,
        tenants: tenantsResponse
      })

      // Handle property details
      if (propertyResponse.status === 'fulfilled' && propertyResponse.value.data) {
        const propertyData = propertyResponse.value.data;
        
        console.log('🏠 Property Data:', propertyData);
        console.log('📦 Units Data:', propertyData.units);
        if (propertyData.units && propertyData.units.length > 0) {
          console.log('🔍 First Unit Sample:', propertyData.units[0]);
        }
        
        // Normalize camelCase to snake_case for is_active field
        const normalizedData = {
          ...propertyData,
          is_active: (propertyData as any).isActive ?? propertyData.is_active,
        };
        
        setPropertyDetails(normalizedData);
        
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
        console.log('✅ Financials Response:', financialsResponse.value)
        console.log('📊 Financials Data:', financialsResponse.value.data)
        setFinancials(financialsResponse.value.data)
      } else {
        console.log('❌ Financials Response Failed:', financialsResponse)
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

      // Handle available caretakers
      if (caretakersResponse.status === 'fulfilled' && caretakersResponse.value.data) {
        setAvailableCaretakers(caretakersResponse.value.data)
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
      console.log(`${enable ? '✅ Enabling' : '❌ Disabling'} property:`, property.id);
      
      let response;
      if (enable) {
        response = await landlordPropertyService.enableProperty(property.id)
      } else {
        response = await landlordPropertyService.disableProperty(property.id)
      }
      
      console.log('Property toggle response:', response);
      
      // Update local state immediately - normalize both camelCase and snake_case
      if (response?.data) {
        console.log('📊 Updating property status. Response data:', response.data);
        const activeStatus = (response.data as any).isActive ?? response.data.is_active ?? enable;
        console.log('📊 Active status (normalized):', activeStatus);
        setPropertyDetails(prev => ({
          ...prev,
          is_active: activeStatus,
          isActive: activeStatus,
        }))
      } else {
        console.warn('⚠️ No response data, using enable value:', enable);
        setPropertyDetails(prev => ({
          ...prev,
          is_active: enable,
          isActive: enable,
        }))
      }
      
      toast({
        title: "Success!",
        description: `Property ${enable ? 'enabled' : 'disabled'} successfully.`,
      })
      
      onPropertyUpdate()
      setTimeout(() => loadAllData(), 500)
    } catch (error: any) {
      console.error(`❌ ${enable ? 'Enable' : 'Disable'} property error:`, error)
      console.error('Error details:', error?.response)
      
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
    
    // Check if property is disabled
    const activeValue = (propertyDetails as any).isActive ?? propertyDetails.is_active;
    const isActive = activeValue !== false;
    
    if (!isActive) {
      toast({
        title: "Property Disabled",
        description: "Cannot add units to a disabled property. Please enable the property first.",
        variant: "destructive",
      })
      return
    }
    
    if (!unitFormData.unit_number || !unitFormData.rental_amount) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    // Additional validation for realistic values
    if (unitFormData.rental_amount < 50) {
      toast({
        title: "Validation Error",
        description: "Monthly rent must be at least ₵50.",
        variant: "destructive",
      })
      return
    }

    if (unitFormData.floor_number && unitFormData.floor_number > 100) {
      toast({
        title: "Validation Error",
        description: "Floor number cannot exceed 100.",
        variant: "destructive",
      })
      return
    }

    if (unitFormData.bedrooms && unitFormData.bedrooms > 20) {
      toast({
        title: "Validation Error",
        description: "Number of bedrooms cannot exceed 20.",
        variant: "destructive",
      })
      return
    }

    if (unitFormData.bathrooms && unitFormData.bathrooms > 20) {
      toast({
        title: "Validation Error",
        description: "Number of bathrooms cannot exceed 20.",
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
          bedrooms: undefined,
          bathrooms: undefined,
          is_furnished: false,
          utilities_included: false,
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
      
      // Handle validation errors specifically
      if (error?.status === 422 && error?.errors) {
        const validationErrors = Object.values(error.errors).flat()
        errorMessage = `Validation failed: ${validationErrors.join(', ')}`
      } else if (error?.message?.includes("Too many requests")) {
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
    // Check if property is disabled
    const activeValue = (propertyDetails as any).isActive ?? propertyDetails.is_active;
    const isActive = activeValue !== false;
    
    if (!isActive) {
      toast({
        title: "Property Disabled",
        description: "Cannot assign tenants to units in a disabled property. Please enable the property first.",
        variant: "destructive",
      })
      return
    }
    
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

  const handleAssignCaretaker = async () => {
    // Check if property is disabled
    const activeValue = (propertyDetails as any).isActive ?? propertyDetails.is_active;
    const isActive = activeValue !== false;

    if (!isActive) {
      toast({
        title: "Property Disabled",
        description: "Cannot assign caretakers to units in a disabled property. Please enable the property first.",
        variant: "destructive",
      })
      return
    }

    if (!selectedUnit || !selectedCaretakerId) {
      toast({
        title: "Validation Error",
        description: "Please select a caretaker.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      await landlordUnitService.assignCaretaker(property.id, selectedUnit.id, selectedCaretakerId)

      setIsAssignCaretakerOpen(false)
      setSelectedUnit(null)
      setSelectedCaretakerId("")

      const caretaker = availableCaretakers.find(c => c.id === selectedCaretakerId)
      toast({
        title: "Success!",
        description: `${caretaker?.name} assigned to Unit ${selectedUnit.unit_number}.`,
      })

      // OPTIMIZED: Use batch loader instead of multiple API calls
      onPropertyUpdate()
      setTimeout(() => loadAllData(), 500)
    } catch (error: any) {
      console.error("Assign caretaker error:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to assign caretaker.",
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
      
      console.log(`🔄 Attempting to ${enable ? 'enable' : 'disable'} unit:`, {
        unitId: unit.id,
        unitNumber: unit.unit_number,
        currentStatus: unit.is_active,
        propertyId: property.id
      })
      
      let response;
      if (enable) {
        response = await landlordUnitService.enableUnit(property.id, unit.id)
      } else {
        response = await landlordUnitService.disableUnit(property.id, unit.id, "Disabled by landlord")
      }
      
      // Immediately update the unit state in the UI
      const updatedUnit = response.data;
      setPropertyDetails(prev => ({
        ...prev,
        units: (prev.units || []).map(u => 
          u.id === unit.id 
            ? { 
                ...u, 
                is_active: updatedUnit.is_active,
                isActive: updatedUnit.is_active,
                disabled_reason: updatedUnit.disabled_reason,
                disabled_at: updatedUnit.disabled_at
              }
            : u
        )
      }));
      
      toast({
        title: "Success!",
        description: `Unit ${unit.unit_number} ${enable ? 'enabled' : 'disabled'} successfully.`,
      })
      
      onPropertyUpdate()
      setTimeout(() => loadAllData(), 500)
    } catch (error: any) {
      console.error(`${enable ? 'Enable' : 'Disable'} unit error:`, error)
      console.error('Error details:', {
        message: error?.message,
        errors: error?.errors,
        status: error?.status,
        fullError: error
      })
      
      let errorMessage = `Failed to ${enable ? 'enable' : 'disable'} unit.`
      
      // Check for specific validation errors
      if (error?.errors) {
        const errorKeys = Object.keys(error.errors)
        if (errorKeys.length > 0) {
          const firstError = error.errors[errorKeys[0]]
          errorMessage = Array.isArray(firstError) ? firstError[0] : firstError
        }
      } else if (error?.message?.includes("already enabled")) {
        errorMessage = "This unit is already enabled."
      } else if (error?.message?.includes("already disabled")) {
        errorMessage = "This unit is already disabled."
      } else if (error?.message?.includes("disabled property")) {
        errorMessage = "Cannot modify units in a disabled property."
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
  
  // Normalize is_active check - handle both camelCase and snake_case
  const activeValue = (propertyDetails as any).isActive ?? propertyDetails.is_active;
  const isPropertyActive = activeValue !== false;
  console.log('🔍 Property status check:', {
    is_active: propertyDetails.is_active,
    isActive: (propertyDetails as any).isActive,
    normalized: activeValue,
    computed: isPropertyActive
  });

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl">{propertyDetails.name}</DialogTitle>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Property Status:</span>
                {isPropertyActive ? (
                  <button
                    onClick={() => handleToggleProperty(false)}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50 border border-green-300"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ToggleRight className="w-5 h-5" />}
                    <span className="text-sm font-medium">Active</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleToggleProperty(true)}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50 border border-red-300"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ToggleLeft className="w-5 h-5" />}
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
                      <Badge className={isPropertyActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                        {isPropertyActive ? "Active" : "Disabled"}
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
                  onClick={() => {
                    if (!isPropertyActive) {
                      toast({
                        title: "Property Disabled",
                        description: "Enable the property first to add units.",
                        variant: "destructive",
                      })
                      return
                    }
                    setIsCreateUnitOpen(true)
                  }}
                  disabled={!isPropertyActive}
                  className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={!isPropertyActive ? "Enable property to add units" : "Add a new unit"}
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
                  {units.map((unit) => {
                    // Normalize unit active status at the top level
                    const unitActiveValue = (unit as any).isActive ?? unit.is_active;
                    const isUnitActive = unitActiveValue !== false;
                    
                    return (
                    <Card key={unit.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Unit {unit.unit_number}</CardTitle>
                          <div className="flex gap-1">
                            {/* If unit is disabled, show Unavailable instead of Available/Occupied */}
                            {!isUnitActive ? (
                              <Badge className="bg-red-100 text-red-700">
                                Unavailable
                              </Badge>
                            ) : (
                              <Badge className={unit.is_occupied ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}>
                                {unit.is_occupied ? "Occupied" : "Available"}
                              </Badge>
                            )}
                            <Badge className={isUnitActive ? "bg-gray-100 text-gray-700" : "bg-red-100 text-red-700"}>
                              {isUnitActive ? "Active" : "Disabled"}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          {/* Unit Details */}
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-gray-500">Type</p>
                              <p className="font-medium capitalize">{unit.unit_type?.replace(/_/g, ' ') || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Floor</p>
                              <p className="font-medium">{unit.floor_number || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Bedrooms</p>
                              <p className="font-medium">{unit.bedrooms || 0}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Bathrooms</p>
                              <p className="font-medium">{unit.bathrooms || 0}</p>
                            </div>
                          </div>
                          
                          {/* Rent */}
                          <div className="pt-2 border-t">
                            <p className="text-gray-500 text-sm">Monthly Rent</p>
                            <p className="text-lg font-bold text-green-600">
                              ₵{(unit.rental_amount || 0).toLocaleString()}
                            </p>
                          </div>
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

                        <div className="pt-3 border-t space-y-2">
                          {/* Caretaker Assignment */}
                          <div className="flex gap-2">
                            {unit.caretaker ? (
                              <div className="flex-1 flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200">
                                <div className="flex items-center text-sm text-blue-700">
                                  <User className="w-4 h-4 mr-2" />
                                  <div>
                                    <span className="font-medium">{unit.caretaker.name}</span>
                                    <div className="text-xs text-blue-600">{unit.caretaker.email}</div>
                                  </div>
                                </div>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Caretaker</span>
                              </div>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => {
                                  if (!isPropertyActive) {
                                    toast({
                                      title: "Property Disabled",
                                      description: "Enable the property first to assign caretakers.",
                                      variant: "destructive",
                                    })
                                    return
                                  }
                                  if (!isUnitActive) {
                                    toast({
                                      title: "Unit Disabled",
                                      description: "Enable this unit first to assign caretakers.",
                                      variant: "destructive",
                                    })
                                    return
                                  }
                                  setSelectedUnit(unit)
                                  setIsAssignCaretakerOpen(true)
                                }}
                                disabled={loading || availableCaretakers.length === 0 || !isPropertyActive || !isUnitActive}
                                title={!isPropertyActive ? "Enable property to assign caretakers" : !isUnitActive ? "Enable unit to assign caretakers" : availableCaretakers.length === 0 ? "No available caretakers" : "Assign a caretaker to this unit"}
                              >
                                <UserPlus className="w-3 h-3 mr-1" />
                                Assign Caretaker
                              </Button>
                            )}
                          </div>

                          {/* Tenant Assignment */}
                          <div className="flex gap-2">
                            {unit.tenant ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => {
                                  if (!isUnitActive) {
                                    toast({
                                      title: "Unit Disabled",
                                      description: "Cannot remove tenant from a disabled unit. Enable the unit first.",
                                      variant: "destructive",
                                    })
                                    return
                                  }
                                  handleRemoveTenant(unit)
                                }}
                                disabled={loading || !isUnitActive}
                                title={!isUnitActive ? "Enable unit to remove tenant" : "Remove tenant from this unit"}
                              >
                                <UserMinus className="w-3 h-3 mr-1" />
                                Remove Tenant
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => {
                                  if (!isPropertyActive) {
                                    toast({
                                      title: "Property Disabled",
                                      description: "Enable the property first to assign tenants.",
                                      variant: "destructive",
                                    })
                                    return
                                  }
                                  if (!isUnitActive) {
                                    toast({
                                      title: "Unit Disabled",
                                      description: "Enable this unit first to assign tenants.",
                                      variant: "destructive",
                                    })
                                    return
                                  }
                                  setSelectedUnit(unit)
                                  setIsAssignTenantOpen(true)
                                }}
                                disabled={loading || availableTenants.length === 0 || !isPropertyActive || !isUnitActive}
                                title={!isPropertyActive ? "Enable property to assign tenants" : !isUnitActive ? "Enable unit to assign tenants" : availableTenants.length === 0 ? "No available tenants" : "Assign a tenant to this unit"}
                              >
                                <UserPlus className="w-3 h-3 mr-1" />
                                Assign Tenant
                              </Button>
                            )}

                            {/* Use the normalized isUnitActive from parent scope */}
                            {isUnitActive ? (
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
                        </div>
                      </CardContent>
                    </Card>
                  )})}
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
                  min="50"
                  max="50000"
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
                  max="100"
                />
              </div>
              <div>
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  value={unitFormData.bedrooms || ""}
                  onChange={(e) => setUnitFormData({ ...unitFormData, bedrooms: parseInt(e.target.value) || undefined })}
                  placeholder="2"
                  min="0"
                  max="20"
                />
              </div>
              <div>
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  value={unitFormData.bathrooms || ""}
                  onChange={(e) => setUnitFormData({ ...unitFormData, bathrooms: parseInt(e.target.value) || undefined })}
                  placeholder="1"
                  min="0"
                  max="20"
                  step="0.5"
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

      {/* Assign Caretaker Modal */}
      <Dialog open={isAssignCaretakerOpen} onOpenChange={setIsAssignCaretakerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Caretaker to Unit {selectedUnit?.unit_number}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="caretaker-select">Select Caretaker *</Label>
              <Select
                value={selectedCaretakerId}
                onValueChange={setSelectedCaretakerId}
              >
                <SelectTrigger id="caretaker-select">
                  <SelectValue placeholder="Choose an available caretaker" />
                </SelectTrigger>
                <SelectContent>
                  {availableCaretakers.map((caretaker) => (
                    <SelectItem key={caretaker.id} value={caretaker.id}>
                      {caretaker.name} - {caretaker.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableCaretakers.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  No available caretakers. Create caretakers first or check if all caretakers are already assigned.
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsAssignCaretakerOpen(false)
                  setSelectedUnit(null)
                  setSelectedCaretakerId("")
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700"
                onClick={handleAssignCaretaker}
                disabled={loading || !selectedCaretakerId}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  "Assign Caretaker"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
