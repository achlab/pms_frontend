"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { AnimatedCard } from "@/components/animated-card"
import { PropertyModal } from "@/components/property-modal"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Eye,
  Edit,
  Wrench,
  Calendar,
  Users,
  Settings,
  AlertTriangle,
  FileText,
} from "lucide-react"
import type { Property } from "@/lib/types"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { togglePropertySelection } from "@/lib/slices/propertiesSlice"
import { formatCurrency } from "@/lib/localization"

interface PropertyCardProps {
  property: Property
  index: number
}

export function PropertyCard({ property, index }: PropertyCardProps) {
  const dispatch = useAppDispatch()
  const { selectedProperties } = useAppSelector((state) => state.properties)
  const isSelected = selectedProperties.includes(property.id)
  const [showDetails, setShowDetails] = useState(false)

  const handleSelectionChange = (checked: boolean) => {
    dispatch(togglePropertySelection(property.id))
  }

  const handleMaintenanceRequest = () => {
    // In a real app, this would open a maintenance request modal
    alert(`Opening maintenance request for ${property.name}`)
  }

  const handlePropertySettings = () => {
    // In a real app, this would open property settings
    alert(`Opening settings for ${property.name}`)
  }

  const handleViewReports = () => {
    // In a real app, this would show property reports
    alert(`Viewing reports for ${property.name}`)
  }

  // Mock health data - in real app this would come from maintenance/lease slices
  const maintenanceTickets = Math.floor(Math.random() * 5)
  const expiringLeases = Math.floor(Math.random() * 3)

  return (
    <AnimatedCard
      delay={500 + index * 100}
      className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 overflow-hidden group relative"
    >
      {/* Selection Checkbox */}
      <div className="absolute top-4 left-4 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={handleSelectionChange}
          className="bg-white/90 backdrop-blur-sm border-gray-300"
        />
      </div>

      <div className="relative overflow-hidden">
        <img
          src={property.image || "/placeholder.svg"}
          alt={property.name}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-4 right-4">
          <Badge
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
        </div>

        {/* Health Badges */}
        <div className="absolute bottom-4 left-4 flex gap-2">
          {maintenanceTickets > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1 text-xs">
              <Wrench className="h-3 w-3" />
              {maintenanceTickets}
            </Badge>
          )}
          {expiringLeases > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1 text-xs bg-orange-100 text-orange-800">
              <Calendar className="h-3 w-3" />
              {expiringLeases}
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{property.name}</h3>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              {property.address}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{property.type}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">{property.bedrooms} bed</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">{property.bathrooms} bath</span>
            </div>
            <div className="flex items-center gap-1">
              <Square className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">{property.sqft} sqft</span>
            </div>
          </div>

          {/* Occupancy Info */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {property.occupied}/{property.units} units occupied
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {Math.round((property.occupied / property.units) * 100)}% occupied
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-600">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Revenue</p>
              <p className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                {formatCurrency(property.monthlyRevenue)}
              </p>
            </div>
            <div className="flex gap-2">
              <Dialog open={showDetails} onOpenChange={setShowDetails}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-200 dark:border-gray-600 bg-transparent transition-all duration-200 hover:scale-110 min-h-[44px] min-w-[44px]"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-gray-900 dark:text-gray-100">Property Details</DialogTitle>
                    <DialogDescription className="text-gray-600 dark:text-gray-300">
                      Complete information for {property.name}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Property Name</label>
                        <p className="text-gray-900 dark:text-gray-100 mt-1">{property.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                        <p className="text-gray-900 dark:text-gray-100 mt-1">{property.type}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                        <p className="text-gray-900 dark:text-gray-100 mt-1">{property.address}</p>
                      </div>
                      {property.region && (
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Region</label>
                          <p className="text-gray-900 dark:text-gray-100 mt-1">{property.region}</p>
                        </div>
                      )}
                      {property.gpsAddress && (
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">GPS Address</label>
                          <p className="text-gray-900 dark:text-gray-100 mt-1">{property.gpsAddress}</p>
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Units</label>
                        <p className="text-gray-900 dark:text-gray-100 mt-1">{property.units}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Occupied Units</label>
                        <p className="text-gray-900 dark:text-gray-100 mt-1">{property.occupied}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Revenue</label>
                        <p className="text-gray-900 dark:text-gray-100 mt-1">
                          {formatCurrency(property.monthlyRevenue)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                        <p className="text-gray-900 dark:text-gray-100 mt-1">{property.status}</p>
                      </div>
                    </div>
                    {/* Health Information */}
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Property Health</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Wrench className="h-4 w-4 text-orange-500" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {maintenanceTickets} maintenance tickets
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {expiringLeases} expiring leases
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <PropertyModal
                property={property}
                mode="edit"
                trigger={
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-200 dark:border-gray-600 bg-transparent transition-all duration-200 hover:scale-110 min-h-[44px] min-w-[44px]"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                }
              />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-110 min-h-[44px] min-w-[44px]"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 shadow-lg z-50"
                  sideOffset={5}
                >
                  <DropdownMenuItem
                    onClick={handleMaintenanceRequest}
                    className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Report Maintenance
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleViewReports}
                    className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Reports
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handlePropertySettings}
                    className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Property Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </AnimatedCard>
  )
}
