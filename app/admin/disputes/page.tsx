"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedCard } from "@/components/animated-card"
import {
  Scale,
  MessageSquare,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Calendar,
  Search,
  Plus,
  Eye,
  Send,
} from "lucide-react"
import { formatDateTime } from "@/lib/localization"
import { useState } from "react"

// Mock dispute data
const disputes = [
  {
    id: 1,
    caseNumber: "DSP-2024-001",
    title: "Rent Payment Dispute",
    description: "Tenant claims rent was paid but landlord denies receiving payment",
    status: "open",
    priority: "high",
    category: "payment",
    landlord: { id: 1, name: "Kofi Mensah", email: "kofi.mensah@email.com" },
    tenant: { id: 2, name: "Akosua Osei", email: "akosua.osei@email.com" },
    property: { id: 1, name: "Sunset Apartments", unit: "Unit 101" },
    createdAt: "2024-02-15T10:30:00Z",
    updatedAt: "2024-02-15T14:20:00Z",
    assignedTo: "Super Admin",
    evidence: ["payment_receipt.pdf", "bank_statement.pdf"],
    communications: [
      {
        id: 1,
        sender: "tenant",
        message: "I have proof of payment via Mobile Money",
        timestamp: "2024-02-15T10:30:00Z",
        attachments: ["momo_receipt.jpg"],
      },
      {
        id: 2,
        sender: "landlord",
        message: "I never received any payment for February rent",
        timestamp: "2024-02-15T11:15:00Z",
        attachments: [],
      },
      {
        id: 3,
        sender: "admin",
        message: "Please provide bank statements for verification",
        timestamp: "2024-02-15T14:20:00Z",
        attachments: [],
      },
    ],
  },
  {
    id: 2,
    caseNumber: "DSP-2024-002",
    title: "Property Maintenance Issue",
    description: "Landlord refusing to fix broken plumbing despite multiple requests",
    status: "in_progress",
    priority: "medium",
    category: "maintenance",
    landlord: { id: 3, name: "Kwame Asante", email: "kwame.asante@email.com" },
    tenant: { id: 4, name: "Ama Serwaa", email: "ama.serwaa@email.com" },
    property: { id: 2, name: "Golden Heights", unit: "Unit 205" },
    createdAt: "2024-02-14T09:15:00Z",
    updatedAt: "2024-02-15T08:45:00Z",
    assignedTo: "Super Admin",
    evidence: ["maintenance_photos.zip", "repair_quotes.pdf"],
    communications: [
      {
        id: 1,
        sender: "tenant",
        message: "The kitchen sink has been leaking for 3 weeks",
        timestamp: "2024-02-14T09:15:00Z",
        attachments: ["leak_photos.jpg"],
      },
      {
        id: 2,
        sender: "admin",
        message: "Landlord has been notified and given 7 days to respond",
        timestamp: "2024-02-15T08:45:00Z",
        attachments: [],
      },
    ],
  },
  {
    id: 3,
    caseNumber: "DSP-2024-003",
    title: "Security Deposit Return",
    description: "Tenant requesting return of security deposit after lease termination",
    status: "resolved",
    priority: "low",
    category: "deposit",
    landlord: { id: 5, name: "Yaw Boateng", email: "yaw.boateng@email.com" },
    tenant: { id: 6, name: "Efua Mensah", email: "efua.mensah@email.com" },
    property: { id: 3, name: "Royal Gardens", unit: "Unit 302" },
    createdAt: "2024-02-10T14:20:00Z",
    updatedAt: "2024-02-13T16:30:00Z",
    assignedTo: "Super Admin",
    resolution: "Landlord agreed to return ₵2,000 deposit after property inspection",
    evidence: ["inspection_report.pdf", "deposit_agreement.pdf"],
    communications: [
      {
        id: 1,
        sender: "tenant",
        message: "Requesting return of ₵2,500 security deposit",
        timestamp: "2024-02-10T14:20:00Z",
        attachments: ["lease_agreement.pdf"],
      },
      {
        id: 2,
        sender: "landlord",
        message: "Property has damages, can only return ₵2,000",
        timestamp: "2024-02-12T10:30:00Z",
        attachments: ["damage_photos.jpg"],
      },
      {
        id: 3,
        sender: "admin",
        message: "After inspection, ₵2,000 return is fair. Case resolved.",
        timestamp: "2024-02-13T16:30:00Z",
        attachments: ["final_inspection.pdf"],
      },
    ],
  },
]

