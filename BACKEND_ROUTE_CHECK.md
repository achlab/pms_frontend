# Backend Route Check

## Current Frontend Call
**Frontend calls:** `PATCH /maintenance/requests/{id}/approve-reject`

**Service:** `maintenanceApprovalService.approveReject`

## Possible Backend Issues

### 1. Route Not Defined
Check if this route exists in `routes/api.php`:

```php
// ✅ Should be
Route::patch('/maintenance/requests/{id}/approve-reject', [MaintenanceRequestController::class, 'approveReject']);

// ❌ Might be missing
// Check your routes file
```

### 2. Wrong Controller Method
The route might point to the wrong controller method:

```php
// ✅ Correct
Route::patch('/maintenance/requests/{id}/approve-reject', [MaintenanceRequestController::class, 'approveReject']);

// ❌ Wrong - points to different method
Route::patch('/maintenance/requests/{id}/approve-reject', [SomeOtherController::class, 'someMethod']);
```

### 3. Super Admin Route Conflict
There are TWO approve-reject endpoints:

1. **Regular:** `PATCH /maintenance/requests/{id}/approve-reject`
2. **Super Admin:** `PATCH /super-admin/maintenance/{id}/approve-reject`

**Check your routes file** to ensure the regular route exists and points to the correct controller.

### 4. Controller Method Name Mismatch
The route might call a different method name:

```php
// Route calls 'approveReject' but method is named differently
public function approveReject(Request $request, $id) // ✅ Correct
public function approve_reject(Request $request, $id) // ❌ Wrong
public function approveRejectAction(Request $request, $id) // ❌ Wrong
```

### 5. Controller File Location
Check if the MaintenanceRequestController exists in the right location:

```php
// ✅ Correct location
app/Http/Controllers/MaintenanceRequestController.php

// ❌ Wrong location
app/Http/Controllers/Api/MaintenanceRequestController.php
app/Http/Controllers/Maintenance/MaintenanceRequestController.php
```

## Quick Debug Commands

### Check Routes
```bash
# List all routes
php artisan route:list | grep approve

# Should see:
/maintenance/requests/{id}/approve-reject | PATCH | App\Http\Controllers\MaintenanceRequestController@approveReject
```

### Check Controller
```bash
# Check if controller exists
ls -la app/Http/Controllers/MaintenanceRequestController.php

# Check method exists
grep -n "function approveReject" app/Http/Controllers/MaintenanceRequestController.php
```

### Test Direct API Call
```bash
# Test the endpoint directly (replace TOKEN)
curl -X PATCH "http://127.0.0.1:8000/api/maintenance/requests/c312d6ef-e896-47f0-b525-d30fbfa562ba/approve-reject" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"action":"approve"}' \
  -v
```

## Most Likely Fix

**Check your `routes/api.php` file:**

```php
<?php

use App\Http\Controllers\MaintenanceRequestController;

Route::middleware(['auth:sanctum'])->group(function () {
    // Maintenance routes
    Route::prefix('maintenance')->group(function () {
        Route::patch('/requests/{id}/approve-reject', [MaintenanceRequestController::class, 'approveReject']);
    });
});
```

**And ensure the controller method exists:**

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class MaintenanceRequestController extends Controller
{
    public function approveReject(Request $request, string $id)
    {
        // Your implementation here
        return response()->json(['success' => true]);
    }
}
```

## Immediate Test

Add this to the beginning of your controller method to verify it's being called:

```php
public function approveReject(Request $request, string $id)
{
    \Log::info('APPROVE_REJECT METHOD CALLED', [
        'id' => $id,
        'action' => $request->action,
        'user' => auth()->user()->id ?? 'null'
    ]);

    // Temporary return
    return response()->json([
        'success' => true,
        'message' => 'Method called successfully',
        'data' => ['id' => $id, 'action' => $request->action]
    ]);
}
```

If this works, the route is correct and the issue is in your business logic. If it still fails, the route is not defined properly.
