"use client"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CardContent } from "@/components/ui/card"
import { AnimatedCard } from "@/components/animated-card"
import { MaintenanceTicketModal } from "@/components/maintenance/maintenance-ticket-modal"
import { TicketAssignmentModal } from "@/components/maintenance/ticket-assignment-modal"
import { MaintenanceKanban } from "@/components/maintenance/maintenance-kanban"
import { MaintenanceTable } from "@/components/maintenance/maintenance-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Wrench,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  Grid3X3,
  List,
  Phone,
  MessageSquare,
  Calendar,
  User,
  MapPin,
} from "lucide-react"
import { useAppSelector } from "@/lib/hooks"
import { formatDate } from "@/lib/localization"

export default function MaintenancePage() {
  const { tickets } = useAppSelector((state) => state.maintenance)
  const { properties } = useAppSelector((state) => state.properties)
  const { currentUser } = useAppSelector((state) => state.users)

  const [searchTerm, setSearchTerm] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [propertyFilter, setPropertyFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban")
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [newNote, setNewNote] = useState("")

  const isCaretaker = currentUser?.role === "caretaker"

  const caretakerRequests = [
    {
      id: 1,
      title: "Leaking Tap in Kitchen",
      description:
        "The kitchen tap has been leaking for 3 days. Water is dripping constantly and making noise at night.",
      priority: "high",
      status: "new",
      dateSubmitted: "2024-02-15T10:30:00Z",
      tenantName: "Kofi Mensah",
      tenantPhone: "+233 20 111 2222",
      unitAddress: "Sunset Apartments - Unit A1",
      propertyName: "Sunset Apartments",
      unitName: "Unit A1",
      hasPhoto: true,
      photoUrl: "/leaking-kitchen-tap.png",
      notes: [],
    },
    {
      id: 2,
      title: "Air Conditioning Not Working",
      description: "AC unit stopped working yesterday. Room is getting very hot and uncomfortable.",
      priority: "high",
      status: "in-progress",
      dateSubmitted: "2024-02-14T16:45:00Z",
      tenantName: "Ama Serwaa",
      tenantPhone: "+233 24 333 4444",
      unitAddress: "Sunset Apartments - Unit A2",
      propertyName: "Sunset Apartments",
      unitName: "Unit A2",
      hasPhoto: false,
      notes: [
        {
          id: 1,
          note: "Called HVAC technician, scheduled for tomorrow morning at 9 AM",
          timestamp: "2024-02-15T08:30:00Z",
        },
      ],
    },
    {
      id: 3,
      title: "Electrical Socket Not Working",
      description: "Power socket in bedroom stopped working. Need to charge devices and use appliances.",
      priority: "normal",
      status: "new",
      dateSubmitted: "2024-02-15T14:20:00Z",
      tenantName: "Yaw Osei",
      tenantPhone: "+233 26 555 6666",
      unitAddress: "Sunset Apartments - Unit A4",
      propertyName: "Sunset Apartments",
      unitName: "Unit A4",
      hasPhoto: true,
      photoUrl: "/broken-electrical-socket.png",
      notes: [],
    },
    {
      id: 4,
      title: "Plumbing Issue in Bathroom",
      description: "Toilet is not flushing properly and water level is low in the tank.",
      priority: "normal",
      status: "resolved",
      dateSubmitted: "2024-02-12T11:15:00Z",
      tenantName: "Kwaku Boateng",
      tenantPhone: "+233 20 777 8888",
      unitAddress: "Golden Heights - Unit B1",
      propertyName: "Golden Heights",
      unitName: "Unit B1",
      hasPhoto: false,
      notes: [
        {
          id: 1,
          note: "Inspected toilet tank, found faulty flush valve",
          timestamp: "2024-02-13T09:00:00Z",
        },
        {
          id: 2,
          note: "Purchased replacement parts from hardware store - ₵45",
          timestamp: "2024-02-13T14:30:00Z",
        },
        {
          id: 3,
          note: "Replaced flush valve, toilet working properly now. Tenant confirmed fix.",
          timestamp: "2024-02-14T10:15:00Z",
        },
      ],
    },
    {
      id: 5,
      title: "Door Lock Sticking",
      description: "Front door lock is difficult to turn and sometimes gets stuck. Need to force it to open.",
      priority: "normal",
      status: "in-progress",
      dateSubmitted: "2024-02-13T09:30:00Z",
      tenantName: "Efua Asante",
      tenantPhone: "+233 24 999 0000",
      unitAddress: "Golden Heights - Unit B3",
      propertyName: "Golden Heights",
      unitName: "Unit B3",
      hasPhoto: false,
      notes: [
        {
          id: 1,
          note: "Applied lubricant to lock mechanism, improved but still needs replacement",
          timestamp: "2024-02-14T15:45:00Z",
        },
      ],
    },
  ]

  const filteredTickets = tickets.filter((ticket) => {
    const property = properties.find((p) => p.id === ticket.propertyId)

    const matchesSearch =
      searchTerm === "" ||
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property?.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter
    const matchesProperty = propertyFilter === "all" || ticket.propertyId.toString() === propertyFilter

    return matchesSearch && matchesPriority && matchesStatus && matchesProperty
  })

  const filteredCaretakerRequests = caretakerRequests.filter((request) => {
    const matchesSearch =
      searchTerm === "" ||
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.unitAddress.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  // Calculate statistics
  const openTickets = tickets.filter((t) => t.status === "open").length
  const inProgressTickets = tickets.filter((t) => t.status === "in-progress").length
  const resolvedTickets = tickets.filter((t) => t.status === "resolved").length
  const highPriorityTickets = tickets.filter((t) => t.priority === "high").length

  const caretakerStats = {
    newRequests: caretakerRequests.filter((r) => r.status === "new").length,
    inProgressRequests: caretakerRequests.filter((r) => r.status === "in-progress").length,
    resolvedRequests: caretakerRequests.filter((r) => r.status === "resolved").length,
    urgentRequests: caretakerRequests.filter((r) => r.priority === "high").length,
  }

  const handleStatusChange = (requestId: number, newStatus: string) => {
    console.log("[v0] Updating request status:", requestId, newStatus)
    // TODO: Implement status update logic
  }

  const handleAddNote = (requestId: number) => {
    if (newNote.trim()) {
      console.log("[v0] Adding note to request:", requestId, newNote)
      setNewNote("")
      // TODO: Implement add note logic
    }
  }

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, "_self")
  }

  const handleMessage = (phone: string) => {
    window.open(`sms:${phone}`, "_self")
  }

  return (
    <MainLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start animate-in fade-in-0 slide-in-from-top-4 duration-500">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              {isCaretaker ? "Maintenance Requests" : "Maintenance Operations"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {isCaretaker
                ? "Manage maintenance requests for your assigned properties and update progress."
                : "Manage maintenance requests, assign tasks, and track resolution progress."}
            </p>
          </div>
          {!isCaretaker && (
            <div className="flex gap-3">
              <TicketAssignmentModal />
              <MaintenanceTicketModal />
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <AnimatedCard delay={100} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {isCaretaker ? "New Requests" : "Open Tickets"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isCaretaker ? caretakerStats.newRequests : openTickets}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Awaiting action</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900 dark:to-orange-900 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={200} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isCaretaker ? caretakerStats.inProgressRequests : inProgressTickets}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Being worked on</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={300} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isCaretaker ? caretakerStats.resolvedRequests : resolvedTickets}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">This month</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={400} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {isCaretaker ? "Urgent Priority" : "High Priority"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isCaretaker ? caretakerStats.urgentRequests : highPriorityTickets}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Urgent attention</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg flex items-center justify-center">
                  <Wrench className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>

        {isCaretaker ? (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search maintenance requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Maintenance Requests Tabs */}
            <Tabs defaultValue="new" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="new" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  New ({caretakerStats.newRequests})
                </TabsTrigger>
                <TabsTrigger value="in-progress" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  In Progress ({caretakerStats.inProgressRequests})
                </TabsTrigger>
                <TabsTrigger value="resolved" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Resolved ({caretakerStats.resolvedRequests})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="new" className="space-y-4">
                <MaintenanceRequestsList
                  requests={filteredCaretakerRequests.filter((r) => r.status === "new")}
                  onStatusChange={handleStatusChange}
                  onAddNote={handleAddNote}
                  onCall={handleCall}
                  onMessage={handleMessage}
                  newNote={newNote}
                  setNewNote={setNewNote}
                  setSelectedRequest={setSelectedRequest}
                />
              </TabsContent>

              <TabsContent value="in-progress" className="space-y-4">
                <MaintenanceRequestsList
                  requests={filteredCaretakerRequests.filter((r) => r.status === "in-progress")}
                  onStatusChange={handleStatusChange}
                  onAddNote={handleAddNote}
                  onCall={handleCall}
                  onMessage={handleMessage}
                  newNote={newNote}
                  setNewNote={setNewNote}
                  setSelectedRequest={setSelectedRequest}
                />
              </TabsContent>

              <TabsContent value="resolved" className="space-y-4">
                <MaintenanceRequestsList
                  requests={filteredCaretakerRequests.filter((r) => r.status === "resolved")}
                  onStatusChange={handleStatusChange}
                  onAddNote={handleAddNote}
                  onCall={handleCall}
                  onMessage={handleMessage}
                  newNote={newNote}
                  setNewNote={setNewNote}
                  setSelectedRequest={setSelectedRequest}
                />
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <>
            {/* Filters and View Toggle */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-300">
              <div className="flex flex-wrap gap-4 flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search tickets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 border-gray-200 dark:border-gray-700"
                  />
                </div>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[140px] border-gray-200 dark:border-gray-700">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] border-gray-200 dark:border-gray-700">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                  <SelectTrigger className="w-[180px] border-gray-200 dark:border-gray-700">
                    <SelectValue placeholder="Property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id.toString()}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "kanban" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("kanban")}
                  className="min-h-[44px]"
                >
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  Kanban
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="min-h-[44px]"
                >
                  <List className="h-4 w-4 mr-2" />
                  Table
                </Button>
              </div>
            </div>

            {/* Tickets Display */}
            {viewMode === "kanban" ? (
              <MaintenanceKanban tickets={filteredTickets} />
            ) : (
              <MaintenanceTable tickets={filteredTickets} />
            )}

            {filteredTickets.length === 0 && (
              <div className="text-center py-12 animate-in fade-in-0 zoom-in-95 duration-300">
                <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No maintenance tickets found matching your filters.</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setPriorityFilter("all")
                    setStatusFilter("all")
                    setPropertyFilter("all")
                  }}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  )
}

function MaintenanceRequestsList({
  requests,
  onStatusChange,
  onAddNote,
  onCall,
  onMessage,
  newNote,
  setNewNote,
  setSelectedRequest,
}: {
  requests: any[]
  onStatusChange: (id: number, status: string) => void
  onAddNote: (id: number) => void
  onCall: (phone: string) => void
  onMessage: (phone: string) => void
  newNote: string
  setNewNote: (note: string) => void
  setSelectedRequest: (request: any) => void
}) {
  return (
    <div className="space-y-4">
      {requests.length === 0 ? (
        <div className="text-center py-12">
          <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No maintenance requests in this category.</p>
        </div>
      ) : (
        requests.map((request) => (
          <AnimatedCard key={request.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Request Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{request.title}</h3>
                      <Badge
                        variant={request.priority === "high" ? "destructive" : "secondary"}
                        className={request.priority === "high" ? "bg-red-100 text-red-800" : ""}
                      >
                        {request.priority === "high" ? "Urgent" : "Normal"}
                      </Badge>
                      <Badge
                        variant={
                          request.status === "resolved"
                            ? "default"
                            : request.status === "in-progress"
                              ? "secondary"
                              : "outline"
                        }
                        className={
                          request.status === "resolved"
                            ? "bg-green-100 text-green-800"
                            : request.status === "in-progress"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }
                      >
                        {request.status === "new"
                          ? "New"
                          : request.status === "in-progress"
                            ? "In Progress"
                            : "Resolved"}
                      </Badge>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">{request.description}</p>
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

                {/* Tenant and Property Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="font-medium text-gray-900 dark:text-white">{request.tenantName}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="h-4 w-4 mr-2" />
                      {request.tenantPhone}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4 mr-2" />
                      {request.unitAddress}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4 mr-2" />
                      Submitted: {formatDate(request.dateSubmitted)}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onCall(request.tenantPhone)}
                        className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:text-green-800"
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        Call
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onMessage(request.tenantPhone)}
                        className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800"
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Message
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Status Update and Notes */}
                <div className="space-y-4">
                  {request.status !== "resolved" && (
                    <div className="flex items-center gap-4">
                      <Label htmlFor={`status-${request.id}`} className="text-sm font-medium">
                        Update Status:
                      </Label>
                      <Select value={request.status} onValueChange={(value) => onStatusChange(request.id, value)}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Notes Section */}
                  {request.notes.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Progress Notes:</Label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {request.notes.map((note: any) => (
                          <div key={note.id} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-sm text-gray-900 dark:text-white">{note.note}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {formatDate(note.timestamp)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Note */}
                  {request.status !== "resolved" && (
                    <div className="space-y-2">
                      <Label htmlFor={`note-${request.id}`} className="text-sm font-medium">
                        Add Progress Note:
                      </Label>
                      <div className="flex gap-2">
                        <Textarea
                          id={`note-${request.id}`}
                          placeholder="e.g., Called plumber, arriving tomorrow at 10 AM"
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          rows={2}
                          className="flex-1"
                        />
                        <Button onClick={() => onAddNote(request.id)} disabled={!newNote.trim()} className="self-end">
                          Add Note
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        ))
      )}
    </div>
  )
}
