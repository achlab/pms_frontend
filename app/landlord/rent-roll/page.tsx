"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedCard } from "@/components/animated-card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Building2,
  Users,
  Calendar,
  DollarSign,
  Search,
  Download,
  MapPin,
  Phone,
  Mail,
  Loader2,
} from "lucide-react"
import { useRentRoll, useRentRollSummary } from "@/lib/hooks/use-rent-roll"
import type { RentRollEntry, RentRollLease } from "@/lib/api-types"

const PER_PAGE = 20

export default function RentRollPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "tenant" | "caretaker">("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)

  const { data: summaryResponse, isLoading: summaryLoading } = useRentRollSummary()
  const summary = useMemo(() => {
    if (!summaryResponse) return null
    if ("data" in summaryResponse && summaryResponse.data) {
      return summaryResponse.data
    }
    return summaryResponse as any
  }, [summaryResponse])

  const rentRollParams = useMemo(
    () => ({
      page,
      per_page: PER_PAGE,
      search: searchTerm || undefined,
      type: typeFilter === "all" ? undefined : typeFilter,
      status: statusFilter === "all" ? undefined : statusFilter,
    }),
    [page, searchTerm, statusFilter, typeFilter]
  )

  const {
    data: rentRollResponse,
    isLoading: entriesLoading,
    isFetching: entriesFetching,
  } = useRentRoll(rentRollParams)

  const entries: RentRollEntry[] = useMemo(() => {
    if (!rentRollResponse) return []
    if (Array.isArray(rentRollResponse.data)) return rentRollResponse.data
    if (Array.isArray((rentRollResponse as any)?.data?.data)) {
      return (rentRollResponse as any).data.data
    }
    return []
  }, [rentRollResponse])

  const pagination = useMemo(() => {
    if (!rentRollResponse) return undefined
    if (rentRollResponse.meta) return rentRollResponse.meta
    if ((rentRollResponse as any)?.data?.meta) return (rentRollResponse as any).data.meta
    return undefined
  }, [rentRollResponse])

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setPage(1)
  }

  const handleTypeChange = (value: "all" | "tenant" | "caretaker") => {
    setTypeFilter(value)
    setPage(1)
  }

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    setPage(1)
  }

  const getPrimaryLease = (entry: RentRollEntry): RentRollLease | null => {
    if (!entry.leases || entry.leases.length === 0) return null
    return entry.leases.find((lease) => lease.is_primary) ?? entry.leases[0]
  }

  const formatLeaseTerm = (lease?: RentRollLease | null) => {
    if (!lease?.lease_start || !lease?.lease_end) return "—"
    return `${new Date(lease.lease_start).toLocaleDateString()} - ${new Date(lease.lease_end).toLocaleDateString()}`
  }

  const formatCurrencyValue = (amount?: number | null) => {
    if (typeof amount !== "number") return "—"
    return `GHS ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start animate-in fade-in-0 slide-in-from-top-4 duration-500">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
            Rent Roll
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Master view of all tenants, caretakers, and lease details across your portfolio.
          </p>
        </div>
        <Button className="min-h-[44px]" disabled>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Records</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summaryLoading ? "…" : summary?.total_records ?? 0}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  {summaryLoading ? "…" : `${summary?.total_tenants ?? 0} tenants, ${summary?.total_caretakers ?? 0} caretakers`}
                </p>
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
                  {summaryLoading ? "…" : `${Math.round(summary?.occupancy_rate ?? 0)}%`}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  {summaryLoading ? "…" : `${summary?.active_leases ?? 0} active leases`}
                </p>
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
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summaryLoading ? "…" : formatCurrencyValue(summary?.monthly_rent)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  {summaryLoading ? "…" : `${summary?.expiring_leases_30_days ?? 0} expiring this month`}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Coverage</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summaryLoading ? "…" : summary?.properties_without_caretakers ?? 0}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">Properties without caretakers</p>
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
        <div className="flex gap-4 flex-1 max-w-3xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tenants, caretakers, properties..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 border-gray-200 dark:border-gray-700"
            />
          </div>
          <Select value={typeFilter} onValueChange={(value: "all" | "tenant" | "caretaker") => handleTypeChange(value)}>
            <SelectTrigger className="w-[160px] border-gray-200 dark:border-gray-700">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="tenant">Tenants</SelectItem>
              <SelectItem value="caretaker">Caretakers</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(value) => handleStatusChange(value)}>
            <SelectTrigger className="w-[160px] border-gray-200 dark:border-gray-700">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="vacated">Vacated</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {entriesFetching && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Refreshing
          </div>
        )}
      </div>

      {/* Rent Roll Table */}
      <AnimatedCard delay={500} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Rent Roll Details</CardTitle>
        </CardHeader>
        <CardContent>
          {entriesLoading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Loading rent roll…
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">No records match your filters.</div>
          ) : (
            <>
              <Table>
              <TableHeader>
                <TableRow className="border-gray-200 dark:border-gray-700">
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Property / Unit</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Rent / Workload</TableHead>
                  <TableHead>Term / Assignment</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => {
                  const primaryLease = getPrimaryLease(entry)
                  const primaryAssignment = entry.assignments?.[0]
                  return (
                    <TableRow key={`${entry.type}-${entry.id}`} className="border-gray-200 dark:border-gray-700">
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{entry.name}</p>
                          {entry.bio && (
                            <p className="text-xs text-muted-foreground line-clamp-1">{entry.bio}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {entry.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {entry.type === "tenant" && primaryLease ? (
                          <div>
                            <p className="font-medium">{primaryLease.property.name}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {primaryLease.property.address || "—"}
                            </p>
                            {primaryLease.unit && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                Unit {primaryLease.unit.unit_number}
                              </Badge>
                            )}
                          </div>
                        ) : entry.type === "caretaker" && primaryAssignment ? (
                          <div>
                            <p className="font-medium">{primaryAssignment.property.name}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {primaryAssignment.property.address || "—"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {entry.assignments?.length ?? 0} properties
                            </p>
                          </div>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {entry.email || "No email"}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {entry.phone || "No phone"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {entry.type === "tenant"
                          ? formatCurrencyValue(primaryLease?.rent_amount ?? entry.statistics?.monthly_rent)
                          : `${entry.statistics?.total_units ?? 0} units`}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          {entry.type === "tenant" ? (
                            <>
                              <p>{formatLeaseTerm(primaryLease)}</p>
                              {primaryLease?.status && (
                                <Badge variant="secondary" className="text-xs capitalize">
                                  {primaryLease.status}
                                </Badge>
                              )}
                            </>
                          ) : (
                            <>
                              <p>
                                Assigned since{" "}
                                {primaryAssignment?.assigned_since
                                  ? new Date(primaryAssignment.assigned_since).toLocaleDateString()
                                  : "—"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {entry.assignments?.length ?? 0} properties
                              </p>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={entry.status === "active" ? "default" : "outline"}
                          className="capitalize"
                        >
                          {entry.status || "unknown"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
              </Table>
              {pagination && (
                <div className="flex items-center justify-between mt-6 text-sm text-muted-foreground">
                  <div>
                    Page {pagination.current_page} of {pagination.last_page ?? pagination.current_page}
                  </div>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.current_page <= 1}
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.current_page >= (pagination.last_page ?? pagination.current_page)}
                      onClick={() =>
                        setPage((prev) =>
                          pagination.last_page ? Math.min(prev + 1, pagination.last_page) : prev + 1
                        )
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </AnimatedCard>
    </div>
  )
}
