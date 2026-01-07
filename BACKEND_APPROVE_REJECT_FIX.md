# Backend Fix: Maintenance Request Approve/Reject Error

## Error Details

**Error Message:** `Attempt to read property "landlord_id" on null`

**Endpoint:** `PATCH /api/maintenance/requests/{id}/approve-reject`

**Error Code:** 500 (Internal Server Error)

**Request Payload:**
```json
{
  "action": "approve"
}
```

---

## Problem Analysis

The backend is trying to access `landlord_id` on a null object. This typically happens when:

1. **Property relationship is not loaded** - The maintenance request's `property` relationship is null
2. **Unit relationship is not loaded** - The maintenance request's `unit` relationship is null, and the code tries to access `unit->property->landlord_id`
3. **Missing relationship loading** - The query doesn't eager load the necessary relationships

---

## Expected Backend Code Structure

The approve/reject endpoint should:

1. **Load the maintenance request with all necessary relationships**
2. **Check if property exists before accessing nested properties**
3. **Handle null relationships gracefully**
4. **Validate landlord ownership properly**

---

## Backend Fix Implementation

### PHP/Laravel Example Fix

#### 1. Update the Controller Method

**File:** `app/Http/Controllers/MaintenanceRequestController.php` (or similar)

```php
/**
 * Approve or reject a maintenance request
 * 
 * @param string $id
 * @param Request $request
 * @return JsonResponse
 */
public function approveReject(string $id, Request $request)
{
    try {
        // Validate request
        $validated = $request->validate([
            'action' => 'required|in:approve,reject',
            'rejection_reason' => 'required_if:action,reject|string|min:10|max:500',
        ]);

        // Load maintenance request with ALL necessary relationships
        $maintenanceRequest = MaintenanceRequest::with([
            'property',           // Load property relationship
            'property.landlord',  // Load property's landlord
            'unit',               // Load unit relationship
            'unit.property',      // Load unit's property (if unit exists)
            'tenant',             // Load tenant
            'landlord',           // Load direct landlord relationship
            'category'            // Load category
        ])->findOrFail($id);

        // Get authenticated user
        $user = auth()->user();

        // Check if user is landlord or super admin
        if (!in_array($user->role, ['landlord', 'super_admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Only landlords and super admins can approve/reject requests'
            ], 403);
        }

        // Check ownership - handle null relationships safely
        $isOwner = false;
        
        // Method 1: Check direct landlord_id on request
        if ($maintenanceRequest->landlord_id && $maintenanceRequest->landlord_id === $user->id) {
            $isOwner = true;
        }
        
        // Method 2: Check property's landlord_id (if property exists)
        if (!$isOwner && $maintenanceRequest->property) {
            // Check property->landlord_id
            if ($maintenanceRequest->property->landlord_id && 
                $maintenanceRequest->property->landlord_id === $user->id) {
                $isOwner = true;
            }
            
            // Also check property->landlord relationship if loaded
            if (!$isOwner && $maintenanceRequest->property->landlord) {
                if ($maintenanceRequest->property->landlord->id === $user->id) {
                    $isOwner = true;
                }
            }
        }
        
        // Method 3: Check unit's property's landlord_id (if unit exists)
        if (!$isOwner && $maintenanceRequest->unit && $maintenanceRequest->unit->property) {
            if ($maintenanceRequest->unit->property->landlord_id && 
                $maintenanceRequest->unit->property->landlord_id === $user->id) {
                $isOwner = true;
            }
        }

        // Super admin can always approve/reject
        if (!$isOwner && $user->role !== 'super_admin') {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to approve/reject this request'
            ], 403);
        }

        // Check if request can be approved/rejected
        $allowedStatuses = ['pending', 'received', 'under_review', 'approved', 'rejected'];
        if (!in_array($maintenanceRequest->status, $allowedStatuses)) {
            return response()->json([
                'success' => false,
                'message' => "Cannot approve/reject request with status: {$maintenanceRequest->status}"
            ], 400);
        }

        // Process approval or rejection
        if ($validated['action'] === 'approve') {
            // Approve the request
            $maintenanceRequest->status = 'approved';
            $maintenanceRequest->approved_at = now();
            $maintenanceRequest->approved_by = $user->id;
            
            // Clear rejection fields if previously rejected
            $maintenanceRequest->rejection_reason = null;
            $maintenanceRequest->rejected_at = null;
            $maintenanceRequest->rejected_by = null;
            
            // Calculate SLA assignment deadline (48 hours from approval for production, or configured time)
            $assignmentDeadlineHours = config('maintenance.sla_assignment_hours', 48);
            $maintenanceRequest->sla_assignment_deadline = now()->addHours($assignmentDeadlineHours);
            
        } else {
            // Reject the request
            $maintenanceRequest->status = 'rejected';
            $maintenanceRequest->rejected_at = now();
            $maintenanceRequest->rejected_by = $user->id;
            $maintenanceRequest->rejection_reason = $validated['rejection_reason'];
            
            // Clear approval fields if previously approved
            $maintenanceRequest->approved_at = null;
            $maintenanceRequest->approved_by = null;
        }

        // Save the request
        $maintenanceRequest->save();

        // Create event log
        MaintenanceRequestEvent::create([
            'maintenance_request_id' => $maintenanceRequest->id,
            'event_type' => $validated['action'] === 'approve' ? 'approved' : 'rejected',
            'created_by' => $user->id,
            'metadata' => [
                'action' => $validated['action'],
                'rejection_reason' => $validated['rejection_reason'] ?? null,
            ],
        ]);

        // Send notifications
        // TODO: Implement notification system
        // - Notify tenant of approval/rejection
        // - If approved, notify available caretakers/artisans

        // Load fresh data with relationships for response
        $maintenanceRequest->refresh();
        $maintenanceRequest->load([
            'property',
            'unit',
            'tenant',
            'landlord',
            'category',
            'assigned_to',
        ]);

        return response()->json([
            'success' => true,
            'message' => $validated['action'] === 'approve' 
                ? 'Request approved successfully' 
                : 'Request rejected successfully',
            'data' => $maintenanceRequest,
        ]);

    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $e->errors(),
        ], 422);

    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        return response()->json([
            'success' => false,
            'message' => 'Maintenance request not found',
        ], 404);

    } catch (\Exception $e) {
        \Log::error('Approve/Reject Maintenance Request Error', [
            'request_id' => $id,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);

        return response()->json([
            'success' => false,
            'message' => 'Failed to process request: ' . $e->getMessage(),
            'error' => config('app.debug') ? $e->getMessage() : 'An error occurred',
        ], 500);
    }
}
```

