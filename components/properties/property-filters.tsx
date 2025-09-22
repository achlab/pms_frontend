"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { setFilters } from "@/lib/slices/propertiesSlice"

export function PropertyFilters() {
  const dispatch = useAppDispatch()
  const { filters } = useAppSelector((state) => state.properties)

  const handleSearchChange = (value: string) => {
    dispatch(setFilters({ search: value }))
  }

  const handleStatusChange = (value: string) => {
    dispatch(setFilters({ status: value }))
  }

  const handleLocationChange = (value: string) => {
    dispatch(setFilters({ location: value }))
  }

  const handleMinRevenueChange = (value: string) => {
    dispatch(setFilters({ minRevenue: Number.parseInt(value) || 0 }))
  }

  const clearFilters = () => {
    dispatch(setFilters({ search: "", status: "all", location: "all", minRevenue: 0 }))
  }

  const hasActiveFilters =
    filters.search || filters.status !== "all" || filters.location !== "all" || filters.minRevenue > 0

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search properties..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 border-gray-200 dark:border-gray-700 transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Status Filter */}
        <Select value={filters.status} onValueChange={handleStatusChange}>
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

        {/* Location Filter */}
        <Select value={filters.location} onValueChange={handleLocationChange}>
          <SelectTrigger className="w-[140px] border-gray-200 dark:border-gray-700">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="downtown">Downtown</SelectItem>
            <SelectItem value="suburbs">Suburbs</SelectItem>
            <SelectItem value="waterfront">Waterfront</SelectItem>
          </SelectContent>
        </Select>

        {/* Min Revenue Filter */}
        <Input
          type="number"
          placeholder="Min Revenue"
          value={filters.minRevenue || ""}
          onChange={(e) => handleMinRevenueChange(e.target.value)}
          className="w-[140px] border-gray-200 dark:border-gray-700"
        />

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="border-gray-200 dark:border-gray-700 bg-transparent"
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
