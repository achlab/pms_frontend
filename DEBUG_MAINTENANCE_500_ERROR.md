# 🔍 DEBUGGING GUIDE: Maintenance Approve/Reject 500 Error

## Current Error Details

**Error Type:** AxiosError
**Status Code:** 500 (Internal Server Error)
**Endpoint:** `PATCH /api/maintenance/requests/{id}/approve-reject`
**Frontend Payload:**
```json
{
  "action": "approve"
}
// or
{
  "action": "reject",
  "rejection_reason": "Reason for rejection..."
}
```

## Root Cause Analysis

The backend is throwing: `"Attempt to read property 'landlord_id' on null"`

This happens when:
1. The maintenance request's `property` relationship is not loaded
2. The code tries to access `$maintenanceRequest->property->landlord_id`
3. But `property` is null, causing the error

## Immediate Fix Required

### Step 1: Open the Backend Fix Guide
Open `BACKEND_APPROVE_REJECT_FIX.md` - it contains the complete solution.

### Step 2: Implement the Laravel Controller Fix

**File:** `app/Http/Controllers/MaintenanceRequestController.php`

The key fix is to **eager load relationships** before accessing nested properties:

```php
// ❌ BROKEN - This causes the 500 error
$maintenanceRequest = MaintenanceRequest::findOrFail($id);
$landlordId = $maintenanceRequest->property->landlord_id; // Error if property is null

// ✅ FIXED - Load relationships first
$maintenanceRequest = MaintenanceRequest::with([
    'property',
    'property.landlord',
    'unit',
    'unit.property',
    'tenant',
    'landlord',
    'category'
])->findOrFail($id);

// Then safely access with null checks
$landlordId = $maintenanceRequest->property?->landlord_id ?? null;
```

### Step 3: Use Multiple Ownership Checks

```php
$isOwner = false;

// Method 1: Direct landlord_id on request
if ($maintenanceRequest->landlord_id && $maintenanceRequest->landlord_id === $user->id) {
    $isOwner = true;
}

// Method 2: Property's landlord_id (null-safe)
if (!$isOwner && $maintenanceRequest->property?->landlord_id === $user->id) {
    $isOwner = true;
}

// Method 3: Unit's property's landlord_id (null-safe)
if (!$isOwner && $maintenanceRequest->unit?->property?->landlord_id === $user->id) {
    $isOwner = true;
}

// Method 4: Loaded landlord relationship
if (!$isOwner && $maintenanceRequest->property?->landlord?->id === $user->id) {
    $isOwner = true;
}

// Super admin can always approve/reject
if (!$isOwner && $user->role !== 'super_admin') {
    return response()->json([
        'success' => false,
        'message' => 'You do not have permission to approve/reject this request'
    ], 403);
}
```

## Testing Steps

After implementing the fix:

1. **Test Approval:**
   - Create a maintenance request
   - Try to approve it as landlord/super admin
   - Should succeed without 500 error

2. **Test Rejection:**
   - Create another maintenance request
   - Try to reject it with a reason
   - Should succeed without 500 error

3. **Test Edge Cases:**
   - Request with no property relationship
   - Request with no unit relationship
   - Request with direct landlord_id
   - Non-owner trying to approve/reject (should get 403)

## Expected Response Format

**Success Response:**
```json
{
  "success": true,
  "message": "Request approved successfully",
  "data": {
    "id": "uuid",
    "status": "approved",
    "approved_at": "2026-01-07T10:30:00Z",
    "sla_assignment_deadline": "2026-01-09T10:30:00Z",
    // ... full maintenance request with relationships
  }
}
```

## Quick Fix Checklist

- [ ] Eager load all relationships in controller
- [ ] Use null-safe operators (`?->`) when accessing nested properties
- [ ] Implement multiple ownership validation paths
- [ ] Test with requests that have null property relationships
- [ ] Verify super admin can approve/reject any request
- [ ] Verify landlords can only approve/reject their own properties

## If Still Broken

If you still get 500 errors after implementing:

1. **Check Laravel Logs:**
   ```bash
   tail -f storage/logs/laravel.log
   ```

2. **Enable Debug Mode:**
   - Set `APP_DEBUG=true` in `.env`
   - Check the detailed error message

3. **Verify Database Relationships:**
   - Ensure foreign keys are properly set up
   - Check that maintenance_requests table has correct foreign key constraints

4. **Test with Different Request Types:**
   - Request with property only
   - Request with unit only
   - Request with both property and unit
   - Request with neither

## Contact for Help

If you need help implementing this fix, share:
- Your current Laravel controller code
- The exact error from Laravel logs
- Your database schema for maintenance_requests table
