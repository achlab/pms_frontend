"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AnimatedCard } from "@/components/animated-card"
import { formatGhanaPhone, formatCurrency } from "@/lib/localization"
import {
  User,
  Mail,
  Phone,
  CreditCard,
  MapPin,
  Building2,
  Calendar,
  Briefcase,
  Users,
  Shield,
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
} from "lucide-react"

interface TenantDetailsModalProps {
  tenant: any
  property?: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TenantDetailsModal({ tenant, property, open, onOpenChange }: TenantDetailsModalProps) {
  if (!tenant) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "pending_approval":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "inactive":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4" />
      case "pending_approval":
        return <Clock className="h-4 w-4" />
      case "inactive":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              Tenant Details
            </DialogTitle>
            <Badge className={`${getStatusColor(tenant.status)} flex items-center gap-1`}>
              {getStatusIcon(tenant.status)}
              {tenant.status?.replace("_", " ").toUpperCase() || "UNKNOWN"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Personal Information */}
          <AnimatedCard delay={100} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">{tenant.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email Address</p>
                    <p className="font-medium text-gray-900 dark:text-white">{tenant.email}</p>
                  </div>
                </div>

                {tenant.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Phone Number</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatGhanaPhone(tenant.phone)}</p>
                    </div>
                  </div>
                )}

                {tenant.dateOfBirth && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Date of Birth</p>
                      <p className="font-medium text-gray-900 dark:text-white">{tenant.dateOfBirth}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {tenant.ghanaCardId && (
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Ghana Card ID</p>
                      <p className="font-medium text-gray-900 dark:text-white">{tenant.ghanaCardId}</p>
                    </div>
                  </div>
                )}

                {tenant.region && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Region</p>
                      <p className="font-medium text-gray-900 dark:text-white">{tenant.region}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Registration Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">{tenant.createdAt || "N/A"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          {/* Property Information */}
          {property && (
            <AnimatedCard delay={200} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Building2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  Property Assignment
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Property Name</p>
                      <p className="font-medium text-gray-900 dark:text-white">{property.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                      <p className="font-medium text-gray-900 dark:text-white">{property.address}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Property Type</p>
                      <p className="font-medium text-gray-900 dark:text-white">{property.type || "N/A"}</p>
                    </div>
                  </div>

                  {property.gpsAddress && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Ghana Post GPS</p>
                        <p className="font-medium text-gray-900 dark:text-white">{property.gpsAddress}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </AnimatedCard>
          )}

          {/* Employment & Financial Information */}
          {(tenant.occupation || tenant.monthlyIncome) && (
            <AnimatedCard delay={300} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Employment & Financial Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  {tenant.occupation && (
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Occupation</p>
                        <p className="font-medium text-gray-900 dark:text-white">{tenant.occupation}</p>
                      </div>
                    </div>
                  )}

                  {tenant.employer && (
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Employer</p>
                        <p className="font-medium text-gray-900 dark:text-white">{tenant.employer}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {tenant.monthlyIncome && (
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Income</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(Number(tenant.monthlyIncome))}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </AnimatedCard>
          )}

          {/* Emergency Contacts */}
          {(tenant.emergencyContactName || tenant.nextOfKinName) && (
            <AnimatedCard delay={400} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  Emergency Contacts
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tenant.emergencyContactName && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">Emergency Contact</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                          <p className="font-medium text-gray-900 dark:text-white">{tenant.emergencyContactName}</p>
                        </div>
                      </div>
                      {tenant.emergencyContactPhone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatGhanaPhone(tenant.emergencyContactPhone)}
                            </p>
                          </div>
                        </div>
                      )}
                      {tenant.emergencyContactRelation && (
                        <div className="flex items-center gap-3">
                          <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Relationship</p>
                            <p className="font-medium text-gray-900 dark:text-white">{tenant.emergencyContactRelation}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {tenant.nextOfKinName && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">Next of Kin</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                          <p className="font-medium text-gray-900 dark:text-white">{tenant.nextOfKinName}</p>
                        </div>
                      </div>
                      {tenant.nextOfKinPhone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatGhanaPhone(tenant.nextOfKinPhone)}
                            </p>
                          </div>
                        </div>
                      )}
                      {tenant.nextOfKinAddress && (
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                            <p className="font-medium text-gray-900 dark:text-white">{tenant.nextOfKinAddress}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </AnimatedCard>
          )}

          {/* Guarantor Information */}
          {tenant.hasGuarantor && tenant.guarantorName && (
            <AnimatedCard delay={500} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  Guarantor Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Guarantor Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">{tenant.guarantorName}</p>
                  </div>
                </div>
                {tenant.guarantorPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Guarantor Phone</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatGhanaPhone(tenant.guarantorPhone)}
                      </p>
                    </div>
                  </div>
                )}
                {tenant.guarantorAddress && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Guarantor Address</p>
                      <p className="font-medium text-gray-900 dark:text-white">{tenant.guarantorAddress}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </AnimatedCard>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                if (tenant.phone) {
                  window.open(`tel:${tenant.phone}`, "_self")
                }
              }}
              disabled={!tenant.phone}
            >
              <Phone className="h-4 w-4 mr-2" />
              Call Tenant
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                if (tenant.email) {
                  window.open(`mailto:${tenant.email}`, "_self")
                }
              }}
              disabled={!tenant.email}
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
