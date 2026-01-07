import apiClient from "../api-client";
import type {
  ApiResponse,
  PaginatedResponse,
  RentRollDetailCaretaker,
  RentRollDetailTenant,
  RentRollEntry,
  RentRollSummary,
} from "../api-types";
import { buildUrl } from "../api-utils";

export interface RentRollQueryParams {
  type?: "tenant" | "caretaker";
  status?: string;
  property_id?: string;
  search?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: "asc" | "desc";
}

class RentRollService {
  async getRentRoll(params?: RentRollQueryParams): Promise<PaginatedResponse<RentRollEntry>> {
    const url = buildUrl("/rent-roll", params);
    return apiClient.get<PaginatedResponse<RentRollEntry>>(url);
  }

  async getSummary(): Promise<ApiResponse<RentRollSummary>> {
    return apiClient.get<ApiResponse<RentRollSummary>>("/rent-roll/summary");
  }

  async getTenantDetail(tenantId: string): Promise<ApiResponse<RentRollDetailTenant>> {
    return apiClient.get<ApiResponse<RentRollDetailTenant>>(`/rent-roll/tenants/${tenantId}`);
  }

  async getCaretakerDetail(caretakerId: string): Promise<ApiResponse<RentRollDetailCaretaker>> {
    return apiClient.get<ApiResponse<RentRollDetailCaretaker>>(`/rent-roll/caretakers/${caretakerId}`);
  }
}

export const rentRollService = new RentRollService();
export default rentRollService;

