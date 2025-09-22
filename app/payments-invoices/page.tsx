"use client"

import { useEffect, useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency, formatDate } from "@/lib/localization"
import { Receipt, CreditCard, Calendar, AlertCircle, CheckCircle, FileText, Upload, Camera } from "lucide-react"

interface CurrentInvoice {
  id: string
  dueDate: string
  status: "paid" | "pending" | "overdue"
  items: {
    description: string
    amount: number
  }[]
  totalDue: number
}

interface PaymentRecord {
  id: string
  date: string
  amount: number
  method: string
  status: "confirmed" | "pending" | "rejected"
  receiptId?: string
  notes?: string
}

export default function PaymentsInvoicesPage() {
  const [currentInvoice, setCurrentInvoice] = useState<CurrentInvoice | null>(null)
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showConfirmPaymentModal, setShowConfirmPaymentModal] = useState(false)

  // Mock data - in real app, this would come from API based on current tenant
  useEffect(() => {
    const mockCurrentInvoice: CurrentInvoice = {
      id: "INV-2024-001",
      dueDate: "2024-03-05",
      status: "overdue",
      items: [
        { description: "Rent", amount: 800.0 },
        { description: "Water (15 units)", amount: 75.0 },
        { description: "Garbage Fee", amount: 50.0 },
      ],
      totalDue: 925.0,
    }

    const mockPaymentHistory: PaymentRecord[] = [
      {
        id: "pay-1",
        date: "2024-02-15",
        amount: 800.0,
        method: "MTN Mobile Money",
        status: "confirmed",
        receiptId: "RCP-2024-001",
        notes: "February rent payment",
      },
      {
        id: "pay-2",
        date: "2024-01-15",
        amount: 800.0,
        method: "Cash",
        status: "confirmed",
        receiptId: "RCP-2024-002",
        notes: "January rent payment",
      },
      {
        id: "pay-3",
        date: "2023-12-28",
        amount: 850.0,
        method: "Cash",
        status: "pending",
        notes: "December rent + utilities - awaiting verification",
      },
      {
        id: "pay-4",
        date: "2023-12-15",
        amount: 800.0,
        method: "Vodafone Cash",
        status: "confirmed",
        receiptId: "RCP-2023-045",
        notes: "December rent payment",
      },
      {
        id: "pay-5",
        date: "2023-11-15",
        amount: 800.0,
        method: "Bank Transfer",
        status: "confirmed",
        receiptId: "RCP-2023-044",
        notes: "November rent payment",
      },
    ]

    setTimeout(() => {
      setCurrentInvoice(mockCurrentInvoice)
      setPaymentHistory(mockPaymentHistory)
      setLoading(false)
    }, 500)
  }, [])

  const handleConfirmPayment = () => {
    setShowConfirmPaymentModal(true)
  }

  const handleSubmitPaymentConfirmation = () => {
    // In real app, this would send notification to landlord
    console.log("Payment confirmation submitted to landlord")
    setShowConfirmPaymentModal(false)
    // Show success message or update UI
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="p-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="animate-in fade-in-0 slide-in-from-top-4 duration-500">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
            Payments & Invoices
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            View your payment history and current invoice details.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Invoice */}
          <Card className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 animate-in fade-in-0 slide-in-from-left-4 duration-500 delay-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  Current Invoice
                </CardTitle>
                {currentInvoice && (
                  <Badge
                    variant={
                      currentInvoice.status === "paid"
                        ? "default"
                        : currentInvoice.status === "overdue"
                          ? "destructive"
                          : "secondary"
                    }
                    className={
                      currentInvoice.status === "paid"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : currentInvoice.status === "overdue"
                          ? ""
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }
                  >
                    {currentInvoice.status.charAt(0).toUpperCase() + currentInvoice.status.slice(1)}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentInvoice ? (
                <>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                    {currentInvoice.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-gray-700 dark:text-gray-300">{item.description}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900 dark:text-white">Total Due:</span>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(currentInvoice.totalDue)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Due Date: {formatDate(currentInvoice.dueDate)}
                    </span>
                    {currentInvoice.status === "overdue" && <AlertCircle className="h-4 w-4 text-red-500" />}
                  </div>

                  {currentInvoice.status !== "paid" && (
                    <div className="pt-4">
                      <Button
                        onClick={handleConfirmPayment}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm Cash Payment
                      </Button>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                        Use this button after making a cash payment to notify your landlord
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No current invoice available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 animate-in fade-in-0 slide-in-from-right-4 duration-500 delay-200">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Total Paid This Year</p>
                  <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                    {formatCurrency(
                      paymentHistory
                        .filter((p) => p.status === "confirmed" && new Date(p.date).getFullYear() === 2024)
                        .reduce((sum, p) => sum + p.amount, 0),
                    )}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
                  <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Pending Verification</p>
                  <p className="text-xl font-bold text-yellow-800 dark:text-yellow-200">
                    {paymentHistory.filter((p) => p.status === "pending").length} payments
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Last Payment</p>
                  <p className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                    {paymentHistory.length > 0 ? formatDate(paymentHistory[0].date) : "No payments"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment History */}
        <Card className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-300">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-600">
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Method</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <td className="py-4 px-4">
                        <span className="text-gray-900 dark:text-white">{formatDate(payment.date)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(payment.amount)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          variant="secondary"
                          className={
                            payment.method === "Cash"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : payment.method.includes("Mobile Money") || payment.method.includes("Cash")
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                          }
                        >
                          {payment.method}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          variant={
                            payment.status === "confirmed"
                              ? "default"
                              : payment.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                          className={
                            payment.status === "confirmed"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : payment.status === "pending"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : ""
                          }
                        >
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-600 dark:text-gray-400">{payment.notes || "-"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Confirm Payment Modal */}
        <Dialog open={showConfirmPaymentModal} onOpenChange={setShowConfirmPaymentModal}>
          <DialogContent className="max-w-lg bg-white dark:bg-gray-700">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">Confirm Cash Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">i</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">Payment Confirmation</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Use this form to notify your landlord that you have made a payment. This will send them a
                      notification to verify and record your payment.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Date</label>
                <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} className="mt-1" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount Paid (₵)</label>
                <Input type="number" defaultValue={currentInvoice?.totalDue || 0} step="0.01" className="mt-1" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Method</label>
                <Select defaultValue="cash">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="mtn_momo">MTN Mobile Money</SelectItem>
                    <SelectItem value="vodafone_cash">Vodafone Cash</SelectItem>
                    <SelectItem value="airteltigo_money">AirtelTigo Money</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Transaction ID/Receipt Number (Optional)
                </label>
                <Input type="text" placeholder="e.g., TXN123456789 or receipt number" className="mt-1" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Upload Receipt Photo (Optional)
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Camera className="h-4 w-4 mr-2" />
                    Take Photo
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Additional Notes</label>
                <Textarea placeholder="Any additional information about this payment..." rows={3} className="mt-1" />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowConfirmPaymentModal(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitPaymentConfirmation}
                  className="bg-gradient-to-r from-green-600 to-emerald-500"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Payment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
