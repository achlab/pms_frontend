# Payment Status Update Backend Implementation - COMPLETE SOLUTION

## 🚨 IMMEDIATE FIX: Copy-Paste This Code

Since you're still getting the error, here's the complete backend implementation you need to copy-paste into your Laravel backend.

---

## Step 1: Create PaymentController

**File:** `app/Http/Controllers/Api/PaymentController.php`

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Invoice;
use App\Models\Tenant;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    /**
     * Update payment status
     * PATCH /api/payments/{paymentId}/status
     */
    public function updateStatus(Request $request, $paymentId)
    {
        try {
            // Validate request
            $validator = Validator::make($request->all(), [
                'status' => 'required|in:pending,recorded,completed,partially_paid,failed'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'Success' => false,
                    'Message' => 'Validation failed',
                    'Errors' => $validator->errors()
                ], 422);
            }

            // Find the payment with relationships
            $payment = Payment::with(['tenant', 'unit.property'])->find($paymentId);

            if (!$payment) {
                return response()->json([
                    'Success' => false,
                    'Message' => 'Payment not found'
                ], 404);
            }

            // Check authorization - only landlords can update payment status
            $user = Auth::user();
            if ($user->role !== 'landlord') {
                return response()->json([
                    'Success' => false,
                    'Message' => 'Unauthorized. Only landlords can update payment status.'
                ], 403);
            }

            // Check if landlord owns this payment
            $hasAccess = false;

            if ($payment->invoice_id) {
                // Payment is linked to an invoice - check if landlord owns the property
                $invoice = Invoice::find($payment->invoice_id);
                if ($invoice && $invoice->property->landlord_id === $user->id) {
                    $hasAccess = true;
                }
            } elseif ($payment->tenant_id && $payment->unit_id) {
                // Tenant payment - check if tenant belongs to landlord's property
                if ($payment->unit && $payment->unit->property->landlord_id === $user->id) {
                    $hasAccess = true;
                }
            } else {
                // Fallback - check if payment has any property association
                if ($payment->unit && $payment->unit->property->landlord_id === $user->id) {
                    $hasAccess = true;
                }
            }

            if (!$hasAccess) {
                return response()->json([
                    'Success' => false,
                    'Message' => 'Unauthorized. You can only update payments for your properties.'
                ], 403);
            }

            // Update payment status
            $oldStatus = $payment->payment_status;
            $payment->payment_status = $request->status;
            $payment->save();

            // Log the status change
            Log::info("Payment status updated", [
                'payment_id' => $paymentId,
                'old_status' => $oldStatus,
                'new_status' => $request->status,
                'updated_by' => $user->id
            ]);

            return response()->json([
                'Success' => true,
                'Data' => [
                    'id' => $payment->id,
                    'payment_status' => $payment->payment_status,
                    'updated_at' => $payment->updated_at
                ],
                'Message' => 'Payment status updated successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Payment status update failed', [
                'payment_id' => $paymentId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'Success' => false,
                'Message' => 'Failed to update payment status',
                'Errors' => ['server' => 'Internal server error']
            ], 500);
        }
    }

    /**
     * Get payment details
     * GET /api/payments/{paymentId}
     */
    public function show($paymentId)
    {
        try {
            $payment = Payment::with(['tenant', 'unit.property', 'invoice'])->find($paymentId);

            if (!$payment) {
                return response()->json([
                    'Success' => false,
                    'Message' => 'Payment not found'
                ], 404);
            }

            // Check authorization
            $user = Auth::user();
            $hasAccess = false;

            if ($user->role === 'landlord') {
                // Landlord can see payments for their properties
                if ($payment->unit && $payment->unit->property->landlord_id === $user->id) {
                    $hasAccess = true;
                }
            } elseif ($user->role === 'tenant') {
                // Tenant can see their own payments
                if ($payment->tenant_id === $user->id) {
                    $hasAccess = true;
                }
            }

            if (!$hasAccess) {
                return response()->json([
                    'Success' => false,
                    'Message' => 'Unauthorized'
                ], 403);
            }

            return response()->json([
                'Success' => true,
                'Data' => $payment,
                'Message' => 'Payment retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Payment retrieval failed', [
                'payment_id' => $paymentId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'Success' => false,
                'Message' => 'Failed to retrieve payment'
            ], 500);
        }
    }
}
```

---

## Step 2: Add Routes

**File:** `routes/api.php`

Add these lines inside the `auth:sanctum` middleware group:

```php
// Add this import at the top
use App\Http\Controllers\Api\PaymentController;

// Inside Route::middleware(['auth:sanctum'])->group(function () {
    // ... existing routes ...

    // Payment management - ADD THESE LINES
    Route::patch('/payments/{payment}/status', [PaymentController::class, 'updateStatus']);
    Route::get('/payments/{payment}', [PaymentController::class, 'show']);

    // ... other routes ...
// });
```

---

## Step 3: Update Payment Model

**File:** `app/Models/Payment.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'unit_id',
        'invoice_id',
        'amount',
        'payment_method',
        'reference_number',
        'payment_date',
        'payment_status',
        'notes',
        'receipt_images',
        'recorded_by'
    ];

    protected $casts = [
        'receipt_images' => 'array',
        'payment_date' => 'date',
        'amount' => 'decimal:2'
    ];

    // Relationships
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function recordedBy()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    // Helper method to get property through unit
    public function getPropertyAttribute()
    {
        return $this->unit ? $this->unit->property : null;
    }
}
```

---

## Step 4: Test Immediately

After implementing the above, test with:

```bash
# Test the endpoint
curl -X PATCH http://localhost:8000/api/payments/019b36a8-e7bd-7286-857c-ba46ef3b30ca/status \
  -H "Authorization: Bearer YOUR_LANDLORD_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

---

## 🔍 Debugging Steps

If you still get errors:

1. **Check if PaymentController exists:**
   ```bash
   ls -la app/Http/Controllers/Api/PaymentController.php
   ```

2. **Check routes are loaded:**
   ```bash
   php artisan route:list | grep payments
   ```

3. **Check Laravel logs:**
   ```bash
   tail -f storage/logs/laravel.log
   ```

4. **Test with a simple response first:**
   Temporarily replace the `updateStatus` method with:
   ```php
   public function updateStatus(Request $request, $paymentId)
   {
       return response()->json([
           'Success' => true,
           'Data' => ['id' => $paymentId, 'payment_status' => $request->status],
           'Message' => 'Test response'
       ]);
   }
   ```

This will confirm the route is working, then you can add the logic back.

---

## ✅ Expected Result

After implementing this, your payment status updates should work and return:

```json
{
  "Success": true,
  "Data": {
    "id": "019b36a8-e7bd-7286-857c-ba46ef3b30ca",
    "payment_status": "completed",
    "updated_at": "2025-12-19T..."
  },
  "Message": "Payment status updated successfully"
}
```</content>
<parameter name="filePath">d:\Work Environment\MarBarnes\final\Property-Management-System-Frontend\PAYMENT_STATUS_UPDATE_FIX.md