---

### 2. Update the Model (if needed)

**File:** `app/Models/MaintenanceRequest.php`

Ensure relationships are properly defined:

```php
/**
 * Get the property that owns the maintenance request
 */
public function property()
{
    return $this->belongsTo(Property::class, 'property_id');
}

/**
 * Get the unit associated with the maintenance request
 */
public function unit()
{
    return $this->belongsTo(Unit::class, 'unit_id');
}

/**
 * Get the landlord who owns the property
 */
public function landlord()
{
    // Try multiple ways to get landlord
    if ($this->landlord_id) {
        return $this->belongsTo(User::class, 'landlord_id');
    }
    
    // Fallback to property's landlord
    return $this->hasOneThrough(
        User::class,
        Property::class,
        'id',           // Foreign key on properties table
        'id',           // Foreign key on users table
        'property_id',  // Local key on maintenance_requests table
        'landlord_id'   // Local key on properties table
    );
}
```

---

### 3. Alternative: Use Null-Safe Operators (PHP 8.0+)

If using PHP 8.0 or higher, you can use the null-safe operator:

```php
// Instead of:
$landlordId = $maintenanceRequest->property->landlord_id;

// Use:
$landlordId = $maintenanceRequest->property?->landlord_id;

// Or check multiple paths:
$landlordId = $maintenanceRequest->property?->landlord_id 
           ?? $maintenanceRequest->unit?->property?->landlord_id
           ?? $maintenanceRequest->landlord_id
           ?? null;
```

