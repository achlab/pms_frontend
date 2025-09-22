"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck } from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import { updateTicket } from "@/lib/slices/maintenanceSlice"

export function TicketAssignmentModal() {
  const [open, setOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState("")
  const [selectedAssignee, setSelectedAssignee] = useState("")

  const dispatch = useAppDispatch()
  const { tickets } = useAppSelector((state) => state.maintenance)
  const { users } = useAppSelector((state) => state.users)
  const { properties } = useAppSelector((state) => state.properties)

  const caretakers = users.filter((user) => user.role === "caretaker")
  const unassignedTickets = tickets.filter((ticket) => !ticket.assignedTo && ticket.status !== "resolved")

  const handleAssign = () => {
    if (!selectedTicket || !selectedAssignee) return

    const ticket = tickets.find((t) => t.id.toString() === selectedTicket)
    if (!ticket) return

    const updatedTicket = {
      ...ticket,
      assignedTo: Number.parseInt(selectedAssignee),
      status: "in-progress" as const,
      updatedAt: new Date().toISOString(),
    }

    dispatch(updateTicket(updatedTicket))
    setOpen(false)
    setSelectedTicket("")
    setSelectedAssignee("")
  }

  const getPropertyName = (propertyId: number) => {
    const property = properties.find((p) => p.id === propertyId)
    return property?.name || "Unknown Property"
  }

  const getAssigneeName = (assigneeId: number) => {
    const assignee = users.find((u) => u.id === assigneeId)
    return assignee?.name || "Unknown"
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="min-h-[44px] bg-transparent">
          <UserCheck className="h-4 w-4 mr-2" />
          Assign Tickets
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assign Maintenance Tickets
          </DialogTitle>
          <DialogDescription>Assign unassigned tickets to caretakers or maintenance staff.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Assignments */}
          <div className="space-y-3">
            <Label>Current Assignments</Label>
            <div className="max-h-32 overflow-y-auto space-y-2">
              {tickets
                .filter((ticket) => ticket.assignedTo && ticket.status !== "resolved")
                .map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{ticket.title}</p>
                      <p className="text-gray-600 dark:text-gray-400">{getPropertyName(ticket.propertyId)}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{getAssigneeName(ticket.assignedTo!)}</Badge>
                      <p className="text-xs text-gray-500 mt-1">{ticket.status}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* New Assignment */}
          <div className="space-y-4">
            <Label>New Assignment</Label>

            <div className="space-y-2">
              <Label htmlFor="ticket">Select Ticket</Label>
              <Select value={selectedTicket} onValueChange={setSelectedTicket}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose unassigned ticket" />
                </SelectTrigger>
                <SelectContent>
                  {unassignedTickets.map((ticket) => (
                    <SelectItem key={ticket.id} value={ticket.id.toString()}>
                      <div className="flex items-center justify-between w-full">
                        <span>{ticket.title}</span>
                        <Badge variant={ticket.priority === "high" ? "destructive" : "secondary"} className="ml-2">
                          {ticket.priority}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignee">Assign To</Label>
              <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose caretaker" />
                </SelectTrigger>
                <SelectContent>
                  {caretakers.map((caretaker) => (
                    <SelectItem key={caretaker.id} value={caretaker.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span>{caretaker.name}</span>
                        <span className="text-xs text-gray-500">({caretaker.email})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={!selectedTicket || !selectedAssignee}>
              Assign Ticket
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
