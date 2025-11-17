# 🚀 API Integration Guide

## Overview

This guide explains the new API infrastructure implemented for the Property Management System tenant portal. The implementation follows **SOLID, DRY, KISS**, and **Separation of Concerns** principles.

## 📁 File Structure

```
lib/
├── api-types.ts              # TypeScript types for all API entities
├── api-client.ts             # Axios client with interceptors
├── api-utils.ts              # Utility functions for API operations
├── config.ts                 # Application configuration
├── auth.ts                   # Legacy compatibility layer
├── services/
│   ├── index.ts             # Services export point
│   ├── auth.service.ts      # Authentication service
│   └── profile.service.ts   # Profile management service
└── hooks/
    ├── index.ts             # Hooks export point
    ├── use-api-query.ts     # Query hook for GET requests
    ├── use-api-mutation.ts  # Mutation hook for POST/PUT/DELETE
    ├── use-auth.ts          # Authentication hooks
    └── use-profile.ts       # Profile management hooks

components/
└── ui/
    └── loading-skeleton.tsx  # Reusable loading components
```

## 🏗️ Architecture

### 1. **API Client Layer** (`api-client.ts`)

The foundation of all API communication:

- **Singleton Pattern**: Single Axios instance across the app
- **Token Management**: Automatic token injection via interceptors
- **Error Handling**: Centralized error transformation
- **Auto-Redirect**: 401 errors redirect to login
- **Request/Response Interceptors**: Add auth headers, handle errors

```typescript
import apiClient from "@/lib/api-client";

// GET request
const data = await apiClient.get<ResponseType>("/endpoint");

// POST request
const result = await apiClient.post<ResponseType>("/endpoint", payload);

// File upload
const formData = new FormData();
formData.append("file", file);
const response = await apiClient.postFormData("/endpoint", formData);
```

### 2. **Service Layer** (`services/`)

Domain-specific business logic:

- **Single Responsibility**: Each service handles one domain
- **Singleton Pattern**: One instance per service
- **Type Safety**: Full TypeScript support
- **Separation of Concerns**: Services don't know about React

```typescript
import { authService } from "@/lib/services/auth.service";

// Login
const response = await authService.login("email@example.com", "password");

// Get current user
const user = authService.getCurrentUser();
```

### 3. **Hooks Layer** (`hooks/`)

React integration for services:

- **useApiQuery**: For GET requests with caching
- **useApiMutation**: For POST/PUT/DELETE operations
- **Domain Hooks**: Wrapped hooks for specific operations

```typescript
import { useLogin } from "@/lib/hooks/use-auth";

function LoginForm() {
  const { mutate: login, isLoading, error } = useLogin();

  const handleSubmit = async (data) => {
    await login({ email: data.email, password: data.password });
  };

  return (
    // Your form JSX
  );
}
```

### 4. **Utilities Layer** (`api-utils.ts`)

Helper functions for common operations:

- Error message extraction
- Validation error formatting
- Query string building
- Date/currency formatting
- File validation

```typescript
import { getErrorMessage, formatCurrency, buildUrl } from "@/lib/api-utils";

// Get user-friendly error message
const message = getErrorMessage(error);

// Format currency
const formatted = formatCurrency(1500.00); // "GHS 1,500.00"

// Build URL with query params
const url = buildUrl("/invoices", { status: "pending", page: 1 });
```

## 🔐 Authentication Flow

### Login Process

```typescript
import { useLogin } from "@/lib/hooks/use-auth";

function LoginPage() {
  const { mutate: login, isLoading, error, isSuccess } = useLogin();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login({ email, password });
      // Token and user are automatically stored
      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      // Error is already handled by the hook
      console.error("Login failed:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      {isLoading && <Spinner />}
      {error && <ErrorMessage error={error} />}
    </form>
  );
}
```

### Protected Routes

```typescript
import { useAuthStatus } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function ProtectedPage() {
  const { isAuthenticated } = useAuthStatus();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

  return <YourContent />;
}
```

### Token Management

Tokens are automatically managed:
- **Storage**: localStorage
- **Injection**: Automatic via interceptors
- **Expiration**: Auto-redirect on 401
- **Cleanup**: Removed on logout

## 📊 Data Fetching Patterns

### Query Pattern (GET)

```typescript
import { useApiQuery } from "@/lib/hooks/use-api-query";
import apiClient from "@/lib/api-client";

function InvoicesList() {
  const { data, isLoading, error, refetch } = useApiQuery(
    ["invoices", "pending"], // Query key
    () => apiClient.get("/invoices?status=pending"),
    {
      enabled: true, // Fetch immediately
      refetchOnWindowFocus: true,
    }
  );

  if (isLoading) return <InvoiceListSkeleton />;
  if (error) return <ErrorState error={error} />;

  return <InvoiceTable data={data?.data} />;
}
```

### Mutation Pattern (POST/PUT/DELETE)

