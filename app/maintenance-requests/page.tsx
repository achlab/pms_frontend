"use client"

import type React from "react"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CardContent } from "@/components/ui/card"
import { AnimatedCard } from "@/components/animated-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wrench, Plus, Clock, CheckCircle, Calendar, MessageSquare, Camera, AlertCircle } from "lucide-react"
import { formatDate } from "@/lib/localization"

export default function MaintenanceRequestsPage() {
  const [showSubmitForm, setShowSubmitForm] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    issueType: "",
    priority: "",
    description: "",
    contactMethod: "",
    availableTimes: "",
  })

  // Mock data for tenant's maintenance requests
  const maintenanceRequests = [
    {
      id: 1,
      title: "Leaking Kitchen Tap",
      description: "The kitchen tap has been leaking for 3 days. Water is dripping constantly.",
      issueType: "Plumbing",
      priority: "Medium",
      status: "In Progress",
      dateSubmitted: "2024-02-15T10:30:00Z",
      lastUpdate: "2024-02-16T14:20:00Z",
      hasPhoto: true,
      photoUrl: "/leaking-kitchen-tap.png",
      updates: [
        {
          id: 1,
          message: "Request received and assigned to maintenance team",
          timestamp: "2024-02-15T10:30:00Z",
          from: "System",
        },
        {
          id: 2,
          message: "Caretaker will visit tomorrow between 9-11 AM to assess the issue",
          timestamp: "2024-02-16T14:20:00Z",
          from: "John (Caretaker)",
        },
      ],
    },
    {
      id: 2,
      title: "Air Conditioning Not Working",
      description: "AC unit stopped working yesterday. Room is getting very hot.",
      issueType: "HVAC",
      priority: "High",
      status: "Submitted",
      dateSubmitted: "2024-02-16T16:45:00Z",
      lastUpdate: "2024-02-16T16:45:00Z",
      hasPhoto: false,
      updates: [
        {
          id: 1,
          message: "Request received and under review",
          timestamp: "2024-02-16T16:45:00Z",
          from: "System",
        },
      ],
    },
    {
      id: 3,
      title: "Broken Door Lock",
      description: "Front door lock is sticking and difficult to turn.",
      issueType: "General Repairs",
      priority: "Low",
      status: "Completed",
      dateSubmitted: "2024-02-10T09:15:00Z",
      lastUpdate: "2024-02-14T15:30:00Z",
      hasPhoto: false,
      updates: [
        {
          id: 1,
          message: "Request received and assigned to maintenance team",
          timestamp: "2024-02-10T09:15:00Z",
          from: "System",
        },
        {
          id: 2,
          message: "Lock mechanism lubricated and adjusted",
          timestamp: "2024-02-12T11:00:00Z",
          from: "John (Caretaker)",
        },
        {
          id: 3,
          message: "Issue resolved. Lock working smoothly now.",
          timestamp: "2024-02-14T15:30:00Z",
          from: "John (Caretaker)",
        },
      ],
    },
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Submitting maintenance request:", formData, selectedFile)
    // TODO: Implement request submission
    setShowSubmitForm(false)
    setFormData({
      issueType: "",
      priority: "",
      description: "",
      contactMethod: "",
      availableTimes: "",
    })
    setSelectedFile(null)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "in progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "submitted":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
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

  const activeRequests = maintenanceRequests.filter((r) => r.status !== "Completed")
  const completedRequests = maintenanceRequests.filter((r) => r.status === "Completed")

  return (
    <MainLayout>
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              Maintenance Requests
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Submit new maintenance requests and track the status of existing ones.
            </p>
          </div>
          <Dialog open={showSubmitForm} onOpenChange={setShowSubmitForm}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" />
                Submit Request
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Submit Maintenance Request
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="issueType">Issue Type</Label>
                  <Select
                    value={formData.issueType}
                    onValueChange={(value) => setFormData({ ...formData, issueType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select issue type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Plumbing">Plumbing</SelectItem>
                      <SelectItem value="Electrical">Electrical</SelectItem>
                      <SelectItem value="HVAC">HVAC/Air Conditioning</SelectItem>
                      <SelectItem value="Appliances">Appliances</SelectItem>
                      <SelectItem value="General Repairs">General Repairs</SelectItem>
                      <SelectItem value="Pest Control">Pest Control</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low - Can wait a few days</SelectItem>
                      <SelectItem value="Medium">Medium - Should be fixed soon</SelectItem>
                      <SelectItem value="High">High - Urgent, affects daily life</SelectItem>
                      <SelectItem value="Emergency">Emergency - Safety concern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Please describe the issue in detail..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photo">Photo (Optional)</Label>
                  <div className="flex items-center gap-2">
                    <Input id="photo" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("photo")?.click()}
                      className="w-full"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {selectedFile ? selectedFile.name : "Upload Photo"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactMethod">Preferred Contact Method</Label>
                  <Select
                    value={formData.contactMethod}
                    onValueChange={(value) => setFormData({ ...formData, contactMethod: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="How should we contact you?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Phone">Phone Call</SelectItem>
                      <SelectItem value="SMS">Text Message</SelectItem>
                      <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                      <SelectItem value="Email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availableTimes">Available Times for Access</Label>
                  <Textarea
                    id="availableTimes"
                    placeholder="e.g., Weekdays 9 AM - 5 PM, Weekends anytime"
                    value={formData.availableTimes}
                    onChange={(e) => setFormData({ ...formData, availableTimes: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowSubmitForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!formData.issueType || !formData.priority || !formData.description}>
                    Submit Request
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Emergency Contact Alert */}
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <strong>Emergency?</strong> For urgent issues like gas leaks, electrical hazards, or security concerns, call
            the emergency hotline: <strong>+233 20 123 4567</strong>
          </AlertDescription>
        </Alert>

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
            {activeRequests.length === 0 ? (
              <div className="text-center py-12">
                <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">No active maintenance requests.</p>
                <Button onClick={() => setShowSubmitForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Submit Your First Request
                </Button>
              </div>
            ) : (
              activeRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  getStatusColor={getStatusColor}
                  getPriorityColor={getPriorityColor}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedRequests.length === 0 ? (
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
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}

function RequestCard({
  request,
  getStatusColor,
  getPriorityColor,
}: {
  request: any
  getStatusColor: (status: string) => string
  getPriorityColor: (priority: string) => string
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
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Submitted: {formatDate(request.dateSubmitted)}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Last Update: {formatDate(request.lastUpdate)}
                </div>
              </div>
            </div>
            {request.hasPhoto && (
              <div className="ml-4">
                <img
                  src={request.photoUrl || "/placeholder.svg"}
                  alt="Maintenance issue"
                  className="w-24 h-24 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          {/* Request Details */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Issue Type</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{request.issueType}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Request ID</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">#{request.id.toString().padStart(4, "0")}</p>
            </div>
          </div>

          {/* Updates Section */}
          <div className="space-y-2">
            <Button variant="outline" size="sm" onClick={() => setShowUpdates(!showUpdates)} className="w-full">
              <MessageSquare className="h-4 w-4 mr-2" />
              {showUpdates ? "Hide" : "Show"} Updates ({request.updates.length})
            </Button>

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
        </div>
      </CardContent>
    </AnimatedCard>
  )
}
