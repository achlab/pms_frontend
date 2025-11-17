/**
 * API Client using Axios
 * Centralized HTTP client with interceptors, error handling, and token management
 * Following SOLID principles and Separation of Concerns
 */

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import config from "./config";
import type { ApiError, ApiResponse } from "./api-types";

// ============================================
// TOKEN MANAGEMENT
// ============================================

class TokenManager {
  private static instance: TokenManager;

  private constructor() {}

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(config.storage.tokenKey);
  }

  setToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(config.storage.tokenKey, token);
  }

  removeToken(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(config.storage.tokenKey);
  }

  getUserData(): any | null {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem(config.storage.userKey);
    return data ? JSON.parse(data) : null;
  }

  setUserData(user: any): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(config.storage.userKey, JSON.stringify(user));
  }

  removeUserData(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(config.storage.userKey);
  }

  clearAll(): void {
    this.removeToken();
    this.removeUserData();
  }
}

export const tokenManager = TokenManager.getInstance();

// ============================================
// ERROR HANDLING
// ============================================

export class ApiClientError extends Error {
  public status?: number;
  public errors?: Record<string, string[]>;
  public isValidationError: boolean = false;
  public isAuthError: boolean = false;
  public isNetworkError: boolean = false;

  constructor(message: string, status?: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.errors = errors;

    // Classify error types
    this.isValidationError = status === 422;
    this.isAuthError = status === 401 || status === 403;
    this.isNetworkError = !status;
  }

  getValidationErrors(): Record<string, string[]> {
    return this.errors || {};
  }

  getFirstError(): string {
    if (this.errors) {
      const firstKey = Object.keys(this.errors)[0];
      return this.errors[firstKey]?.[0] || this.message;
    }
    return this.message;
  }
}

// ============================================
// AXIOS INSTANCE
// ============================================

class ApiClient {
  private instance: AxiosInstance;
  private static apiClientInstance: ApiClient;

  private constructor() {
    this.instance = axios.create({
      baseURL: config.api.baseUrl,
      timeout: config.api.timeout,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });

    this.setupInterceptors();
  }

  static getInstance(): ApiClient {
    if (!ApiClient.apiClientInstance) {
      ApiClient.apiClientInstance = new ApiClient();
    }
    return ApiClient.apiClientInstance;
  }

  private setupInterceptors(): void {
    // Request Interceptor - Add auth token
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = tokenManager.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response Interceptor - Handle errors
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: AxiosError<ApiError>) => {
        // Network error
        if (!error.response) {
          throw new ApiClientError(
            "Network error. Please check your internet connection.",
            undefined,
            undefined
          );
        }

        const { status, data } = error.response;

        // Handle 401 - Unauthorized (token expired or invalid)
        if (status === 401) {
          tokenManager.clearAll();
          
          // Redirect to login only if not already on login page
          if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }

          throw new ApiClientError(
            data?.message || "Your session has expired. Please login again.",
            status
          );
        }

        // Handle 403 - Forbidden
        if (status === 403) {
          throw new ApiClientError(
            data?.message || "You don't have permission to perform this action.",
            status
          );
        }

        // Handle 422 - Validation Error
        if (status === 422) {
          throw new ApiClientError(
            data?.message || "Validation failed",
            status,
            data?.errors
          );
        }

        // Handle 404 - Not Found
        if (status === 404) {
          throw new ApiClientError(
            data?.message || "The requested resource was not found.",
            status
          );
        }

        // Handle 500 - Server Error
        if (status >= 500) {
          throw new ApiClientError(
            data?.message || "Server error. Please try again later.",
            status
          );
        }

        // Generic error
        throw new ApiClientError(
          data?.message || "An unexpected error occurred.",
          status,
          data?.errors
        );
      }
    );
  }

  getAxiosInstance(): AxiosInstance {
    return this.instance;
  }

  // ============================================
  // HTTP METHODS
  // ============================================

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<T>(url, config);
    return response.data;
  }

  // ============================================
  // MULTIPART/FORM-DATA REQUESTS
  // ============================================

  async postFormData<T>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post<T>(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  async putFormData<T>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put<T>(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }
}

// Export singleton instance
export const apiClient = ApiClient.getInstance();

// Export axios instance for advanced use cases
export const axiosInstance = apiClient.getAxiosInstance();

export default apiClient;

