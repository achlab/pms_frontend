"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import { AnimatedCard } from "@/components/animated-card"
import { MaintenanceTicketModal } from "./maintenance-ticket-modal"
import { AlertTriangle, Clock, CheckCircle, User, Calendar, Edit } from "lucide-react"
import type { MaintenanceTicket } from "@/lib/slices/maintenanceSlice"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import { updateTicket } from "@/lib/slices/maintenanceSlice"

interface MaintenanceKanbanProps {
  tickets: MaintenanceTicket[]
}

export function MaintenanceKanban({ tickets }: MaintenanceKanbanProps) {
  const dispatch = useAppDispatch()
  const { properties } = useAppSelector((state) => state.properties)
  const { users } = useAppSelector((state) => state.users)

  const openTickets = tickets.filter((t) => t.status === "open")
  const inProgressTickets = tickets.filter((t) => t.status === "in-progress")
  const resolvedTickets = tickets.filter((t) => t.status === "resolved")

  const getPropertyName = (propertyId: number) => {
    const property = properties.find((p) => p.id === propertyId)
    return property?.name || "Unknown Property"
  }

  const getTenantName = (tenantId?: number) => {
    if (!tenantId) return null
    const tenant = users.find((u) => u.id === tenantId && u.role === "tenant")
    return tenant?.name || "Unknown Tenant"
  }

  const getAssigneeName = (assigneeId?: number) => {
    if (!assigneeId) return null
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

  const handleStatusChange = (ticket: MaintenanceTicket, newStatus: "open" | "in-progress" | "resolved") => {
    const updatedTicket = {
      ...ticket,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    }
    dispatch(updateTicket(updatedTicket))
  }

  const TicketCard = ({ ticket, index }: { ticket: MaintenanceTicket; index: number }) => (
    <AnimatedCard
      key={ticket.id}
      delay={100 + index * 50}
      className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 mb-4"
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-gray-900 dark:text-white line-clamp-2">{ticket.title}</h4>
            <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{ticket.description}</p>

          <div className="space-y-2 text-xs text-gray-500 dark:text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(ticket.createdAt).toLocaleDateString()}
            </div>
            <div className="font-medium text-gray-700 dark:text-gray-300">{getPropertyName(ticket.propertyId)}</div>
            {getTenantName(ticket.tenantId) && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {getTenantName(ticket.tenantId)}
              </div>
            )}
            {getAssigneeName(ticket.assignedTo) && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                Assigned to: {getAssigneeName(ticket.assignedTo)}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-1">
              {ticket.status !== "in-progress" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange(ticket, "in-progress")}
                  className="h-7 px-2 text-xs"
                >
                  Start
                </Button>
              )}
              {ticket.status !== "resolved" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange(ticket, "resolved")}
                  className="h-7 px-2 text-xs"
                >
                  Resolve
                </Button>
              )}
            </div>
            <MaintenanceTicketModal
              ticket={ticket}
              mode="edit"
              trigger={
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                  <Edit className="h-3 w-3" />
                </Button>
              }
            />
          </div>
        </div>
      </CardContent>
    </AnimatedCard>
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Open Column */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <h3 className="font-semibold text-red-900 dark:text-red-100">Open ({openTickets.length})</h3>
        </div>
        <div className="space-y-4">
          {openTickets.map((ticket, index) => (
            <TicketCard key={ticket.id} ticket={ticket} index={index} />
          ))}
          {openTickets.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No open tickets</p>
            </div>
          )}
        </div>
      </div>

      {/* In Progress Column */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
            In Progress ({inProgressTickets.length})
          </h3>
        </div>
        <div className="space-y-4">
          {inProgressTickets.map((ticket, index) => (
            <TicketCard key={ticket.id} ticket={ticket} index={index} />
          ))}
          {inProgressTickets.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No tickets in progress</p>
            </div>
          )}
        </div>
      </div>

      {/* Resolved Column */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <h3 className="font-semibold text-green-900 dark:text-green-100">Resolved ({resolvedTickets.length})</h3>
        </div>
        <div className="space-y-4">
          {resolvedTickets.map((ticket, index) => (
            <TicketCard key={ticket.id} ticket={ticket} index={index} />
          ))}
          {resolvedTickets.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No resolved tickets</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
