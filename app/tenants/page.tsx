"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useCreateTenant, useCreateCaretaker, useLandlordUsers } from "@/lib/hooks/use-landlord-users"
import { useLandlordUnits } from "@/lib/hooks/use-landlord-units"
import { useLandlordProperties } from "@/lib/hooks/use-landlord-properties"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  UserPlus,
  Mail,
  Phone,
  Wrench,
  Shield,
  Loader2,
  Search,
  Calendar,
  Home,
  Building2,
} from "lucide-react"
import { MainLayout } from "@/components/main-layout"
import { useToast } from "@/hooks/use-toast"

interface CreateUserFormData {
  name: string
  email: string
  phone: string
  password: string
  password_confirmation: string
  address?: string
  bio?: string
}

export default function TenantsPage() {
  const { user: currentUser, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  
  // Hooks for API operations
  const { data: usersData, loading: usersLoading, refetch: refetchUsers } = useLandlordUsers()
  const { data: unitsData } = useLandlordUnits()
  const { data: propertiesData } = useLandlordProperties()
  const { createTenant, loading: createTenantLoading } = useCreateTenant()
  const { createCaretaker, loading: createCaretakerLoading } = useCreateCaretaker()

  const [searchTerm, setSearchTerm] = useState("")
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<"tenant" | "caretaker">("tenant")
  const [formData, setFormData] = useState<CreateUserFormData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
    address: "",
    bio: "",
  })

  const users = usersData?.data || []
  const units = unitsData?.data || []
  const properties = propertiesData?.data || []
  const tenants = users.filter((user) => user.role === "tenant")
  const caretakers = users.filter((user) => user.role === "caretaker")

  // Helper function to get tenant's unit and property
  const getTenantUnitInfo = (tenantId: string) => {
    const unit = units.find((u) => u.tenant?.id === tenantId)
    if (!unit) return null
    const property = properties.find((p) => p.id === unit.property_id)
    return { unit, property }
  }

  // Helper function to get caretaker's properties
  const getCaretakerProperties = (caretakerId: string) => {
    return properties.filter((p) => p.caretaker?.id === caretakerId)
  }

  // Filtered users based on search
  const filteredTenants = tenants.filter((tenant) => {
    if (!searchTerm) return true; // If no search term, show all
    
    return (
      tenant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.phone?.includes(searchTerm)
    );
  })

  const filteredCaretakers = caretakers.filter((caretaker) => {
    if (!searchTerm) return true; // If no search term, show all
    
    return (
      caretaker.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caretaker.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caretaker.phone?.includes(searchTerm)
    );
  })


  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate passwords match
    if (formData.password !== formData.password_confirmation) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      })
      return
    }

    // Validate password length
    if (formData.password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      })
      return
    }

    try {
      console.log("Creating user with data:", { ...formData, password: "***", password_confirmation: "***" })
      
      let result

      if (selectedRole === "tenant") {
        result = await createTenant(formData)
      } else {
        result = await createCaretaker(formData)
      }

      console.log("User creation result:", result)

      if (result) {
        // Close dialog immediately for better UX
        setIsAddUserOpen(false)

        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          password: "",
          password_confirmation: "",
          address: "",
          bio: "",
        })

        // Show success toast
        toast({
          title: "Success!",
          description: `${selectedRole === "tenant" ? "Tenant" : "Caretaker"} ${result.user.name} created successfully.`,
        })

        // Refetch users list to show new user immediately
        refetchUsers()
      } else {
        // If result is null, show error
        console.error("Result is null - check API response")
        toast({
          title: "Error",
          description: `Failed to create ${selectedRole}. Please check console for details.`,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Create user error:", error)
      console.error("Error details:", {
        message: error?.message,
        status: error?.status,
        errors: error?.errors,
        isValidationError: error?.isValidationError,
        isAuthError: error?.isAuthError,
        isNetworkError: error?.isNetworkError
      })
      
      // Extract detailed error message
      let errorMessage = `Failed to create ${selectedRole}.`
      
      if (error?.errors) {
        // Validation errors from ApiClientError
        const errorMessages = Object.entries(error.errors)
          .map(([field, messages]: [string, any]) => {
            const msgArray = Array.isArray(messages) ? messages : [messages]
            return `${field}: ${msgArray.join(', ')}`
          })
          .join('; ')
        errorMessage = errorMessages
      } else if (error?.message) {
        // General error message
        errorMessage = error.message
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const loading = authLoading || usersLoading
  const isCreating = createTenantLoading || createCaretakerLoading

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
              User Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage tenants and caretakers for your properties
            </p>
          </div>
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-6">
                {/* Role Selection */}
                <div>
                  <Label htmlFor="role">User Role *</Label>
                  <Select
                    value={selectedRole}
                    onValueChange={(value: "tenant" | "caretaker") => setSelectedRole(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tenant">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Tenant
                        </div>
                      </SelectItem>
                      <SelectItem value="caretaker">
                        <div className="flex items-center gap-2">
                          <Wrench className="h-4 w-4" />
                          Caretaker
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter full name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="user@example.com"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+233 24 123 4567"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Physical address"
                      />
                    </div>
                  </div>
                </div>

                {/* Account Credentials */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Account Credentials</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Min. 8 characters"
                        required
                        minLength={8}
                      />
                    </div>
                    <div>
                      <Label htmlFor="password_confirmation">Confirm Password *</Label>
                      <Input
                        id="password_confirmation"
                        type="password"
                        value={formData.password_confirmation}
                        onChange={(e) =>
                          setFormData({ ...formData, password_confirmation: e.target.value })
                        }
                        placeholder="Re-enter password"
                        required
                        minLength={8}
                      />
                    </div>
                  </div>
                </div>

                {/* Bio (Optional) */}
                <div>
                  <Label htmlFor="bio">Bio / Notes</Label>
                  <Input
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Additional information (optional)"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    `Create ${selectedRole === "tenant" ? "Tenant" : "Caretaker"}`
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tenants</p>
                  <p className="text-2xl font-bold text-gray-900">{tenants.length}</p>
                  <p className="text-xs text-gray-500">Active users</p>
                </div>
                <Users className="w-8 h-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Caretakers</p>
                  <p className="text-2xl font-bold text-gray-900">{caretakers.length}</p>
                  <p className="text-xs text-gray-500">Property managers</p>
                </div>
                <Wrench className="w-8 h-8 text-cyan-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                  <p className="text-xs text-gray-500">All roles</p>
                </div>
                <Shield className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search users by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="tenants" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tenants">
              <Users className="h-4 w-4 mr-2" />
              Tenants ({tenants.length})
            </TabsTrigger>
            <TabsTrigger value="caretakers">
              <Wrench className="h-4 w-4 mr-2" />
              Caretakers ({caretakers.length})
            </TabsTrigger>
          </TabsList>

          {/* Tenants Tab */}
          <TabsContent value="tenants">
            {filteredTenants.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchTerm
                      ? "No tenants found matching your search."
                      : "No tenants yet. Click 'Add User' to create your first tenant."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTenants.map((tenant) => {
                  const unitInfo = getTenantUnitInfo(tenant.id)
                  
                  return (
                    <Card key={tenant.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{tenant.name}</CardTitle>
                          <Badge className="bg-indigo-100 text-indigo-700">Tenant</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{tenant.email}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                          {tenant.phone}
                        </div>
                        
                        {/* Unit & Property Info */}
                        {unitInfo ? (
                          <>
                            <div className="pt-2 border-t">
                              <div className="flex items-center text-sm text-gray-600 mb-1">
                                <Building2 className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span className="truncate font-medium">{unitInfo.property?.name || "Unknown Property"}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Home className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span>Unit {unitInfo.unit.unit_number}</span>
                                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
                                  Assigned
                                </Badge>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="pt-2 border-t">
                            <div className="flex items-center text-sm text-gray-400">
                              <Home className="w-4 h-4 mr-2 flex-shrink-0" />
                              <span>No unit assigned</span>
                              <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-700">
                                Unassigned
                              </Badge>
                            </div>
                          </div>
                        )}
                        
                        {tenant.created_at && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                            Joined {new Date(tenant.created_at).toLocaleDateString()}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* Caretakers Tab */}
          <TabsContent value="caretakers">
            {filteredCaretakers.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchTerm
                      ? "No caretakers found matching your search."
                      : "No caretakers yet. Click 'Add User' to create your first caretaker."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCaretakers.map((caretaker) => {
                  const assignedProperties = getCaretakerProperties(caretaker.id)
                  
                  return (
                    <Card key={caretaker.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{caretaker.name}</CardTitle>
                          <Badge className="bg-cyan-100 text-cyan-700">Caretaker</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{caretaker.email}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                          {caretaker.phone}
                        </div>
                        
                        {/* Properties Assigned */}
                        {assignedProperties.length > 0 ? (
                          <div className="pt-2 border-t">
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                              <Building2 className="w-4 h-4 mr-2 flex-shrink-0" />
                              <span className="font-medium">Managing {assignedProperties.length} {assignedProperties.length === 1 ? "Property" : "Properties"}</span>
                            </div>
                            <div className="ml-6 space-y-1">
                              {assignedProperties.slice(0, 2).map((property) => (
                                <p key={property.id} className="text-xs text-gray-600 truncate">
                                  • {property.name}
                                </p>
                              ))}
                              {assignedProperties.length > 2 && (
                                <p className="text-xs text-gray-500">
                                  +{assignedProperties.length - 2} more
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="pt-2 border-t">
                            <div className="flex items-center text-sm text-gray-400">
                              <Building2 className="w-4 h-4 mr-2 flex-shrink-0" />
                              <span>No properties assigned</span>
                            </div>
                          </div>
                        )}
                        
                        {caretaker.created_at && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                            Joined {new Date(caretaker.created_at).toLocaleDateString()}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
