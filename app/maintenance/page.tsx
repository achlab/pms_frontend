"use client"

import type React from "react"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import { AnimatedCard } from "@/components/animated-card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Wrench,
  Clock,
  CheckCircle,
  Calendar,
  MessageSquare,
  Camera,
  AlertCircle,
  User,
  MapPin,
  Phone,
  Mail,
  Loader2
} from "lucide-react"
import { formatDate } from "@/lib/localization"
import { toast } from "@/hooks/use-toast"
import {
  useCaretakerMaintenanceRequests,
  useCaretakerStatistics,
  useUpdateMaintenanceStatus
} from "@/lib/hooks/use-caretaker-maintenance"

export default function CaretakerMaintenancePage() {
  const { user } = useAuth()
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [updateData, setUpdateData] = useState({
    status: "",
    message: ""
  })

  // Fetch maintenance requests from API
  const {
    data: requestsData,
    isLoading: requestsLoading,
    error: requestsError
  } = useCaretakerMaintenanceRequests({}, { enabled: true })

  // Fetch statistics from API
  const {
    data: statsData,
    isLoading: statsLoading
  } = useCaretakerStatistics({ enabled: true })

  // Update status mutation
  const updateStatusMutation = useUpdateMaintenanceStatus({
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Maintenance request status has been updated successfully",
      })
      setShowUpdateDialog(false)
      setSelectedRequest(null)
      setUpdateData({ status: "", message: "" })
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update maintenance request status",
        variant: "destructive",
      })
    }
  })

  // Get maintenance requests from API response
  const maintenanceRequests = requestsData?.data || []

  const handleUpdateStatus = (request: any) => {
    setSelectedRequest(request)
    setUpdateData({
      status: request.status,
      message: ""
    })
    setShowUpdateDialog(true)
  }

  const handleSubmitUpdate = () => {
    if (!selectedRequest || !updateData.status) return

    updateStatusMutation.mutate({
      requestId: selectedRequest.id,
      data: {
        status: updateData.status,
        note: updateData.message || undefined,
      }
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "in progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "assigned":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "pending":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "medium":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const activeRequests = maintenanceRequests.filter((r) => r.status !== "resolved" && r.status !== "closed")
  const completedRequests = maintenanceRequests.filter((r) => r.status === "resolved" || r.status === "closed")

  return (
    <MainLayout>
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              Maintenance Requests
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage and track maintenance requests assigned to your properties.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <AnimatedCard className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Requests</p>
                  <p className="text-2xl font-bold">
                    {statsLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      statsData?.data?.total || 0
                    )}
                  </p>
                </div>
                <Wrench className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">In Progress</p>
                  <p className="text-2xl font-bold">
                    {statsLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      statsData?.data?.by_status?.in_progress || 0
                    )}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-200" />
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Completed</p>
                  <p className="text-2xl font-bold">
                    {statsLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      statsData?.data?.by_status?.resolved || 0
                    )}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Assigned</p>
                  <p className="text-2xl font-bold">
                    {statsLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      statsData?.data?.by_status?.assigned || 0
                    )}
                  </p>
                </div>
                <User className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Requests Tabs */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Active Requests ({activeRequests.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Completed ({completedRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {requestsLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Loading maintenance requests...</p>
              </div>
            ) : requestsError ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-500 dark:text-red-400">
                  Failed to load maintenance requests. Please try again.
                </p>
              </div>
            ) : activeRequests.length === 0 ? (
              <div className="text-center py-12">
                <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No active maintenance requests assigned to you.</p>
              </div>
            ) : (
              activeRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  getStatusColor={getStatusColor}
                  getPriorityColor={getPriorityColor}
                  onUpdateStatus={handleUpdateStatus}
                  isCaretaker={true}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {requestsLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Loading maintenance requests...</p>
              </div>
            ) : requestsError ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-500 dark:text-red-400">
                  Failed to load maintenance requests. Please try again.
                </p>
              </div>
            ) : completedRequests.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No completed requests yet.</p>
              </div>
            ) : (
              completedRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  getStatusColor={getStatusColor}
                  getPriorityColor={getPriorityColor}
                  onUpdateStatus={handleUpdateStatus}
                  isCaretaker={true}
                />
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Update Status Dialog */}
        <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Update Request Status
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={updateData.status}
                  onValueChange={(value) => setUpdateData({ ...updateData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Assigned">Assigned</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Update Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Add a note about this update..."
                  value={updateData.message}
                  onChange={(e) => setUpdateData({ ...updateData, message: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowUpdateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitUpdate} disabled={!updateData.status}>
                  Update Status
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}

function RequestCard({
  request,
  getStatusColor,
  getPriorityColor,
  onUpdateStatus,
  isCaretaker = false
}: {
  request: any
  getStatusColor: (status: string) => string
  getPriorityColor: (priority: string) => string
  onUpdateStatus: (request: any) => void
  isCaretaker?: boolean
}) {
  const [showUpdates, setShowUpdates] = useState(false)

  return (
    <AnimatedCard className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Request Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{request.title}</h3>
                <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                <Badge className={getPriorityColor(request.priority)}>{request.priority}</Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-3">{request.description}</p>

              {/* Tenant and Property Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Tenant Information</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <User className="h-4 w-4" />
                      <span>{request.tenant?.name || "N/A"}</span>
                    </div>
                    {request.tenant?.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="h-4 w-4" />
                        <span>{request.tenant.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Property Information</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4" />
                      <span>{request.property?.name || "N/A"}</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {request.unit && <span className="font-medium">Unit: {request.unit.unit_number}</span>}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {request.property?.address}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Submitted: {formatDate(request.created_at)}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Last Update: {formatDate(request.updated_at)}
                </div>
              </div>
            </div>
            {request.media && request.media.length > 0 && (
              <div className="ml-4">
                <img
                  src={request.media[0].url || "/placeholder.svg"}
                  alt="Maintenance issue"
                  className="w-24 h-24 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          {/* Request Details */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Category</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{request.category?.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Request ID</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">#{request.request_number || request.id}</p>
            </div>
          </div>

          {/* Action Buttons for Caretakers */}
          {isCaretaker && request.status !== "Completed" && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateStatus(request)}
                className="flex-1"
              >
                Update Status
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUpdates(!showUpdates)}
                className="flex-1"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {showUpdates ? "Hide" : "Show"} Updates ({request.updates.length})
              </Button>
            </div>
          )}

          {/* Updates Section */}
          {(showUpdates || !isCaretaker) && (
            <div className="space-y-2">
              {!isCaretaker && (
                <Button variant="outline" size="sm" onClick={() => setShowUpdates(!showUpdates)} className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {showUpdates ? "Hide" : "Show"} Updates ({request.updates.length})
                </Button>
              )}

              {showUpdates && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {request.updates.map((update: any) => (
                    <div key={update.id} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-start justify-between">
                        <p className="text-sm text-gray-900 dark:text-white">{update.message}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">From: {update.from}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(update.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </AnimatedCard>
  )
}
