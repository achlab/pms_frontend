"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatCurrency, formatDate } from "@/lib/localization"
import { User, MapPin, Phone, Mail, CreditCard, FileText, Calendar, ArrowLeft, Plus, Download } from "lucide-react"
import Link from "next/link"

interface PaymentRecord {
  id: string
  date: string
  amount: number
  method: string
  recordedBy: string
  receiptId: string
  notes?: string
}

interface Tenant {
  id: string
  name: string
  phone: string
  email: string
  ghanaCardId: string
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  lease: {
    propertyName: string
    unitName: string
    unitAddress: string
    moveInDate: string
    moveOutDate?: string
    rentAmount: number
    depositAmount: number
    leaseAgreementUrl?: string
  }
  paymentHistory: PaymentRecord[]
  totalPaid: number
  outstandingBalance: number
  lastPaymentDate?: string
}

export default function TenantProfilePage() {
  const params = useParams()
  const tenantId = params.id as string

  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showLeaseAgreement, setShowLeaseAgreement] = useState(false)

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockTenant: Tenant = {
      id: tenantId,
      name: "Kofi Mensah",
      phone: "+233 24 123 4567",
      email: "kofi.mensah@email.com",
      ghanaCardId: "GHA-123456789-0",
      emergencyContact: {
        name: "Ama Mensah",
        phone: "+233 20 987 6543",
        relationship: "Sister",
      },
      lease: {
        propertyName: "Sunset Apartments",
        unitName: "A1",
        unitAddress: "123 Independence Avenue, Accra - Unit A1",
        moveInDate: "2024-01-15",
        rentAmount: 800,
        depositAmount: 1600,
        leaseAgreementUrl: "/documents/lease-kofi-mensah.pdf",
      },
      paymentHistory: [
        {
          id: "pay-1",
          date: "2024-02-15",
          amount: 800,
          method: "MTN Mobile Money",
          recordedBy: "John Landlord",
          receiptId: "RCP-2024-001",
          notes: "February rent payment",
        },
        {
          id: "pay-2",
          date: "2024-01-15",
          amount: 800,
          method: "Cash",
          recordedBy: "John Landlord",
          receiptId: "RCP-2024-002",
          notes: "January rent payment",
        },
        {
          id: "pay-3",
          date: "2024-01-15",
          amount: 1600,
          method: "Bank Transfer",
          recordedBy: "John Landlord",
          receiptId: "RCP-2024-003",
          notes: "Security deposit payment",
        },
        {
          id: "pay-4",
          date: "2023-12-15",
          amount: 800,
          method: "Vodafone Cash",
          recordedBy: "John Landlord",
          receiptId: "RCP-2023-045",
          notes: "December rent payment",
        },
        {
          id: "pay-5",
          date: "2023-11-15",
          amount: 800,
          method: "Cash",
          recordedBy: "John Landlord",
          receiptId: "RCP-2023-044",
          notes: "November rent payment",
        },
      ],
      totalPaid: 4800,
      outstandingBalance: 0,
      lastPaymentDate: "2024-02-15",
    }

    setTimeout(() => {
      setTenant(mockTenant)
      setLoading(false)
    }, 500)
  }, [tenantId])

  const handleRecordPayment = () => {
    setShowPaymentModal(true)
  }

  const handleViewLeaseAgreement = () => {
    setShowLeaseAgreement(true)
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Tenant Not Found</h1>
        <Link href="/landlord/tenants">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tenants
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/tenants">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tenants
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                {tenant.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                <MapPin className="h-4 w-4" />
                {tenant.lease.unitAddress}
              </p>
            </div>
          </div>
          <Button onClick={handleRecordPayment} className="bg-gradient-to-r from-green-600 to-emerald-500">
            <Plus className="h-4 w-4 mr-2" />
            Record New Payment
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Details */}
          <Card className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Full Name</label>
                  <p className="text-gray-900 dark:text-white mt-1">{tenant.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Phone Number</label>
                  <p className="text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {tenant.phone}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Email Address</label>
                  <p className="text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {tenant.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Ghana Card ID</label>
                  <p className="text-gray-900 dark:text-white mt-1">{tenant.ghanaCardId}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Emergency Contact</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Name</label>
                    <p className="text-gray-900 dark:text-white">{tenant.emergencyContact.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Phone</label>
                    <p className="text-gray-900 dark:text-white">{tenant.emergencyContact.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Relationship</label>
                    <p className="text-gray-900 dark:text-white">{tenant.emergencyContact.relationship}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lease Information */}
          <Card className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Lease Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Property & Unit</label>
                  <p className="text-gray-900 dark:text-white mt-1">
                    {tenant.lease.propertyName} - Unit {tenant.lease.unitName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Unit Address</label>
                  <p className="text-gray-900 dark:text-white mt-1">{tenant.lease.unitAddress}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Move-in Date</label>
                    <p className="text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(tenant.lease.moveInDate)}
                    </p>
                  </div>
                  {tenant.lease.moveOutDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Move-out Date</label>
                      <p className="text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(tenant.lease.moveOutDate)}
                      </p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Monthly Rent</label>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {formatCurrency(tenant.lease.rentAmount)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Security Deposit</label>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white mt-1">
                      {formatCurrency(tenant.lease.depositAmount)}
                    </p>
                  </div>
                </div>
              </div>

              {tenant.lease.leaseAgreementUrl && (
                <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                  <Button
                    onClick={handleViewLeaseAgreement}
                    variant="outline"
                    className="w-full bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Lease Agreement
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Total Paid</p>
                  <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                    {formatCurrency(tenant.totalPaid)}
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Outstanding Balance</p>
                  <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                    {formatCurrency(tenant.outstandingBalance)}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Last Payment</p>
                  <p className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                    {tenant.lastPaymentDate ? formatDate(tenant.lastPaymentDate) : "No payments"}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment History */}
        <Card className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment History
              </CardTitle>
              <Button onClick={handleRecordPayment} className="bg-gradient-to-r from-green-600 to-emerald-500">
                <Plus className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-600">
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Method</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Recorded By</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Receipt ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {tenant.paymentHistory.map((payment) => (
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
                        <span className="text-gray-700 dark:text-gray-300">{payment.recordedBy}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-mono text-sm text-gray-600 dark:text-gray-400">{payment.receiptId}</span>
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

        {/* Record Payment Modal */}
        <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
          <DialogContent className="max-w-lg bg-white dark:bg-gray-700">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">Record New Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tenant</label>
                <p className="text-gray-900 dark:text-white mt-1">{tenant.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount (₵)</label>
                <input
                  type="number"
                  defaultValue={tenant.lease.rentAmount}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Date</label>
                <input
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Method</label>
                <select className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  <option value="Cash">Cash</option>
                  <option value="MTN Mobile Money">MTN Mobile Money</option>
                  <option value="Vodafone Cash">Vodafone Cash</option>
                  <option value="AirtelTigo Money">AirtelTigo Money</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Transaction/Receipt Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., TXN123456789"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes (Optional)</label>
                <textarea
                  placeholder="e.g., March rent payment"
                  rows={3}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
                  Cancel
                </Button>
                <Button className="bg-gradient-to-r from-green-600 to-emerald-500">Record Payment</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Lease Agreement Modal */}
        <Dialog open={showLeaseAgreement} onOpenChange={setShowLeaseAgreement}>
          <DialogContent className="max-w-4xl bg-white dark:bg-gray-700">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-gray-900 dark:text-white">Lease Agreement</DialogTitle>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Lease agreement document would be displayed here</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">File: {tenant.lease.leaseAgreementUrl}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
  )
}
