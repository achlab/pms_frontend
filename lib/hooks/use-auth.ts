/**
 * useAuth Hook
 * Custom hook for authentication operations
 * Provides easy access to auth service with React state management
 */

import { useCallback } from "react";
import { useApiMutation } from "./use-api-mutation";
import authService from "../services/auth.service";
import type {
  LoginResponse,
  RegisterRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "../api-types";

export function useLogin() {
  return useApiMutation<LoginResponse, { email: string; password: string }>(
    async ({ email, password }) => {
      return authService.login(email, password);
    }
  );
}

export function useRegister() {
  return useApiMutation<LoginResponse, RegisterRequest>(async (data) => {
    return authService.register(data);
  });
}

export function useLogout() {
  return useApiMutation<any, void>(async () => {
    return authService.logout();
  });
}

export function useForgotPassword() {
  return useApiMutation<any, { email: string }>(async ({ email }) => {
    return authService.forgotPassword(email);
  });
}

export function useResetPassword() {
  return useApiMutation<any, ResetPasswordRequest>(async (data) => {
    return authService.resetPassword(data);
  });
}

export function useChangePassword() {
  return useApiMutation<any, ChangePasswordRequest>(async (data) => {
    return authService.changePassword(data);
  });
}

export function useVerifyPassword() {
  return useApiMutation<any, { password: string }>(async ({ password }) => {
    return authService.verifyPassword(password);
  });
}

/**
 * Hook to check authentication status
 */
export function useAuthStatus() {
  const isAuthenticated = useCallback(() => {
    return authService.isAuthenticated();
  }, []);

  const getCurrentUser = useCallback(() => {
    return authService.getCurrentUser();
  }, []);

  const getToken = useCallback(() => {
    return authService.getToken();
  }, []);

  return {
    isAuthenticated: isAuthenticated(),
    currentUser: getCurrentUser(),
    token: getToken(),
  };
}

export default useLogin;

