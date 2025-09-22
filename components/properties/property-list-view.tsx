"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { PropertyModal } from "@/components/property-modal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MapPin, Eye, Edit, Wrench, Users, DollarSign } from "lucide-react"
import type { Property } from "@/lib/types"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { togglePropertySelection } from "@/lib/slices/propertiesSlice"

interface PropertyListViewProps {
  properties: Property[]
}

export function PropertyListView({ properties }: PropertyListViewProps) {
  const dispatch = useAppDispatch()
  const { selectedProperties } = useAppSelector((state) => state.properties)

  const handleSelectionChange = (propertyId: number, checked: boolean) => {
    dispatch(togglePropertySelection(propertyId))
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-200 dark:border-gray-700">
            <TableHead className="w-12">
              <Checkbox />
            </TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Units</TableHead>
            <TableHead>Occupancy</TableHead>
            <TableHead>Revenue</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Health</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.map((property) => {
            const isSelected = selectedProperties.includes(property.id)
            const occupancyRate = Math.round((property.occupied / property.units) * 100)
            const maintenanceTickets = Math.floor(Math.random() * 5)
            const expiringLeases = Math.floor(Math.random() * 3)

            return (
              <TableRow
                key={property.id}
                className={`border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  isSelected ? "bg-indigo-50 dark:bg-indigo-900/20" : ""
                }`}
              >
                <TableCell>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => handleSelectionChange(property.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={property.image || "/placeholder.svg"}
                      alt={property.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{property.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{property.type}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    {property.address}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{property.units}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-2 rounded-full"
                        style={{ width: `${occupancyRate}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{occupancyRate}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">${property.monthlyRevenue.toLocaleString()}</span>
                  </div>
                </TableCell>
                <TableCell>
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
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {maintenanceTickets > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {maintenanceTickets} issues
                      </Badge>
                    )}
                    {expiringLeases > 0 && (
                      <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                        {expiringLeases} expiring
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <PropertyModal
                      property={property}
                      mode="edit"
                      trigger={
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Wrench className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
