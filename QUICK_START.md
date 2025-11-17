# 🚀 Quick Start Guide - API Integration

## 🎯 5-Minute Quick Start

### 1. Environment Setup (1 min)

Set your API base URL (already configured for localhost):

```env
# .env.local (already created)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

### 2. Login Example (2 min)

```typescript
"use client";

import { useLogin } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  
  const { mutate: login, isLoading } = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login({ email, password });
      toast.success("Login successful!");
      router.push("/dashboard");
    } catch (error) {
      // Error already shown by hook
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tenant1@pms.com"
      />
      <Input 
        type="password" 
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Tenant123!"
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
}
```

### 3. Fetch Data Example (2 min)

```typescript
"use client";

import { useApiQuery } from "@/lib/hooks/use-api-query";
import apiClient from "@/lib/api-client";
import { DashboardSkeleton } from "@/components/ui/loading-skeleton";
import type { ApiResponse, DashboardData } from "@/lib/api-types";

export default function DashboardPage() {
  const { data, isLoading, error } = useApiQuery<ApiResponse<DashboardData>>(
    ["dashboard"],
    () => apiClient.get("/analytics/dashboard")
  );

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <div>Error loading dashboard</div>;

  const dashboard = data?.data;

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Pending Invoices: {dashboard?.overview.pending_invoices}</p>
      <p>Outstanding Balance: GHS {dashboard?.overview.outstanding_balance}</p>
    </div>
  );
}
```

## 📚 Common Use Cases

### Use Case 1: Get User Profile

```typescript
import { useProfile } from "@/lib/hooks/use-profile";

function ProfilePage() {
  const { data, isLoading } = useProfile();
  
  if (isLoading) return <ProfileSkeleton />;
  
  const profile = data?.data;
  
  return <div>Welcome, {profile?.name}!</div>;
}
```

### Use Case 2: Update Profile

```typescript
import { useUpdateProfile } from "@/lib/hooks/use-profile";
import { toast } from "sonner";

