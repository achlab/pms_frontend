"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Wrench } from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import { addTicket, type MaintenanceTicket } from "@/lib/slices/maintenanceSlice"

interface MaintenanceTicketModalProps {
  ticket?: MaintenanceTicket
  mode?: "create" | "edit"
  trigger?: React.ReactNode
}

export function MaintenanceTicketModal({ ticket, mode = "create", trigger }: MaintenanceTicketModalProps) {
  const [open, setOpen] = useState(false)
  const dispatch = useAppDispatch()
  const { properties } = useAppSelector((state) => state.properties)
  const { users } = useAppSelector((state) => state.users)

  const tenants = users.filter((user) => user.role === "tenant")

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const newTicket: MaintenanceTicket = {
      id: ticket?.id || Date.now(),
      propertyId: Number.parseInt(formData.get("property") as string),
      tenantId: formData.get("tenant") ? Number.parseInt(formData.get("tenant") as string) : undefined,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      priority: formData.get("priority") as "low" | "medium" | "high",
      status: ticket?.status || "open",
      assignedTo: ticket?.assignedTo,
      createdAt: ticket?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    dispatch(addTicket(newTicket))
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="min-h-[44px]">
            <Plus className="h-4 w-4 mr-2" />
            Create Ticket
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            {mode === "create" ? "Create Maintenance Ticket" : "Edit Maintenance Ticket"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Report a new maintenance issue or request."
              : "Update the maintenance ticket details."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Brief description of the issue"
              defaultValue={ticket?.title}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="property">Property</Label>
              <Select name="property" defaultValue={ticket?.propertyId?.toString()}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id.toString()}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenant">Tenant (Optional)</Label>
              <Select name="tenant" defaultValue={ticket?.tenantId?.toString()}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tenant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No tenant</SelectItem>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id.toString()}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select name="priority" defaultValue={ticket?.priority || "medium"}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Detailed description of the maintenance issue..."
              defaultValue={ticket?.description}
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{mode === "create" ? "Create Ticket" : "Update Ticket"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
