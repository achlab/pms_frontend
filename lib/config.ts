/**
 * Application Configuration
 * Centralized configuration management following Single Responsibility Principle
 */

export const config = {
  api: {
    // Try 127.0.0.1 instead of localhost (sometimes fixes network issues)
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api",
    timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 30000,
  },
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || "Property Management System",
    version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
  },
  storage: {
    tokenKey: "pms_auth_token",
    userKey: "pms_user_data",
  },
} as const;

export default config;

