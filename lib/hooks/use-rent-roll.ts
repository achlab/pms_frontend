import { useApiQuery } from "./use-api-query";
import type {
  ApiResponse,
  PaginatedResponse,
  RentRollDetailCaretaker,
  RentRollDetailTenant,
  RentRollEntry,
  RentRollSummary,
} from "../api-types";
import rentRollService, { RentRollQueryParams } from "../services/rent-roll.service";

export function useRentRoll(params?: RentRollQueryParams) {
  return useApiQuery<PaginatedResponse<RentRollEntry>>(
    ["rent-roll", params],
    () => rentRollService.getRentRoll(params),
    {
      keepPreviousData: true,
    }
  );
}

export function useRentRollSummary() {
  return useApiQuery<ApiResponse<RentRollSummary>>(
    ["rent-roll-summary"],
    () => rentRollService.getSummary()
  );
}

export function useRentRollTenantDetail(tenantId?: string) {
  return useApiQuery<ApiResponse<RentRollDetailTenant>>(
    ["rent-roll-tenant", tenantId],
    () => rentRollService.getTenantDetail(tenantId as string),
    {
      enabled: Boolean(tenantId),
    }
  );
}

export function useRentRollCaretakerDetail(caretakerId?: string) {
  return useApiQuery<ApiResponse<RentRollDetailCaretaker>>(
    ["rent-roll-caretaker", caretakerId],
    () => rentRollService.getCaretakerDetail(caretakerId as string),
    {
      enabled: Boolean(caretakerId),
    }
  );
}

