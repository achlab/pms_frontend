# Tenant Payment Backend Implementation Guide

## Issue
You're getting a 500 Internal Server Error when submitting tenant payments to `POST /api/tenant/payments`. This guide provides the complete backend implementation needed.

## Request Data Structure
The frontend is sending this data:
```json
{
  "amount": 9000,
  "payment_method": "airtel_tigo",
  "reference_number": "987654321234567",
  "payment_date": "2025-12-19",
  "notes": "Tenant payment. Receipt: 987654321234567.",
  "payment_status": "recorded"
}
```

---

## Step 1: Database Migration

First, ensure your payments table has the correct structure:

```php
<?php
// database/migrations/xxxx_xx_xx_update_payments_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('payments', function (Blueprint $table) {
            // Ensure payment_method column can handle all values
            $table->string('payment_method', 50)->change();
            
            // Add missing columns if they don't exist
            if (!Schema::hasColumn('payments', 'reference_number')) {
                $table->string('reference_number')->nullable();
            }
            
            if (!Schema::hasColumn('payments', 'payment_status')) {
                $table->enum('payment_status', ['pending', 'recorded', 'verified', 'rejected'])
                      ->default('pending');
            }
            
            // Ensure tenant_id exists and is properly set up
            if (!Schema::hasColumn('payments', 'tenant_id')) {
                $table->uuid('tenant_id')->after('unit_id');
                $table->foreign('tenant_id')->references('id')->on('tenants');
            }
        });
    }

    public function down()
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['reference_number', 'payment_status']);
        });
    }
};
```

Run the migration:
```bash
php artisan migrate
```

---

## Step 2: Create Tenant Payment Controller

Create a dedicated controller for tenant payments:

```bash
php artisan make:controller Api/TenantPaymentController
```

