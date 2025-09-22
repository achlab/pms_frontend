"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Edit, Download } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { clearSelectedProperties } from "@/lib/slices/propertiesSlice"

export function BulkActionsToolbar() {
  const dispatch = useAppDispatch()
  const { selectedProperties } = useAppSelector((state) => state.properties)

  if (selectedProperties.length === 0) return null

  const handleClearSelection = () => {
    dispatch(clearSelectedProperties())
  }

  const handleBulkAction = (action: string) => {
    console.log(`Performing ${action} on ${selectedProperties.length} properties`)
    // TODO: Implement bulk actions
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
            >
              {selectedProperties.length} selected
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleClearSelection}>
              Clear
            </Button>
          </div>

          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction("update-status")}
              className="min-h-[44px]"
            >
              <Edit className="h-4 w-4 mr-2" />
              Update Status
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction("generate-invoices")}
              className="min-h-[44px]"
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate Invoices
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction("export-data")}
              className="min-h-[44px]"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