export default function AdminDisputesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [selectedDispute, setSelectedDispute] = useState<any>(null)
  const [newMessage, setNewMessage] = useState("")

  const filteredDisputes = disputes.filter((dispute) => {
    const matchesSearch =
      dispute.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.landlord.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.tenant.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || dispute.status === filterStatus
    const matchesPriority = filterPriority === "all" || dispute.priority === filterPriority
    const matchesCategory = filterCategory === "all" || dispute.category === filterCategory

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "in_progress":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "closed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "payment":
        return <FileText className="h-4 w-4" />
      case "maintenance":
        return <AlertCircle className="h-4 w-4" />
      case "deposit":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Scale className="h-4 w-4" />
    }
  }

  const totalDisputes = disputes.length
  const openDisputes = disputes.filter((d) => d.status === "open").length
  const inProgressDisputes = disputes.filter((d) => d.status === "in_progress").length
  const resolvedDisputes = disputes.filter((d) => d.status === "resolved").length

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedDispute) {
      // Mock sending message
      console.log("[v0] Sending message:", newMessage)
      setNewMessage("")
      alert("Message sent successfully!")
    }
  }

  const handleResolveDispute = (disputeId: number) => {
    // Mock resolving dispute
    console.log("[v0] Resolving dispute:", disputeId)
    alert("Dispute marked as resolved!")
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
        <div className="flex justify-between items-start animate-in fade-in-0 slide-in-from-top-4 duration-500">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              Dispute Resolution Center
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage tenant-landlord disputes, facilitate mediation, and track case resolutions.
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" />
                New Dispute
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Dispute Case</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Case Title</label>
                    <Input placeholder="Enter dispute title" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="payment">Payment</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="deposit">Deposit</SelectItem>
                        <SelectItem value="lease">Lease Terms</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea placeholder="Describe the dispute in detail" rows={4} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Assign To</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Assign mediator" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin1">Super Admin</SelectItem>
                        <SelectItem value="mediator1">Mediator 1</SelectItem>
                        <SelectItem value="mediator2">Mediator 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button className="bg-indigo-600 hover:bg-indigo-700">Create Dispute</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <AnimatedCard delay={100} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Disputes</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalDisputes}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">All cases</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-lg flex items-center justify-center">
                  <Scale className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={200} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Open Cases</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{openDisputes}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Need attention</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900 dark:to-pink-900 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={300} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">In Progress</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{inProgressDisputes}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Being resolved</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-orange-100 to-yellow-100 dark:from-orange-900 dark:to-yellow-900 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={400} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Resolved</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{resolvedDisputes}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Successfully closed</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Filters */}
        <AnimatedCard delay={500} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Filter Disputes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search disputes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="lease">Lease Terms</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </AnimatedCard>

        {/* Disputes List */}
        <AnimatedCard delay={600} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Dispute Cases ({filteredDisputes.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredDisputes.map((dispute, index) => (
              <div
                key={dispute.id}
                className="p-4 bg-gray-50 dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500 animate-in fade-in-0 slide-in-from-left-4 duration-300"
                style={{ animationDelay: `${700 + index * 100}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(dispute.category)}
                        <h3 className="font-semibold text-gray-900 dark:text-white">{dispute.title}</h3>
                      </div>
                      <Badge className={getStatusColor(dispute.status)}>{dispute.status.replace("_", " ")}</Badge>
                      <Badge className={getPriorityColor(dispute.priority)}>{dispute.priority}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{dispute.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <div>
                        <span className="font-medium">Case #:</span> {dispute.caseNumber}
                      </div>
                      <div>
                        <span className="font-medium">Landlord:</span> {dispute.landlord.name}
                      </div>
                      <div>
                        <span className="font-medium">Tenant:</span> {dispute.tenant.name}
                      </div>
                      <div>
                        <span className="font-medium">Property:</span> {dispute.property.name} - {dispute.property.unit}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Created: {formatDateTime(dispute.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {dispute.communications.length} messages
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {dispute.evidence.length} evidence files
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedDispute(dispute)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Dispute Case: {dispute.caseNumber}</DialogTitle>
                        </DialogHeader>
                        {selectedDispute && (
                          <div className="space-y-6">
                            {/* Case Details */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2">Case Information</h4>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <span className="font-medium">Title:</span> {selectedDispute.title}
                                  </div>
                                  <div>
                                    <span className="font-medium">Status:</span>
                                    <Badge className={`ml-2 ${getStatusColor(selectedDispute.status)}`}>
                                      {selectedDispute.status.replace("_", " ")}
                                    </Badge>
                                  </div>
                                  <div>
                                    <span className="font-medium">Priority:</span>
                                    <Badge className={`ml-2 ${getPriorityColor(selectedDispute.priority)}`}>
                                      {selectedDispute.priority}
                                    </Badge>
                                  </div>
                                  <div>
                                    <span className="font-medium">Category:</span> {selectedDispute.category}
                                  </div>
                                  <div>
                                    <span className="font-medium">Assigned To:</span> {selectedDispute.assignedTo}
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Parties Involved</h4>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <span className="font-medium">Landlord:</span> {selectedDispute.landlord.name}
                                    <br />
                                    <span className="text-gray-500">{selectedDispute.landlord.email}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium">Tenant:</span> {selectedDispute.tenant.name}
                                    <br />
                                    <span className="text-gray-500">{selectedDispute.tenant.email}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium">Property:</span> {selectedDispute.property.name}
                                    <br />
                                    <span className="text-gray-500">{selectedDispute.property.unit}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Description */}
                            <div>
                              <h4 className="font-semibold mb-2">Description</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-600 p-3 rounded">
                                {selectedDispute.description}
                              </p>
                            </div>

                            {/* Evidence */}
                            <div>
                              <h4 className="font-semibold mb-2">Evidence Files</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedDispute.evidence.map((file: string, index: number) => (
                                  <Badge key={index} variant="outline" className="cursor-pointer hover:bg-gray-100">
                                    <FileText className="h-3 w-3 mr-1" />
                                    {file}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {/* Communications */}
                            <div>
                              <h4 className="font-semibold mb-2">Communication Thread</h4>
                              <div className="space-y-3 max-h-60 overflow-y-auto">
                                {selectedDispute.communications.map((comm: any) => (
                                  <div key={comm.id} className="p-3 bg-gray-50 dark:bg-gray-600 rounded">
                                    <div className="flex justify-between items-start mb-2">
                                      <span className="font-medium text-sm capitalize">
                                        {comm.sender === "admin" ? "Mediator" : comm.sender}
                                      </span>
                                      <span className="text-xs text-gray-500">{formatDateTime(comm.timestamp)}</span>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{comm.message}</p>
                                    {comm.attachments.length > 0 && (
                                      <div className="mt-2">
                                        {comm.attachments.map((attachment: string, index: number) => (
                                          <Badge key={index} variant="outline" className="mr-1 text-xs">
                                            {attachment}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Add Message */}
                            <div>
                              <h4 className="font-semibold mb-2">Add Message</h4>
                              <div className="flex gap-2">
                                <Textarea
                                  placeholder="Type your message..."
                                  value={newMessage}
                                  onChange={(e) => setNewMessage(e.target.value)}
                                  rows={3}
                                  className="flex-1"
                                />
                                <Button onClick={handleSendMessage} className="bg-indigo-600 hover:bg-indigo-700">
                                  <Send className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Resolution */}
                            {selectedDispute.resolution && (
                              <div>
                                <h4 className="font-semibold mb-2">Resolution</h4>
                                <p className="text-sm text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900 p-3 rounded">
                                  {selectedDispute.resolution}
                                </p>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-end gap-2 pt-4 border-t">
                              {selectedDispute.status !== "resolved" && (
                                <Button
                                  onClick={() => handleResolveDispute(selectedDispute.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark as Resolved
                                </Button>
                              )}
                              <Button variant="outline">
                                <Users className="h-4 w-4 mr-2" />
                                Schedule Mediation
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    {dispute.status !== "resolved" && (
                      <Button
                        size="sm"
                        onClick={() => handleResolveDispute(dispute.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </AnimatedCard>
    </div>
  )
}
