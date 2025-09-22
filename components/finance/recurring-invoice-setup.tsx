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
import { Switch } from "@/components/ui/switch"
import { Calendar, Repeat } from "lucide-react"

export function RecurringInvoiceSetup() {
  const [open, setOpen] = useState(false)
  const [autoGenerate, setAutoGenerate] = useState(true)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="min-h-[44px] bg-transparent">
          <Repeat className="h-4 w-4 mr-2" />
          Recurring Setup
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recurring Invoice Setup
          </DialogTitle>
          <DialogDescription>Configure automatic invoice generation for rent and recurring charges.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-generate Invoices</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">Automatically create monthly rent invoices</p>
            </div>
            <Switch checked={autoGenerate} onCheckedChange={setAutoGenerate} />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Generation Day</Label>
              <Select defaultValue="1">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1st of the month</SelectItem>
                  <SelectItem value="15">15th of the month</SelectItem>
                  <SelectItem value="last">Last day of the month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              <Select defaultValue="5">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 days after generation</SelectItem>
                  <SelectItem value="10">10 days after generation</SelectItem>
                  <SelectItem value="15">15 days after generation</SelectItem>
                  <SelectItem value="30">30 days after generation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Late Fee</Label>
              <Select defaultValue="none">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No late fee</SelectItem>
                  <SelectItem value="50">$50 flat fee</SelectItem>
                  <SelectItem value="5percent">5% of rent amount</SelectItem>
                  <SelectItem value="10percent">10% of rent amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Settings</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
