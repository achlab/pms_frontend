/**
 * Services Index
 * Central export point for all API services
 * Following Single Point of Entry pattern
 */

// Authentication & Profile
export { authService, default as AuthenticationService } from "./auth.service";
export { profileService, default as ProfileService } from "./profile.service";

// Settings Management
export { settingsService, default as SettingsService } from "./settings.service";

// Dashboard & Analytics
export { dashboardService, default as DashboardService } from "./dashboard.service";

// Lease Management
export { leaseService, default as LeaseService } from "./lease.service";

// Invoice & Payment Management
export { invoiceService, default as InvoiceService } from "./invoice.service";
export { paymentService, default as PaymentService } from "./payment.service";

// Maintenance Management
export { maintenanceService, default as MaintenanceService } from "./maintenance.service";

// Unit & Property Management
export { unitService, default as UnitService } from "./unit.service";

// ============================================
// CARETAKER-SPECIFIC SERVICES
// ============================================

// Caretaker Maintenance
export { 
  caretakerMaintenanceService, 
  default as CaretakerMaintenanceService 
} from "./caretaker-maintenance.service";

// Caretaker Property & Unit Management
export { 
  caretakerPropertyService, 
  default as CaretakerPropertyService 
} from "./caretaker-property.service";

// Caretaker Lease Management (Read-only)
export { 
  caretakerLeaseService, 
  default as CaretakerLeaseService 
} from "./caretaker-lease.service";

// ============================================
// TENANT-SPECIFIC SERVICES
// ============================================

// Tenant Property & Unit Management
export { 
  tenantPropertyService, 
  default as TenantPropertyService 
} from "./tenant-property.service";

// ============================================
// LANDLORD-SPECIFIC SERVICES
// ============================================

// Landlord Property Management
export { 
  landlordPropertyService, 
  default as LandlordPropertyService 
} from "./landlord-property.service";

// Landlord Unit Management
export { 
  landlordUnitService, 
  default as LandlordUnitService 
} from "./landlord-unit.service";

// Landlord Lease Management
export { 
  landlordLeaseService, 
  default as LandlordLeaseService 
} from "./landlord-lease.service";

// Landlord Invoice Management
export { 
  landlordInvoiceService, 
  default as LandlordInvoiceService 
} from "./landlord-invoice.service";

// Landlord Payment Management
export { 
  landlordPaymentService, 
  default as LandlordPaymentService 
} from "./landlord-payment.service";

// Landlord User Management
export { 
  landlordUserService, 
  default as LandlordUserService 
} from "./landlord-user.service";

// Landlord Maintenance Management
export { 
  landlordMaintenanceService, 
  default as LandlordMaintenanceService 
} from "./landlord-maintenance.service";

// Landlord Analytics & Dashboard
export { 
  landlordAnalyticsService, 
  default as LandlordAnalyticsService 
} from "./landlord-analytics.service";

// ============================================
// SUPER ADMIN-SPECIFIC SERVICES
// ============================================

// Super Admin User Management (Create ALL roles)
export { 
  superAdminUsersService, 
  default as SuperAdminUsersService 
} from "./super-admin-users.service";

// Super Admin Property Management (System-Wide)
export { 
  superAdminPropertiesService, 
  default as SuperAdminPropertiesService 
} from "./super-admin-properties.service";

// Super Admin Unit Management (System-Wide)
export { 
  superAdminUnitService, 
  default as SuperAdminUnitService 
} from "./super-admin-unit.service";

// Super Admin Lease Management (System-Wide)
export { 
  superAdminLeaseService, 
  default as SuperAdminLeaseService 
} from "./super-admin-lease.service";

// Super Admin Invoice Management (System-Wide)
export { 
  superAdminInvoicesService, 
  default as SuperAdminInvoicesService 
} from "./super-admin-invoices.service";

// Super Admin Payment Management (System-Wide)
export { 
  superAdminPaymentsService, 
  default as SuperAdminPaymentsService 
} from "./super-admin-payments.service";

// Super Admin Maintenance Management (System-Wide)
export { 
  superAdminMaintenanceService, 
  default as SuperAdminMaintenanceService 
} from "./super-admin-maintenance.service";

// Super Admin Analytics & Dashboard (System-Wide)
export { 
  superAdminAnalyticsService, 
  default as SuperAdminAnalyticsService 
} from "./super-admin-analytics.service";

// Re-export for convenience
export { tokenManager } from "../api-client";

