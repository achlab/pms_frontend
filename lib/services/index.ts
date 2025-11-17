/**
 * Services Index
 * Central export point for all API services
 * Following Single Point of Entry pattern
 */

// Authentication & Profile
export { authService, default as AuthenticationService } from "./auth.service";
export { profileService, default as ProfileService } from "./profile.service";

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

// Re-export for convenience
export { tokenManager } from "../api-client";

