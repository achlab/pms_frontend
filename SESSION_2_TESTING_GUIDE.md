# 🧪 Session 2: Testing Guide

## Quick Test Instructions

### 1. Start the Backend API

Make sure your Laravel backend is running:
```bash
cd /path/to/backend
php artisan serve
```

Should be running on: `http://localhost:8000`

### 2. Test Login

Use one of the test credentials from the API documentation:

```
Email: tenant1@pms.com
Password: Tenant123!
```

Other test accounts:
- `tenant2@pms.com` / `Tenant123!`
- `tenant3@pms.com` / `Tenant123!`
- `demo@pms.com` / `Demo123!`

### 3. Access the New Dashboard

#### Option A: Test the New Page Directly

Navigate to: `http://localhost:3000/tenant/dashboard/page-new.tsx`

Or temporarily rename the files:
```bash
# Backup old file
mv app/tenant/dashboard/page.tsx app/tenant/dashboard/page-old.tsx

# Make new file active
mv app/tenant/dashboard/page-new.tsx app/tenant/dashboard/page.tsx
```

Then visit: `http://localhost:3000/tenant/dashboard`

#### Option B: Test Components Individually

Create a test page in `app/test-dashboard/page.tsx`:

```typescript
"use client";

import { useDashboard } from "@/lib/hooks/use-dashboard";
import { DashboardStatsOverview } from "@/components/dashboard/dashboard-stats-overview";
import { CurrentLeaseCard } from "@/components/dashboard/current-lease-card";
import { MaintenanceOverviewCard } from "@/components/dashboard/maintenance-overview-card";
import { RecentPaymentsCard } from "@/components/dashboard/recent-payments-card";

export default function TestDashboard() {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data?.data) return <div>No data</div>;

  const dashboard = data.data;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Test</h1>
      
      <DashboardStatsOverview overview={dashboard.overview} />
      
      <div className="grid gap-6 md:grid-cols-2">
        <CurrentLeaseCard lease={dashboard.current_lease} />
        <MaintenanceOverviewCard maintenance={dashboard.maintenance_requests} />
      </div>
      
      <RecentPaymentsCard 
        payments={dashboard.recent_payments}
        upcomingDueDate={dashboard.upcoming_due_date}
      />
    </div>
  );
}
```

Then visit: `http://localhost:3000/test-dashboard`

### 4. What to Test

#### ✅ Loading States
1. Open DevTools Network tab
2. Throttle to "Slow 3G"
3. Refresh page
4. Verify skeleton loader appears
5. Verify smooth transition to content

#### ✅ Dashboard Stats
1. Check all 6 stat cards display correctly
2. Verify numbers are formatted
3. Verify colors match status (green=paid, red=overdue, etc.)
4. Verify icons are appropriate

#### ✅ Current Lease Card
1. Check property name and address display
2. Check unit number and bed/bath count
3. Verify lease dates are formatted
4. Verify monthly rent shows with currency (GHS)
5. If lease expiring soon (< 60 days):
   - Warning banner should appear
   - Days remaining should be orange
6. Click "View Full Lease Details" button
   - Should navigate to `/my-lease`

#### ✅ Maintenance Overview
1. Check total requests count
2. Verify status breakdown (Received, In Progress, Resolved)
3. If urgent requests exist:
   - Badge should show count
   - Warning banner should appear
4. Click "View All" button → Navigate to `/maintenance-requests`
5. Click "New Request" button → Navigate to create form

#### ✅ Recent Payments
1. If upcoming due date exists:
   - Blue banner should show
   - Date should be formatted
2. Check payments list:
   - Amount with currency
   - Payment method label
   - Date formatted
   - Status badge colored correctly
3. Click payment item → Navigate to `/payments`
4. Click "Make a Payment" → Navigate to `/pay-rent`

#### ✅ Error Handling
1. Stop backend API
2. Refresh dashboard page
3. Verify error state appears
4. Verify "Retry" button exists
5. Start backend
6. Click "Retry"
7. Verify data loads

