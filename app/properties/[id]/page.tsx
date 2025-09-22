"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/localization"
import { Building2, MapPin, Edit, Plus, Eye, UserPlus, Users, Calendar, Phone, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Unit {
  id: string
  name: string
  type: string
  rent: number
  deposit: number
  status: "vacant" | "occupied"
  tenant?: {
    id: string
    name: string
    phone: string
    email: string
    moveInDate: string
  }
}

interface Property {
  id: string
  name: string
  address: string
  gpsAddress: string
  region: string
  type: string
  description: string
  totalUnits: number
  occupiedUnits: number
  monthlyRevenue: number
  units: Unit[]
}

export default function PropertyDetailPage() {
  const params = useParams()
  const propertyId = params.id as string

  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingProperty, setEditingProperty] = useState(false)
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
  const [addingUnit, setAddingUnit] = useState(false)

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockProperty: Property = {
      id: propertyId,
      name: "Sunset Apartments",
      address: "123 Independence Avenue, Accra",
      gpsAddress: "GA-123-4567",
      region: "Greater Accra",
      type: "Apartment Complex",
      description: "Modern apartment complex with 15 units, featuring contemporary amenities and excellent location.",
      totalUnits: 15,
      occupiedUnits: 12,
      monthlyRevenue: 18000,
      units: [
        {
          id: "unit-1",
          name: "A1",
          type: "Bedsitter",
          rent: 800,
          deposit: 1600,
          status: "occupied",
          tenant: {
            id: "tenant-1",
            name: "Kofi Mensah",
            phone: "+233 24 123 4567",
            email: "kofi.mensah@email.com",
            moveInDate: "2024-01-15",
          },
        },
        {
          id: "unit-2",
          name: "A2",
          type: "Chamber & Hall",
          rent: 1200,
          deposit: 2400,
          status: "occupied",
          tenant: {
            id: "tenant-2",
            name: "Ama Serwaa",
            phone: "+233 20 987 6543",
            email: "ama.serwaa@email.com",
            moveInDate: "2023-11-01",
          },
        },
        {
          id: "unit-3",
          name: "B1",
          type: "Bedsitter",
          rent: 800,
          deposit: 1600,
          status: "vacant",
        },
        {
          id: "unit-4",
          name: "B2",
          type: "Chamber & Hall",
          rent: 1200,
          deposit: 2400,
          status: "occupied",
          tenant: {
            id: "tenant-3",
            name: "Kwame Asante",
            phone: "+233 26 555 1234",
            email: "kwame.asante@email.com",
            moveInDate: "2024-02-01",
          },
        },
        {
          id: "unit-5",
          name: "C1",
          type: "One Bedroom",
          rent: 1500,
          deposit: 3000,
          status: "vacant",
        },
      ],
    }

    setTimeout(() => {
      setProperty(mockProperty)
      setLoading(false)
    }, 500)
  }, [propertyId])

  const handleEditProperty = () => {
    setEditingProperty(true)
  }

  const handleSaveProperty = () => {
    setEditingProperty(false)
    // Save property changes
  }

  const handleAddUnit = () => {
    setAddingUnit(true)
  }

  const handleEditUnit = (unit: Unit) => {
    setEditingUnit(unit)
  }

  const handleSaveUnit = () => {
    setEditingUnit(null)
    setAddingUnit(false)
    // Save unit changes
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="p-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!property) {
    return (
      <MainLayout>
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Property Not Found</h1>
          <Link href="/properties">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Properties
            </Button>
          </Link>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/properties">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Properties
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                {property.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                <MapPin className="h-4 w-4" />
                {property.address}
              </p>
            </div>
          </div>
          <Button onClick={handleEditProperty} className="bg-gradient-to-r from-indigo-600 to-cyan-500">
            <Edit className="h-4 w-4 mr-2" />
            Edit Property
          </Button>
        </div>

        {/* Property Information */}
        <Card className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Property Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Total Units</p>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{property.totalUnits}</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Occupied Units</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{property.occupiedUnits}</p>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Vacant Units</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {property.totalUnits - property.occupiedUnits}
                </p>
              </div>
              <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Monthly Revenue</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(property.monthlyRevenue)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ghana Post GPS Address</Label>
                <p className="text-gray-900 dark:text-white mt-1">{property.gpsAddress}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Region</Label>
                <p className="text-gray-900 dark:text-white mt-1">{property.region}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Property Type</Label>
                <p className="text-gray-900 dark:text-white mt-1">{property.type}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Occupancy Rate</Label>
                <p className="text-gray-900 dark:text-white mt-1">
                  {Math.round((property.occupiedUnits / property.totalUnits) * 100)}%
                </p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
              <p className="text-gray-900 dark:text-white mt-1">{property.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Units Management */}
        <Card className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                Units Management
              </CardTitle>
              <Button onClick={handleAddUnit} className="bg-gradient-to-r from-green-600 to-emerald-500">
                <Plus className="h-4 w-4 mr-2" />
                Add Unit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-600">
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Unit</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Rent</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Deposit</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Current Tenant</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {property.units.map((unit) => (
                    <tr
                      key={unit.id}
                      className="border-b border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900 dark:text-white">{unit.name}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-700 dark:text-gray-300">{unit.type}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(unit.rent)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-700 dark:text-gray-300">{formatCurrency(unit.deposit)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          variant={unit.status === "occupied" ? "default" : "secondary"}
                          className={
                            unit.status === "occupied"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                          }
                        >
                          {unit.status === "occupied" ? "Occupied" : "Vacant"}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        {unit.tenant ? (
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{unit.tenant.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {unit.tenant.phone}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Since {new Date(unit.tenant.moveInDate).toLocaleDateString()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">No tenant</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditUnit(unit)}
                            className="min-h-[32px] min-w-[32px] p-1"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="min-h-[32px] min-w-[32px] p-1 bg-transparent">
                            <Eye className="h-3 w-3" />
                          </Button>
                          {unit.status === "vacant" && (
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-blue-600 to-indigo-500 min-h-[32px] px-3"
                            >
                              <UserPlus className="h-3 w-3 mr-1" />
                              Add Tenant
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Edit Property Dialog */}
        <Dialog open={editingProperty} onOpenChange={setEditingProperty}>
          <DialogContent className="max-w-2xl bg-white dark:bg-gray-700">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">Edit Property</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Property Name</Label>
                  <Input id="name" defaultValue={property.name} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="type">Property Type</Label>
                  <Select defaultValue={property.type}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Apartment Complex">Apartment Complex</SelectItem>
                      <SelectItem value="Single Family House">Single Family House</SelectItem>
                      <SelectItem value="Townhouse">Townhouse</SelectItem>
                      <SelectItem value="Commercial Building">Commercial Building</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" defaultValue={property.address} className="mt-1" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gps">Ghana Post GPS Address</Label>
                  <Input id="gps" defaultValue={property.gpsAddress} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="region">Region</Label>
                  <Select defaultValue={property.region}>
                    <SelectTrigger className="mt-1">
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
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" defaultValue={property.description} className="mt-1" />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditingProperty(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProperty} className="bg-gradient-to-r from-indigo-600 to-cyan-500">
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add/Edit Unit Dialog */}
        <Dialog
          open={addingUnit || editingUnit !== null}
          onOpenChange={() => {
            setAddingUnit(false)
            setEditingUnit(null)
          }}
        >
          <DialogContent className="max-w-lg bg-white dark:bg-gray-700">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">
                {addingUnit ? "Add New Unit" : "Edit Unit"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="unitName">Unit Name/Number</Label>
                  <Input
                    id="unitName"
                    defaultValue={editingUnit?.name || ""}
                    placeholder="e.g., A1, B2, 101"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="unitType">Unit Type</Label>
                  <Select defaultValue={editingUnit?.type || ""}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select unit type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bedsitter">Bedsitter</SelectItem>
                      <SelectItem value="Chamber & Hall">Chamber & Hall</SelectItem>
                      <SelectItem value="One Bedroom">One Bedroom</SelectItem>
                      <SelectItem value="Two Bedroom">Two Bedroom</SelectItem>
                      <SelectItem value="Three Bedroom">Three Bedroom</SelectItem>
                      <SelectItem value="Shop/Store">Shop/Store</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rent">Monthly Rent (₵)</Label>
                  <Input
                    id="rent"
                    type="number"
                    defaultValue={editingUnit?.rent || ""}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="deposit">Security Deposit (₵)</Label>
                  <Input
                    id="deposit"
                    type="number"
                    defaultValue={editingUnit?.deposit || ""}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setAddingUnit(false)
                    setEditingUnit(null)
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveUnit} className="bg-gradient-to-r from-green-600 to-emerald-500">
                  {addingUnit ? "Add Unit" : "Save Changes"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
