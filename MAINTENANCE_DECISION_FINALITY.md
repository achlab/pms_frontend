# Maintenance Request Decision Finality

## Business Rule Implemented

**Once a maintenance request is approved or rejected, the decision cannot be changed.**

This prevents landlords from arbitrarily changing their minds after making a decision, ensuring accountability and proper audit trails.

---

## Changes Made

### Backend (Laravel)

#### 1. Controller Validation Update
**File:** `MaintenanceRequestController.php`

**Change:** Updated status validation to only allow decisions on pending/received/under_review requests:

```php
// BEFORE: Allowed decisions on any status
$allowedStatuses = ['pending', 'received', 'under_review', 'approved', 'rejected'];

// AFTER: Only allow decisions on undecided requests
$allowedStatuses = ['pending', 'received', 'under_review'];
```

**Error Message:** "Cannot change decision for request with status: [status]. Approved or rejected requests cannot be modified."

#### 2. Test Coverage
**File:** `MaintenanceRequestApproveRejectTest.php`

Added comprehensive tests:
- ✅ Cannot change decision on already approved requests
- ✅ Cannot change decision on already rejected requests
- ✅ Cannot approve/reject requests with invalid statuses

---

### Frontend (React)

#### 1. Request Card Logic
**File:** `maintenance-request-card.tsx`

**Changes:**
- Button text: "Review" → "View Details" for approved/rejected requests
- Click behavior: Shows approve/reject modal only for pending/received/under_review
- For approved/rejected: Opens details view instead

#### 2. Request Details Logic
**File:** `maintenance-request-details.tsx`

**Change:** Removed 'approved' and 'rejected' from `canReview` array:

```php
// BEFORE: Could review any status
const canReview = ['pending', 'received', 'under_review', 'approved', 'rejected'].includes(status);

// AFTER: Can only review undecided requests
const canReview = ['pending', 'received', 'under_review'].includes(status);
```

#### 3. User Experience
- **Pending/Received/Under Review:** Shows "Review" button → Opens approval modal
- **Approved/Rejected:** Shows "View Details" button → Opens details view only

---

### Tests Updated

#### Backend Tests (3 new tests)
- `cannot_change_decision_on_already_approved_request()`
- `cannot_change_decision_on_already_rejected_request()`
- `cannot_approve_request_with_invalid_status()` (updated error message)

#### Frontend Tests (3 new E2E tests)
- `should prevent changing decisions on approved requests`
- `should prevent changing decisions on rejected requests`
- `should show review button for pending requests`

---

## User Flow Examples

### ✅ Allowed: Making Initial Decision

1. **Tenant submits request** → Status: `pending`
2. **Landlord clicks "Review"** → Opens approval modal
3. **Landlord chooses "Approve & Assign"** → Status: `approved`
4. **System opens assignment modal**

### ❌ Blocked: Trying to Change Decision

1. **Request already approved** → Status: `approved`
2. **Landlord clicks "View Details"** → Opens details view only
3. **No approval modal shown** → Cannot change decision
4. **Backend rejects any API attempts** → Returns 400 error

### ✅ Allowed: Viewing Historical Decisions

1. **Request was rejected** → Status: `rejected`
2. **Landlord clicks "View Details"** → Shows rejection reason and history
3. **All decision details visible** → But cannot modify

---

## API Behavior

### ✅ Successful Approval (Status: pending → approved)
```json
PATCH /api/maintenance/requests/{id}/approve-reject
{
  "action": "approve"
}

Response: 200 OK
{
  "success": true,
  "message": "Request approved successfully",
  "data": { /* updated request */ }
}
```

### ❌ Attempt to Change Approved Request
```json
PATCH /api/maintenance/requests/{id}/approve-reject
{
  "action": "reject",
  "rejection_reason": "Changed my mind"
}

Response: 400 Bad Request
{
  "success": false,
  "message": "Cannot change decision for request with status: approved. Approved or rejected requests cannot be modified."
}
```

---

## Database Impact

### Event Logging
All approval/rejection actions are logged in `maintenance_request_events` table:
```php
MaintenanceRequestEvent::create([
    'maintenance_request_id' => $request->id,
    'event_type' => 'approved', // or 'rejected'
    'created_by' => $user->id,
    'metadata' => [
        'action' => $action,
        'rejection_reason' => $reason ?? null,
    ],
]);
```

### Status Tracking
- `approved_at` / `approved_by` - Set on approval
- `rejected_at` / `rejected_by` / `rejection_reason` - Set on rejection
- Once set, these fields maintain the **original decision**

---

## Security & Audit Benefits

1. **Accountability:** Landlords cannot arbitrarily change decisions
2. **Audit Trail:** Original decisions are preserved in event logs
3. **Tenant Trust:** Tenants know decisions are final
4. **Legal Protection:** Prevents disputes over changed decisions

---

## Testing

Run the updated tests:
```bash
# Backend
php artisan test --filter=MaintenanceRequestApproveRejectTest

# Frontend
npm test -- --testPathPattern=maintenance-approve-reject

# E2E
npx cypress run --spec cypress/integration/maintenance-approve-reject.spec.js
```

---

## Summary

**✅ Business Rule Implemented:** Decisions cannot be changed once made

**✅ Technical Changes:**
- Backend validation prevents API changes on final statuses
- Frontend UI prevents showing approval options for final requests
- Comprehensive test coverage ensures rule enforcement

**✅ User Experience:**
- Clear visual distinction between actionable and historical requests
- Appropriate error messages for invalid operations
- Maintains workflow integrity while preserving decision history
