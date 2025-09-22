"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedCard } from "@/components/animated-card"
import { MaintenanceTicketModal } from "./maintenance-ticket-modal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { User, Calendar, Edit, Play, CheckCircle } from "lucide-react"
import type { MaintenanceTicket } from "@/lib/slices/maintenanceSlice"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import { updateTicket } from "@/lib/slices/maintenanceSlice"

interface MaintenanceTableProps {
  tickets: MaintenanceTicket[]
}

export function MaintenanceTable({ tickets }: MaintenanceTableProps) {
  const dispatch = useAppDispatch()
  const { properties } = useAppSelector((state) => state.properties)
  const { users } = useAppSelector((state) => state.users)

  const getPropertyName = (propertyId: number) => {
    const property = properties.find((p) => p.id === propertyId)
    return property?.name || "Unknown Property"
  }

  const getTenantName = (tenantId?: number) => {
    if (!tenantId) return "N/A"
    const tenant = users.find((u) => u.id === tenantId && u.role === "tenant")
    return tenant?.name || "Unknown Tenant"
  }

  const getAssigneeName = (assigneeId?: number) => {
    if (!assigneeId) return "Unassigned"
    const assignee = users.find((u) => u.id === assigneeId)
    return assignee?.name || "Unknown"
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "in-progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const handleStatusChange = (ticket: MaintenanceTicket, newStatus: "open" | "in-progress" | "resolved") => {
    const updatedTicket = {
      ...ticket,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    }
    dispatch(updateTicket(updatedTicket))
  }

  return (
    <AnimatedCard delay={500} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">All Maintenance Tickets</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200 dark:border-gray-700">
              <TableHead>Ticket</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Tenant</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id} className="border-gray-200 dark:border-gray-700">
                <TableCell>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{ticket.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{ticket.description}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className="text-sm">{getPropertyName(ticket.propertyId)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{getTenantName(ticket.tenantId)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{getAssigneeName(ticket.assignedTo)}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    {ticket.status !== "in-progress" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStatusChange(ticket, "in-progress")}
                        className="h-8 w-8 p-0"
                        title="Start work"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    {ticket.status !== "resolved" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStatusChange(ticket, "resolved")}
                        className="h-8 w-8 p-0"
                        title="Mark resolved"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <MaintenanceTicketModal
                      ticket={ticket}
                      mode="edit"
                      trigger={
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Edit ticket">
                          <Edit className="h-4 w-4" />
                        </Button>
                      }
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </AnimatedCard>
  )
}
