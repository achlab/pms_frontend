"use client"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedCard } from "@/components/animated-card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CreditCard,
  Search,
  Download,
  Receipt,
  Clock,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Banknote,
  Building2,
} from "lucide-react"
import { useAppSelector } from "@/lib/hooks"
import { formatCurrency, formatDate } from "@/lib/localization"
import { PaymentRecordModal } from "@/components/payments/payment-record-modal"

// Mock payment data - in real app this would come from a payments slice
const mockPayments = [
  {
    id: 1,
    tenantId: 1,
    propertyId: 1,
    invoiceId: 1,
    amount: 2500,
    paymentMethod: "mobile_money",
    reference: "MM240201001",
    receivedDate: "2024-02-01",
    status: "confirmed",
    notes: "MTN Mobile Money payment",
  },
  {
    id: 2,
    tenantId: 2,
    propertyId: 1,
    invoiceId: 2,
    amount: 1200,
    paymentMethod: "cash",
    reference: "CASH240203001",
    receivedDate: "2024-02-03",
    status: "confirmed",
    notes: "Cash payment received at office",
  },
]

export default function PaymentsPage() {
  const { properties } = useAppSelector((state) => state.properties)
  const { users } = useAppSelector((state) => state.users)
  const { invoices } = useAppSelector((state) => state.invoices)

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [methodFilter, setMethodFilter] = useState("all")

  const filteredPayments = mockPayments.filter((payment) => {
    const tenant = users.find((u) => u.id === payment.tenantId)
    const property = properties.find((p) => p.id === payment.propertyId)

    const matchesSearch =
      searchTerm === "" ||
      tenant?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || payment.status === statusFilter
    const matchesMethod = methodFilter === "all" || payment.paymentMethod === methodFilter

    return matchesSearch && matchesStatus && matchesMethod
  })

  // Calculate payment statistics
  const totalPayments = mockPayments.length
  const totalAmount = mockPayments.reduce((sum, payment) => sum + payment.amount, 0)
  const pendingPayments = mockPayments.filter((p) => p.status === "pending").length
  const confirmedPayments = mockPayments.filter((p) => p.status === "confirmed").length

  const getPropertyName = (propertyId: number) => {
    const property = properties.find((p) => p.id === propertyId)
    return property?.name || "Unknown Property"
  }

  const getTenantName = (tenantId: number) => {
    const tenant = users.find((u) => u.id === tenantId && u.role === "tenant")
    return tenant?.name || "Unknown Tenant"
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "mobile_money":
        return <Smartphone className="h-4 w-4" />
      case "cash":
        return <Banknote className="h-4 w-4" />
      case "bank_transfer":
        return <Building2 className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "mobile_money":
        return "Mobile Money"
      case "cash":
        return "Cash"
      case "bank_transfer":
        return "Bank Transfer"
      default:
        return method
    }
  }

  return (
    <MainLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start animate-in fade-in-0 slide-in-from-top-4 duration-500">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              Payment Tracking
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manually record and track all rent payments and transactions.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="min-h-[44px] bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <PaymentRecordModal />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <AnimatedCard delay={100} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Payments</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalPayments}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">This month</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-lg flex items-center justify-center">
                  <Receipt className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={200} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Amount Received</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalAmount)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Total collected</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={300} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Verification</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingPayments}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Need review</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={400} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Confirmed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{confirmedPayments}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Verified payments</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-emerald-100 to-cyan-100 dark:from-emerald-900 dark:to-cyan-900 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-300">
          <div className="flex gap-4 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search payments, tenants, or reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 dark:border-gray-700"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-[160px] border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Payment Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="all">All Payments</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <AnimatedCard delay={500} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">All Payment Records</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200 dark:border-gray-700">
                      <TableHead>Reference</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id} className="border-gray-200 dark:border-gray-700">
                        <TableCell className="font-mono text-sm">{payment.reference}</TableCell>
                        <TableCell className="font-medium">{getTenantName(payment.tenantId)}</TableCell>
                        <TableCell>{getPropertyName(payment.propertyId)}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPaymentMethodIcon(payment.paymentMethod)}
                            <span className="text-sm">{getPaymentMethodLabel(payment.paymentMethod)}</span>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(payment.receivedDate)}</TableCell>
                        <TableCell>
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
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <Receipt className="h-4 w-4" />
                            </Button>
                            {payment.status === "pending" && (
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </AnimatedCard>
          </TabsContent>

          <TabsContent value="pending">
            <AnimatedCard className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  Pending Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  No pending payments requiring verification at this time.
                </p>
              </CardContent>
            </AnimatedCard>
          </TabsContent>

          <TabsContent value="confirmed">
            <AnimatedCard className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Confirmed Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPayments
                    .filter((p) => p.status === "confirmed")
                    .map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                            {getPaymentMethodIcon(payment.paymentMethod)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {getTenantName(payment.tenantId)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{payment.reference}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(payment.amount)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(payment.receivedDate)}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </AnimatedCard>
          </TabsContent>

          <TabsContent value="history">
            <AnimatedCard className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Complete payment history and analytics will be displayed here.
                </p>
              </CardContent>
            </AnimatedCard>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
