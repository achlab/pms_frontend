"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Send } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/localization"

const payments = [
  {
    id: 1,
    tenant: "John Smith",
    property: "Sunset Apartments",
    amount: 2500,
    dueDate: "2024-02-01",
    status: "pending" as const,
  },
  {
    id: 2,
    tenant: "Sarah Johnson",
    property: "Downtown Lofts",
    amount: 1800,
    dueDate: "2024-02-03",
    status: "overdue" as const,
  },
  {
    id: 3,
    tenant: "Mike Wilson",
    property: "Garden View",
    amount: 2200,
    dueDate: "2024-02-05",
    status: "pending" as const,
  },
]

export function PaymentsTable() {
  const handleSendReminder = (paymentId: number) => {
    // TODO: Implement send reminder functionality
    console.log(`Sending reminder for payment ${paymentId}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Upcoming Payments</h3>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </div>

      <div className="space-y-3">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{payment.tenant}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{payment.property}</p>
                </div>
                <Badge variant={payment.status === "overdue" ? "destructive" : "secondary"}>{payment.status}</Badge>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(payment.amount)}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Due {formatDate(payment.dueDate)}</p>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSendReminder(payment.id)}
                className="min-h-[44px]"
              >
                <Send className="h-4 w-4 mr-2" />
                Remind
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
