"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
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
  Loader2,
  UserCheck,
  XCircle
} from "lucide-react"
import { AcceptAssignmentModal } from "@/components/maintenance/accept-assignment-modal"
import { StartWorkModal } from "@/components/maintenance/start-work-modal"
import { CompleteWorkModal } from "@/components/maintenance/complete-work-modal"
import { formatDate } from "@/lib/localization"
import { toast } from "@/hooks/use-toast"
import {
  useCaretakerMaintenanceRequests,
  useCaretakerStatistics,
  useUpdateMaintenanceStatus
} from "@/lib/hooks/use-caretaker-maintenance"

export default function MaintenancePage() {
  const { user } = useAuth()
  const router = useRouter()

  // Role-specific redirects
  useEffect(() => {
    if (user?.role === "landlord") {
      router.replace("/landlord/maintenance")
    }
    if (user?.role === "super_admin") {
      router.replace("/admin/maintenance")
    }
  }, [user, router])
  
  // Prevent rendering this page for landlord/super admin while redirecting
  if (user?.role === "landlord" || user?.role === "super_admin") {
    return null
  }

  // If tenant, redirect to tenant maintenance page component
  if (user?.role === "tenant") {
    // Dynamically import tenant page to avoid circular dependencies
    const TenantMaintenancePage = require("./page-tenant").default;
    return <TenantMaintenancePage />;
  }
  
  // Otherwise, show caretaker maintenance page
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [showAcceptModal, setShowAcceptModal] = useState(false)
  const [showStartWorkModal, setShowStartWorkModal] = useState(false)
  const [showCompleteWorkModal, setShowCompleteWorkModal] = useState(false)
  const [acceptRequest, setAcceptRequest] = useState<any>(null)
  const [startWorkRequest, setStartWorkRequest] = useState<any>(null)
  const [completeWorkRequest, setCompleteWorkRequest] = useState<any>(null)
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

  const handleAcceptAssignment = (request: any) => {
    setAcceptRequest(request)
    setShowAcceptModal(true)
  }

  const handleAcceptSuccess = () => {
    // Refetch requests after accepting
    // The hook should handle this automatically
    setShowAcceptModal(false)
    setAcceptRequest(null)
  }

  const handleStartWork = (request: any) => {
    setStartWorkRequest(request)
    setShowStartWorkModal(true)
  }

  const handleStartWorkSuccess = () => {
    setShowStartWorkModal(false)
    setStartWorkRequest(null)
  }

  const handleCompleteWork = (request: any) => {
    setCompleteWorkRequest(request)
    setShowCompleteWorkModal(true)
  }

  const handleCompleteWorkSuccess = () => {
    setShowCompleteWorkModal(false)
    setCompleteWorkRequest(null)
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

  // Filter requests based on new workflow statuses
  const activeRequests = maintenanceRequests.filter((r) => 
    !["resolved", "closed", "cancelled", "rejected"].includes(r.status)
  );
  const completedRequests = maintenanceRequests.filter((r) => 
    ["resolved", "closed", "completed"].includes(r.status)
  );
  // Get assigned requests (waiting for acceptance) - assigned to current user
  const assignedRequests = maintenanceRequests.filter((r) => 
    r.status === "assigned" && 
    (r.assigned_to_id === user?.id || r.assigned_to?.id === user?.id)
  );
  // Get rework required requests (assigned to current user)
  const reworkRequests = maintenanceRequests.filter((r) => 
    r.status === "rework_required" && 
    (r.assigned_to_id === user?.id || r.assigned_to?.id === user?.id)
  );

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
        <Tabs defaultValue="assigned" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="assigned" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              New Assignments ({assignedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="rework" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Rework Required ({reworkRequests.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              In Progress ({activeRequests.filter(r => r.status === "in_progress").length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Completed ({completedRequests.length})
            </TabsTrigger>
          </TabsList>

          {/* New Assignments Tab */}
          <TabsContent value="assigned" className="space-y-4">
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
            ) : assignedRequests.length === 0 ? (
              <div className="text-center py-12">
                <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No new assignments waiting for your response.</p>
              </div>
            ) : (
              assignedRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  getStatusColor={getStatusColor}
                  getPriorityColor={getPriorityColor}
                  onUpdateStatus={handleUpdateStatus}
                  onAcceptAssignment={handleAcceptAssignment}
                  onStartWork={handleStartWork}
                  onCompleteWork={handleCompleteWork}
                  isCaretaker={true}
                />
              ))
            )}
          </TabsContent>

          {/* Rework Required Tab */}
          <TabsContent value="rework" className="space-y-4">
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
            ) : reworkRequests.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No rework required requests.</p>
              </div>
            ) : (
              reworkRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  getStatusColor={getStatusColor}
                  getPriorityColor={getPriorityColor}
                  onUpdateStatus={handleUpdateStatus}
                  onStartWork={handleStartWork}
                  onCompleteWork={handleCompleteWork}
                  isCaretaker={true}
                />
              ))
            )}
          </TabsContent>

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
            ) : activeRequests.filter(r => r.status === "in_progress").length === 0 ? (
              <div className="text-center py-12">
                <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No active maintenance requests in progress.</p>
              </div>
            ) : (
              activeRequests.filter(r => r.status === "in_progress").map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  getStatusColor={getStatusColor}
                  getPriorityColor={getPriorityColor}
                  onUpdateStatus={handleUpdateStatus}
                  onStartWork={handleStartWork}
                  onCompleteWork={handleCompleteWork}
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
                  onStartWork={handleStartWork}
                  onCompleteWork={handleCompleteWork}
                  isCaretaker={true}
                />
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Accept Assignment Modal */}
        {showAcceptModal && acceptRequest && (
          <AcceptAssignmentModal
            isOpen={showAcceptModal}
            onClose={() => {
              setShowAcceptModal(false)
              setAcceptRequest(null)
            }}
            maintenanceRequest={acceptRequest}
            onSuccess={handleAcceptSuccess}
          />
        )}

        {/* Start Work Modal */}
        {showStartWorkModal && startWorkRequest && (
          <StartWorkModal
            isOpen={showStartWorkModal}
            onClose={() => {
              setShowStartWorkModal(false)
              setStartWorkRequest(null)
            }}
            maintenanceRequest={startWorkRequest}
            onSuccess={handleStartWorkSuccess}
          />
        )}

        {/* Complete Work Modal */}
        {showCompleteWorkModal && completeWorkRequest && (
          <CompleteWorkModal
            isOpen={showCompleteWorkModal}
            onClose={() => {
              setShowCompleteWorkModal(false)
              setCompleteWorkRequest(null)
            }}
            maintenanceRequest={completeWorkRequest}
            onSuccess={handleCompleteWorkSuccess}
          />
        )}

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
  onAcceptAssignment,
  onStartWork,
  onCompleteWork,
  isCaretaker = false
}: {
  request: any
  getStatusColor: (status: string) => string
  getPriorityColor: (priority: string) => string
  onUpdateStatus: (request: any) => void
  onAcceptAssignment?: (request: any) => void
  onStartWork?: (request: any) => void
  onCompleteWork?: (request: any) => void
  isCaretaker?: boolean
}) {
  const { user } = useAuth()
  const [showUpdates, setShowUpdates] = useState(false)
  
  // Check if this request is assigned to the current user and needs acceptance
  const isAssignedToMe = 
    request.assigned_to_id === user?.id ||
    request.assigned_to?.id === user?.id
  const needsAcceptance = request.status === "assigned" && isAssignedToMe && !request.accepted_at
  
  // Check if assignment has been accepted and can start work
  const canStartWork = request.status === "assigned" && isAssignedToMe && request.accepted_at && !request.started_at
  
  // Check if work is in progress and can be completed
  const canCompleteWork = request.status === "in_progress" && isAssignedToMe
  
  // Check if rework is required and can start rework
  const canStartRework = request.status === "rework_required" && isAssignedToMe

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

          {/* Accept/Reject Assignment Buttons */}
          {needsAcceptance && onAcceptAssignment && (
            <div className="flex gap-2 mb-4">
              <Button
                variant="default"
                size="sm"
                onClick={() => onAcceptAssignment(request)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept Assignment
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAcceptAssignment(request)}
                className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject Assignment
              </Button>
            </div>
          )}

          {/* Rejection Reason (if rework required) */}
          {request.status === "rework_required" && request.completion_rejected_reason && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                    Rejection Reason
                  </p>
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {request.completion_rejected_reason}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Start Rework Button */}
          {canStartRework && onStartWork && (
            <div className="flex gap-2 mb-4">
              <Button
                variant="default"
                size="sm"
                onClick={() => onStartWork(request)}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                <Wrench className="h-4 w-4 mr-2" />
                Start Rework
              </Button>
            </div>
          )}

          {/* Start Work Button */}
          {canStartWork && onStartWork && (
            <div className="flex gap-2 mb-4">
              <Button
                variant="default"
                size="sm"
                onClick={() => onStartWork(request)}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Wrench className="h-4 w-4 mr-2" />
                Start Work
              </Button>
            </div>
          )}

          {/* Mark as Completed Button */}
          {canCompleteWork && onCompleteWork && (
            <div className="flex gap-2 mb-4">
              <Button
                variant="default"
                size="sm"
                onClick={() => onCompleteWork(request)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Completed
              </Button>
            </div>
          )}

          {/* Action Buttons for Caretakers */}
          {isCaretaker && request.status !== "completed" && request.status !== "closed" && !needsAcceptance && !canStartWork && !canCompleteWork && (
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
                {showUpdates ? "Hide" : "Show"} Updates ({request.updates?.length || 0})
              </Button>
            </div>
          )}

          {/* Updates Section */}
          {(showUpdates || !isCaretaker) && (
            <div className="space-y-2">
              {!isCaretaker && (
                <Button variant="outline" size="sm" onClick={() => setShowUpdates(!showUpdates)} className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {showUpdates ? "Hide" : "Show"} Updates ({request.updates?.length || 0})
                </Button>
              )}

              {showUpdates && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {(request.updates || []).map((update: any) => (
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