function EditProfileForm() {
  const { mutate: updateProfile, isLoading } = useUpdateProfile();

  const handleSubmit = async (formData) => {
    try {
      await updateProfile(formData);
      toast.success("Profile updated!");
    } catch (error) {
      // Error handled automatically
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
}
```

### Use Case 3: Create Maintenance Request

```typescript
import { useApiMutation } from "@/lib/hooks/use-api-mutation";
import apiClient from "@/lib/api-client";
import { createFormData } from "@/lib/api-utils";

function CreateMaintenanceRequest() {
  const { mutate, isLoading } = useApiMutation((data) =>
    apiClient.postFormData("/maintenance/requests", createFormData(data))
  );

  const handleSubmit = (formData) => {
    mutate({
      title: formData.title,
      description: formData.description,
      priority: "urgent",
      category_id: formData.categoryId,
      media: formData.files, // Array of File objects
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
}
```

### Use Case 4: Record Payment

```typescript
import { useApiMutation } from "@/lib/hooks/use-api-mutation";
import apiClient from "@/lib/api-client";

function RecordPaymentModal({ invoiceId }) {
  const { mutate, isLoading } = useApiMutation(
    (data) => apiClient.post(`/payments/invoices/${invoiceId}/record`, data),
    {
      onSuccess: () => {
        toast.success("Payment recorded!");
        refetchInvoices();
        closeModal();
      },
    }
  );

  const handleSubmit = (data) => {
    mutate({
      amount: data.amount,
      payment_method: "mobile_money",
      payment_reference: data.reference,
      payment_date: formatDateForApi(new Date()),
      notes: data.notes,
    });
  };

  return (
    // Modal with form
  );
}
```

### Use Case 5: List Invoices with Filters

```typescript
import { useApiQuery } from "@/lib/hooks/use-api-query";
import apiClient from "@/lib/api-client";
import { buildUrl } from "@/lib/api-utils";
import type { PaginatedResponse, Invoice } from "@/lib/api-types";

function InvoicesPage() {
  const [filters, setFilters] = useState({ status: "pending", page: 1 });

  const { data, isLoading, refetch } = useApiQuery<PaginatedResponse<Invoice>>(
    ["invoices", filters],
    () => apiClient.get(buildUrl("/invoices", filters))
  );

  const invoices = data?.data || [];
  const total = data?.meta.total || 0;

  return (
    <div>
      <select onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
        <option value="pending">Pending</option>
        <option value="paid">Paid</option>
        <option value="overdue">Overdue</option>
      </select>

      {isLoading ? (
        <InvoiceListSkeleton />
      ) : (
        invoices.map((invoice) => (
          <InvoiceCard key={invoice.id} invoice={invoice} />
        ))
      )}

      <p>Total: {total} invoices</p>
    </div>
  );
}
```

## 🎨 Loading States

Always show loading states:

```typescript
import { 
  DashboardSkeleton,
  InvoiceListSkeleton,
  TableSkeleton,
  CardSkeleton,
} from "@/components/ui/loading-skeleton";

// For dashboard
if (isLoading) return <DashboardSkeleton />;

// For invoice list
if (isLoading) return <InvoiceListSkeleton items={3} />;

// For table
if (isLoading) return <TableSkeleton rows={5} columns={4} />;

// For single card
if (isLoading) return <CardSkeleton />;
```

## ⚠️ Error Handling

```typescript
import { getErrorMessage, formatValidationErrors } from "@/lib/api-utils";
import { toast } from "sonner";

// Option 1: Using hooks with callbacks
const { mutate, error } = useApiMutation(submitForm, {
  onError: (err) => {
    toast.error(getErrorMessage(err));
  },
});

// Option 2: Try-catch in handler
const handleSubmit = async (data) => {
  try {
    await mutate(data);
  } catch (error) {
    toast.error(getErrorMessage(error));
  }
};

// Option 3: Show validation errors on form
const formErrors = formatValidationErrors(error);
<Input error={formErrors.email} />
```

## 🔐 Protected Routes

```typescript
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStatus } from "@/lib/hooks/use-auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function ProtectedLayout({ children }) {
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

  return <>{children}</>;
}
```

## 📋 Checklist

Before starting development:

- [ ] API is running on `http://localhost:8000`
- [ ] Test credentials ready: `tenant1@pms.com` / `Tenant123!`
- [ ] Environment variables configured
- [ ] Axios installed: `npm install axios`
- [ ] Understand the hook patterns

## 🆘 Troubleshooting

### "Network Error"
```bash
# Check if API is running
curl http://localhost:8000/api

# Check CORS settings in backend
```

### "401 Unauthorized"
```typescript
// You'll be auto-redirected to login
// If not, clear storage and login again
localStorage.clear();
```

### "422 Validation Error"
```typescript
// Access validation errors
const { mutate, error } = useApiMutation(submitForm);
const formErrors = formatValidationErrors(error);
// Display in form: formErrors.fieldName
```

## 🎓 Learning Path

1. ✅ Read this Quick Start (5 min)
2. ✅ Try the Login Example (5 min)
3. ✅ Try the Fetch Data Example (5 min)
4. ✅ Read API_INTEGRATION_GUIDE.md (20 min)
5. ✅ Review API_ENDPOINTS.md in /plg (30 min)
6. ✅ Start building features!

## 📖 Reference

- **Types**: `lib/api-types.ts`
- **Services**: `lib/services/`
- **Hooks**: `lib/hooks/`
- **Utils**: `lib/api-utils.ts`
- **Full Guide**: `lib/API_INTEGRATION_GUIDE.md`
- **API Docs**: `plg/TENANT_API_ENDPOINTS.md`

## 🚀 You're Ready!

Start building with confidence. The infrastructure handles:
- ✅ Token management
- ✅ Error handling
- ✅ Loading states
- ✅ Type safety
- ✅ Request/response interceptors

Just focus on your UI and business logic!

---

**Happy Coding! 🎉**

