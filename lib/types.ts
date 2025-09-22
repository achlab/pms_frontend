export interface Property {
  id: number
  name: string
  address: string
  gpsAddress?: string // Ghana Post GPS address
  region?: string // Ghana region
  type: string
  units: number
  occupied: number
  monthlyRevenue: number
  bedrooms: string
  bathrooms: string
  sqft: string
  status: "Active" | "Maintenance" | "Vacant"
  image?: string
  createdAt: string
  updatedAt: string
}

export interface Tenant {
  id: number
  name: string
  email: string
  phone: string
  ghanaCardId?: string // Ghana Card National ID
  propertyId: number
  unitNumber: string
  rentAmount: number
  leaseStart: string
  leaseEnd: string
  status: "Active" | "Pending" | "Expired"
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
}

export interface Activity {
  id: number
  type: "payment" | "maintenance" | "application" | "lease"
  title: string
  description: string
  propertyId?: number
  tenantId?: number
  amount?: number
  timestamp: string
  status: "completed" | "pending" | "cancelled"
}

export interface DashboardStats {
  totalProperties: number
  totalUnits: number
  occupiedUnits: number
  monthlyRevenue: number
  pendingIssues: number
  occupancyRate: number
  revenueGrowth: number
}

export interface User {
  id: number
  name: string
  email: string
  role: "tenant" | "caretaker" | "landlord" | "super_admin"
  propertyId?: number
  phone?: string
  ghanaCardId?: string
  createdAt: string
  status: "active" | "inactive" | "pending_approval"
}
