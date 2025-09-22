"use client"

import type React from "react"

import { useState } from "react"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import { addUser } from "@/lib/slices/usersSlice"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Users,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle,
  CreditCard,
  UserCheck,
  Clock,
  Upload,
  MapPin,
  MessageSquare,
  Search,
} from "lucide-react"
import { MainLayout } from "@/components/main-layout"
import { TenantDetailsModal } from "@/components/tenant-details-modal"
import { formatGhanaPhone, formatCurrency, GHANA_REGIONS } from "@/lib/localization"
import { generateLeaseAgreementPDF, formatLeaseData } from "@/lib/lease-generator"
import { useToast } from "@/hooks/use-toast"

function TenantsPageContent() {
  const dispatch = useAppDispatch()
  const { users, currentUser } = useAppSelector((state) => state.users)
  const { properties } = useAppSelector((state) => state.properties)
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isLeaseModalOpen, setIsLeaseModalOpen] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState<any>(null)
  const [isTenantDetailsOpen, setIsTenantDetailsOpen] = useState(false)

  const isCaretaker = currentUser?.role === "caretaker"

  const tenants = users.filter((user) => user.role === "tenant")
  const caretakers = users.filter((user) => user.role === "caretaker")
  const pendingTenants = tenants.filter((tenant) => tenant.status === "pending_approval")
  const activeTenants = tenants.filter((tenant) => tenant.status === "active")

  // Mock tenants with proper property relationships for demo
  const mockActiveTenants = [
    {
      id: 1,
      name: "Kofi Mensah",
      email: "kofi.mensah@email.com",
      phone: "+233 20 111 2222",
      ghanaCardId: "GHA-123456789-1",
      propertyId: 1,
      status: "active",
      role: "tenant",
      createdAt: "2024-01-15",
      occupation: "Software Engineer",
      monthlyIncome: "8500",
      emergencyContactName: "Ama Mensah",
      emergencyContactPhone: "+233 24 555 0001",
      emergencyContactRelation: "Sister"
    },
    {
      id: 2,
      name: "Ama Serwaa", 
      email: "ama.serwaa@email.com",
      phone: "+233 24 333 4444",
      ghanaCardId: "GHA-123456789-2",
      propertyId: 1,
      status: "active",
      role: "tenant",
      createdAt: "2024-02-01",
      occupation: "Teacher",
      monthlyIncome: "4200",
      emergencyContactName: "Kwame Serwaa",
      emergencyContactPhone: "+233 20 555 0002",
      emergencyContactRelation: "Brother"
    },
    {
      id: 3,
      name: "Yaw Osei",
      email: "yaw.osei@email.com", 
      phone: "+233 26 555 6666",
      ghanaCardId: "GHA-123456789-3",
      propertyId: 2,
      status: "active",
      role: "tenant",
      createdAt: "2024-01-20",
      occupation: "Accountant",
      monthlyIncome: "6000",
      emergencyContactName: "Akosua Osei",
      emergencyContactPhone: "+233 24 555 0003",
      emergencyContactRelation: "Wife"
    }
  ]

  // Mock properties for demo
  const mockProperties = [
    {
      id: 1,
      name: "Sunset Apartments",
      address: "123 Independence Avenue, Accra",
      type: "Apartment Complex",
      gpsAddress: "GA-123-4567",
      region: "Greater Accra",
      units: 8,
      occupied: 6,
      monthlyRevenue: 2500
    },
    {
      id: 2, 
      name: "Golden Heights",
      address: "456 Ring Road, Kumasi",
      type: "Residential Complex",
      gpsAddress: "AK-987-6543",
      region: "Ashanti",
      units: 6,
      occupied: 4,
      monthlyRevenue: 3000
    }
  ]

  // Use mock data if Redux data is empty, otherwise use Redux data
  const activeTenantsToShow = activeTenants.length > 0 ? activeTenants : mockActiveTenants
  const propertiesToShow = properties.length > 0 ? properties : mockProperties

  const caretakerTenants = [
    {
      id: 1,
      name: "Kofi Mensah",
      phone: "+233 20 111 2222",
      email: "kofi.mensah@email.com",
      unitAddress: "Sunset Apartments - Unit A1",
      propertyName: "Sunset Apartments",
      unitName: "Unit A1",
      unitType: "Bedsitter",
      ghanaCardId: "GHA-123456789-1",
      status: "active",
    },
    {
      id: 2,
      name: "Ama Serwaa",
      phone: "+233 24 333 4444",
      email: "ama.serwaa@email.com",
      unitAddress: "Sunset Apartments - Unit A2",
      propertyName: "Sunset Apartments",
      unitName: "Unit A2",
      unitType: "Chamber & Hall",
      ghanaCardId: "GHA-123456789-2",
      status: "active",
    },
    {
      id: 3,
      name: "Yaw Osei",
      phone: "+233 26 555 6666",
      email: "yaw.osei@email.com",
      unitAddress: "Sunset Apartments - Unit A4",
      propertyName: "Sunset Apartments",
      unitName: "Unit A4",
      unitType: "Chamber & Hall",
      ghanaCardId: "GHA-123456789-3",
      status: "active",
    },
    {
      id: 4,
      name: "Kwaku Boateng",
      phone: "+233 20 777 8888",
      email: "kwaku.boateng@email.com",
      unitAddress: "Golden Heights - Unit B1",
      propertyName: "Golden Heights",
      unitName: "Unit B1",
      unitType: "Single Room",
      ghanaCardId: "GHA-987654321-1",
      status: "active",
    },
    {
      id: 5,
      name: "Efua Asante",
      phone: "+233 24 999 0000",
      email: "efua.asante@email.com",
      unitAddress: "Golden Heights - Unit B3",
      propertyName: "Golden Heights",
      unitName: "Unit B3",
      unitType: "Single Room",
      ghanaCardId: "GHA-987654321-2",
      status: "active",
    },
    {
      id: 6,
      name: "Kojo Antwi",
      phone: "+233 26 111 2222",
      email: "kojo.antwi@email.com",
      unitAddress: "Golden Heights - Unit B4",
      propertyName: "Golden Heights",
      unitName: "Unit B4",
      unitType: "Bedsitter",
      ghanaCardId: "GHA-987654321-3",
      status: "active",
    },
  ]

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.ghanaCardId && user.ghanaCardId.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const filteredCaretakerTenants = caretakerTenants.filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.unitAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.phone.includes(searchTerm) ||
      tenant.email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const leases = [
    {
      id: 1,
      tenantId: 1,
      propertyId: 1,
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      monthlyRent: 2500,
      securityDeposit: 2500,
      status: "active",
      renewalAlert: 45, // days until renewal needed
      leaseDocument: null,
      isManuallyUploaded: false,
    },
  ]

  const handleAddUser = (userData: any) => {
    const newUser = {
      ...userData,
      id: Date.now(),
      createdAt: new Date().toISOString().split("T")[0],
      status: "pending_approval" as const, // New tenants require manual approval
    }
    dispatch(addUser(newUser))
    setIsAddUserOpen(false)
  }

  const handleGenerateLease = (tenantId: number) => {
    console.log("[v0] Generating lease for tenant:", tenantId)

    // Use the same data sources as the UI
    const allTenants = [...activeTenantsToShow, ...caretakerTenants]
    const allProperties = [...propertiesToShow]

    console.log("[v0] Available tenants:", allTenants)
    console.log("[v0] Available properties:", allProperties)

    // Find tenant in either active tenants or caretaker tenants
    let tenant = allTenants.find((t) => t.id === tenantId)
    let property = null

    if (tenant) {
      if (tenant.propertyId) {
        // Find by propertyId
        property = allProperties.find((p) => p.id === tenant.propertyId)
      } else if (tenant.propertyName) {
        // Find by property name (for caretaker tenants)
        property = allProperties.find((p) => p.name === tenant.propertyName) || {
          id: tenantId,
          name: tenant.propertyName,
          address: tenant.unitAddress || "Address not available",
          type: tenant.unitType || "Residential",
          gpsAddress: `GP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          monthlyRevenue: 2500
        }
      }
    }

    console.log("[v0] Found tenant:", tenant)
    console.log("[v0] Found property:", property)

    if (tenant && property) {
      try {
        console.log("Generating PDF lease agreement...")
        
        // Format the lease data
        const leaseData = formatLeaseData(tenant, property)
        
        // Generate and download the PDF
        generateLeaseAgreementPDF(leaseData)
        
        // Show success toast
        toast({
          title: "Lease Agreement Generated! 📄",
          description: `PDF lease agreement for ${tenant.name} at ${property.name} has been downloaded successfully.`,
          variant: "default",
        })
        
      } catch (error) {
        console.error("Error generating lease PDF:", error)
        toast({
          title: "Generation Failed ❌",
          description: "There was an error generating the lease agreement. Please try again.",
          variant: "destructive",
        })
      }
    } else {
      console.error("[v0] Missing data - tenant:", !!tenant, "property:", !!property)
      toast({
        title: "Missing Information ⚠️",
        description: `Could not find ${!tenant ? 'tenant' : 'property'} information. Please check the data and try again.`,
        variant: "destructive",
      })
    }
  }

  const handleApproveTenant = (tenantId: number) => {
    console.log("[v0] Approving tenant:", tenantId)
    // TODO: Implement tenant approval logic
  }

  const handleViewTenantDetails = (tenant: any) => {
    console.log("[v0] Viewing tenant details:", tenant)
    setSelectedTenant(tenant)
    setIsTenantDetailsOpen(true)
  }

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, "_self")
  }

  const handleMessage = (phone: string) => {
    window.open(`sms:${phone}`, "_self")
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              {isCaretaker ? "Tenant Directory" : "Tenant Management"}
            </h1>
            <p className="text-gray-600 mt-1 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {isCaretaker
                ? "Quick access to tenant contact information for your assigned properties."
                : "Manage tenants with Ghana Card verification and manual approval processes"}
            </p>
          </div>
          {!isCaretaker && (
            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Register Tenant
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Register New Tenant</DialogTitle>
                </DialogHeader>
                <AddUserForm onSubmit={handleAddUser} properties={propertiesToShow} />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {isCaretaker ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Tenants</p>
                      <p className="text-2xl font-bold text-gray-900">{caretakerTenants.length}</p>
                      <p className="text-xs text-gray-500">In your properties</p>
                    </div>
                    <Users className="w-8 h-8 text-indigo-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Properties</p>
                      <p className="text-2xl font-bold text-gray-900">2</p>
                      <p className="text-xs text-gray-500">Under your care</p>
                    </div>
                    <MapPin className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Occupied Units</p>
                      <p className="text-2xl font-bold text-gray-900">6</p>
                      <p className="text-xs text-gray-500">Active tenants</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-cyan-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search Bar */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search tenants by name, unit, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Tenant Directory Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Tenant Contact Directory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium text-gray-900">Tenant Name</th>
                        <th className="text-left p-4 font-medium text-gray-900">Unit Address</th>
                        <th className="text-left p-4 font-medium text-gray-900">Phone Number</th>
                        <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCaretakerTenants.map((tenant) => (
                        <tr key={tenant.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="p-4">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{tenant.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{tenant.email}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{tenant.unitAddress}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{tenant.unitType}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="font-medium text-gray-900 dark:text-white">{tenant.phone}</p>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCall(tenant.phone)}
                                className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:text-green-800"
                              >
                                <Phone className="w-4 h-4 mr-1" />
                                Call
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMessage(tenant.phone)}
                                className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800"
                              >
                                <MessageSquare className="w-4 h-4 mr-1" />
                                Message
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredCaretakerTenants.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchTerm
                        ? "No tenants found matching your search."
                        : "No tenants in your assigned properties."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Tenants</p>
                      <p className="text-2xl font-bold text-gray-900">{tenants.length}</p>
                      <p className="text-xs text-gray-500">{activeTenants.length} active</p>
                    </div>
                    <Users className="w-8 h-8 text-indigo-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                      <p className="text-2xl font-bold text-gray-900">{pendingTenants.length}</p>
                      <p className="text-xs text-gray-500">Require verification</p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Leases</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {leases.filter((l) => l.status === "active").length}
                      </p>
                      <p className="text-xs text-gray-500">Signed agreements</p>
                    </div>
                    <FileText className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {leases.filter((l) => l.renewalAlert <= 60).length}
                      </p>
                      <p className="text-xs text-gray-500">Within 60 days</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-orange-600" />
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
                    <CheckCircle className="w-8 h-8 text-cyan-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="tenants" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="tenants">Tenants</TabsTrigger>
                <TabsTrigger value="pending">Pending Approval</TabsTrigger>
                <TabsTrigger value="leases">Lease Management</TabsTrigger>
                <TabsTrigger value="users">All Users</TabsTrigger>
              </TabsList>

              <TabsContent value="tenants" className="space-y-6">
                <TenantsTab 
                  tenants={activeTenantsToShow} 
                  properties={propertiesToShow} 
                  onGenerateLease={handleGenerateLease}
                  onViewDetails={handleViewTenantDetails}
                />
              </TabsContent>

              <TabsContent value="pending" className="space-y-6">
                <PendingTenantsTab tenants={pendingTenants} properties={properties} onApprove={handleApproveTenant} />
              </TabsContent>

              <TabsContent value="leases" className="space-y-6">
                <LeasesTab leases={leases} tenants={tenants} properties={properties} />
              </TabsContent>

              <TabsContent value="users" className="space-y-6">
                <UsersTab
                  users={filteredUsers}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  roleFilter={roleFilter}
                  setRoleFilter={setRoleFilter}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      {/* Tenant Details Modal */}
      <TenantDetailsModal
        tenant={selectedTenant}
        property={selectedTenant ? [...propertiesToShow].find((p) => p.id === selectedTenant.propertyId || p.name === selectedTenant.propertyName) : undefined}
        open={isTenantDetailsOpen}
        onOpenChange={setIsTenantDetailsOpen}
      />
    </MainLayout>
  )
}

export default function TenantsPage() {
  return <TenantsPageContent />
}

function AddUserForm({ onSubmit, properties }: { onSubmit: (data: any) => void; properties: any[] }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    ghanaCardId: "",
    dateOfBirth: "",
    occupation: "",
    employer: "",
    monthlyIncome: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    nextOfKinName: "",
    nextOfKinPhone: "",
    nextOfKinAddress: "",
    previousAddress: "",
    region: "",
    role: "tenant" as "tenant" | "caretaker" | "landlord",
    propertyId: undefined as number | undefined,
    hasGuarantor: false,
    guarantorName: "",
    guarantorPhone: "",
    guarantorAddress: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({
      name: "",
      email: "",
      phone: "",
      ghanaCardId: "",
      dateOfBirth: "",
      occupation: "",
      employer: "",
      monthlyIncome: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelation: "",
      nextOfKinName: "",
      nextOfKinPhone: "",
      nextOfKinAddress: "",
      previousAddress: "",
      region: "",
      role: "tenant",
      propertyId: undefined,
      hasGuarantor: false,
      guarantorName: "",
      guarantorPhone: "",
      guarantorAddress: "",
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter full name as on Ghana Card"
              required
            />
          </div>

          <div>
            <Label htmlFor="ghanaCardId">Ghana Card ID *</Label>
            <Input
              id="ghanaCardId"
              value={formData.ghanaCardId}
              onChange={(e) => setFormData({ ...formData, ghanaCardId: e.target.value.toUpperCase() })}
              placeholder="GHA-123456789-0"
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
              placeholder="tenant@example.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="0244123456"
              required
            />
          </div>

          <div>
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="region">Region</Label>
            <Select value={formData.region} onValueChange={(value) => setFormData({ ...formData, region: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                {GHANA_REGIONS.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="previousAddress">Previous Address</Label>
          <Textarea
            id="previousAddress"
            value={formData.previousAddress}
            onChange={(e) => setFormData({ ...formData, previousAddress: e.target.value })}
            placeholder="Enter previous residential address"
            rows={2}
          />
        </div>
      </div>

      {/* User Role & Property Assignment */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">User Role & Property Assignment</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="role">User Role *</Label>
            <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select user role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tenant">Tenant</SelectItem>
                <SelectItem value="caretaker">Caretaker</SelectItem>
                <SelectItem value="landlord">Landlord</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.role === "tenant" && (
            <div>
              <Label htmlFor="property">Assign to Property *</Label>
              <Select
                value={formData.propertyId?.toString()}
                onValueChange={(value) => setFormData({ ...formData, propertyId: Number.parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id.toString()}>
                      {property.name} - {property.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Employment Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Employment Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="occupation">Occupation</Label>
            <Input
              id="occupation"
              value={formData.occupation}
              onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
              placeholder="e.g., Teacher, Engineer, Trader"
            />
          </div>

          <div>
            <Label htmlFor="employer">Employer</Label>
            <Input
              id="employer"
              value={formData.employer}
              onChange={(e) => setFormData({ ...formData, employer: e.target.value })}
              placeholder="Company or organization name"
            />
          </div>

          <div>
            <Label htmlFor="monthlyIncome">Monthly Income (₵)</Label>
            <Input
              id="monthlyIncome"
              type="number"
              value={formData.monthlyIncome}
              onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Emergency Contact</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="emergencyContactName">Contact Name *</Label>
            <Input
              id="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
              placeholder="Emergency contact name"
              required
            />
          </div>

          <div>
            <Label htmlFor="emergencyContactPhone">Contact Phone *</Label>
            <Input
              id="emergencyContactPhone"
              value={formData.emergencyContactPhone}
              onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
              placeholder="0244123456"
              required
            />
          </div>

          <div>
            <Label htmlFor="emergencyContactRelation">Relationship</Label>
            <Input
              id="emergencyContactRelation"
              value={formData.emergencyContactRelation}
              onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
              placeholder="e.g., Father, Sister, Friend"
            />
          </div>
        </div>
      </div>

      {/* Next of Kin */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Next of Kin</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nextOfKinName">Next of Kin Name</Label>
            <Input
              id="nextOfKinName"
              value={formData.nextOfKinName}
              onChange={(e) => setFormData({ ...formData, nextOfKinName: e.target.value })}
              placeholder="Next of kin full name"
            />
          </div>

          <div>
            <Label htmlFor="nextOfKinPhone">Next of Kin Phone</Label>
            <Input
              id="nextOfKinPhone"
              value={formData.nextOfKinPhone}
              onChange={(e) => setFormData({ ...formData, nextOfKinPhone: e.target.value })}
              placeholder="0244123456"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="nextOfKinAddress">Next of Kin Address</Label>
          <Textarea
            id="nextOfKinAddress"
            value={formData.nextOfKinAddress}
            onChange={(e) => setFormData({ ...formData, nextOfKinAddress: e.target.value })}
            placeholder="Next of kin residential address"
            rows={2}
          />
        </div>
      </div>

      {/* Guarantor Information */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="hasGuarantor"
            checked={formData.hasGuarantor}
            onCheckedChange={(checked) => setFormData({ ...formData, hasGuarantor: checked })}
          />
          <Label htmlFor="hasGuarantor">Has Guarantor</Label>
        </div>

        {formData.hasGuarantor && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="guarantorName">Guarantor Name</Label>
              <Input
                id="guarantorName"
                value={formData.guarantorName}
                onChange={(e) => setFormData({ ...formData, guarantorName: e.target.value })}
                placeholder="Guarantor full name"
              />
            </div>

            <div>
              <Label htmlFor="guarantorPhone">Guarantor Phone</Label>
              <Input
                id="guarantorPhone"
                value={formData.guarantorPhone}
                onChange={(e) => setFormData({ ...formData, guarantorPhone: e.target.value })}
                placeholder="0244123456"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="guarantorAddress">Guarantor Address</Label>
              <Textarea
                id="guarantorAddress"
                value={formData.guarantorAddress}
                onChange={(e) => setFormData({ ...formData, guarantorAddress: e.target.value })}
                placeholder="Guarantor residential address"
                rows={2}
              />
            </div>
          </div>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700"
      >
        Register Tenant (Pending Approval)
      </Button>
    </form>
  )
}

function PendingTenantsTab({
  tenants,
  properties,
  onApprove,
}: { tenants: any[]; properties: any[]; onApprove: (id: number) => void }) {
  return (
    <div className="space-y-6">
      {tenants.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No pending tenant approvals</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {tenants.map((tenant) => {
            const property = properties.find((p) => p.id === tenant.propertyId)
            return (
              <Card key={tenant.id} className="border-orange-200 bg-orange-50 dark:bg-orange-900/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5 text-orange-600" />
                      {tenant.name}
                    </CardTitle>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      Pending Approval
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        {tenant.email}
                      </div>
                      {tenant.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          {formatGhanaPhone(tenant.phone)}
                        </div>
                      )}
                      {tenant.ghanaCardId && (
                        <div className="flex items-center text-sm text-gray-600">
                          <CreditCard className="w-4 h-4 mr-2" />
                          {tenant.ghanaCardId}
                        </div>
                      )}
                      {property && (
                        <div className="flex items-center text-sm text-gray-600">
                          <FileText className="w-4 h-4 mr-2" />
                          {property.name}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      {tenant.emergencyContactName && (
                        <div className="text-sm">
                          <span className="font-medium">Emergency Contact:</span>
                          <br />
                          {tenant.emergencyContactName} - {formatGhanaPhone(tenant.emergencyContactPhone)}
                        </div>
                      )}
                      {tenant.occupation && (
                        <div className="text-sm">
                          <span className="font-medium">Occupation:</span> {tenant.occupation}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => onApprove(tenant.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Tenant
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      View Full Details
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      Request Documents
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function TenantsTab({
  tenants,
  properties,
  onGenerateLease,
  onViewDetails,
}: { 
  tenants: any[]; 
  properties: any[]; 
  onGenerateLease: (id: number) => void;
  onViewDetails: (tenant: any) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tenants.map((tenant) => {
        const property = properties.find((p) => p.id === tenant.propertyId)
        return (
          <Card key={tenant.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{tenant.name}</CardTitle>
                <Badge variant={tenant.status === "active" ? "default" : "secondary"}>{tenant.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  {tenant.email}
                </div>
                {tenant.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {formatGhanaPhone(tenant.phone)}
                  </div>
                )}
                {tenant.ghanaCardId && (
                  <div className="flex items-center text-sm text-gray-600">
                    <CreditCard className="w-4 h-4 mr-2" />
                    {tenant.ghanaCardId}
                  </div>
                )}
                {property && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FileText className="w-4 h-4 mr-2" />
                    {property.name}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 bg-transparent"
                  onClick={() => onViewDetails(tenant)}
                >
                  View Details
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700"
                  onClick={() => onGenerateLease(tenant.id)}
                >
                  Generate Lease
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function LeasesTab({ leases, tenants, properties }: { leases: any[]; tenants: any[]; properties: any[] }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lease Agreements</CardTitle>
            <Button variant="outline" className="bg-transparent">
              <Upload className="w-4 h-4 mr-2" />
              Upload Lease Document
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Tenant</th>
                  <th className="text-left p-4">Property</th>
                  <th className="text-left p-4">Start Date</th>
                  <th className="text-left p-4">End Date</th>
                  <th className="text-left p-4">Monthly Rent</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leases.map((lease) => {
                  const tenant = tenants.find((t) => t.id === lease.tenantId)
                  const property = properties.find((p) => p.id === lease.propertyId)
                  return (
                    <tr key={lease.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{tenant?.name}</p>
                          {tenant?.ghanaCardId && <p className="text-xs text-gray-500">{tenant.ghanaCardId}</p>}
                        </div>
                      </td>
                      <td className="p-4">{property?.name}</td>
                      <td className="p-4">{lease.startDate}</td>
                      <td className="p-4">{lease.endDate}</td>
                      <td className="p-4">{formatCurrency(lease.monthlyRent)}</td>
                      <td className="p-4">
                        <Badge variant={lease.status === "active" ? "default" : "secondary"}>{lease.status}</Badge>
                        {lease.renewalAlert <= 60 && (
                          <Badge variant="destructive" className="ml-2">
                            Expires in {lease.renewalAlert} days
                          </Badge>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            Renew
                          </Button>
                          <Button size="sm" variant="outline">
                            <Upload className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function UsersTab({ users, searchTerm, setSearchTerm, roleFilter, setRoleFilter, statusFilter, setStatusFilter }: any) {
  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Input
          placeholder="Search users by name, email, or Ghana Card ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="tenant">Tenants</SelectItem>
            <SelectItem value="caretaker">Caretakers</SelectItem>
            <SelectItem value="landlord">Landlords</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending_approval">Pending Approval</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user: any) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{user.name}</CardTitle>
                <div className="flex gap-2">
                  <Badge
                    variant={user.role === "landlord" ? "default" : user.role === "tenant" ? "secondary" : "outline"}
                  >
                    {user.role}
                  </Badge>
                  <Badge
                    variant={
                      user.status === "active"
                        ? "default"
                        : user.status === "pending_approval"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {user.status?.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                {user.email}
              </div>
              {user.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  {formatGhanaPhone(user.phone)}
                </div>
              )}
              {user.ghanaCardId && (
                <div className="flex items-center text-sm text-gray-600">
                  <CreditCard className="w-4 h-4 mr-2" />
                  {user.ghanaCardId}
                </div>
              )}
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                Joined {user.createdAt}
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  Edit
                </Button>
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
