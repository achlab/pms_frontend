"use client"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedCard } from "@/components/animated-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  User,
  Building2,
  Settings,
  Bell,
  Shield,
  Save,
  Camera,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Key,
  Globe,
  Briefcase,
  Home,
  Calendar,
} from "lucide-react"

export default function ProfilePage() {
  const userRole = "tenant" // or "caretaker" or "landlord" or "super_admin"

  const [profile, setProfile] = useState({
    // Personal Information
    firstName: userRole === "tenant" ? "Akosua" : userRole === "caretaker" ? "Kwame" : "John",
    lastName: userRole === "tenant" ? "Mensah" : userRole === "caretaker" ? "Asante" : "Doe",
    email:
      userRole === "tenant"
        ? "akosua.mensah@email.com"
        : userRole === "caretaker"
          ? "kwame.asante@email.com"
          : "john.doe@email.com",
    phone:
      userRole === "tenant" ? "+233 24 789 0123" : userRole === "caretaker" ? "+233 24 567 8901" : "+233 24 123 4567",
    ghanaCardId:
      userRole === "tenant" ? "GHA-456789123-0" : userRole === "caretaker" ? "GHA-123456789-0" : "GHA-987654321-0",
    dateOfBirth: userRole === "tenant" ? "1995-08-12" : userRole === "caretaker" ? "1990-03-20" : "1985-06-15",

    // Business Information (Landlord only)
    businessName: "Doe Properties Ltd",
    businessRegistration: "BN-2020-123456",
    businessAddress: "123 Business Street, Accra",
    businessPhone: "+233 30 123 4567",
    businessEmail: "info@doeproperties.com",

    // Address Information
    residentialAddress:
      userRole === "tenant"
        ? "456 Tenant Street, Tema, Accra"
        : userRole === "caretaker"
          ? "789 Caretaker Lane, Tema, Accra"
          : "456 Residential Ave, East Legon, Accra",
    region: "Greater Accra",
    city: userRole === "tenant" ? "Tema" : userRole === "caretaker" ? "Tema" : "Accra",
    digitalAddress: userRole === "tenant" ? "GA-456-7890" : userRole === "caretaker" ? "GA-789-0123" : "GA-123-4567",

    // Work Information (Caretaker only)
    landlordName: "John Doe",
    landlordPhone: "+233 24 123 4567",
    landlordEmail: "john.doe@email.com",
    assignedProperties: ["Sunrise Apartments", "Golden Heights"],
    startDate: "2023-01-15",

    // Lease Information (Tenant only)
    unitAddress: "Sunset Apartments - Unit A1",
    landlordName: "John Doe",
    landlordPhone: "+233 24 123 4567",
    landlordEmail: "john.doe@email.com",
    leaseStartDate: "2023-06-01",
    leaseEndDate: "2024-05-31",
    monthlyRent: 800,
    securityDeposit: 2400,
    emergencyContact: "Kwame Mensah",
    emergencyPhone: "+233 20 555 6666",

    // Account Settings
    language: "en-GH",
    currency: "GHS",
    timezone: "Africa/Accra",

    // Notification Preferences
    emailNotifications: true,
    smsNotifications: false,
    paymentReminders: userRole === "landlord" || userRole === "tenant",
    maintenanceAlerts: true,
    tenantUpdates: userRole === "landlord",
    workUpdates: userRole === "caretaker",
    rentReminders: userRole === "tenant",
    leaseUpdates: userRole === "tenant",

    // Security Settings
    twoFactorAuth: false,
    loginAlerts: true,
  })

  const [activeTab, setActiveTab] = useState("personal")

  const handleProfileChange = (key: string, value: any) => {
    setProfile((prev) => ({ ...prev, [key]: value }))
  }

  const handleSaveProfile = () => {
    console.log("Saving profile:", profile)
    // TODO: Implement profile save
  }

  const handleChangePassword = () => {
    console.log("Opening change password modal")
    // TODO: Implement password change
  }

  const handleUploadPhoto = () => {
    console.log("Opening photo upload")
    // TODO: Implement photo upload
  }

  const getLandlordTabs = () => [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "business", label: "Business Info", icon: Building2 },
    { id: "preferences", label: "Preferences", icon: Settings },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
  ]

  const getCaretakerTabs = () => [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "work", label: "Work Info", icon: Briefcase },
    { id: "preferences", label: "Preferences", icon: Settings },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
  ]

  const getTenantTabs = () => [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "lease", label: "Lease Info", icon: Home },
    { id: "preferences", label: "Preferences", icon: Settings },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
  ]

  const tabs =
    userRole === "tenant" ? getTenantTabs() : userRole === "caretaker" ? getCaretakerTabs() : getLandlordTabs()

  return (
    <MainLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start animate-in fade-in-0 slide-in-from-top-4 duration-500">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              My Profile & Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {userRole === "tenant"
                ? "Manage your personal information and account preferences."
                : userRole === "caretaker"
                  ? "Manage your personal information and work preferences."
                  : "Manage your personal information, business details, and account preferences."}
            </p>
          </div>
          <Button onClick={handleSaveProfile} className="min-h-[44px]">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <AnimatedCard delay={100} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
              <CardContent className="p-6">
                {/* Profile Photo */}
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <Avatar className="h-24 w-24 mx-auto">
                      <AvatarImage src="/placeholder-avatar.jpg" alt="Profile" />
                      <AvatarFallback className="text-xl bg-gradient-to-br from-indigo-100 to-cyan-100 dark:from-indigo-900 dark:to-cyan-900">
                        {profile.firstName[0]}
                        {profile.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-transparent"
                      onClick={handleUploadPhoto}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mt-3">
                    {profile.firstName} {profile.lastName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {userRole === "tenant"
                      ? "Tenant"
                      : userRole === "caretaker"
                        ? "Property Caretaker"
                        : profile.businessName}
                  </p>
                </div>

                {/* Navigation Tabs */}
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 min-h-[44px] ${
                        activeTab === tab.id
                          ? "bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                      }`}
                    >
                      <tab.icon className="h-5 w-5" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </AnimatedCard>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Personal Information */}
            {activeTab === "personal" && (
              <AnimatedCard delay={200} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profile.firstName}
                        onChange={(e) => handleProfileChange("firstName", e.target.value)}
                        className="border-gray-200 dark:border-gray-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profile.lastName}
                        onChange={(e) => handleProfileChange("lastName", e.target.value)}
                        className="border-gray-200 dark:border-gray-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          onChange={(e) => handleProfileChange("email", e.target.value)}
                          className="pl-10 border-gray-200 dark:border-gray-600"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          value={profile.phone}
                          onChange={(e) => handleProfileChange("phone", e.target.value)}
                          className="pl-10 border-gray-200 dark:border-gray-600"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="ghanaCardId">Ghana Card ID</Label>
                      <Input
                        id="ghanaCardId"
                        value={profile.ghanaCardId}
                        onChange={(e) => handleProfileChange("ghanaCardId", e.target.value)}
                        className="border-gray-200 dark:border-gray-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={profile.dateOfBirth}
                        onChange={(e) => handleProfileChange("dateOfBirth", e.target.value)}
                        className="border-gray-200 dark:border-gray-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="residentialAddress">Residential Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Textarea
                        id="residentialAddress"
                        value={profile.residentialAddress}
                        onChange={(e) => handleProfileChange("residentialAddress", e.target.value)}
                        className="pl-10 border-gray-200 dark:border-gray-600"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="region">Region</Label>
                      <Select value={profile.region} onValueChange={(value) => handleProfileChange("region", value)}>
                        <SelectTrigger className="border-gray-200 dark:border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Greater Accra">Greater Accra</SelectItem>
                          <SelectItem value="Ashanti">Ashanti</SelectItem>
                          <SelectItem value="Western">Western</SelectItem>
                          <SelectItem value="Central">Central</SelectItem>
                          <SelectItem value="Eastern">Eastern</SelectItem>
                          <SelectItem value="Northern">Northern</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={profile.city}
                        onChange={(e) => handleProfileChange("city", e.target.value)}
                        className="border-gray-200 dark:border-gray-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="digitalAddress">Ghana Post GPS Address</Label>
                      <Input
                        id="digitalAddress"
                        value={profile.digitalAddress}
                        onChange={(e) => handleProfileChange("digitalAddress", e.target.value)}
                        placeholder="e.g., GA-123-4567"
                        className="border-gray-200 dark:border-gray-600"
                      />
                    </div>
                  </div>

                  {userRole === "tenant" && (
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Emergency Contact</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                          <Input
                            id="emergencyContact"
                            value={profile.emergencyContact}
                            onChange={(e) => handleProfileChange("emergencyContact", e.target.value)}
                            className="border-gray-200 dark:border-gray-600"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="emergencyPhone"
                              value={profile.emergencyPhone}
                              onChange={(e) => handleProfileChange("emergencyPhone", e.target.value)}
                              className="pl-10 border-gray-200 dark:border-gray-600"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </AnimatedCard>
            )}

            {activeTab === "lease" && userRole === "tenant" && (
              <AnimatedCard delay={200} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Lease Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="unitAddress">Unit Address</Label>
                      <Input
                        id="unitAddress"
                        value={profile.unitAddress}
                        readOnly
                        className="border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="monthlyRent">Monthly Rent</Label>
                      <Input
                        id="monthlyRent"
                        value={`₵${profile.monthlyRent.toLocaleString()}`}
                        readOnly
                        className="border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="leaseStartDate">Lease Start Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="leaseStartDate"
                          type="date"
                          value={profile.leaseStartDate}
                          readOnly
                          className="pl-10 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="leaseEndDate">Lease End Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="leaseEndDate"
                          type="date"
                          value={profile.leaseEndDate}
                          readOnly
                          className="pl-10 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="securityDeposit">Security Deposit</Label>
                    <Input
                      id="securityDeposit"
                      value={`₵${profile.securityDeposit.toLocaleString()} (Paid)`}
                      readOnly
                      className="border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
                    />
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Landlord Contact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="landlordName">Landlord Name</Label>
                        <Input
                          id="landlordName"
                          value={profile.landlordName}
                          readOnly
                          className="border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="landlordPhone">Landlord Phone</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="landlordPhone"
                            value={profile.landlordPhone}
                            readOnly
                            className="pl-10 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="landlordEmail">Landlord Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="landlordEmail"
                            value={profile.landlordEmail}
                            readOnly
                            className="pl-10 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </AnimatedCard>
            )}

            {activeTab === "work" && userRole === "caretaker" && (
              <AnimatedCard delay={200} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Work Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="landlordName">Landlord Name</Label>
                      <Input
                        id="landlordName"
                        value={profile.landlordName}
                        readOnly
                        className="border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Employment Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={profile.startDate}
                        readOnly
                        className="border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="landlordPhone">Landlord Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="landlordPhone"
                          value={profile.landlordPhone}
                          readOnly
                          className="pl-10 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="landlordEmail">Landlord Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="landlordEmail"
                          value={profile.landlordEmail}
                          readOnly
                          className="pl-10 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Assigned Properties</Label>
                    <div className="space-y-2">
                      {profile.assignedProperties.map((property, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600"
                        >
                          <Building2 className="h-5 w-5 text-indigo-600" />
                          <span className="font-medium text-gray-900 dark:text-white">{property}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </AnimatedCard>
            )}

            {/* Business Information - Landlord only */}
            {activeTab === "business" && userRole === "landlord" && (
              <AnimatedCard delay={200} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Business Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name</Label>
                      <Input
                        id="businessName"
                        value={profile.businessName}
                        onChange={(e) => handleProfileChange("businessName", e.target.value)}
                        className="border-gray-200 dark:border-gray-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessRegistration">Business Registration Number</Label>
                      <Input
                        id="businessRegistration"
                        value={profile.businessRegistration}
                        onChange={(e) => handleProfileChange("businessRegistration", e.target.value)}
                        className="border-gray-200 dark:border-gray-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessAddress">Business Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Textarea
                        id="businessAddress"
                        value={profile.businessAddress}
                        onChange={(e) => handleProfileChange("businessAddress", e.target.value)}
                        className="pl-10 border-gray-200 dark:border-gray-600"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="businessPhone">Business Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="businessPhone"
                          value={profile.businessPhone}
                          onChange={(e) => handleProfileChange("businessPhone", e.target.value)}
                          className="pl-10 border-gray-200 dark:border-gray-600"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessEmail">Business Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="businessEmail"
                          type="email"
                          value={profile.businessEmail}
                          onChange={(e) => handleProfileChange("businessEmail", e.target.value)}
                          className="pl-10 border-gray-200 dark:border-gray-600"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </AnimatedCard>
            )}

            {/* Preferences */}
            {activeTab === "preferences" && (
              <AnimatedCard delay={200} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Account Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Select
                          value={profile.language}
                          onValueChange={(value) => handleProfileChange("language", value)}
                        >
                          <SelectTrigger className="pl-10 border-gray-200 dark:border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en-GH">English (Ghana)</SelectItem>
                            <SelectItem value="en-US">English (US)</SelectItem>
                            <SelectItem value="tw">Twi</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Select
                          value={profile.currency}
                          onValueChange={(value) => handleProfileChange("currency", value)}
                        >
                          <SelectTrigger className="pl-10 border-gray-200 dark:border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GHS">Ghana Cedi (₵)</SelectItem>
                            <SelectItem value="USD">US Dollar ($)</SelectItem>
                            <SelectItem value="EUR">Euro (€)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select
                        value={profile.timezone}
                        onValueChange={(value) => handleProfileChange("timezone", value)}
                      >
                        <SelectTrigger className="border-gray-200 dark:border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Africa/Accra">Africa/Accra (GMT)</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </AnimatedCard>
            )}

            {/* Notifications */}
            {activeTab === "notifications" && (
              <AnimatedCard delay={200} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications via email</p>
                      </div>
                      <Switch
                        checked={profile.emailNotifications}
                        onCheckedChange={(checked) => handleProfileChange("emailNotifications", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>SMS Notifications</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications via SMS</p>
                      </div>
                      <Switch
                        checked={profile.smsNotifications}
                        onCheckedChange={(checked) => handleProfileChange("smsNotifications", checked)}
                      />
                    </div>

                    {userRole === "tenant" && (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Rent Reminders</Label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Get notified about upcoming rent payments
                            </p>
                          </div>
                          <Switch
                            checked={profile.rentReminders}
                            onCheckedChange={(checked) => handleProfileChange("rentReminders", checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Lease Updates</Label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Get notified about lease renewals and changes
                            </p>
                          </div>
                          <Switch
                            checked={profile.leaseUpdates}
                            onCheckedChange={(checked) => handleProfileChange("leaseUpdates", checked)}
                          />
                        </div>
                      </>
                    )}

                    {userRole === "landlord" && (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Payment Reminders</Label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Get notified about overdue payments
                            </p>
                          </div>
                          <Switch
                            checked={profile.paymentReminders}
                            onCheckedChange={(checked) => handleProfileChange("paymentReminders", checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Tenant Updates</Label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Get notified about tenant activities
                            </p>
                          </div>
                          <Switch
                            checked={profile.tenantUpdates}
                            onCheckedChange={(checked) => handleProfileChange("tenantUpdates", checked)}
                          />
                        </div>
                      </>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Maintenance Alerts</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Get notified about maintenance requests
                        </p>
                      </div>
                      <Switch
                        checked={profile.maintenanceAlerts}
                        onCheckedChange={(checked) => handleProfileChange("maintenanceAlerts", checked)}
                      />
                    </div>

                    {userRole === "caretaker" && (
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Work Updates</Label>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Get notified about work assignments
                          </p>
                        </div>
                        <Switch
                          checked={profile.workUpdates}
                          onCheckedChange={(checked) => handleProfileChange("workUpdates", checked)}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </AnimatedCard>
            )}

            {/* Security */}
            {activeTab === "security" && (
              <AnimatedCard delay={200} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Two-Factor Authentication</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Switch
                        checked={profile.twoFactorAuth}
                        onCheckedChange={(checked) => handleProfileChange("twoFactorAuth", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Login Alerts</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Get notified when someone logs into your account
                        </p>
                      </div>
                      <Switch
                        checked={profile.loginAlerts}
                        onCheckedChange={(checked) => handleProfileChange("loginAlerts", checked)}
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Password</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Last changed 3 months ago</p>
                        <Button variant="outline" onClick={handleChangePassword} className="bg-transparent">
                          <Key className="h-4 w-4 mr-2" />
                          Change Password
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </AnimatedCard>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
