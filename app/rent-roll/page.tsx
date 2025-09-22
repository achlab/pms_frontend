"use client"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedCard } from "@/components/animated-card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Users, Calendar, DollarSign, Search, Download, MapPin, Phone, Mail } from "lucide-react"
import { useAppSelector } from "@/lib/hooks"

// Mock lease data - in real app this would come from a leases slice
const mockLeases = [
  {
    id: 1,
    propertyId: 1,
    tenantId: 1,
    unitNumber: "101",
    rentAmount: 2500,
    leaseStart: "2023-01-01",
    leaseEnd: "2024-01-01",
    securityDeposit: 2500,
    status: "active",
  },
  {
    id: 2,
    propertyId: 1,
    tenantId: 2,
    unitNumber: "102",
    rentAmount: 2300,
    leaseStart: "2023-06-01",
    leaseEnd: "2024-06-01",
    securityDeposit: 2300,
    status: "active",
  },
]

export default function RentRollPage() {
  const { properties } = useAppSelector((state) => state.properties)
  const { users } = useAppSelector((state) => state.users)

  const [searchTerm, setSearchTerm] = useState("")
  const [propertyFilter, setPropertyFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredLeases = mockLeases.filter((lease) => {
    const tenant = users.find((u) => u.id === lease.tenantId)
    const property = properties.find((p) => p.id === lease.propertyId)

    const matchesSearch =
      searchTerm === "" ||
      tenant?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lease.unitNumber.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesProperty = propertyFilter === "all" || lease.propertyId.toString() === propertyFilter
    const matchesStatus = statusFilter === "all" || lease.status === statusFilter

    return matchesSearch && matchesProperty && matchesStatus
  })

  const totalUnits = mockLeases.length
  const occupiedUnits = mockLeases.filter((lease) => lease.status === "active").length
  const totalRent = mockLeases.reduce((sum, lease) => sum + lease.rentAmount, 0)
  const totalDeposits = mockLeases.reduce((sum, lease) => sum + lease.securityDeposit, 0)

  const getPropertyName = (propertyId: number) => {
    const property = properties.find((p) => p.id === propertyId)
    return property?.name || "Unknown Property"
  }

  const getTenantInfo = (tenantId: number) => {
    const tenant = users.find((u) => u.id === tenantId && u.role === "tenant")
    return tenant || { name: "Unknown Tenant", email: "", phone: "" }
  }

  const isLeaseExpiringSoon = (leaseEnd: string) => {
    const endDate = new Date(leaseEnd)
    const today = new Date()
    const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
    return daysUntilExpiry <= 60 && daysUntilExpiry > 0
  }

  return (
    <MainLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start animate-in fade-in-0 slide-in-from-top-4 duration-500">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              Rent Roll
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Master view of all units, tenants, and lease details across your portfolio.
            </p>
          </div>
          <Button className="min-h-[44px]">
            <Download className="h-4 w-4 mr-2" />
            Export Rent Roll
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <AnimatedCard delay={100} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Units</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalUnits}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">{occupiedUnits} occupied</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={200} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Occupancy Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.round((occupiedUnits / totalUnits) * 100)}%
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">{totalUnits - occupiedUnits} vacant</p>
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Rent</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalRent.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    ${Math.round(totalRent / totalUnits).toLocaleString()} avg/unit
                  </p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-emerald-100 to-cyan-100 dark:from-emerald-900 dark:to-cyan-900 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={400} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Security Deposits</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalDeposits.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Total held</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-300">
          <div className="flex gap-4 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tenants, properties, or units..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 dark:border-gray-700"
              />
            </div>
            <Select value={propertyFilter} onValueChange={setPropertyFilter}>
              <SelectTrigger className="w-[180px] border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="All Properties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id.toString()}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="vacant">Vacant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Rent Roll Table */}
        <AnimatedCard delay={500} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Rent Roll Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 dark:border-gray-700">
                  <TableHead>Property</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Rent</TableHead>
                  <TableHead>Lease Term</TableHead>
                  <TableHead>Deposit</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeases.map((lease) => {
                  const tenant = getTenantInfo(lease.tenantId)
                  const property = properties.find((p) => p.id === lease.propertyId)
                  const isExpiring = isLeaseExpiringSoon(lease.leaseEnd)

                  return (
                    <TableRow key={lease.id} className="border-gray-200 dark:border-gray-700">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {getPropertyName(lease.propertyId)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {property?.address}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {lease.unitNumber}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white">{tenant.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                            <Mail className="h-3 w-3" />
                            {tenant.email || "No email"}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                            <Phone className="h-3 w-3" />
                            {tenant.phone || "No phone"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">${lease.rentAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm">
                            {new Date(lease.leaseStart).toLocaleDateString()} -{" "}
                            {new Date(lease.leaseEnd).toLocaleDateString()}
                          </p>
                          {isExpiring && (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                              Expiring Soon
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">${lease.securityDeposit.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant={lease.status === "active" ? "default" : "secondary"}
                          className={
                            lease.status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : ""
                          }
                        >
                          {lease.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </AnimatedCard>
      </div>
    </MainLayout>
  )
}