#### ✅ Empty States
Test with a new tenant account (no data):
1. No lease → "No active lease found" message
2. No payments → "No recent payments" message with icon

#### ✅ Responsive Design
1. Open DevTools Responsive Mode
2. Test at breakpoints:
   - Mobile (375px): Single column
   - Tablet (768px): 2 columns
   - Desktop (1024px+): 3 columns
3. Verify all content is readable
4. Verify buttons are tap-friendly

#### ✅ Dark Mode
1. Toggle dark mode
2. Verify all components adapt
3. Check text contrast
4. Check card backgrounds

## 🐛 Common Issues & Solutions

### Issue: "Network Error"
**Solution**: 
- Check backend is running on port 8000
- Check `NEXT_PUBLIC_API_BASE_URL` in config
- Check CORS settings in Laravel

### Issue: "401 Unauthorized"
**Solution**:
- Login again
- Check token in localStorage
- Check token expiration

### Issue: "No data showing"
**Solution**:
- Check browser console for errors
- Verify API response in Network tab
- Check data structure matches types

### Issue: "Skeleton never goes away"
**Solution**:
- Check `isLoading` state
- Check API response time
- Check for JS errors

## 📊 Expected API Response

When you call `GET /analytics/dashboard`, you should get:

```json
{
  "success": true,
  "data": {
    "overview": {
      "total_invoices": 10,
      "paid_invoices": 6,
      "pending_invoices": 3,
      "overdue_invoices": 1,
      "total_amount_paid": 12500.00,
      "outstanding_balance": 2500.00
    },
    "current_lease": {
      "id": "uuid",
      "start_date": "2024-06-01",
      "end_date": "2025-06-01",
      "monthly_rent": 1500.00,
      "status": "active",
      "days_until_expiration": 201,
      "property": {
        "name": "Ocean View Towers",
        "address": "Cantonments, Accra"
      },
      "unit": {
        "unit_number": "A01",
        "bedrooms": 2,
        "bathrooms": 2
      }
    },
    "maintenance_requests": {
      "total": 5,
      "received": 1,
      "in_progress": 2,
      "resolved": 2,
      "urgent_count": 1
    },
    "recent_payments": [
      {
        "id": "uuid",
        "amount": 1500.00,
        "payment_date": "2025-11-01",
        "payment_method": "mobile_money",
        "status": "completed"
      }
    ],
    "upcoming_due_date": "2025-12-01"
  }
}
```

## 🔍 Debug Checklist

If dashboard doesn't work:

1. **Check Console**
   ```
   Open DevTools → Console
   Look for red errors
   ```

2. **Check Network**
   ```
   Open DevTools → Network
   Filter: XHR/Fetch
   Look for failed requests
   ```

3. **Check Auth**
   ```
   DevTools → Application → Local Storage
   Look for: pms_auth_token
   Should have value
   ```

4. **Check API**
   ```bash
   # Test directly with curl
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        http://localhost:8000/api/analytics/dashboard
   ```

5. **Check Types**
   ```typescript
   // In component, log the data
   console.log("Dashboard Data:", data);
   console.log("Data Type:", typeof data);
   ```

## ✅ Success Criteria

Dashboard is working correctly when:

- [x] All 6 stat cards display with correct data
- [x] Lease card shows property and unit info
- [x] Maintenance card shows request counts
- [x] Payments list shows recent transactions
- [x] All navigation buttons work
- [x] Loading states appear and disappear
- [x] Error states show when API fails
- [x] Retry button works
- [x] Dark mode works
- [x] Responsive on mobile
- [x] No console errors
- [x] No TypeScript errors
- [x] No linting warnings

## 🎉 Next Steps After Testing

Once dashboard tests pass:

1. Commit the changes
2. Move to Session 3 (Lease Management)
3. Or continue testing other features

---

**Happy Testing! 🚀**

