/**
 * Hooks Index
 * Central export point for all custom hooks
 * Following Single Point of Entry pattern
 */

// Query & Mutation Hooks
export { useApiQuery } from "./use-api-query";
export { useApiMutation } from "./use-api-mutation";

// Auth Hooks
export {
  useLogin,
  useRegister,
  useLogout,
  useForgotPassword,
  useResetPassword,
  useChangePassword,
  useVerifyPassword,
  useAuthStatus,
} from "./use-auth";

// Profile Hooks
export {
  useProfile,
  useUpdateProfile,
  useUploadProfilePicture,
  useDeleteProfilePicture,
} from "./use-profile";

// Dashboard & Analytics Hooks
export {
  useDashboard,
  usePaymentAnalytics,
} from "./use-dashboard";

// Lease Hooks
export {
  useLeases,
  useLease,
  useExpiringLeases,
  useActiveLeases,
  useExpiredLeases,
  useTerminatedLeases,
} from "./use-lease";

// Invoice & Payment Hooks
export {
  useInvoices,
  useInvoice,
  usePendingInvoices,
  usePaidInvoices,
  useOverdueInvoices,
  usePaymentHistory,
  useInvoicePayments,
  useRecordPayment,
} from "./use-invoice";

// Maintenance Hooks
export {
  useMaintenanceRequests,
  useMaintenanceRequest,
  useMaintenanceCategories,
  useCreateMaintenanceRequest,
  useAddMaintenanceNote,
  useMaintenanceStatistics,
} from "./use-maintenance";

// Unit Hooks
export {
  useMyUnit,
  useUnitDetails,
} from "./use-unit";

