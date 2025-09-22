"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { createProperty, updateProperty } from "@/lib/slices/propertiesSlice"
import type { Property } from "@/lib/types"
import { GHANA_REGIONS, GHANA_PROPERTY_TYPES } from "@/lib/localization"
import { Plus, Loader2, MapPin } from "lucide-react"

interface PropertyModalProps {
  property?: Property
  trigger?: React.ReactNode
  mode?: "create" | "edit"
}

export function PropertyModal({ property, trigger, mode = "create" }: PropertyModalProps) {
  const dispatch = useAppDispatch()
  const { loading } = useAppSelector((state) => state.properties)

  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: property?.name || "",
    address: property?.address || "",
    gpsAddress: property?.gpsAddress || "", // Added Ghana Post GPS address field
    region: property?.region || "", // Added Ghana region field
    type: property?.type || "",
    units: property?.units || 1,
    occupied: property?.occupied || 0,
    monthlyRevenue: property?.monthlyRevenue || 0,
    bedrooms: property?.bedrooms || "",
    bathrooms: property?.bathrooms || "",
    sqft: property?.sqft || "",
    status: property?.status || ("Active" as const),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (mode === "edit" && property) {
        await dispatch(updateProperty({ id: property.id, updates: formData })).unwrap()
      } else {
        await dispatch(createProperty(formData)).unwrap()
      }
      setOpen(false)
      // Reset form for create mode
      if (mode === "create") {
        setFormData({
          name: "",
          address: "",
          gpsAddress: "",
          region: "",
          type: "",
          units: 1,
          occupied: 0,
          monthlyRevenue: 0,
          bedrooms: "",
          bathrooms: "",
          sqft: "",
          status: "Active",
        })
      }
    } catch (error) {
      console.error("Failed to save property:", error)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-200 hover:scale-105 min-h-[44px]">
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 animate-in fade-in-0 zoom-in-95 duration-200 flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <DialogTitle className="text-gray-900 dark:text-white">
            {mode === "edit" ? "Edit Property" : "Add New Property"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-6" id="property-form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
                  Property Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., Sunset Apartments"
                  className="border-gray-200 dark:border-gray-700 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 min-h-[44px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-gray-700 dark:text-gray-300">
                  Property Type
                </Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                  <SelectTrigger className="border-gray-200 dark:border-gray-700 min-h-[44px]">
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    {GHANA_PROPERTY_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="region" className="text-gray-700 dark:text-gray-300">
                Ghana Region
              </Label>
              <Select value={formData.region} onValueChange={(value) => handleInputChange("region", value)}>
                <SelectTrigger className="border-gray-200 dark:border-gray-700 min-h-[44px]">
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

            <div className="space-y-2">
              <Label htmlFor="address" className="text-gray-700 dark:text-gray-300">
                Street Address
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Enter full street address (e.g., House No. 123, Osu Street, Accra)"
                className="border-gray-200 dark:border-gray-700 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 min-h-[44px]"
                rows={2}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gpsAddress" className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Ghana Post GPS Address (Optional)
              </Label>
              <Input
                id="gpsAddress"
                value={formData.gpsAddress}
                onChange={(e) => handleInputChange("gpsAddress", e.target.value)}
                placeholder="e.g., GA-123-4567"
                className="border-gray-200 dark:border-gray-700 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 min-h-[44px]"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ghana Post GPS digital address for precise location
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="units" className="text-gray-700 dark:text-gray-300">
                  Total Units
                </Label>
                <Input
                  id="units"
                  type="number"
                  value={formData.units}
                  onChange={(e) => handleInputChange("units", Number.parseInt(e.target.value) || 0)}
                  min="1"
                  className="border-gray-200 dark:border-gray-700 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 min-h-[44px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="occupied" className="text-gray-700 dark:text-gray-300">
                  Occupied Units
                </Label>
                <Input
                  id="occupied"
                  type="number"
                  value={formData.occupied}
                  onChange={(e) => handleInputChange("occupied", Number.parseInt(e.target.value) || 0)}
                  min="0"
                  max={formData.units}
                  className="border-gray-200 dark:border-gray-700 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 min-h-[44px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="revenue" className="text-gray-700 dark:text-gray-300">
                  Monthly Revenue (₵)
                </Label>
                <Input
                  id="revenue"
                  type="number"
                  value={formData.monthlyRevenue}
                  onChange={(e) => handleInputChange("monthlyRevenue", Number.parseInt(e.target.value) || 0)}
                  min="0"
                  placeholder="0"
                  className="border-gray-200 dark:border-gray-700 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 min-h-[44px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-gray-700 dark:text-gray-300">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "Active" | "Maintenance" | "Vacant") => handleInputChange("status", value)}
                >
                  <SelectTrigger className="border-gray-200 dark:border-gray-700 min-h-[44px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Maintenance">Under Maintenance</SelectItem>
                    <SelectItem value="Vacant">Vacant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedrooms" className="text-gray-700 dark:text-gray-300">
                  Bedrooms
                </Label>
                <Input
                  id="bedrooms"
                  value={formData.bedrooms}
                  onChange={(e) => handleInputChange("bedrooms", e.target.value)}
                  placeholder="e.g., 1-3 or Mixed"
                  className="border-gray-200 dark:border-gray-700 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 min-h-[44px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bathrooms" className="text-gray-700 dark:text-gray-300">
                  Bathrooms
                </Label>
                <Input
                  id="bathrooms"
                  value={formData.bathrooms}
                  onChange={(e) => handleInputChange("bathrooms", e.target.value)}
                  placeholder="e.g., 1-2 or Shared"
                  className="border-gray-200 dark:border-gray-700 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 min-h-[44px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sqft" className="text-gray-700 dark:text-gray-300">
                  Size (sq ft)
                </Label>
                <Input
                  id="sqft"
                  value={formData.sqft}
                  onChange={(e) => handleInputChange("sqft", e.target.value)}
                  placeholder="e.g., 400-800"
                  className="border-gray-200 dark:border-gray-700 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 min-h-[44px]"
                />
              </div>
            </div>
          </form>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 min-h-[44px]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="property-form"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {mode === "edit" ? "Updating..." : "Creating..."}
              </>
            ) : mode === "edit" ? (
              "Update Property"
            ) : (
              "Create Property"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
