"use client"

import { useEffect, useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatCurrency, formatDate } from "@/lib/localization"
import { FileText, Calendar, MapPin, DollarSign, Download, Eye, Home } from "lucide-react"

interface LeaseDetails {
  propertyName: string
  unitName: string
  unitAddress: string
  rentAmount: number
  securityDeposit: number
  depositStatus: "paid" | "pending" | "partial"
  leaseStartDate: string
  leaseEndDate: string
  leaseAgreementUrl?: string
  landlordName: string
  landlordPhone: string
  landlordEmail: string
}

export default function MyLeasePage() {
  const [leaseDetails, setLeaseDetails] = useState<LeaseDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [showLeaseAgreement, setShowLeaseAgreement] = useState(false)

  // Mock data - in real app, this would come from API based on current tenant
  useEffect(() => {
    const mockLeaseDetails: LeaseDetails = {
      propertyName: "Sunset Apartments",
      unitName: "B12",
      unitAddress: "123 Independence Avenue, Accra - Unit B12",
      rentAmount: 800,
      securityDeposit: 2400,
      depositStatus: "paid",
      leaseStartDate: "2024-01-15",
      leaseEndDate: "2025-01-14",
      leaseAgreementUrl: "/documents/lease-agreement.pdf",
      landlordName: "John Landlord",
      landlordPhone: "+233 24 555 0123",
      landlordEmail: "john.landlord@email.com",
    }

    setTimeout(() => {
      setLeaseDetails(mockLeaseDetails)
      setLoading(false)
    }, 500)
  }, [])

  const handleViewLeaseAgreement = () => {
    setShowLeaseAgreement(true)
  }

  const handleDownloadLease = () => {
    // In real app, this would trigger a download
    console.log("Downloading lease agreement...")
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

  if (!leaseDetails) {
    return (
      <MainLayout>
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No Lease Found</h1>
          <p className="text-gray-600 dark:text-gray-400">
            We couldn't find your lease information. Please contact your landlord.
          </p>
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
            My Lease Agreement
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            View your lease details and access your lease agreement document.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Property & Unit Information */}
          <Card className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 animate-in fade-in-0 slide-in-from-left-4 duration-500 delay-100">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <Home className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Property & Unit Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Property Name</label>
                <p className="text-xl font-semibold text-gray-900 dark:text-white mt-1">{leaseDetails.propertyName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Unit</label>
                <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">Unit {leaseDetails.unitName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Full Address</label>
                <p className="text-gray-900 dark:text-white mt-1 flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-1 text-gray-500" />
                  {leaseDetails.unitAddress}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Landlord Contact</label>
                <div className="mt-2 space-y-1">
                  <p className="text-gray-900 dark:text-white font-medium">{leaseDetails.landlordName}</p>
                  <p className="text-gray-600 dark:text-gray-400">{leaseDetails.landlordPhone}</p>
                  <p className="text-gray-600 dark:text-gray-400">{leaseDetails.landlordEmail}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lease Terms */}
          <Card className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 animate-in fade-in-0 slide-in-from-right-4 duration-500 delay-200">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                Lease Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                  <label className="text-sm font-medium text-green-700 dark:text-green-300">Monthly Rent</label>
                  <p className="text-3xl font-bold text-green-800 dark:text-green-200 mt-1 flex items-center gap-2">
                    <DollarSign className="h-6 w-6" />
                    {formatCurrency(leaseDetails.rentAmount)}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                  <label className="text-sm font-medium text-blue-700 dark:text-blue-300">Security Deposit</label>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                      {formatCurrency(leaseDetails.securityDeposit)}
                    </p>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        leaseDetails.depositStatus === "paid"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : leaseDetails.depositStatus === "partial"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {leaseDetails.depositStatus === "paid"
                        ? "Paid"
                        : leaseDetails.depositStatus === "partial"
                          ? "Partial"
                          : "Pending"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Lease Start Date</label>
                  <p className="text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    {formatDate(leaseDetails.leaseStartDate)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Lease End Date</label>
                  <p className="text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    {formatDate(leaseDetails.leaseEndDate)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lease Agreement Access */}
        <Card className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-300">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Lease Agreement Document
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Your Lease Agreement</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Click to view or download your complete lease agreement document
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleViewLeaseAgreement}
                    className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Lease Agreement
                  </Button>
                  <Button variant="outline" onClick={handleDownloadLease}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Notice */}
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-700 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-400">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-amber-600 dark:text-amber-400 text-sm font-bold">!</span>
              </div>
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Important Information</h3>
                <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                  <li>• This page is read-only. You cannot modify lease terms.</li>
                  <li>• For any questions about your lease, contact your landlord directly.</li>
                  <li>• Keep a copy of your lease agreement for your records.</li>
                  <li>• Report any discrepancies to your landlord immediately.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lease Agreement Modal */}
        <Dialog open={showLeaseAgreement} onOpenChange={setShowLeaseAgreement}>
          <DialogContent className="max-w-4xl bg-white dark:bg-gray-700">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-gray-900 dark:text-white">Lease Agreement Document</DialogTitle>
                <Button variant="outline" size="sm" onClick={handleDownloadLease}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
                <FileText className="h-20 w-20 text-gray-400 mx-auto mb-6" />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Lease Agreement Document
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Your complete lease agreement would be displayed here as a PDF viewer
                </p>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <p className="text-sm text-gray-500 dark:text-gray-500">File: {leaseDetails.leaseAgreementUrl}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                    In a real application, this would show the actual PDF document
                  </p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
