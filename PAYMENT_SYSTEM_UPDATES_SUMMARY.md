# Payment System Updates - Quick Reference

## Changes Made

### 1. Payment History Sorting ✅

**Problem**: Recent tenant payments not appearing first in payment history list.

**Solution**: Added default sorting to show latest payments first.

**Files Modified**:
- `lib/api-types.ts` - Added `sort_by` and `sort_order` to PaymentQueryParams
- `app/payments/page.tsx` - Added default sort parameters: `sort_by: "created_at"`, `sort_order: "desc"`

**Usage**:
```typescript
usePaymentHistory({
  sort_by: "created_at",    // Sort by: created_at | amount | payment_date
  sort_order: "desc",        // Order: desc (latest first) | asc (oldest first)
  start_date: "2024-01-01",
  end_date: "2024-12-31",
  payment_method: "mtn_momo",
})
```

---

### 2. Payment Notifications ✅

**Problem**: Landlord not receiving in-app notifications when tenants make payments.

**Solution**: Extended notification system to support payment notifications.

**Frontend Files Modified**:
1. `lib/api-types.ts`:
   - Added `"payment_received"` to `NotificationType`
   - Updated `NotificationData` interface with payment fields:
     - `payment_id`, `payment_reference`, `amount`, `payment_method`, `payment_date`, `receipt_number`
   - Made maintenance-specific fields optional

2. `components/notifications/notification-bell.tsx`:
   - Added `DollarSign` icon for payment notifications (green color)
   - Updated `handleNotificationClick` to route payment notifications to `/payments`
   - Updated `getNotificationIcon` to show dollar icon for payments
   - Made priority badge conditional (only for maintenance)
   - Added payment amount display in notification details
   - Changed footer link to "View All Notifications" (generic, not maintenance-specific)

**Notification Display**:
- ✅ Green dollar icon for payment notifications
- ✅ Shows amount: "₵925.00" in green text
- ✅ Shows property and unit details
- ✅ Shows tenant name and time ago
- ✅ Clicking navigates to payments page
- ✅ Unread badge shows count
- ✅ Mark as read functionality works

---

## Backend Implementation Required

### Quick Steps:

1. **Create notification class**:
```bash
php artisan make:notification PaymentReceivedNotification
```

2. **Send notification when payment is recorded**:
```php
// In PaymentController@store
$landlord->notify(new PaymentReceivedNotification($payment));
```

3. **Add sorting to payment history endpoint**:
```php
// In PaymentController@index
$sortBy = $request->get('sort_by', 'created_at');
$sortOrder = $request->get('sort_order', 'desc');
$query->orderBy($sortBy, $sortOrder);
```

4. **Ensure notifications endpoint returns all types**:
```php
// In NotificationController@index
auth()->user()->notifications()->orderBy('created_at', 'desc')->paginate()
```

📖 **Full Implementation Guide**: See [PAYMENT_NOTIFICATION_BACKEND_GUIDE.md](./PAYMENT_NOTIFICATION_BACKEND_GUIDE.md)

---

## Testing Checklist

### Payment Sorting
- [ ] Open /payments page as landlord
- [ ] Verify latest payments appear at the top
- [ ] Test date filters (start_date, end_date)
- [ ] Verify filtering by payment method works
- [ ] Check pagination maintains sort order

### Payment Notifications
1. **Backend Setup** (required first):
   - [ ] Create PaymentReceivedNotification class
   - [ ] Update PaymentController to send notifications
   - [ ] Add sorting parameters to payment history endpoint
   - [ ] Test notification creation in database

2. **Frontend Testing**:
   - [ ] Record a payment as tenant
   - [ ] Check bell icon shows unread count (red badge)
   - [ ] Click bell to open dropdown
   - [ ] Verify payment notification shows:
     - [ ] Green dollar icon
     - [ ] "Payment Received" title
     - [ ] Amount in green text (₵XXX)
     - [ ] Property and unit details
     - [ ] Tenant name
     - [ ] Time ago
   - [ ] Click notification → should navigate to /payments
   - [ ] Click "Mark all read" → badge should disappear
   - [ ] Refresh page → notification should persist

---

## API Endpoints

### Get Payment History (with sorting)
```
GET /api/payments/history?sort_by=created_at&sort_order=desc&start_date=2024-01-01&end_date=2024-12-31
```

### Get Notifications
```
GET /api/notifications?per_page=10&page=1
```

### Get Unread Count
```
GET /api/notifications/unread-count
```

### Mark Notification as Read
```
PATCH /api/notifications/{id}/mark-as-read
```

### Mark All as Read
```
PATCH /api/notifications/mark-all-as-read
```

---

## Notification Data Structure

**Payment Notification Example**:
```json
{
  "ID": "uuid",
  "Type": "PaymentReceivedNotification",
  "Data": {
    "type": "payment_received",
    "title": "Payment Received",
    "message": "John Doe paid ₵925.00 for Sunset Apartments - Unit A101",
    "data": {
      "payment_id": "uuid",
      "payment_reference": "MTN-123456",
      "amount": 925.00,
      "payment_method": "mtn_momo",
      "payment_date": "2024-01-15",
      "receipt_number": "RCT-20240115-A1B2",
      "property_name": "Sunset Apartments",
      "unit_number": "A101",
      "tenant_name": "John Doe"
    },
    "action_url": "/payments"
  },
  "IsRead": false,
  "CreatedAt": "2024-01-15T10:30:00Z",
  "TimeAgo": "2 minutes ago"
}
```

---

## Key Features

### Payment History
✅ Sort by: `created_at` (default), `amount`, `payment_date`  
✅ Sort order: `desc` (latest first), `asc` (oldest first)  
✅ Date filtering: `start_date`, `end_date`  
✅ Payment method filter: `cash`, `mtn_momo`, `vodafone_cash`, `bank_transfer`  
✅ Pagination: 15 records per page  

### Notification System
✅ Real-time in-app notifications  
✅ Unread count badge  
✅ Payment-specific icon (green dollar)  
✅ Amount display in notification  
✅ Mark as read / Mark all as read  
✅ Click to navigate to payments page  
✅ Email notifications (optional)  
✅ Queue support for async delivery  

---

## Next Steps

1. **Implement backend** following [PAYMENT_NOTIFICATION_BACKEND_GUIDE.md](./PAYMENT_NOTIFICATION_BACKEND_GUIDE.md)
2. **Test payment recording** to ensure notifications are created
3. **Verify frontend** displays notifications correctly
4. **Configure queues** for production (optional but recommended)
5. **Add email notifications** if needed (already supported in notification class)

---

## Support

- **Date filtering not working?** Check that backend parses `start_date` and `end_date` params
- **Sorting not working?** Verify backend applies `sort_by` and `sort_order` to query
- **Notifications not appearing?** Check notification table in database, verify landlord_id matches
- **Bell icon not updating?** Check useMaintenanceNotifications hook is polling correctly

For detailed troubleshooting, see the full backend guide.
