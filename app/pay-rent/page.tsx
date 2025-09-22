"use client"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/localization"
import {
  Smartphone,
  Building2,
  Banknote,
  Copy,
  CheckCircle,
  Upload,
  Camera,
  AlertCircle,
  CreditCard,
  Clock,
} from "lucide-react"

interface PaymentMethod {
  type: "mobile_money" | "bank_transfer" | "cash"
  title: string
  details: {
    name?: string
    phone?: string
    provider?: string
    bankName?: string
    accountNumber?: string
    accountName?: string
    reference?: string
    instructions?: string
    location?: string
    hours?: string
    contact?: string
  }
}

export default function PayRentPage() {
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [copiedText, setCopiedText] = useState("")

  // Mock data - in real app, this would come from API based on landlord preferences
  const currentRentAmount = 925.0 // Including utilities
  const dueDate = "March 5, 2024"
  const isOverdue = true

  const paymentMethods: PaymentMethod[] = [
    {
      type: "mobile_money",
      title: "MTN Mobile Money",
      details: {
        name: "John Landlord",
        phone: "0244 123 456",
        provider: "MTN MoMo",
        reference: "RENT-UNIT-B12",
      },
    },
    {
      type: "mobile_money",
      title: "Vodafone Cash",
      details: {
        name: "John Landlord",
        phone: "0203 987 654",
        provider: "Vodafone Cash",
        reference: "RENT-UNIT-B12",
      },
    },
    {
      type: "bank_transfer",
      title: "Bank Transfer",
      details: {
        bankName: "Ghana Commercial Bank",
        accountNumber: "1234567890123",
        accountName: "John Landlord",
        reference: "RENT-UNIT-B12-MAR2024",
      },
    },
    {
      type: "cash",
      title: "Cash Payment",
      details: {
        instructions: "Pay to the caretaker, Mr. Mensah, at Property ABC",
        location: "Property ABC - Main Office",
        hours: "Monday to Friday: 4:00 PM - 6:00 PM",
        contact: "Caretaker: +233 20 555 0123",
      },
    },
  ]

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(text)
    setTimeout(() => setCopiedText(""), 2000)
  }

  const handleConfirmPayment = () => {
    setShowConfirmationModal(true)
  }

  const handleSubmitConfirmation = () => {
    // In real app, this would send notification to landlord
    console.log("Payment confirmation submitted to landlord")
    setShowConfirmationModal(false)
    // Show success message or redirect
  }

  const getMethodIcon = (type: string) => {
    switch (type) {
      case "mobile_money":
        return <Smartphone className="h-6 w-6" />
      case "bank_transfer":
        return <Building2 className="h-6 w-6" />
      case "cash":
        return <Banknote className="h-6 w-6" />
      default:
        return <CreditCard className="h-6 w-6" />
    }
  }

  return (
    <MainLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="animate-in fade-in-0 slide-in-from-top-4 duration-500">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
            Pay Your Rent
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Choose your preferred payment method and follow the instructions below.
          </p>
        </div>

        {/* Current Amount Due */}
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-700 animate-in fade-in-0 slide-in-from-top-4 duration-500 delay-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-lg font-semibold text-orange-800 dark:text-orange-200">Amount Due</h2>
                  {isOverdue && (
                    <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      Overdue
                    </Badge>
                  )}
                </div>
                <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                  {formatCurrency(currentRentAmount)}
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300 flex items-center gap-1 mt-1">
                  <Clock className="h-4 w-4" />
                  Due: {dueDate}
                </p>
              </div>
              <div className="h-16 w-16 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 rounded-full flex items-center justify-center">
                <CreditCard className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Choose Payment Method</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paymentMethods.map((method, index) => (
              <Card
                key={index}
                className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${200 + index * 100}ms` }}
              >
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        method.type === "mobile_money"
                          ? "bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 text-blue-600 dark:text-blue-400"
                          : method.type === "bank_transfer"
                            ? "bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 text-green-600 dark:text-green-400"
                            : "bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 text-yellow-600 dark:text-yellow-400"
                      }`}
                    >
                      {getMethodIcon(method.type)}
                    </div>
                    {method.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {method.type === "mobile_money" && (
                    <>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                          <p className="font-medium text-gray-900 dark:text-white">{method.details.name}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyToClipboard(method.details.name || "")}
                          className="h-8 w-8 p-0"
                        >
                          {copiedText === method.details.name ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Phone Number</p>
                          <p className="font-medium text-gray-900 dark:text-white">{method.details.phone}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyToClipboard(method.details.phone || "")}
                          className="h-8 w-8 p-0"
                        >
                          {copiedText === method.details.phone ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Reference</p>
                          <p className="font-medium text-gray-900 dark:text-white">{method.details.reference}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyToClipboard(method.details.reference || "")}
                          className="h-8 w-8 p-0"
                        >
                          {copiedText === method.details.reference ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </>
                  )}

                  {method.type === "bank_transfer" && (
                    <>
                      <div className="space-y-3">
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Bank Name</p>
                          <p className="font-medium text-gray-900 dark:text-white">{method.details.bankName}</p>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Account Number</p>
                            <p className="font-medium text-gray-900 dark:text-white font-mono">
                              {method.details.accountNumber}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyToClipboard(method.details.accountNumber || "")}
                            className="h-8 w-8 p-0"
                          >
                            {copiedText === method.details.accountNumber ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Account Name</p>
                          <p className="font-medium text-gray-900 dark:text-white">{method.details.accountName}</p>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Reference</p>
                            <p className="font-medium text-gray-900 dark:text-white">{method.details.reference}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyToClipboard(method.details.reference || "")}
                            className="h-8 w-8 p-0"
                          >
                            {copiedText === method.details.reference ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </>
                  )}

                  {method.type === "cash" && (
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Instructions</p>
                        <p className="font-medium text-gray-900 dark:text-white">{method.details.instructions}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                        <p className="font-medium text-gray-900 dark:text-white">{method.details.location}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Office Hours</p>
                        <p className="font-medium text-gray-900 dark:text-white">{method.details.hours}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Contact</p>
                        <p className="font-medium text-gray-900 dark:text-white">{method.details.contact}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Instructions and Confirmation */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-600">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Important Instructions</h3>
                <div className="space-y-2 text-blue-700 dark:text-blue-300">
                  <p>1. Choose your preferred payment method from the options above</p>
                  <p>2. Make your payment using the provided details</p>
                  <p>3. After completing your payment, click the button below to confirm</p>
                  <p>4. Provide your transaction details for verification</p>
                  <p>5. Your landlord will be notified and will verify your payment</p>
                </div>
                <div className="mt-6">
                  <Button
                    onClick={handleConfirmPayment}
                    size="lg"
                    className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />I Have Made a Payment
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Confirmation Modal */}
        <Dialog open={showConfirmationModal} onOpenChange={setShowConfirmationModal}>
          <DialogContent className="max-w-lg bg-white dark:bg-gray-700">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">Confirm Your Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-800 dark:text-green-200 mb-1">Payment Confirmation</h3>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Please provide the details of your payment so your landlord can verify and record it.
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
                <Input type="number" defaultValue={currentRentAmount} step="0.01" className="mt-1" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Method</label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mtn_momo">MTN Mobile Money</SelectItem>
                    <SelectItem value="vodafone_cash">Vodafone Cash</SelectItem>
                    <SelectItem value="airteltigo_money">AirtelTigo Money</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
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
                <Button variant="outline" onClick={() => setShowConfirmationModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitConfirmation} className="bg-gradient-to-r from-green-600 to-emerald-500">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Confirmation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
