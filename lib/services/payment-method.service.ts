/**
 * Payment Method Service
 * Handles landlord payment methods (mobile money & bank details)
 */

import apiClient from "../api-client";
import type { ApiResponse } from "../api-types";

export interface MobileMoneyMethod {
  id?: number;
  provider: "mtn_momo" | "vodafone_cash" | "airteltigo_money";
  account_number: string;
  account_name: string;
  is_active?: boolean;
}

export interface BankTransferMethod {
  id?: number;
  bank_name: string;
  account_number: string;
  account_name: string;
  branch?: string;
  is_active?: boolean;
}

export interface PaymentMethodsData {
  mobile_money?: MobileMoneyMethod[];
  bank_transfer?: BankTransferMethod[];
  cash_enabled?: boolean;
}

class PaymentMethodService {
  private static instance: PaymentMethodService;

  private constructor() {}

  static getInstance(): PaymentMethodService {
    if (!PaymentMethodService.instance) {
      PaymentMethodService.instance = new PaymentMethodService();
    }
    return PaymentMethodService.instance;
  }

  /**
   * Get landlord's payment methods
   */
  async getPaymentMethods(): Promise<ApiResponse<PaymentMethodsData>> {
    return apiClient.get<ApiResponse<PaymentMethodsData>>(
      "/landlord/payment-methods"
    );
  }

  /**
   * Add a mobile money method
   */
  async addMobileMoneyMethod(
    data: Omit<MobileMoneyMethod, "id">
  ): Promise<ApiResponse<MobileMoneyMethod>> {
    return apiClient.post<ApiResponse<MobileMoneyMethod>>(
      "/landlord/payment-methods/mobile-money",
      data
    );
  }

  /**
   * Update a mobile money method
   */
  async updateMobileMoneyMethod(
    id: number,
    data: Partial<MobileMoneyMethod>
  ): Promise<ApiResponse<MobileMoneyMethod>> {
    return apiClient.put<ApiResponse<MobileMoneyMethod>>(
      `/landlord/payment-methods/mobile-money/${id}`,
      data
    );
  }

  /**
   * Delete a mobile money method
   */
  async deleteMobileMoneyMethod(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete<ApiResponse<null>>(
      `/landlord/payment-methods/mobile-money/${id}`
    );
  }

  /**
   * Add a bank transfer method
   */
  async addBankTransferMethod(
    data: Omit<BankTransferMethod, "id">
  ): Promise<ApiResponse<BankTransferMethod>> {
    return apiClient.post<ApiResponse<BankTransferMethod>>(
      "/landlord/payment-methods/bank-transfer",
      data
    );
  }

  /**
   * Update a bank transfer method
   */
  async updateBankTransferMethod(
    id: number,
    data: Partial<BankTransferMethod>
  ): Promise<ApiResponse<BankTransferMethod>> {
    return apiClient.put<ApiResponse<BankTransferMethod>>(
      `/landlord/payment-methods/bank-transfer/${id}`,
      data
    );
  }

  /**
   * Delete a bank transfer method
   */
  async deleteBankTransferMethod(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete<ApiResponse<null>>(
      `/landlord/payment-methods/bank-transfer/${id}`
    );
  }

  /**
   * Get tenant's landlord payment methods
   */
  async getLandlordPaymentMethods(): Promise<ApiResponse<PaymentMethodsData>> {
    return apiClient.get<ApiResponse<PaymentMethodsData>>(
      "/tenant/landlord-payment-methods"
    );
  }
}

export const paymentMethodService = PaymentMethodService.getInstance();
export default paymentMethodService;
