"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import {
  useLandlordProperties,
  useCreateProperty,
  useDeleteProperty,
} from "@/lib/hooks/use-landlord-properties"
import { useLandlordUsers } from "@/lib/hooks/use-landlord-users"
import { landlordPropertyService } from "@/lib/services"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Building2,
  Plus,
  MapPin,
  Loader2,
  Search,
  Home,
  User,
  UserPlus,
  UserMinus,
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  Eye,
} from "lucide-react"
import { PropertyDetailsModal } from "@/components/property-details-modal"
import { MainLayout } from "@/components/main-layout"
import { useToast } from "@/hooks/use-toast"
import type { CreatePropertyRequest } from "@/lib/api-types"

export default function PropertiesPage() {
  const { user: currentUser, isLoading: authLoading } = useAuth()
  const { toast } = useToast()

  // Hooks for API operations
  const { data: propertiesData, loading: propertiesLoading, refetch: refetchProperties } = useLandlordProperties()
  const { data: usersData } = useLandlordUsers()
  const { createProperty, loading: createPropertyLoading } = useCreateProperty()

  const [searchTerm, setSearchTerm] = useState("")
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false)
  const [isAssignCaretakerOpen, setIsAssignCaretakerOpen] = useState(false)
  const [isPropertyDetailsOpen, setIsPropertyDetailsOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [selectedCaretakerId, setSelectedCaretakerId] = useState<string>("")
  const [isAssigning, setIsAssigning] = useState(false)
  const [formData, setFormData] = useState<CreatePropertyRequest>({
    name: "",
    street_address: "",
    description: "",
    ghana_post_gps_address: "",
    caretaker_id: undefined,
  })

  const properties = propertiesData?.data || []
  const caretakers = usersData?.data?.filter((user) => user.role === "caretaker") || []

  // Filtered properties based on search
  const filteredProperties = properties.filter((property) => {
    if (!searchTerm) return true; // If no search term, show all
    
    return (
      property.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.street_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (property.ghana_post_gps_address && property.ghana_post_gps_address.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  })


  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.name || !formData.street_address) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      // Remove caretaker_id if it's empty
      const dataToSubmit = { ...formData }
      if (!dataToSubmit.caretaker_id) {
        delete dataToSubmit.caretaker_id
      }

      const result = await createProperty(dataToSubmit)

      if (result) {
        // Close dialog immediately
        setIsAddPropertyOpen(false)

        // Reset form
        setFormData({
          name: "",
          street_address: "",
          description: "",
          ghana_post_gps_address: "",
          caretaker_id: undefined,
        })

        // Show success toast
        toast({
          title: "Success!",
          description: `Property "${result.name}" created successfully.`,
        })

        // Refetch properties list
        refetchProperties()
      } else {
        toast({
          title: "Error",
          description: "Failed to create property. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Create property error:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to create property.",
        variant: "destructive",
      })
    }
  }

  const handleAssignCaretaker = async () => {
    if (!selectedProperty || !selectedCaretakerId) {
      toast({
        title: "Validation Error",
        description: "Please select a caretaker.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsAssigning(true)
      
      const response = await landlordPropertyService.assignCaretaker(
        selectedProperty.id,
        selectedCaretakerId
      )

      if (response.data) {
        // Close dialog
        setIsAssignCaretakerOpen(false)
        setSelectedProperty(null)
        setSelectedCaretakerId("")

        // Show success toast
        const caretaker = caretakers.find((c) => c.id === selectedCaretakerId)
        toast({
          title: "Success!",
          description: `${caretaker?.name} assigned to ${selectedProperty.name}.`,
        })

        // Refetch properties to show updated data
        refetchProperties()
      }
    } catch (error: any) {
      console.error("Assign caretaker error:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to assign caretaker to property.",
        variant: "destructive",
      })
    } finally {
      setIsAssigning(false)
    }
  }

  const handleRemoveCaretaker = async (property: any) => {
    try {
      setIsAssigning(true)
      
      const response = await landlordPropertyService.removeCaretaker(property.id)

      if (response.data) {
        const caretaker = caretakers.find((c) => c.id === property.caretaker_id)
        toast({
          title: "Success!",
          description: `${caretaker?.name} removed from ${property.name}.`,
        })

        // Refetch properties to show updated data
        refetchProperties()
      }
    } catch (error: any) {
      console.error("Remove caretaker error:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to remove caretaker from property.",
        variant: "destructive",
      })
    } finally {
      setIsAssigning(false)
    }
  }

  const loading = authLoading || propertiesLoading

  if (loading) {
    return (
      <MainLayout>
        <div className="p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              Properties
            </h1>
            <p className="text-gray-600 mt-1">Manage your properties and assign caretakers</p>
          </div>
          <Dialog open={isAddPropertyOpen} onOpenChange={setIsAddPropertyOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Property
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Property</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateProperty} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Property Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="name">Property Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Sunset Apartments"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="street_address">Street Address *</Label>
                      <Input
                        id="street_address"
                        value={formData.street_address}
                        onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
                        placeholder="e.g., 123 Independence Avenue, Accra"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="ghana_post_gps_address">Ghana Post GPS Address</Label>
                      <Input
                        id="ghana_post_gps_address"
                        value={formData.ghana_post_gps_address}
                        onChange={(e) =>
                          setFormData({ ...formData, ghana_post_gps_address: e.target.value })
                        }
                        placeholder="e.g., GA-123-4567"
                      />
                    </div>
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
                      {caretakers.length === 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          No caretakers available. Create a caretaker in the Tenants page first.
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Additional details about the property..."
                      rows={3}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700"
                  disabled={createPropertyLoading}
                >
                  {createPropertyLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Property"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Properties</p>
                  <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
                  <p className="text-xs text-gray-500">Active properties</p>
                </div>
                <Building2 className="w-8 h-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Units</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {properties.reduce((sum, p) => sum + (p.analytics?.total_units || 0), 0)}
                  </p>
                  <p className="text-xs text-gray-500">All units</p>
                </div>
                <Home className="w-8 h-8 text-cyan-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {properties.length > 0 
                      ? Math.round(
                          properties.reduce((sum, p) => sum + (p.analytics?.occupancy_rate || 0), 0) / properties.length
                        )
                      : 0}%
                  </p>
                  <p className="text-xs text-gray-500">Average across all properties</p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₵{(properties.reduce((sum, p) => sum + (p.analytics?.monthly_revenue || 0), 0) || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">Current month</p>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search properties by name or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm
                  ? "No properties found matching your search."
                  : "No properties yet. Click 'Add Property' to create your first property."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => {
              const caretaker = caretakers.find((c) => c.id === property.caretaker_id)
              
              return (
                <Card key={property.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{property.name}</CardTitle>
                      <Badge className="bg-indigo-100 text-indigo-700">Active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Address */}
                    <div className="flex items-start text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{property.street_address}</span>
                    </div>
                    
                    {property.ghana_post_gps_address && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Home className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{property.ghana_post_gps_address}</span>
                      </div>
                    )}

                    {/* Caretaker */}
                    {property.caretaker ? (
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="w-4 h-4 mr-2 flex-shrink-0" />
                        <div className="flex flex-col">
                          <span className="font-medium">{property.caretaker.name}</span>
                          <span className="text-xs text-gray-500">{property.caretaker.email}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center text-sm text-gray-400">
                        <User className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>No caretaker assigned</span>
                      </div>
                    )}

                    {/* Analytics */}
                    {property.analytics && (
                      <div className="pt-3 border-t space-y-2">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center">
                            <Building2 className="w-4 h-4 mr-2 text-blue-600" />
                            <span className="text-gray-600">{property.analytics.total_units} Units</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2 text-green-600" />
                            <span className="text-gray-600">{property.analytics.occupied_units} Occupied</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <TrendingUp className="w-4 h-4 mr-2 text-purple-600" />
                            <span className="text-gray-600">Occupancy:</span>
                          </div>
                          <Badge 
                            variant="secondary" 
                            className={`${
                              (property.analytics.occupancy_rate || 0) >= 80 
                                ? 'bg-green-100 text-green-700' 
                                : (property.analytics.occupancy_rate || 0) >= 60 
                                ? 'bg-yellow-100 text-yellow-700' 
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {Math.round(property.analytics.occupancy_rate || 0)}%
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-2 text-yellow-600" />
                            <span className="text-gray-600">Revenue:</span>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">
                              ₵{(property.analytics.monthly_revenue || 0).toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              of ₵{(property.analytics.expected_monthly_revenue || 0).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {property.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 pt-2 border-t">{property.description}</p>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="pt-3 border-t space-y-2">
                      {/* View Details Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setSelectedProperty(property)
                          setIsPropertyDetailsOpen(true)
                        }}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View Details
                      </Button>

                      {/* Caretaker Management Buttons */}
                      <div className="flex gap-2">
                        {caretaker ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => {
                                setSelectedProperty(property)
                                setSelectedCaretakerId(property.caretaker_id || "")
                                setIsAssignCaretakerOpen(true)
                              }}
                              disabled={isAssigning}
                            >
                              <UserPlus className="w-3 h-3 mr-1" />
                              Reassign
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-red-600 hover:text-red-700"
                              onClick={() => handleRemoveCaretaker(property)}
                              disabled={isAssigning}
                            >
                              <UserMinus className="w-3 h-3 mr-1" />
                              Remove
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              setSelectedProperty(property)
                              setSelectedCaretakerId("")
                              setIsAssignCaretakerOpen(true)
                            }}
                            disabled={isAssigning || caretakers.length === 0}
                          >
                            <UserPlus className="w-3 h-3 mr-1" />
                            Assign Caretaker
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
        
        {/* Assign Caretaker Dialog */}
        <Dialog open={isAssignCaretakerOpen} onOpenChange={setIsAssignCaretakerOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedProperty?.caretaker_id ? "Reassign" : "Assign"} Caretaker
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="property-name">Property</Label>
                <Input
                  id="property-name"
                  value={selectedProperty?.name || ""}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label htmlFor="caretaker-select">Select Caretaker *</Label>
                <Select
                  value={selectedCaretakerId}
                  onValueChange={setSelectedCaretakerId}
                >
                  <SelectTrigger id="caretaker-select">
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
                  <p className="text-xs text-gray-500 mt-1">
                    No caretakers available. Create a caretaker in the Tenants page first.
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsAssignCaretakerOpen(false)
                    setSelectedProperty(null)
                    setSelectedCaretakerId("")
                  }}
                  disabled={isAssigning}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700"
                  onClick={handleAssignCaretaker}
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
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Property Details Modal */}
        {selectedProperty && (
          <PropertyDetailsModal
            property={selectedProperty}
            isOpen={isPropertyDetailsOpen}
            onClose={() => {
              setIsPropertyDetailsOpen(false)
              setSelectedProperty(null)
            }}
            onPropertyUpdate={refetchProperties}
          />
        )}
      </div>
    </MainLayout>
  )
}