---

### 4. Database Migration Check

Ensure the database schema has the necessary columns:

```php
Schema::table('maintenance_requests', function (Blueprint $table) {
    $table->foreignId('property_id')->nullable()->constrained('properties');
    $table->foreignId('unit_id')->nullable()->constrained('units');
    $table->foreignId('landlord_id')->nullable()->constrained('users');
    $table->foreignId('approved_by')->nullable()->constrained('users');
    $table->foreignId('rejected_by')->nullable()->constrained('users');
    $table->timestamp('approved_at')->nullable();
    $table->timestamp('rejected_at')->nullable();
    $table->text('rejection_reason')->nullable();
    $table->timestamp('sla_assignment_deadline')->nullable();
});
```

---

## Key Points to Fix

### ✅ Always Load Relationships
```php
// ❌ BAD - May cause null error
$request = MaintenanceRequest::find($id);
$landlordId = $request->property->landlord_id; // Error if property is null

// ✅ GOOD - Load relationships
$request = MaintenanceRequest::with('property.landlord')->find($id);
$landlordId = $request->property?->landlord_id ?? null;
```

### ✅ Check for Null Before Accessing
```php
// ❌ BAD
if ($request->property->landlord_id === $user->id) { }

// ✅ GOOD
if ($request->property && $request->property->landlord_id === $user->id) { }

// ✅ BETTER (PHP 8.0+)
if ($request->property?->landlord_id === $user->id) { }
```

### ✅ Use Multiple Fallback Methods
```php
// Check ownership through multiple paths
$isOwner = 
    ($request->landlord_id === $user->id) ||
    ($request->property?->landlord_id === $user->id) ||
    ($request->unit?->property?->landlord_id === $user->id) ||
    ($request->property?->landlord?->id === $user->id);
```

---

## Testing Checklist

After implementing the fix, test:

1. ✅ Approve request with property relationship loaded
2. ✅ Approve request with property relationship null (should handle gracefully)
3. ✅ Approve request with unit relationship loaded
4. ✅ Approve request with unit relationship null
5. ✅ Reject request with all scenarios above
6. ✅ Verify landlord ownership check works correctly
7. ✅ Verify super admin can approve/reject any request
8. ✅ Verify non-owner landlord cannot approve/reject
9. ✅ Verify status transitions are correct
10. ✅ Verify SLA deadlines are set correctly on approval

---

## Expected Response Format

**Success Response (Approve):**
```json
{
  "success": true,
  "message": "Request approved successfully",
  "data": {
    "id": "76b27f83-fc1d-4a74-87de-ca4bceabe47e",
    "status": "approved",
    "approved_at": "2026-01-07T10:30:00Z",
    "sla_assignment_deadline": "2026-01-09T10:30:00Z",
    "property": {
      "id": "...",
      "name": "Local Geography",
      "landlord_id": "..."
    },
    ...
  }
}
```

**Success Response (Reject):**
```json
{
  "success": true,
  "message": "Request rejected successfully",
  "data": {
    "id": "76b27f83-fc1d-4a74-87de-ca4bceabe47e",
    "status": "rejected",
    "rejected_at": "2026-01-07T10:30:00Z",
    "rejection_reason": "Reason for rejection...",
    ...
  }
}
```

---

## Summary

The main issue is that the backend is trying to access `landlord_id` on a null `property` object. The fix requires:

1. **Eager loading relationships** before accessing nested properties
2. **Null checks** before accessing nested properties
3. **Multiple fallback methods** to determine ownership
4. **Proper error handling** for edge cases

This will prevent the `Attempt to read property "landlord_id" on null` error and make the endpoint more robust.

