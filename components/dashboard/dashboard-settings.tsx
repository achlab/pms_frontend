"use client"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Settings } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface DashboardSettingsProps {
  widgetVisibility: Record<string, boolean>
  onToggleWidget: (widget: string) => void
}

export function DashboardSettings({ widgetVisibility, onToggleWidget }: DashboardSettingsProps) {
  const widgets = [
    { key: "revenue", label: "Revenue Chart" },
    { key: "occupancy", label: "Occupancy Chart" },
    { key: "payments", label: "Payments Table" },
    { key: "maintenance", label: "Maintenance Health" },
    { key: "activities", label: "Recent Activities" },
  ]

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="min-h-[44px] min-w-[44px] bg-transparent">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Dashboard Settings</DialogTitle>
          <DialogDescription>Customize which widgets are visible on your dashboard.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {widgets.map((widget) => (
            <div key={widget.key} className="flex items-center justify-between">
              <label htmlFor={widget.key} className="text-sm font-medium">
                {widget.label}
              </label>
              <Switch
                id={widget.key}
                checked={widgetVisibility[widget.key]}
                onCheckedChange={() => onToggleWidget(widget.key)}
              />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
