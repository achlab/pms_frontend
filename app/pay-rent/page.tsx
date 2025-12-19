"use client"

import { useState, useRef, useEffect } from "react"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/localization"
import { toast } from "sonner"
import paymentMethodService from "@/lib/services/payment-method.service"
import { useTenantUnit } from "@/lib/hooks/use-tenant-property"
import { useAuth } from "@/contexts/auth-context"
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
  X,
  Image as ImageIcon,
  Loader2,
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
    branch?: string
    reference?: string
    instructions?: string
    location?: string
    hours?: string
    contact?: string
  }
}

export default function PayRentPage() {
  // Helper function to convert base64 data URL to Blob (for future FormData implementation)
  // const dataURLToBlob = (dataURL: string): Blob => {
  //   const arr = dataURL.split(',')
  //   const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
  //   const bstr = atob(arr[1])
  //   let n = bstr.length
  //   const u8arr = new Uint8Array(n)
  //   while (n--) {
  //     u8arr[n] = bstr.charCodeAt(n)
  //   }
  //   return new Blob([u8arr], { type: mime })
  // }
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [copiedText, setCopiedText] = useState("")
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoadingMethods, setIsLoadingMethods] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state for confirmation
  const [confirmationData, setConfirmationData] = useState({
    paymentDate: new Date().toISOString().split("T")[0],
    amount: 0,
    paymentMethod: "",
    transactionId: "",
    notes: "",
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // Get current user
  const { user: currentUser } = useAuth()
  console.log('Current user:', currentUser)

  // Get tenant's unit information
  const { data: tenantUnitData, isLoading: isLoadingUnit } = useTenantUnit()

  // Calculate rent information dynamically
  const getRentInfo = () => {
    console.log('getRentInfo called:', { tenantUnitData })
    if (!tenantUnitData?.data) {
      return {
        currentRentAmount: 0,
        dueDate: "Loading...",
        isOverdue: false,
        unitReference: "Loading...",
      }
    }

    const { unit } = tenantUnitData.data
    console.log('Unit data:', unit)
    const rentalAmount = unit.rental_amount || 0

    // Calculate next due date (5th of current month or next month if past 5th)
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    const currentDay = now.getDate()

    let dueMonth = currentMonth
    let dueYear = currentYear

    // If we're past the 5th, due date is 5th of next month
    if (currentDay > 5) {
      dueMonth = currentMonth + 1
      if (dueMonth > 11) {
        dueMonth = 0
        dueYear = currentYear + 1
      }
    }

    const dueDateObj = new Date(dueYear, dueMonth, 5)
    const dueDate = dueDateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Check if overdue (past due date)
    const isOverdue = now > dueDateObj

    const unitReference = `${unit.unit_number}`

    return {
      currentRentAmount: rentalAmount,
      dueDate,
      isOverdue,
      unitReference,
    }
  }

  const rentInfo = getRentInfo()

  useEffect(() => {
    // Only fetch payment methods after tenant unit data is loaded
    console.log('useEffect triggered:', { isLoadingUnit, tenantUnitData: !!tenantUnitData?.data })
    if (!isLoadingUnit && tenantUnitData?.data) {
      console.log('Tenant unit data loaded, fetching payment methods...')
      fetchPaymentMethods()
    }
  }, [isLoadingUnit, tenantUnitData])

  const fetchPaymentMethods = async () => {
    try {
      setIsLoadingMethods(true)
      console.log('Fetching landlord payment methods...')
      const response = await paymentMethodService.getLandlordPaymentMethods()
      console.log('Payment methods response:', response)
      const methods = response.data
      console.log('Payment methods data:', methods)

      // Transform API data to component format
      const transformedMethods: PaymentMethod[] = []

      // Add mobile money methods
      if (methods.mobile_money && methods.mobile_money.length > 0) {
        methods.mobile_money
          .filter((m) => m.is_active)
          .forEach((mm) => {
            const providerName =
              mm.provider === "mtn_momo"
                ? "MTN Mobile Money"
                : mm.provider === "vodafone_cash"
                ? "Vodafone Cash"
                : "AirtelTigo Money"

            transformedMethods.push({
              type: "mobile_money",
              title: providerName,
              details: {
                name: mm.account_name,
                phone: mm.account_number,
                provider: providerName,
                reference: `RENT-${rentInfo.unitReference}`,
              },
            })
          })
      }

      // Add bank transfer methods
      if (methods.bank_transfer && methods.bank_transfer.length > 0) {
        methods.bank_transfer
          .filter((b) => b.is_active)
          .forEach((bank) => {
            transformedMethods.push({
              type: "bank_transfer",
              title: bank.bank_name,
              details: {
                bankName: bank.bank_name,
                accountNumber: bank.account_number,
                accountName: bank.account_name,
                branch: bank.branch,
                reference: `RENT-${rentInfo.unitReference}-${new Date().toISOString().slice(0, 7).replace("-", "")}`,
              },
            })
          })
      }

      // Add cash payment option if enabled
      if (methods.cash_enabled) {
        transformedMethods.push({
          type: "cash",
          title: "Cash Payment",
          details: {
            instructions: "Pay to the property caretaker",
            location: "Property Office - Main Entrance",
            hours: "Monday to Friday: 4:00 PM - 6:00 PM",
            contact: "Contact caretaker for payment",
          },
        })
      }

      setPaymentMethods(transformedMethods)

      if (transformedMethods.length === 0) {
        toast.error("No payment methods available. Please contact your landlord.")
      }
    } catch (error: any) {
      console.error('Error fetching payment methods:', error)
      console.error('Error response:', error?.response)
      toast.error(error?.message || "Failed to load payment methods")
      // Fall back to showing informational message
      setPaymentMethods([])
    } finally {
      setIsLoadingMethods(false)
    }
  }

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(text)
    setTimeout(() => setCopiedText(""), 2000)
  }

  const handleConfirmPayment = () => {
    if (rentInfo.currentRentAmount > 0) {
      setConfirmationData(prev => ({
        ...prev,
        amount: rentInfo.currentRentAmount,
        paymentDate: new Date().toISOString().split("T")[0],
      }))
    }
    setShowConfirmationModal(true)
  }

  const handleSubmitConfirmation = async () => {
    console.log("🔥 handleSubmitConfirmation called!")
    console.log("📊 Full confirmationData:", JSON.stringify(confirmationData, null, 2))
    try {
      setIsSubmitting(true)
      console.log("🔥 Setting isSubmitting to true")

      // Validate form
      console.log("🔍 Checking paymentMethod:", `"${confirmationData.paymentMethod}"`, "length:", confirmationData.paymentMethod?.length)
      if (!confirmationData.paymentMethod || confirmationData.paymentMethod.trim() === "") {
        console.log("❌ Validation failed: No payment method selected")
        toast.error("Please select a payment method")
        return
      }
      if (confirmationData.amount <= 0) {
        console.log("❌ Validation failed: Invalid amount", confirmationData.amount)
        toast.error("Please enter a valid amount")
        return
      }

      console.log("✅ Validation passed, proceeding with submission")
      console.log("📊 Current confirmationData:", confirmationData)
      console.log("🖼️ Uploaded images count:", uploadedImages.length, uploadedImages.length > 0 ? "(will be sent as base64)" : "(no images)")

      console.log("Submitting payment confirmation:", {
        paymentMethod: confirmationData.paymentMethod,
        amount: confirmationData.amount,
        paymentDate: confirmationData.paymentDate,
        transactionId: confirmationData.transactionId,
        notes: confirmationData.notes,
        uploadedImagesCount: uploadedImages.length,
        willSendImages: uploadedImages.length > 0,
      })

      // Get tenant unit data for basic validation
      console.log("🏠 Checking tenant unit data:", tenantUnitData)
      if (!tenantUnitData?.data) {
        console.log("❌ No tenant unit data found")
        toast.error("Unable to load unit information. Please refresh and try again.")
        return
      }

      console.log("👤 Checking current user:", currentUser)
      if (!currentUser?.id) {
        console.log("❌ No current user found")
        toast.error("Authentication required. Please log in again.")
        return
      }

      // Call tenant-specific payment endpoint (no property_id/unit_id/tenant_id needed)
      const { default: apiClient } = await import("@/lib/api-client")
      
      // Send images as base64 strings with the fixed backend
      const paymentData = {
        amount: confirmationData.amount,
        payment_method: confirmationData.paymentMethod === "airteltigo_money" ? "airtel_tigo" : confirmationData.paymentMethod,
        reference_number: confirmationData.transactionId || `TENANT-${new Date().getTime()}`,
        payment_date: confirmationData.paymentDate,
        notes: `Tenant payment. Receipt: ${confirmationData.transactionId || "N/A"}. ${confirmationData.notes}`.trim(),
        payment_status: 'recorded',
        receipt_images: uploadedImages.length > 0 ? uploadedImages : undefined, // Send base64 images
      }

      console.log("📤 Sending payment data with base64 images:", paymentData)
      console.log("🖼️ Images count:", uploadedImages.length)

      const response = await apiClient.post("/tenant/payments", paymentData)
      
      if (response.success) {
        const imageCount = uploadedImages.length
        toast.success(
          imageCount > 0 
            ? `Payment submitted successfully with ${imageCount} receipt image(s)! Your landlord will verify it shortly.`
            : "Payment submitted successfully! Your landlord will verify it shortly."
        )
        console.log("Payment recorded:", response.data)
        setShowConfirmationModal(false)
        setUploadedImages([])
        setConfirmationData({
          paymentDate: new Date().toISOString().split("T")[0],
          amount: 0,
          paymentMethod: "",
          transactionId: "",
          notes: "",
        })
      } else {
        console.error("Payment submission failed:", response)
        toast.error(response.message || "Failed to record payment")
      }
    } catch (error: any) {
      console.error("Error submitting payment:", error)
      console.error("Full error details:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
      
      // More detailed error handling
      if (error?.response?.data) {
        console.error("Backend error response:", error.response.data)
        
        if (error.response.status === 500) {
          toast.error("Server error. Please check the backend logs for details.")
        } else if (error.response.status === 422) {
          const validationErrors = error.response.data.errors
          if (validationErrors) {
            const firstError = Object.values(validationErrors)[0]
            toast.error(Array.isArray(firstError) ? firstError[0] : firstError)
          } else {
            toast.error("Validation failed. Please check your input.")
          }
        } else {
          toast.error(error.response.data.message || "Payment submission failed")
        }
      } else {
        toast.error(error?.message || "Failed to submit payment confirmation")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setUploadedImages((prev) => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleTakePhoto = () => {
    cameraInputRef.current?.click()
  }

  const handleUploadFile = () => {
    fileInputRef.current?.click()
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between animate-in fade-in-0 slide-in-from-top-4 duration-500">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Pay Your Rent
              </h1>
              <p className="text-lg text-muted-foreground">
                Choose your preferred payment method and complete your transaction
              </p>
            </div>
          </div>

          {/* Current Amount Due */}
          {isLoadingUnit ? (
            <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-700 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                  <span className="ml-2 text-orange-700 dark:text-orange-300">Loading rent information...</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-700 shadow-lg animate-in fade-in-0 slide-in-from-top-4 duration-500 delay-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-lg font-semibold text-orange-800 dark:text-orange-200">Amount Due</h2>
                      {rentInfo.isOverdue && (
                        <Badge className="bg-red-500 text-white hover:bg-red-600 shadow-md">
                          Overdue
                        </Badge>
                      )}
                    </div>
                    <p className="text-4xl font-bold text-orange-900 dark:text-orange-100">
                      {formatCurrency(rentInfo.currentRentAmount)}
                    </p>
                    <p className="text-sm text-orange-700 dark:text-orange-300 flex items-center gap-1 mt-2">
                      <Clock className="h-4 w-4" />
                      Due: {rentInfo.dueDate}
                    </p>
                  </div>
                  <div className="h-20 w-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                    <CreditCard className="h-10 w-10 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Methods */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Payment Methods</h2>

            {isLoadingMethods ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span className="ml-2 text-sm text-gray-600">Loading payment methods...</span>
              </div>
            ) : paymentMethods.length === 0 ? (
              <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-700">
                <CardContent className="py-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-yellow-900 dark:text-yellow-100">
                        No Payment Methods Available
                      </h3>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                        Your landlord hasn't set up any payment methods yet. Please contact them for payment instructions.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {paymentMethods.map((method, index) => (
                <Card
                  key={index}
                  className="border shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          method.type === "mobile_money"
                            ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30"
                            : method.type === "bank_transfer"
                              ? "bg-green-100 text-green-600 dark:bg-green-900/30"
                              : "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30"
                        }`}
                      >
                        {getMethodIcon(method.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">{method.title}</h3>
                        
                        {method.type === "mobile_money" && (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 dark:text-gray-400">Name:</span>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{method.details.name}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopyToClipboard(method.details.name || "")}
                                  className="h-6 w-6 p-0"
                                >
                                  {copiedText === method.details.name ? (
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{method.details.phone}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopyToClipboard(method.details.phone || "")}
                                  className="h-6 w-6 p-0"
                                >
                                  {copiedText === method.details.phone ? (
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            <div className="flex justify-between items-center pt-1 border-t">
                              <span className="text-gray-600 dark:text-gray-400">Reference:</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs">{method.details.reference}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopyToClipboard(method.details.reference || "")}
                                  className="h-6 w-6 p-0"
                                >
                                  {copiedText === method.details.reference ? (
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        {method.type === "bank_transfer" && (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 dark:text-gray-400">Bank:</span>
                              <span className="font-medium">{method.details.bankName}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 dark:text-gray-400">Account Number:</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs">{method.details.accountNumber}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopyToClipboard(method.details.accountNumber || "")}
                                  className="h-6 w-6 p-0"
                                >
                                  {copiedText === method.details.accountNumber ? (
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 dark:text-gray-400">Account Name:</span>
                              <span className="font-medium">{method.details.accountName}</span>
                            </div>
                            {method.details.branch && (
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">Branch:</span>
                                <span className="font-medium">{method.details.branch}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center pt-1 border-t">
                              <span className="text-gray-600 dark:text-gray-400">Reference:</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs">{method.details.reference}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopyToClipboard(method.details.reference || "")}
                                  className="h-6 w-6 p-0"
                                >
                                  {copiedText === method.details.reference ? (
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        {method.type === "cash" && (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-start">
                              <span className="text-gray-600 dark:text-gray-400">Instructions:</span>
                              <span className="font-medium text-right">{method.details.instructions}</span>
                            </div>
                            {method.details.location && (
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">Location:</span>
                                <span className="font-medium">{method.details.location}</span>
                              </div>
                            )}
                            {method.details.hours && (
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">Hours:</span>
                                <span className="font-medium">{method.details.hours}</span>
                              </div>
                            )}
                            {method.details.contact && (
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">Contact:</span>
                                <span className="font-medium">{method.details.contact}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              </div>
            )}
          </div>

          {/* Instructions and Confirmation */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700 shadow-lg animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-600">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 text-lg">Important Instructions</h3>
                  <div className="space-y-2 text-blue-800 dark:text-blue-200">
                    <p>✓ Choose your preferred payment method from the options above</p>
                    <p>✓ Make your payment using the provided details</p>
                    <p>✓ After completing your payment, click the button below to confirm</p>
                    <p>✓ Provide your transaction details for verification</p>
                    <p>✓ Your landlord will be notified and will verify your payment</p>
                  </div>
                  <div className="mt-6">
                    <Button
                      onClick={handleConfirmPayment}
                      size="lg"
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      I Have Made a Payment
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Confirmation Modal */}
          <Dialog open={showConfirmationModal} onOpenChange={setShowConfirmationModal}>
            <DialogContent className="max-w-lg bg-white dark:bg-slate-800">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-white text-xl">Confirm Your Payment</DialogTitle>
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
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Payment Date</label>
                  <Input 
                    type="date" 
                    value={confirmationData.paymentDate}
                    onChange={(e) => setConfirmationData(prev => ({ ...prev, paymentDate: e.target.value }))}
                    className="bg-white dark:bg-slate-700" 
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Amount Paid (GH₵)</label>
                  <Input 
                    type="number" 
                    value={confirmationData.amount}
                    onChange={(e) => setConfirmationData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    step="0.01" 
                    className="bg-white dark:bg-slate-700" 
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Payment Method</label>
                  <Select value={confirmationData.paymentMethod} onValueChange={(value) => {
                    console.log("🔄 Payment method changed to:", value)
                    setConfirmationData(prev => ({ ...prev, paymentMethod: value }))
                  }}>
                    <SelectTrigger className="bg-white dark:bg-slate-700">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mtn_momo">MTN Mobile Money</SelectItem>
                      <SelectItem value="vodafone_cash">Vodafone Cash</SelectItem>
                      <SelectItem value="airtel_tigo">AirtelTigo Money</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Transaction ID/Receipt Number (Optional)
                  </label>
                  <Input 
                    type="text" 
                    placeholder="e.g., TXN123456789 or receipt number"
                    value={confirmationData.transactionId}
                    onChange={(e) => setConfirmationData(prev => ({ ...prev, transactionId: e.target.value }))}
                    className="bg-white dark:bg-slate-700" 
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Upload Receipt Photo (Optional)
                  </label>
                  
                  {/* Hidden file inputs */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={handleTakePhoto}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Take Photo
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={handleUploadFile}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload File
                      </Button>
                    </div>

                    {/* Image Preview */}
                    {uploadedImages.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {uploadedImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Receipt ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {uploadedImages.length === 0 && (
                      <div className="text-center py-8 bg-slate-50 dark:bg-slate-700/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <ImageIcon className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-muted-foreground">No images uploaded yet</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Additional Notes</label>
                  <Textarea 
                    placeholder="Any additional information about this payment..." 
                    rows={3} 
                    value={confirmationData.notes}
                    onChange={(e) => setConfirmationData(prev => ({ ...prev, notes: e.target.value }))}
                    className="bg-white dark:bg-slate-700" 
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowConfirmationModal(false)} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => {
                      console.log("🔥 Submit button clicked!")
                      handleSubmitConfirmation()
                    }} 
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-md"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Submit Confirmation
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </MainLayout>
  )
}
