# Backend Debug Steps for Approve/Reject Error

## The Error
```
Attempt to read property "landlord_id" on null
```

This means the backend code is trying to access `landlord_id` on a null object.

## Quick Debug Steps

### 1. Check Laravel Logs
```bash
# Check Laravel logs for the exact error
tail -f storage/logs/laravel.log
# Or check the latest log file
tail -f storage/logs/laravel-2026-01-07.log
```

### 2. Add Debug Logging to Backend

**File: `app/Http/Controllers/MaintenanceRequestController.php`**

Add this at the beginning of the `approveReject` method:

```php
public function approveReject(string $id, Request $request)
{
    \Log::info('=== APPROVE/REJECT DEBUG ===', [
        'request_id' => $id,
        'user_id' => auth()->id(),
        'user_role' => auth()->user()->role ?? null,
        'request_data' => $request->all(),
    ]);

    try {
        // Load maintenance request with relationships
        $maintenanceRequest = MaintenanceRequest::with([
            'property',
            'property.landlord',
            'unit',
            'unit.property',
            'tenant',
            'landlord',
            'category'
        ])->findOrFail($id);

        \Log::info('Maintenance Request Loaded', [
            'id' => $maintenanceRequest->id,
            'status' => $maintenanceRequest->status,
            'property_id' => $maintenanceRequest->property_id,
            'landlord_id' => $maintenanceRequest->landlord_id,
            'property_exists' => $maintenanceRequest->property ? 'YES' : 'NO',
            'property_landlord_id' => $maintenanceRequest->property ? $maintenanceRequest->property->landlord_id : 'NULL',
            'unit_exists' => $maintenanceRequest->unit ? 'YES' : 'NO',
            'unit_property_landlord_id' => $maintenanceRequest->unit && $maintenanceRequest->unit->property ? $maintenanceRequest->unit->property->landlord_id : 'NULL',
        ]);

        // ... rest of your code
```

### 3. Check Database Directly

```sql
-- Check the maintenance request in database
SELECT mr.id, mr.property_id, mr.landlord_id, mr.status,
       p.name as property_name, p.landlord_id as property_landlord_id,
       u.unit_number,
       l.name as landlord_name
FROM maintenance_requests mr
LEFT JOIN properties p ON mr.property_id = p.id
LEFT JOIN units u ON mr.unit_id = u.id
LEFT JOIN users l ON mr.landlord_id = l.id
WHERE mr.id = '542f9524-091a-48bf-9667-64f3c5ea38ac';
```

### 4. Test the API Directly

```bash
# Get the request (replace YOUR_TOKEN with actual token)
curl -X GET "http://127.0.0.1:8000/api/maintenance/requests/542f9524-091a-48bf-9667-64f3c5ea38ac" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Try to approve it
curl -X PATCH "http://127.0.0.1:8000/api/maintenance/requests/542f9524-091a-48bf-9667-64f3c5ea38ac/approve-reject" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"action":"approve"}'
```

### 5. Check Model Relationships

**File: `app/Models/MaintenanceRequest.php`**

Ensure these relationships exist:

```php
public function property()
{
    return $this->belongsTo(Property::class, 'property_id');
}

public function unit()
{
    return $this->belongsTo(Unit::class, 'unit_id');
}

public function landlord()
{
    return $this->belongsTo(User::class, 'landlord_id');
}
```

**File: `app/Models/Property.php`**

```php
public function landlord()
{
    return $this->belongsTo(User::class, 'landlord_id');
}
```

### 6. Check Route Definition

**File: `routes/api.php`**

Ensure the route exists:

```php
Route::patch('/maintenance/requests/{id}/approve-reject', [MaintenanceRequestController::class, 'approveReject'])
    ->middleware(['auth:sanctum']);
```

### 7. Check Authentication

Make sure you're logged in as a landlord. Check:

```php
// In your controller or middleware
$user = auth()->user();
\Log::info('Auth User', [
    'id' => $user->id,
    'role' => $user->role,
    'name' => $user->name,
]);
```

### 8. Simple Fix (If Relationships Are Missing)

If the issue is missing relationships, try this quick fix:

```php
public function approveReject(string $id, Request $request)
{
    $maintenanceRequest = MaintenanceRequest::findOrFail($id);

    // Simple ownership check - just check landlord_id directly
    $user = auth()->user();
    if ($user->role !== 'super_admin' && $maintenanceRequest->landlord_id !== $user->id) {
        return response()->json([
            'success' => false,
            'message' => 'You do not have permission to approve this request'
        ], 403);
    }

    // ... rest of your logic without accessing property relationships
}
```

## Most Likely Causes

1. **Relationship not loaded**: `->with(['property.landlord'])` missing
2. **Property is null**: Maintenance request has no property_id
3. **Multiple code paths**: There might be another controller or method being called
4. **Wrong controller**: Check if you're hitting the super-admin endpoint by mistake
5. **Database issue**: Property record was deleted but maintenance request still references it

## Quick Test

Add this at the very beginning of your controller method:

```php
public function approveReject(string $id, Request $request)
{
    // TEMPORARY DEBUG - return success without doing anything
    return response()->json([
        'success' => true,
        'message' => 'Debug: Request received',
        'data' => ['id' => $id, 'action' => $request->action]
    ]);
}
```

If this works, the issue is in your business logic, not routing/auth.

## Share Debug Info

After adding the logging, run the approve action again and check:

1. Laravel logs for the debug info
2. Database query results
3. API response when getting the maintenance request

This will tell us exactly what's null and why.