Update `app/Http/Controllers/Api/TenantPaymentController.php`:

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Tenant;
use App\Models\Property;
use App\Models\Unit;
use App\Models\User;
use App\Notifications\PaymentReceivedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class TenantPaymentController extends Controller
{
    /**
     * Submit a payment by a tenant
     */
    public function store(Request $request)
    {
        try {
            Log::info('Tenant payment submission started', [
                'user_id' => Auth::id(),
                'request_data' => $request->all()
            ]);

            // Get the authenticated tenant
            $user = Auth::user();
            $tenant = Tenant::where('user_id', $user->id)->first();
            
            if (!$tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tenant profile not found'
                ], 404);
            }

            // Get tenant's current lease/unit information
            $currentLease = $tenant->leases()
                ->where('status', 'active')
                ->orWhere('status', 'pending')
                ->first();
            
            if (!$currentLease) {
                return response()->json([
                    'success' => false,
                    'message' => 'No active lease found. Please contact your landlord.'
                ], 404);
            }

            $unit = $currentLease->unit;
            $property = $unit->property;
            $landlord = $property->landlord;

            // Validation rules
            $validator = Validator::make($request->all(), [
                'amount' => 'required|numeric|min:0.01',
                'payment_method' => 'required|in:mtn_momo,vodafone_cash,airtel_tigo,bank_transfer,cash',
                'reference_number' => 'required|string|max:100',
                'payment_date' => 'required|date|before_or_equal:today',
                'notes' => 'nullable|string|max:500',
                'payment_status' => 'required|in:pending,recorded,verified,rejected'
            ]);

            if ($validator->fails()) {
                Log::warning('Tenant payment validation failed', [
                    'errors' => $validator->errors(),
                    'request_data' => $request->all()
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            try {
                // Create payment record
                $payment = Payment::create([
                    'property_id' => $property->id,
                    'unit_id' => $unit->id,
                    'tenant_id' => $tenant->id,
                    'landlord_id' => $landlord->id,
                    'amount' => $request->amount,
                    'payment_method' => $request->payment_method,
                    'payment_date' => $request->payment_date,
                    'reference_number' => $request->reference_number,
                    'receipt_number' => $this->generateReceiptNumber(),
                    'notes' => $request->notes,
                    'payment_status' => $request->payment_status,
                    'recorded_by' => $user->id,
                ]);

                Log::info('Payment record created', [
                    'payment_id' => $payment->id,
                    'tenant_id' => $tenant->id,
                    'landlord_id' => $landlord->id
                ]);

                // Load relationships for notification
                $payment->load(['property', 'unit', 'tenant.user']);

                // Send notification to landlord
                try {
                    $landlord->notify(new PaymentReceivedNotification($payment));
                    Log::info('Payment notification sent to landlord', [
                        'payment_id' => $payment->id,
                        'landlord_id' => $landlord->id
                    ]);
                } catch (\Exception $notificationError) {
                    Log::error('Failed to send payment notification', [
                        'payment_id' => $payment->id,
                        'landlord_id' => $landlord->id,
                        'error' => $notificationError->getMessage()
                    ]);
                    // Don't fail the payment if notification fails
                }

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Payment submitted successfully! Your landlord will verify it shortly.',
                    'data' => [
                        'payment_id' => $payment->id,
                        'receipt_number' => $payment->receipt_number,
                        'amount' => $payment->amount,
                        'payment_method' => $payment->payment_method,
                        'payment_date' => $payment->payment_date,
                        'payment_status' => $payment->payment_status,
                        'reference_number' => $payment->reference_number,
                        'property' => $property->name,
                        'unit' => $unit->unit_number
                    ]
                ], 201);

            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Database error during payment creation', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'request_data' => $request->all()
                ]);
                throw $e;
            }

        } catch (\Exception $e) {
            Log::error('Tenant payment submission failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to submit payment. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get payment history for the authenticated tenant
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            $tenant = Tenant::where('user_id', $user->id)->first();
            
            if (!$tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tenant profile not found'
                ], 404);
            }

            $query = Payment::where('tenant_id', $tenant->id)
                ->with(['property', 'unit', 'landlord']);

            // Filter by date range
            if ($request->has('start_date')) {
                $query->whereDate('payment_date', '>=', $request->start_date);
            }
            if ($request->has('end_date')) {
                $query->whereDate('payment_date', '<=', $request->end_date);
            }

            // Filter by status
            if ($request->has('status')) {
                $query->where('payment_status', $request->status);
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            $perPage = $request->get('per_page', 15);
            $payments = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $payments->items(),
                'meta' => [
                    'current_page' => $payments->currentPage(),
                    'last_page' => $payments->lastPage(),
                    'per_page' => $payments->perPage(),
                    'total' => $payments->total(),
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch tenant payments', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch payment history',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Generate unique receipt number
     */
    private function generateReceiptNumber()
    {
        $prefix = 'RCT-';
        $timestamp = now()->format('Ymd');
        $random = strtoupper(substr(uniqid(), -4));
        
        return $prefix . $timestamp . '-' . $random;
    }
}
```

---

## Step 3: Update Payment Model

Ensure your `Payment` model has all the necessary fields:

```php
<?php
// app/Models/Payment.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Payment extends Model
{
    use HasUuids;

    protected $fillable = [
        'property_id',
        'unit_id',
        'tenant_id',
        'landlord_id',
        'amount',
        'payment_method',
        'payment_date',
        'reference_number',    // Added
        'receipt_number',
        'notes',
        'payment_status',      // Added
        'recorded_by',
    ];

    protected $casts = [
        'payment_date' => 'date',
        'amount' => 'decimal:2',
    ];

    // Relationships
    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function landlord()
    {
        return $this->belongsTo(User::class, 'landlord_id');
    }

    public function recordedBy()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
```

---

## Step 4: Add Routes

Add the tenant payment routes to `routes/api.php`:

```php
<?php
// routes/api.php

use App\Http\Controllers\Api\TenantPaymentController;

Route::middleware(['auth:sanctum'])->group(function () {
    
    // Tenant-specific payment routes
    Route::prefix('tenant')->group(function () {
        Route::prefix('payments')->group(function () {
            Route::get('/', [TenantPaymentController::class, 'index']);
            Route::post('/', [TenantPaymentController::class, 'store']);
        });
    });
    
    // ... other routes
});
```

---

## Step 5: Create/Update Payment Notification

Ensure you have the PaymentReceivedNotification class:

```bash
php artisan make:notification PaymentReceivedNotification
```

```php
<?php
// app/Notifications/PaymentReceivedNotification.php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use App\Models\Payment;

class PaymentReceivedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $payment;

    public function __construct(Payment $payment)
    {
        $this->payment = $payment;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        return [
            'type' => 'payment_received',
            'title' => 'Payment Received',
            'message' => $this->payment->tenant->user->name . ' paid ₵' . number_format($this->payment->amount, 2) . ' for ' . $this->payment->property->name . ' - Unit ' . $this->payment->unit->unit_number,
            'data' => [
                'payment_id' => $this->payment->id,
                'reference_number' => $this->payment->reference_number,
                'amount' => $this->payment->amount,
                'payment_method' => $this->payment->payment_method,
                'payment_date' => $this->payment->payment_date,
                'receipt_number' => $this->payment->receipt_number,
                'property_name' => $this->payment->property->name,
                'unit_number' => $this->payment->unit->unit_number,
                'tenant_name' => $this->payment->tenant->user->name,
                'payment_status' => $this->payment->payment_status,
            ],
            'action_url' => '/payments',
        ];
    }
}
```

---

## Step 6: Debugging Steps

1. **Check Backend Logs**:
```bash
tail -f storage/logs/laravel.log
```

2. **Test Database Connection**:
```bash
php artisan tinker
```
```php
// In tinker
\App\Models\Payment::count()
\App\Models\Tenant::count()
```

3. **Check Route Registration**:
```bash
php artisan route:list | grep tenant
```

4. **Test Validation**:
```bash
# Test with curl or Postman
curl -X POST http://localhost:8000/api/tenant/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "amount": 9000,
    "payment_method": "airtel_tigo",
    "reference_number": "987654321234567",
    "payment_date": "2025-12-19",
    "notes": "Test payment",
    "payment_status": "recorded"
  }'
```

---

## Step 7: Common Issues and Solutions

### Issue 1: Route Not Found (404)
**Solution**: Ensure routes are registered in `api.php` and clear route cache:
```bash
php artisan route:clear
php artisan route:cache
```

### Issue 2: Column Not Found
**Solution**: Run the migration and check database structure:
```bash
php artisan migrate
php artisan migrate:status
```

### Issue 3: Foreign Key Constraints
**Solution**: Ensure all referenced tables exist and have proper relationships.

### Issue 4: Authentication Issues
**Solution**: Check if Sanctum is properly configured and token is valid:
```bash
php artisan config:cache
```

---

## Summary

After implementing this backend:

1. Run the migration to update the payments table
2. Create the TenantPaymentController
3. Update the Payment model
4. Add the routes
5. Test the endpoint

The frontend should now be able to successfully submit payments, and landlords should receive notifications when tenants make payments.

**Next Steps After Implementation**:
1. Test the payment submission from the tenant frontend
2. Check that notifications appear for landlords
3. Verify payment history shows in both tenant and landlord views