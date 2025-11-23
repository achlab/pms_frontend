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
    // Request Interceptor - Add auth token and log requests
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = tokenManager.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Enhanced request logging
        console.group(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        console.log('Full URL:', `${config.baseURL}${config.url}`);
        console.log('Headers:', config.headers);
        console.log('Data:', config.data);
        console.log('Auth Token:', token ? `${token.substring(0, 20)}...` : 'None');
        console.groupEnd();
        
        return config;
      },
      (error: AxiosError) => {
        console.error('❌ Request Interceptor Error:', error);
        return Promise.reject(error);
      }
    );

    // Response Interceptor - Handle errors
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Enhanced response logging
        console.group(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`);
        console.log('Status:', response.status, response.statusText);
        console.log('Data:', response.data);
        console.groupEnd();
        return response;
      },
      async (error: AxiosError<ApiError>) => {
        // Enhanced error logging
        console.group(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
        console.error('Error Object:', error);
        console.error('Error Message:', error.message);
        console.error('Error Code:', error.code);
        
        // Network error
        if (!error.response) {
          console.error('Network Error Details:');
          console.error('- No response from server');
          console.error('- Possible causes: Server down, CORS issue, network disconnected');
          console.error('- Request URL:', `${error.config?.baseURL}${error.config?.url}`);
          console.groupEnd();
          
          throw new ApiClientError(
            "Network error. Please check your internet connection and ensure the backend server is running.",
            undefined,
            undefined
          );
        }

        const { status, data, config: reqConfig } = error.response;
        console.error('Response Status:', status);
        console.error('Response Data:', data);
        console.error('Request URL:', `${reqConfig.baseURL}${reqConfig.url}`);
        console.error('Request Method:', reqConfig.method);
        console.error('Request Data:', reqConfig.data);

        // Normalize error response keys (handle uppercase)
        const errorMessage = (data as any)?.Message || (data as any)?.message;
        const errorErrors = (data as any)?.Errors || (data as any)?.errors;
        
        console.error('Normalized Error Message:', errorMessage);
        console.error('Normalized Error Errors:', errorErrors);
        console.groupEnd();

        // Handle 401 - Unauthorized (token expired or invalid)
        if (status === 401) {
          tokenManager.clearAll();
          
          // Redirect to login only if not already on login page
          if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }

          throw new ApiClientError(
            errorMessage || "Your session has expired. Please login again.",
            status
          );
        }

        // Handle 403 - Forbidden
        if (status === 403) {
          throw new ApiClientError(
            errorMessage || "You don't have permission to perform this action.",
            status
          );
        }

        // Handle 422 - Validation Error
        if (status === 422) {
          throw new ApiClientError(
            errorMessage || "Validation failed",
            status,
            errorErrors
          );
        }

        // Handle 429 - Too Many Requests (Rate Limit)
        if (status === 429) {
          throw new ApiClientError(
            "Too many requests. Please wait a moment and try again.",
            status
          );
        }

        // Handle 404 - Not Found
        if (status === 404) {
          const detailedMessage = errorMessage || 
            `Endpoint not found: ${reqConfig.method?.toUpperCase()} ${reqConfig.baseURL}${reqConfig.url}\n` +
            `Please verify:\n` +
            `1. Backend server is running\n` +
            `2. API base URL is correct (check .env.local)\n` +
            `3. Endpoint exists in backend routes`;
          
          throw new ApiClientError(
            detailedMessage,
            status
          );
        }

        // Handle 500 - Server Error
        if (status >= 500) {
          throw new ApiClientError(
            errorMessage || "Server error. Please try again later.",
            status
          );
        }

        // Generic error
        throw new ApiClientError(
          errorMessage || "An unexpected error occurred.",
          status,
          errorErrors
        );
      }
    );
  }

  getAxiosInstance(): AxiosInstance {
    return this.instance;
  }

  // ============================================
  // RESPONSE NORMALIZATION
  // ============================================

  /**
   * Normalize API response keys from uppercase to lowercase
   * Backend returns: { Success, Data, Message, Errors }
   * OR: { success, user, token, message } (for user creation)
   * Frontend expects: { success, data, message, errors }
   */
  private normalizeResponse<T>(responseData: any): T {
    if (!responseData || typeof responseData !== 'object') {
      return responseData;
    }

    // Log for debugging
    console.log('API Response (raw):', responseData);

    // Check if response has uppercase keys and convert to lowercase
    if ('Success' in responseData || 'Data' in responseData) {
      const normalized = {
        success: responseData.Success ?? responseData.success,
        data: responseData.Data ?? responseData.data,
        message: responseData.Message ?? responseData.message,
        errors: responseData.Errors ?? responseData.errors,
      } as T;
      
      console.log('API Response (normalized from uppercase):', normalized);
      return normalized;
    }

    // Handle user creation response format: { success, user, token, message }
    // Convert to: { success, data: { user, token }, message }
    if (responseData.success && responseData.user && responseData.token) {
      const normalized = {
        success: responseData.success,
        data: {
          user: responseData.user,
          token: responseData.token,
        },
        message: responseData.message,
      } as T;
      
      console.log('API Response (normalized user creation):', normalized);
      return normalized;
    }

    console.log('API Response (no normalization needed):', responseData);
    return responseData as T;
  }

  // ============================================
  // HTTP METHODS
  // ============================================

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get(url, config);
    return this.normalizeResponse<T>(response.data);
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post(url, data, config);
    return this.normalizeResponse<T>(response.data);
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put(url, data, config);
    return this.normalizeResponse<T>(response.data);
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.patch(url, data, config);
    return this.normalizeResponse<T>(response.data);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete(url, config);
    return this.normalizeResponse<T>(response.data);
  }

  // ============================================
  // MULTIPART/FORM-DATA REQUESTS
  // ============================================

  async postFormData<T>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        "Content-Type": "multipart/form-data",
      },
    });
    return this.normalizeResponse<T>(response.data);
  }

  async putFormData<T>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        "Content-Type": "multipart/form-data",
      },
    });
    return this.normalizeResponse<T>(response.data);
  }
}

// Export singleton instance
export const apiClient = ApiClient.getInstance();

// Export axios instance for advanced use cases
export const axiosInstance = apiClient.getAxiosInstance();

export default apiClient;

