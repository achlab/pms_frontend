export interface Property {
  id: string
  name: string
  address: string
  units: number
  occupiedUnits: number
  monthlyRevenue: number
  status: 'active' | 'inactive' | 'pending'
  ghanaPostGPS: string
}

export interface MaintenanceRequest {
  id: string
  propertyId: string
  unitId: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  createdAt: string
  updatedAt: string
  assignedTo?: string
}

export interface Tenant {
  id: string
  name: string
  propertyId: string
  unitId: string
  leaseStart: string
  leaseEnd: string
  rentAmount: number
  balance: number
  status: 'active' | 'inactive' | 'pending'
  ghanaCardNumber: string
  contact: {
    phone: string
    email: string
  }
}

export interface Payment {
  id: string
  tenantId: string
  amount: number
  type: 'rent' | 'utility' | 'deposit' | 'other'
  method: 'mobile_money' | 'bank_transfer' | 'cash'
  status: 'pending' | 'confirmed' | 'failed'
  date: string
  reference: string
}

export interface DashboardStats {
  // Shared stats
  totalProperties: number
  totalUnits: number
  occupiedUnits: number
  vacantUnits: number
  
  // Financial stats
  totalRevenue: number
  outstandingBalance: number
  monthlyExpectedRent: number
  rentCollectedYTD: number
  
  // Maintenance stats
  activeMaintenanceRequests: number
  urgentRequests: number
  normalRequests: number
  completedThisWeek: number
  
  // System stats
  totalUsers: number
  landlords: number
  tenants: number
  caretakers: number
  verifiedProperties: number
  pendingVerification: number
  fraudFlags: number
  systemHealth: number
}

export interface Activity {
  id: string
  type: 'maintenance_request' | 'payment_confirmed' | 'lease_viewed' | 'tenant_registration' | 'payment_recorded' | 'property_added' | 'meter_reading' | 'maintenance_update' | 'maintenance_resolved' | 'user_registration' | 'property_verification' | 'fraud_detection'
  title: string
  description: string
  timestamp: string
  user?: string
  priority?: 'low' | 'medium' | 'high'
  status?: 'pending' | 'in_progress' | 'completed'
}

export interface FraudAlert {
  id: string
  propertyId: string
  landlord: string
  issue: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  reportedAt: string
}

export interface ManualTask {
  id: string
  type: 'payment_verification' | 'lease_upload' | 'maintenance_review' | 'tenant_approval'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  dueDate: string
  status: 'pending' | 'in_progress' | 'completed'
}
