# IMMEDIATE BACKEND FIX - Copy & Paste Ready

## The Error
```
Attempt to read property "landlord_id" on null
```

This happens when code tries to access `$object->landlord_id` but `$object` is `null`.

## Copy & Paste Fix

Replace your `approveReject` method with this:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MaintenanceRequest;

class MaintenanceRequestController extends Controller
{
    public function approveReject(Request $request, string $id)
    {
        try {
            // VALIDATE INPUT FIRST
            $validated = $request->validate([
                'action' => 'required|in:approve,reject',
                'rejection_reason' => 'required_if:action,reject|string|min:10|max:500',
            ]);

            // LOAD WITH RELATIONSHIPS - THIS IS CRITICAL
            $maintenanceRequest = MaintenanceRequest::with([
                'property',
                'property.landlord',
                'unit',
                'unit.property',
                'tenant',
                'landlord',
                'category'
            ])->findOrFail($id);

            // GET CURRENT USER
            $user = auth()->user();
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
            }

            // SAFE LANDLORD ID CHECK - MULTIPLE FALLBACKS
            $landlordId = null;

            // Method 1: Direct landlord_id on request
            if ($maintenanceRequest->landlord_id) {
                $landlordId = $maintenanceRequest->landlord_id;
            }

            // Method 2: Property's landlord_id (most common)
            elseif ($maintenanceRequest->property && $maintenanceRequest->property->landlord_id) {
                $landlordId = $maintenanceRequest->property->landlord_id;
            }

            // Method 3: Unit's property landlord_id
            elseif ($maintenanceRequest->unit && $maintenanceRequest->unit->property && $maintenanceRequest->unit->property->landlord_id) {
                $landlordId = $maintenanceRequest->unit->property->landlord_id;
            }

            // If still no landlord ID found, return error
            if (!$landlordId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot determine property owner for this request'
                ], 400);
            }

            // CHECK PERMISSIONS
            $isOwner = $landlordId === $user->id;
            $isSuperAdmin = $user->role === 'super_admin';
            $isLandlord = $user->role === 'landlord';

            if (!$isOwner && !$isSuperAdmin && !$isLandlord) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to approve/reject this request'
                ], 403);
            }

        // CHECK IF REQUEST CAN BE APPROVED/REJECTED
        $allowedStatuses = ['pending', 'received', 'under_review'];
        if (!in_array($maintenanceRequest->status, $allowedStatuses)) {
            return response()->json([
                'success' => false,
                'message' => "Cannot change decision for request with status: {$maintenanceRequest->status}. Approved or rejected requests cannot be modified."
            ], 400);
        }

            // PROCESS APPROVAL OR REJECTION
            $now = now();

            if ($validated['action'] === 'approve') {
                // APPROVE REQUEST
                $maintenanceRequest->status = 'approved';
                $maintenanceRequest->approved_at = $now;
                $maintenanceRequest->approved_by = $user->id;

                // Clear any previous rejection
                $maintenanceRequest->rejection_reason = null;
                $maintenanceRequest->rejected_at = null;
                $maintenanceRequest->rejected_by = null;

            } else {
                // REJECT REQUEST
                $maintenanceRequest->status = 'rejected';
                $maintenanceRequest->rejected_at = $now;
                $maintenanceRequest->rejected_by = $user->id;
                $maintenanceRequest->rejection_reason = $validated['rejection_reason'];

                // Clear any previous approval
                $maintenanceRequest->approved_at = null;
                $maintenanceRequest->approved_by = null;
            }

            // SAVE REQUEST
            $maintenanceRequest->save();

            // CREATE EVENT LOG
            \App\Models\MaintenanceRequestEvent::create([
                'maintenance_request_id' => $maintenanceRequest->id,
                'event_type' => $validated['action'] === 'approve' ? 'approved' : 'rejected',
                'created_by' => $user->id,
                'metadata' => [
                    'action' => $validated['action'],
                    'rejection_reason' => $validated['rejection_reason'] ?? null,
                ],
            ]);

            // RETURN SUCCESS RESPONSE
            return response()->json([
                'success' => true,
                'message' => $validated['action'] === 'approve'
                    ? 'Request approved successfully'
                    : 'Request rejected successfully',
                'data' => $maintenanceRequest->load([
                    'property',
                    'unit',
                    'tenant',
                    'landlord',
                    'category'
                ])
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
            ], 500);
        }
    }
}
```

## Key Changes Made

### 1. **Load Relationships FIRST**
```php
$maintenanceRequest = MaintenanceRequest::with([
    'property',
    'property.landlord',
    'unit',
    'unit.property',
    'tenant',
    'landlord',
    'category'
])->findOrFail($id);
```

### 2. **Safe Landlord ID Check**
```php
$landlordId = null;

// Try multiple sources
if ($maintenanceRequest->landlord_id) {
    $landlordId = $maintenanceRequest->landlord_id;
} elseif ($maintenanceRequest->property && $maintenanceRequest->property->landlord_id) {
    $landlordId = $maintenanceRequest->property->landlord_id;
} elseif ($maintenanceRequest->unit && $maintenanceRequest->unit->property && $maintenanceRequest->unit->property->landlord_id) {
    $landlordId = $maintenanceRequest->unit->property->landlord_id;
}
```

### 3. **Null Checks Before Access**
- Always check if `property` exists before accessing `property->landlord_id`
- Always check if `unit` exists before accessing `unit->property->landlord_id`

## Test This Fix

1. **Copy the entire method** above
2. **Replace your existing `approveReject` method**
3. **Test approve action**
4. **Test reject action**

## If This Still Fails

Add debug logging at the top:

```php
public function approveReject(Request $request, string $id)
{
    \Log::info('APPROVE_REJECT DEBUG', [
        'id' => $id,
        'user_id' => auth()->id(),
        'request_data' => $request->all(),
        'relationships_loaded' => true,
    ]);

    // ... rest of method
}
```

Check Laravel logs after testing to see the debug info.

## This Should Fix the Error

The error occurs because code tries to access `landlord_id` on a null object. This fix ensures all relationships are loaded and null-checked before access.
