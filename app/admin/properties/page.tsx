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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Building2, MapPin, Users, DollarSign, Search, UserCheck, Settings } from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import { formatCurrency } from "@/lib/localization"

export default function AdminPropertiesPage() {
  const dispatch = useAppDispatch()
  const { properties } = useAppSelector((state) => state.properties)
  const { users } = useAppSelector((state) => state.users)

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedProperty, setSelectedProperty] = useState<any>(null)

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      searchTerm === "" ||
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || property.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const totalProperties = properties.length
  const activeProperties = properties.filter((p) => p.status === "Active").length
  const totalRevenue = properties.reduce((sum, p) => sum + p.monthlyRevenue, 0)
  const totalUnits = properties.reduce((sum, p) => sum + p.units, 0)

  const getPropertyOwner = (propertyId: number) => {
    // In real app, properties would have ownerId field
    const landlords = users.filter((u) => u.role === "landlord")
    return landlords[propertyId % landlords.length] || { name: "Unassigned", email: "" }
  }

  return (
    <MainLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start animate-in fade-in-0 slide-in-from-top-4 duration-500">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              Property Oversight
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Monitor all properties across the platform and manage landlord assignments.
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <AnimatedCard delay={100} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Properties</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalProperties}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">{activeProperties} active</p>
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Units</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalUnits}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Across all properties</p>
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalRevenue)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Monthly across platform</p>
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Occupancy Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.round((properties.reduce((sum, p) => sum + p.occupied, 0) / totalUnits) * 100)}%
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Platform average</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
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
                placeholder="Search properties by name or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 dark:border-gray-700"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Vacant">Vacant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Properties Table */}
        <AnimatedCard delay={500} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Property Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 dark:border-gray-700">
                  <TableHead>Property</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Occupancy</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProperties.map((property) => {
                  const owner = getPropertyOwner(property.id)
                  const occupancyRate = Math.round((property.occupied / property.units) * 100)

                  return (
                    <TableRow key={property.id} className="border-gray-200 dark:border-gray-700">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-100 to-cyan-100 dark:from-indigo-900 dark:to-cyan-900 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{property.name}</p>
                            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                              <MapPin className="h-3 w-3" />
                              {property.address}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{owner.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{owner.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <p className="font-semibold text-gray-900 dark:text-white">{property.units}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-500">total</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <p className="font-semibold text-gray-900 dark:text-white">{occupancyRate}%</p>
                          <p className="text-sm text-gray-500 dark:text-gray-500">
                            {property.occupied}/{property.units}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">{formatCurrency(property.monthlyRevenue)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={property.status === "Active" ? "default" : "secondary"}
                          className={
                            property.status === "Active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : property.status === "Maintenance"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }
                        >
                          {property.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedProperty(property)}
                                className="min-h-[36px]"
                              >
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Property Details</DialogTitle>
                                <DialogDescription>Complete information for {property.name}</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                      Property Name
                                    </label>
                                    <p className="text-gray-900 dark:text-white">{property.name}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Type</label>
                                    <p className="text-gray-900 dark:text-white">{property.type}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                      Address
                                    </label>
                                    <p className="text-gray-900 dark:text-white">{property.address}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                      Total Units
                                    </label>
                                    <p className="text-gray-900 dark:text-white">{property.units}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                      Occupied Units
                                    </label>
                                    <p className="text-gray-900 dark:text-white">{property.occupied}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                      Monthly Revenue
                                    </label>
                                    <p className="text-gray-900 dark:text-white">
                                      {formatCurrency(property.monthlyRevenue)}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                      Status
                                    </label>
                                    <p className="text-gray-900 dark:text-white">{property.status}</p>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button size="sm" variant="outline" className="min-h-[36px] min-w-[36px] bg-transparent">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
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
