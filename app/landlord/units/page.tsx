"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useLandlordUnits, useCreateUnit } from "@/lib/hooks/use-landlord-units"
import { landlordUnitService } from "@/lib/services"
import { useLandlordProperties } from "@/lib/hooks/use-landlord-properties"
import { useLandlordUsers } from "@/lib/hooks/use-landlord-users"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Home,
  Plus,
  Search,
  Loader2,
  Building2,
  User,
  DollarSign,
  CheckCircle,
  XCircle,
  Users,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"
import type { CreateUnitRequest, UnitType } from "@/lib/api-types"

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

export default function UnitsPage() {
  const { user: currentUser, isLoading: authLoading } = useAuth()
  const { toast } = useToast()

  // Hooks for API operations
  const { data: unitsData, loading: unitsLoading, refetch: refetchUnits } = useLandlordUnits()
  const { data: propertiesData } = useLandlordProperties()
  const { data: usersData } = useLandlordUsers()
  const { createUnit, loading: createUnitLoading } = useCreateUnit()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState<string>("all")
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false)
  const [isAssignTenantOpen, setIsAssignTenantOpen] = useState(false)
  const [isAssignCaretakerOpen, setIsAssignCaretakerOpen] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<any>(null)
  const [selectedTenantId, setSelectedTenantId] = useState<string>("")
  const [selectedCaretakerId, setSelectedCaretakerId] = useState<string>("")
  const [isAssigning, setIsAssigning] = useState(false)
  const [formData, setFormData] = useState<CreateUnitRequest>({
    property_id: "",
    unit_number: "",
    unit_type: "studio",
    rental_amount: 0,
    description: "",
    floor_number: undefined,
    caretaker_id: undefined,
  })

  const units = unitsData?.data || []
  const properties = propertiesData?.data || []
  const tenants = usersData?.data?.filter((user) => user.role === "tenant") || []
  const caretakers = usersData?.data?.filter((user) => user.role === "caretaker") || []

  // Helper function to get property ID from unit (handles multiple formats)
  const getPropertyId = (unit: any): string | null => {
    return unit.property_id || 
           unit.propertyId ||
           unit.property?.id || 
           unit.property?.PropertyID ||
           unit.property?.property_id ||
           null
  }

  // Helper function to get property name from unit or properties list
  const getPropertyName = (unit: any): string => {
    // First try to get from unit's property object
    if (unit.property?.Name) return unit.property.Name
    if (unit.property?.name) return unit.property.name
    
    // Then try to find in properties list
    const propertyId = getPropertyId(unit)
    if (propertyId) {
      const property = properties.find((p: any) => p.id === propertyId || p.ID === propertyId)
      if (property) {
        return property.name || property.Name || "Unknown Property"
      }
    }
    
    return "Unknown Property"
  }

  // Filtered units based on search and property filter
  const filteredUnits = units.filter((unit) => {
    const matchesSearch =
      unit.unit_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (unit.description && unit.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const propertyId = getPropertyId(unit)
    const matchesProperty =
      selectedPropertyFilter === "all" || propertyId === selectedPropertyFilter

    return matchesSearch && matchesProperty
  })

  // Group units by property
  const unitsByProperty = filteredUnits.reduce((acc, unit) => {
    const propertyId = getPropertyId(unit)
    if (propertyId) {
      if (!acc[propertyId]) {
        acc[propertyId] = []
      }
      acc[propertyId].push(unit)
    }
    return acc
  }, {} as Record<string, typeof units>)

  const handleCreateUnit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.property_id || !formData.unit_number || !formData.rental_amount) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      // Remove optional fields if empty
      const dataToSubmit = { ...formData }
      if (!dataToSubmit.caretaker_id) {
        delete dataToSubmit.caretaker_id
      }
      if (!dataToSubmit.floor_number) {
        delete dataToSubmit.floor_number
      }

      const result = await createUnit(dataToSubmit)

      if (result) {
        // Close dialog immediately
        setIsAddUnitOpen(false)

        // Reset form
        setFormData({
          property_id: "",
          unit_number: "",
          unit_type: "studio",
          rental_amount: 0,
          description: "",
          floor_number: undefined,
          caretaker_id: undefined,
        })

        // Show success toast
        const property = properties.find((p) => p.id === result.property_id)
        toast({
          title: "Success!",
          description: `Unit ${result.unit_number} created in ${property?.name || "property"}.`,
        })

        // Refetch units list
        refetchUnits()
      } else {
        toast({
          title: "Error",
          description: "Failed to create unit. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Create unit error:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to create unit.",
        variant: "destructive",
      })
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
      setIsAssigning(true)
      
      // Get property_id from unit - try multiple possible locations (handle both camelCase and snake_case)
      let propertyId = selectedUnit.property_id || 
                      selectedUnit.propertyId ||
                      selectedUnit.property?.id || 
                      selectedUnit.property?.PropertyID ||
                      selectedUnit.property?.property_id
      
      // If still not found, try to get it from the properties list by matching unit
      if (!propertyId && selectedUnit.id) {
        // Find the unit in the full units list to get property_id
        const fullUnit = units.find((u: any) => u.id === selectedUnit.id)
        if (fullUnit) {
          propertyId = fullUnit.property_id || 
                      fullUnit.propertyId ||
                      fullUnit.property?.id || 
                      fullUnit.property?.PropertyID ||
                      fullUnit.property?.property_id
        }
      }
      
      // If still not found, fetch unit details
      if (!propertyId && selectedUnit.id) {
        try {
          const unitDetails = await landlordUnitService.getUnitDetails(selectedUnit.id)
          if (unitDetails.data) {
            propertyId = unitDetails.data.property_id || 
                        unitDetails.data.propertyId ||
                        unitDetails.data.property?.id || 
                        unitDetails.data.property?.PropertyID ||
                        unitDetails.data.property?.property_id
          }
        } catch (fetchError) {
          console.error("Failed to fetch unit details:", fetchError)
        }
      }
      
      if (!propertyId) {
        console.error("Unit structure:", selectedUnit)
        toast({
          title: "Error",
          description: "Property ID not found for this unit. Please try refreshing the page.",
          variant: "destructive",
        })
        return
      }
      
      
      const response = await landlordUnitService.assignUnit(
        propertyId,
        selectedUnit.id,
        { tenant_id: selectedTenantId }
      )


      if (response.data) {
        
        // Close dialog
        setIsAssignTenantOpen(false)
        setSelectedUnit(null)
        setSelectedTenantId("")

        // Show success toast
        const tenant = tenants.find((t) => t.id === selectedTenantId)
        toast({
          title: "Success!",
          description: `${tenant?.name} assigned to Unit ${selectedUnit.unit_number}.`,
        })

        // Refetch units to show updated data
        await refetchUnits()
        
        // Force a small delay to ensure state updates
        setTimeout(async () => {
          await refetchUnits()
        }, 500)
      } else {
        console.warn("⚠️ Response data is missing:", response)
      }
    } catch (error: any) {
      console.error("Assign tenant error:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to assign tenant to unit.",
        variant: "destructive",
      })
    } finally {
      setIsAssigning(false)
    }
  }

  const handleAssignCaretaker = async () => {
    if (!selectedUnit || !selectedCaretakerId) {
      toast({
        title: "Validation Error",
        description: "Please select a caretaker.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsAssigning(true)
      
      // Get property_id from unit - try multiple possible locations (handle both camelCase and snake_case)
      let propertyId = selectedUnit.property_id || 
                      selectedUnit.propertyId ||
                      selectedUnit.property?.id || 
                      selectedUnit.property?.PropertyID ||
                      selectedUnit.property?.property_id
      
      // If still not found, try to get it from the properties list by matching unit
      if (!propertyId && selectedUnit.id) {
        // Find the unit in the full units list to get property_id
        const fullUnit = units.find((u: any) => u.id === selectedUnit.id)
        if (fullUnit) {
          propertyId = fullUnit.property_id || 
                      fullUnit.propertyId ||
                      fullUnit.property?.id || 
                      fullUnit.property?.PropertyID ||
                      fullUnit.property?.property_id
        }
      }
      
      // If still not found, fetch unit details
      if (!propertyId && selectedUnit.id) {
        try {
          const unitDetails = await landlordUnitService.getUnitDetails(selectedUnit.id)
          if (unitDetails.data) {
            propertyId = unitDetails.data.property_id || 
                        unitDetails.data.propertyId ||
                        unitDetails.data.property?.id || 
                        unitDetails.data.property?.PropertyID ||
                        unitDetails.data.property?.property_id
          }
        } catch (fetchError) {
          console.error("Failed to fetch unit details:", fetchError)
        }
      }
      
      if (!propertyId) {
        console.error("❌ Property ID not found! Unit structure:", {
          selectedUnit,
          unitKeys: Object.keys(selectedUnit),
          property: selectedUnit.property,
          propertyKeys: selectedUnit.property ? Object.keys(selectedUnit.property) : null,
          unitsArray: units.map((u: any) => ({ id: u.id, property_id: u.property_id, property: u.property }))
        })
        toast({
          title: "Error",
          description: "Property ID not found for this unit. Please try refreshing the page.",
          variant: "destructive",
        })
        return
      }
      
      
      const response = await landlordUnitService.assignCaretaker(
        propertyId,
        selectedUnit.id,
        selectedCaretakerId
      )

      if (response.data) {
        // Close dialog
        setIsAssignCaretakerOpen(false)
        setSelectedUnit(null)
        setSelectedCaretakerId("")

        // Show success toast
        const caretaker = caretakers.find((c) => c.id === selectedCaretakerId)
        const caretakerName = caretaker?.name || "Caretaker"
        toast({
          title: "Success!",
          description: `${caretakerName} assigned to Unit ${selectedUnit.unit_number}.`,
        })

        // Refetch units to show updated data
        await refetchUnits()
        
        // Force a small delay to ensure state updates
        setTimeout(() => {
          refetchUnits()
        }, 500)
      }
    } catch (error: any) {
      console.error("Assign caretaker error:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to assign caretaker to unit.",
        variant: "destructive",
      })
    } finally {
      setIsAssigning(false)
    }
  }

  const handleUnassignCaretaker = async (unit: any) => {
    try {
      setIsAssigning(true)
      
      // Get property_id from unit - try multiple possible locations (handle both camelCase and snake_case)
      let propertyId = unit.property_id || 
                      unit.propertyId ||
                      unit.property?.id || 
                      unit.property?.PropertyID ||
                      unit.property?.property_id
      
      // If still not found, try to get it from the properties list by matching unit
      if (!propertyId && unit.id) {
        // Find the unit in the full units list to get property_id
        const fullUnit = units.find((u: any) => u.id === unit.id)
        if (fullUnit) {
          propertyId = fullUnit.property_id || 
                      fullUnit.propertyId ||
                      fullUnit.property?.id || 
                      fullUnit.property?.PropertyID ||
                      fullUnit.property?.property_id
        }
      }
      
      // If still not found, fetch unit details
      if (!propertyId && unit.id) {
        try {
          const unitDetails = await landlordUnitService.getUnitDetails(unit.id)
          if (unitDetails.data) {
            propertyId = unitDetails.data.property_id || 
                        unitDetails.data.propertyId ||
                        unitDetails.data.property?.id || 
                        unitDetails.data.property?.PropertyID ||
                        unitDetails.data.property?.property_id
          }
        } catch (fetchError) {
          console.error("Failed to fetch unit details:", fetchError)
        }
      }
      
      if (!propertyId) {
        console.error("❌ Property ID not found! Unit structure:", {
          unit,
          unitKeys: Object.keys(unit),
          property: unit.property,
          propertyKeys: unit.property ? Object.keys(unit.property) : null,
          unitsArray: units.map((u: any) => ({ id: u.id, property_id: u.property_id, property: u.property }))
        })
        toast({
          title: "Error",
          description: "Property ID not found for this unit. Please try refreshing the page.",
          variant: "destructive",
        })
        return
      }
      
      
      const response = await landlordUnitService.removeCaretaker(
        propertyId,
        unit.id
      )

      if (response.data) {
        // Check if backend actually removed the caretaker from the response
        const responseHasCaretaker = response.data?.caretaker_id || 
                                    response.data?.caretakerId || 
                                    response.data?.caretaker ||
                                    response.data?.HasCaretaker;
        
        // Try to find caretaker in multiple ways (from original unit, not response)
        const caretakerId = unit.caretaker_id || unit.caretakerId || unit.caretaker?.id
        const caretaker = caretakerId ? caretakers.find((c) => c.id === caretakerId) : null
        const directCaretaker = unit.caretaker || null
        
        const caretakerName = caretaker?.name || 
                             directCaretaker?.name || 
                             directCaretaker?.Name || 
                             "Caretaker"
        
        // Check if backend actually removed the caretaker
        if (responseHasCaretaker) {
          console.warn("⚠️ Backend returned success but caretaker is still assigned:", {
            responseData: response.data,
            hasCaretaker: responseHasCaretaker,
            caretakerId: response.data?.caretaker_id || response.data?.caretaker?.id || response.data?.caretaker?.CaretakerID
          });
          toast({
            title: "Warning",
            description: "Caretaker removal may not have completed. The backend still shows a caretaker assigned. Please check the backend implementation or refresh the page.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success!",
            description: `${caretakerName} removed from Unit ${unit.unit_number}.`,
          })
        }

        // Refetch units to show updated data - wait a bit for backend to process
        await new Promise(resolve => setTimeout(resolve, 300))
        await refetchUnits()
        
        // Force a second refetch after a longer delay to ensure state updates
        setTimeout(async () => {
          await refetchUnits()
        }, 800)
      } else {
        console.warn("⚠️ Response data is missing:", response)
        toast({
          title: "Warning",
          description: "Caretaker removal may not have completed. Please refresh the page.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Unassign caretaker error:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to remove caretaker from unit.",
        variant: "destructive",
      })
    } finally {
      setIsAssigning(false)
    }
  }

  const handleUnassignTenant = async (unit: any) => {
    console.log("🔴 handleUnassignTenant called with unit:", unit)
    
    try {
      setIsAssigning(true)
      
      // Get property_id from unit - try multiple possible locations (handle both camelCase and snake_case)
      let propertyId = unit.property_id || 
                      unit.propertyId ||
                      unit.property?.id || 
                      unit.property?.PropertyID ||
                      unit.property?.property_id
      
      console.log("🔍 First attempt - propertyId:", propertyId, {
        property_id: unit.property_id,
        propertyId: unit.propertyId,
        'property?.id': unit.property?.id,
        'property?.PropertyID': unit.property?.PropertyID,
        'property?.property_id': unit.property?.property_id,
        property: unit.property
      })
      
      // If still not found, try to get it from the properties list by matching unit
      if (!propertyId && unit.id) {
        // Find the unit in the full units list to get property_id
        const fullUnit = units.find((u: any) => u.id === unit.id)
        console.log("🔍 Looking up full unit from units array:", { 
          unitId: unit.id, 
          unitsCount: units.length,
          fullUnit,
          fullUnitProperty: fullUnit?.property
        })
        if (fullUnit) {
          propertyId = fullUnit.property_id || 
                      fullUnit.propertyId ||
                      fullUnit.property?.id || 
                      fullUnit.property?.PropertyID ||
                      fullUnit.property?.property_id
        }
      }
      
      // If still not found, fetch unit details
      if (!propertyId && unit.id) {
        try {
          const unitDetails = await landlordUnitService.getUnitDetails(unit.id)
          if (unitDetails.data) {
            propertyId = unitDetails.data.property_id || 
                        unitDetails.data.propertyId ||
                        unitDetails.data.property?.id || 
                        unitDetails.data.property?.PropertyID ||
                        unitDetails.data.property?.property_id
          }
        } catch (fetchError) {
          console.error("❌ Failed to fetch unit details:", fetchError)
        }
      }
      
      if (!propertyId) {
        console.error("❌ Property ID not found! Unit structure:", {
          unit,
          unitKeys: Object.keys(unit),
          property: unit.property,
          propertyKeys: unit.property ? Object.keys(unit.property) : null,
          unitsArray: units.map((u: any) => ({ id: u.id, property_id: u.property_id, property: u.property }))
        })
        toast({
          title: "Error",
          description: "Property ID not found for this unit. Please try refreshing the page.",
          variant: "destructive",
        })
        return
      }
      
      
      const response = await landlordUnitService.assignUnit(
        propertyId,
        unit.id,
        { tenant_id: null }
      )

      if (response.data) {
        // Try to find tenant in multiple ways
        const tenantId = unit.tenant_id || unit.tenantId || unit.tenant?.id
        const tenant = tenantId ? tenants.find((t) => t.id === tenantId) : null
        const directTenant = unit.tenant || null
        
        const tenantName = tenant?.name || 
                          directTenant?.name || 
                          directTenant?.Name || 
                          "Tenant"
        
        toast({
          title: "Success!",
          description: `${tenantName} removed from Unit ${unit.unit_number}.`,
        })

        // Refetch units to show updated data
        await refetchUnits()
        
        // Force a small delay to ensure state updates
        setTimeout(() => {
          refetchUnits()
        }, 500)
      }
    } catch (error: any) {
      console.error("Unassign tenant error:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to remove tenant from unit.",
        variant: "destructive",
      })
    } finally {
      setIsAssigning(false)
    }
  }

  const loading = authLoading || unitsLoading

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Check for tenant assignment in multiple possible fields
  const occupiedUnits = units.filter((u) => {
    return u.tenant_id || u.tenantId || u.tenant || u.is_occupied || u.IsOccupied
  }).length
  const vacantUnits = units.length - occupiedUnits
  const occupancyRate = units.length > 0 ? Math.round((occupiedUnits / units.length) * 100) : 0
  const totalRevenue = units.reduce((sum, u) => {
    const amount = typeof u.rental_amount === 'string' ? parseFloat(u.rental_amount) : (u.rental_amount || 0)
    return sum + amount
  }, 0)

  return (
    <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              Units Management
            </h1>
            <p className="text-gray-600 mt-1">Manage units across all your properties</p>
          </div>
          <Dialog open={isAddUnitOpen} onOpenChange={setIsAddUnitOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Unit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Unit</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateUnit} className="space-y-6">
                {/* Property Selection */}
                <div>
                  <Label htmlFor="property_id">Property *</Label>
                  <Select
                    value={formData.property_id}
                    onValueChange={(value) => setFormData({ ...formData, property_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a property" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.name} - {property.street_address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {properties.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">
                      No properties available. Create a property first.
                    </p>
                  )}
                </div>

                {/* Unit Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Unit Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="unit_number">Unit Number *</Label>
                      <Input
                        id="unit_number"
                        value={formData.unit_number}
                        onChange={(e) => setFormData({ ...formData, unit_number: e.target.value })}
                        placeholder="e.g., A1, 101, Ground Floor"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="unit_type">Unit Type *</Label>
                      <Select
                        value={formData.unit_type}
                        onValueChange={(value: UnitType) => setFormData({ ...formData, unit_type: value })}
                        required
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
                      <Label htmlFor="rental_amount">Monthly Rent (GH¢) *</Label>
                      <Input
                        id="rental_amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.rental_amount}
                        onChange={(e) =>
                          setFormData({ ...formData, rental_amount: parseFloat(e.target.value) || 0 })
                        }
                        placeholder="e.g., 1500"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="floor_number">Floor Number</Label>
                      <Input
                        id="floor_number"
                        type="number"
                        min="0"
                        value={formData.floor_number || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            floor_number: e.target.value ? parseInt(e.target.value) : undefined,
                          })
                        }
                        placeholder="e.g., 1, 2, 3"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Additional details about the unit..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Optional Caretaker Assignment */}
                <div>
                  <Label htmlFor="caretaker_id">Assign Caretaker (Optional)</Label>
                  <Select
                    value={formData.caretaker_id || "none"}
                    onValueChange={(value) =>
                      setFormData({ ...formData, caretaker_id: value === "none" ? undefined : value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a caretaker" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No caretaker</SelectItem>
                      {caretakers.map((caretaker) => (
                        <SelectItem key={caretaker.id} value={caretaker.id}>
                          {caretaker.name} - {caretaker.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700"
                  disabled={createUnitLoading || properties.length === 0}
                >
                  {createUnitLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Unit"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Assign Tenant Dialog */}
          <Dialog open={isAssignTenantOpen} onOpenChange={setIsAssignTenantOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Tenant to Unit</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {selectedUnit && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unit</p>
                    <p className="text-lg font-bold">{selectedUnit.unit_number}</p>
                    <p className="text-sm text-gray-600">
                      {UNIT_TYPES.find((t) => t.value === selectedUnit.unit_type)?.label} - GH¢
                      {selectedUnit.rental_amount.toLocaleString()} /month
                    </p>
                  </div>
                )}
                <div>
                  <Label htmlFor="tenant">Select Tenant *</Label>
                  <Select value={selectedTenantId} onValueChange={setSelectedTenantId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a tenant" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants
                        .filter((tenant) => !tenant.tenant_id) // Filter out already assigned tenants
                        .map((tenant) => (
                          <SelectItem key={tenant.id} value={tenant.id}>
                            {tenant.name} - {tenant.email}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {tenants.filter((t) => !t.tenant_id).length === 0 && (
                    <p className="text-xs text-red-500 mt-1">
                      No available tenants. All tenants are already assigned.
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAssignTenant}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700"
                    disabled={isAssigning || !selectedTenantId}
                  >
                    {isAssigning ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      "Assign Tenant"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAssignTenantOpen(false)
                      setSelectedUnit(null)
                      setSelectedTenantId("")
                    }}
                    disabled={isAssigning}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Assign Caretaker Dialog */}
          <Dialog open={isAssignCaretakerOpen} onOpenChange={setIsAssignCaretakerOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Caretaker to Unit</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {selectedUnit && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unit</p>
                    <p className="text-lg font-bold">{selectedUnit.unit_number}</p>
                    <p className="text-sm text-gray-600">
                      {UNIT_TYPES.find((t) => t.value === selectedUnit.unit_type)?.label} - GH¢
                      {selectedUnit.rental_amount.toLocaleString()} /month
                    </p>
                  </div>
                )}
                <div>
                  <Label htmlFor="caretaker">Select Caretaker *</Label>
                  <Select value={selectedCaretakerId} onValueChange={setSelectedCaretakerId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a caretaker" />
                    </SelectTrigger>
                    <SelectContent>
                      {caretakers.map((caretaker) => (
                        <SelectItem key={caretaker.id} value={caretaker.id}>
                          {caretaker.name} - {caretaker.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {caretakers.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">
                      No caretakers available. Please create a caretaker first.
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAssignCaretaker}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    disabled={isAssigning || !selectedCaretakerId}
                  >
                    {isAssigning ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      "Assign Caretaker"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAssignCaretakerOpen(false)
                      setSelectedUnit(null)
                      setSelectedCaretakerId("")
                    }}
                    disabled={isAssigning}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Units</p>
                  <p className="text-2xl font-bold text-gray-900">{units.length}</p>
                </div>
                <Home className="w-8 h-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Occupied</p>
                  <p className="text-2xl font-bold text-green-600">{occupiedUnits}</p>
                  <p className="text-xs text-gray-500">{occupancyRate}% occupancy</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Vacant</p>
                  <p className="text-2xl font-bold text-orange-600">{vacantUnits}</p>
                  <p className="text-xs text-gray-500">Available units</p>
                </div>
                <XCircle className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Expected Revenue</p>
                  <p className="text-2xl font-bold text-cyan-600">{formatCurrency(totalRevenue)}</p>
                  <p className="text-xs text-gray-500">Monthly potential</p>
                </div>
                <DollarSign className="w-8 h-8 text-cyan-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search units by number or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedPropertyFilter} onValueChange={setSelectedPropertyFilter}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Units Display */}
        {filteredUnits.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || selectedPropertyFilter !== "all"
                  ? "No units found matching your filters."
                  : "No units yet. Click 'Add Unit' to create your first unit."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="grid" className="space-y-6">
            <TabsList>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="property">By Property</TabsTrigger>
            </TabsList>

            <TabsContent value="grid" className="space-y-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUnits.map((unit) => {
                  const propertyId = getPropertyId(unit)
                  const property = propertyId ? properties.find((p: any) => p.id === propertyId || p.ID === propertyId) : null
                  const propertyName = getPropertyName(unit)
                  
                  // Check for tenant in multiple possible fields
                  const tenantId = unit.tenant_id || unit.tenantId || unit.tenant?.id
                  const tenant = tenantId ? tenants.find((t) => t.id === tenantId) : null
                  
                  // Also check if tenant object exists directly on unit
                  const directTenant = unit.tenant || null
                  
                  // Check for caretaker in multiple possible fields
                  const caretakerId = unit.caretaker_id || unit.caretakerId || unit.caretaker?.id
                  const caretaker = caretakerId ? caretakers.find((c) => c.id === caretakerId) : null
                  
                  // Also check if caretaker object exists directly on unit
                  const directCaretaker = unit.caretaker || null

                  return (
                    <Card key={unit.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Unit {unit.unit_number}</CardTitle>
                          <Badge
                            className={
                              (unit.tenant_id || unit.tenantId || unit.tenant)
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                            }
                          >
                            {(unit.tenant_id || unit.tenantId || unit.tenant) ? "Occupied" : "Vacant"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <Building2 className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{propertyName}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Home className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>
                            {UNIT_TYPES.find((t) => t.value === unit.unit_type)?.label || unit.unit_type}
                          </span>
                        </div>
                        <div className="flex items-center text-sm font-medium text-gray-900">
                          <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>GH¢{unit.rental_amount.toLocaleString()} /month</span>
                        </div>
                        {(tenant || directTenant) && (
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="w-4 h-4 mr-2 flex-shrink-0" />
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {tenant?.name || directTenant?.name || directTenant?.Name || "Tenant"}
                              </span>
                              <span className="text-xs text-gray-500">Tenant</span>
                            </div>
                          </div>
                        )}
                        {!tenant && !directTenant && (
                          <div className="flex items-center text-sm text-gray-400">
                            <User className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span>No tenant assigned</span>
                          </div>
                        )}
                        {(caretaker || directCaretaker) ? (
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="w-4 h-4 mr-2 flex-shrink-0" />
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {caretaker?.name || directCaretaker?.name || directCaretaker?.Name || "Caretaker"}
                              </span>
                              <span className="text-xs text-gray-500">Caretaker</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center text-sm text-gray-400">
                            <User className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span>No caretaker assigned</span>
                          </div>
                        )}
                        {unit.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">{unit.description}</p>
                        )}
                        
                        {/* Action Buttons */}
                        <div className="pt-3 border-t space-y-2">
                          {!(unit.tenant_id || unit.tenantId || unit.tenant) ? (
                            <Button
                              size="sm"
                              className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700"
                              onClick={() => {
                                // Ensure we have the full unit object with property_id
                                const fullUnit = units.find((u: any) => u.id === unit.id) || unit
                                setSelectedUnit(fullUnit)
                                setIsAssignTenantOpen(true)
                              }}
                              disabled={tenants.length === 0}
                            >
                              <Users className="w-4 h-4 mr-2" />
                              Assign Tenant
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() => {
                                // Ensure we have the full unit object with property_id
                                const fullUnit = units.find((u: any) => u.id === unit.id) || unit
                                handleUnassignTenant(fullUnit)
                              }}
                              disabled={isAssigning}
                            >
                              {isAssigning ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Users className="w-4 h-4 mr-2" />
                              )}
                              Remove Tenant
                            </Button>
                          )}
                          {!(unit.caretaker_id || unit.caretakerId || unit.caretaker) ? (
                            <Button
                              size="sm"
                              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                              onClick={() => {
                                // Ensure we have the full unit object with property_id
                                const fullUnit = units.find((u: any) => u.id === unit.id) || unit
                                setSelectedUnit(fullUnit)
                                setIsAssignCaretakerOpen(true)
                              }}
                              disabled={caretakers.length === 0}
                            >
                              <User className="w-4 h-4 mr-2" />
                              Assign Caretaker
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() => {
                                // Ensure we have the full unit object with property_id
                                const fullUnit = units.find((u: any) => u.id === unit.id) || unit
                                handleUnassignCaretaker(fullUnit)
                              }}
                              disabled={isAssigning}
                            >
                              {isAssigning ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <User className="w-4 h-4 mr-2" />
                              )}
                              Remove Caretaker
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="property" className="space-y-6">
              {Object.entries(unitsByProperty).map(([propertyId, propertyUnits]) => {
                const property = properties.find((p) => p.id === propertyId)
                const occupiedCount = propertyUnits.filter((u) => {
                  return u.tenant_id || u.tenantId || u.tenant || u.is_occupied || u.IsOccupied
                }).length

                return (
                  <Card key={propertyId}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl">{property?.name || "Unknown Property"}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">{property?.street_address}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-600">
                            {occupiedCount} / {propertyUnits.length} Occupied
                          </p>
                          <p className="text-xs text-gray-500">
                            {Math.round((occupiedCount / propertyUnits.length) * 100)}% occupancy
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {propertyUnits.map((unit) => {
                          // Check for tenant in multiple possible fields
                          const tenantId = unit.tenant_id || unit.tenantId || unit.tenant?.id
                          const tenant = tenantId ? tenants.find((t) => t.id === tenantId) : null
                          const directTenant = unit.tenant || null
                          
                          // Check for caretaker in multiple possible fields
                          const caretakerId = unit.caretaker_id || unit.caretakerId || unit.caretaker?.id
                          const caretaker = caretakerId ? caretakers.find((c) => c.id === caretakerId) : null
                          const directCaretaker = unit.caretaker || null

                          return (
                            <div
                              key={unit.id}
                              className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-medium">Unit {unit.unit_number}</p>
                                <Badge
                                  variant={(unit.tenant_id || unit.tenantId || unit.tenant) ? "default" : "secondary"}
                                  className={
                                    (unit.tenant_id || unit.tenantId || unit.tenant)
                                      ? "bg-green-100 text-green-700"
                                      : "bg-orange-100 text-orange-700"
                                  }
                                >
                                  {(unit.tenant_id || unit.tenantId || unit.tenant) ? "Occupied" : "Vacant"}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">
                                {UNIT_TYPES.find((t) => t.value === unit.unit_type)?.label}
                              </p>
                              <p className="text-sm font-medium text-gray-900 mb-2">
                                GH¢{unit.rental_amount.toLocaleString()} /month
                              </p>
                              {(tenant || directTenant) ? (
                                <p className="text-sm text-gray-600">
                                  <User className="w-3 h-3 inline mr-1" />
                                  {tenant?.name || directTenant?.name || directTenant?.Name || "Tenant"}
                                </p>
                              ) : (
                                <p className="text-sm text-gray-400">
                                  <User className="w-3 h-3 inline mr-1" />
                                  Available
                                </p>
                              )}
                              {(caretaker || directCaretaker) && (
                                <p className="text-sm text-gray-600">
                                  <User className="w-3 h-3 inline mr-1" />
                                  Caretaker: {caretaker?.name || directCaretaker?.name || directCaretaker?.Name || "Caretaker"}
                                </p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </TabsContent>
          </Tabs>
        )}
      </div>
  )
}