```typescript
import { useApiMutation } from "@/lib/hooks/use-api-mutation";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

function RecordPaymentForm({ invoiceId }) {
  const { mutate, isLoading } = useApiMutation(
    (data) => apiClient.post(`/payments/invoices/${invoiceId}/record`, data),
    {
      onSuccess: () => {
        toast.success("Payment recorded successfully");
        refetchInvoices();
      },
      onError: (error) => {
        toast.error(getErrorMessage(error));
      },
    }
  );

  const handleSubmit = (formData) => {
    mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button disabled={isLoading}>
        {isLoading ? "Recording..." : "Record Payment"}
      </button>
    </form>
  );
}
```

## 🎨 Loading States

Use the provided skeleton components for consistent loading UX:

```typescript
import {
  DashboardSkeleton,
  InvoiceListSkeleton,
  TableSkeleton,
  CardSkeleton,
} from "@/components/ui/loading-skeleton";

function DashboardPage() {
  const { data, isLoading } = useApiQuery(["dashboard"], getDashboard);

  if (isLoading) return <DashboardSkeleton />;

  return <DashboardContent data={data} />;
}
```

## ⚠️ Error Handling

### Error Types

```typescript
import { ApiClientError } from "@/lib/api-client";
import { isValidationError, isAuthError, isNetworkError } from "@/lib/api-utils";

try {
  await apiClient.post("/endpoint", data);
} catch (error) {
  if (error instanceof ApiClientError) {
    if (error.isValidationError) {
      // Handle validation errors
      const errors = error.getValidationErrors();
      setFormErrors(errors);
    } else if (error.isAuthError) {
      // Redirect to login (already handled by interceptor)
    } else if (error.isNetworkError) {
      toast.error("Network error. Check your connection.");
    }
  }
}
```

### Validation Errors

```typescript
import { formatValidationErrors } from "@/lib/api-utils";

const { mutate, error } = useApiMutation(submitForm);

// Convert API validation errors to form errors
const formErrors = formatValidationErrors(error);

<Input error={formErrors.email} />
<Input error={formErrors.password} />
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_API_TIMEOUT=30000
```

### Config Access

```typescript
import config from "@/lib/config";

const apiUrl = config.api.baseUrl;
const timeout = config.api.timeout;
```

## 📝 Type Safety

All API responses are fully typed:

```typescript
import type {
  Invoice,
  Payment,
  Lease,
  MaintenanceRequest,
  ApiResponse,
  PaginatedResponse,
} from "@/lib/api-types";

// Typed response
const response = await apiClient.get<ApiResponse<Invoice>>(`/invoices/${id}`);
const invoice: Invoice | undefined = response.data;

// Paginated response
const result = await apiClient.get<PaginatedResponse<Payment>>("/payments/history");
const payments: Payment[] = result.data;
const total: number = result.meta.total;
```

## 🧪 Testing

### Mock API Responses

```typescript
import { vi } from "vitest";
import apiClient from "@/lib/api-client";

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({ success: true, data: mockData }),
    post: vi.fn().mockResolvedValue({ success: true, data: mockData }),
  },
}));
```

## 🚀 Best Practices

1. **Always use hooks in components** - Don't call services directly
2. **Use skeletons for loading states** - Better UX than spinners
3. **Handle errors gracefully** - Show user-friendly messages
4. **Validate on client** - Before sending to API
5. **Use toast notifications** - For success/error feedback
6. **Implement optimistic updates** - Where appropriate
7. **Cache frequently used data** - Profile, categories, etc.
8. **Debounce search inputs** - Reduce API calls

## 📚 Examples

### Complete Form Example

```typescript
import { useApiMutation } from "@/lib/hooks/use-api-mutation";
import { formatValidationErrors, getErrorMessage } from "@/lib/api-utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

function CreateMaintenanceRequest() {
  const [formData, setFormData] = useState({});
  
  const { mutate, isLoading, error } = useApiMutation(
    (data) => apiClient.post("/maintenance/requests", data),
    {
      onSuccess: (response) => {
        toast.success("Maintenance request created successfully");
        router.push("/maintenance");
      },
      onError: (err) => {
        toast.error(getErrorMessage(err));
      },
    }
  );

  const formErrors = formatValidationErrors(error);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        error={formErrors.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
      />
      
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Request"}
      </Button>
    </form>
  );
}
```

## 🔄 Migration from Mock Data

The new API is backward compatible. Existing code using `AuthService` will work:

```typescript
// Old code (still works)
import { AuthService } from "@/lib/auth";
const user = await AuthService.login(email, password);

// New code (recommended)
import { useLogin } from "@/lib/hooks/use-auth";
const { mutate: login } = useLogin();
await login({ email, password });
```

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review the API documentation in `/plg/TENANT_API_ENDPOINTS.md`
3. Check the Postman collection for examples
4. Contact the development team

---

**Version:** 1.0.0  
**Last Updated:** Session 1 Implementation  
**Status:** ✅ Ready for Production

