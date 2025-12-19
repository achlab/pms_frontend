# Payment Status Update Backend Implementation Guide

## Issue
You're getting a 404 error when trying to update payment status with `PATCH /api/payments/{paymentId}/status`. The error message "Payment invoice not found" suggests the backend is looking for invoice-linked payments, but tenant payments don't have invoices.

## Root Cause
The frontend calls `paymentService.updatePaymentStatus()` which makes a PATCH request to `/payments/{paymentId}/status`, but this endpoint doesn't exist in the backend.

## Solution
Add the payment status update endpoint to handle both tenant payments (no invoice) and landlord-recorded payments (with invoices).

---

## Step 1: Update Payment Controller

Add the status update method to your existing PaymentController or create it if it doesn't exist.

```bash
# If PaymentController doesn't exist, create it
php artisan make:controller Api/PaymentController
```

Update `app/Http/Controllers/Api/PaymentController.php`:

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

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

            // Find the payment
            $payment = Payment::find($paymentId);

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

            // For payments linked to invoices, verify landlord owns the property
            if ($payment->invoice_id) {
                $invoice = Invoice::find($payment->invoice_id);
                if ($invoice && $invoice->property->landlord_id !== $user->id) {
                    return response()->json([
                        'Success' => false,
                        'Message' => 'Unauthorized. You can only update payments for your properties.'
                    ], 403);
                }
            } else {
                // For tenant payments (no invoice), verify the tenant belongs to landlord's property
                if ($payment->tenant_id) {
                    $tenant = \App\Models\Tenant::find($payment->tenant_id);
                    if ($tenant && $tenant->unit->property->landlord_id !== $user->id) {
                        return response()->json([
                            'Success' => false,
                            'Message' => 'Unauthorized. You can only update payments for your tenants.'
                        ], 403);
                    }
                }
            }

            // Update payment status
            $oldStatus = $payment->payment_status;
            $payment->payment_status = $request->status;
            $payment->save();

            // Log the status change
            \Illuminate\Support\Facades\Log::info("Payment status updated", [
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
            \Illuminate\Support\Facades\Log::error('Payment status update failed', [
                'payment_id' => $paymentId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'Success' => false,
                'Message' => 'Failed to update payment status',
                'Errors' => ['server' => 'Internal server error']
            ], 500);
        }
    }

    // ... other existing methods ...
}
```

---

## Step 2: Add Route

Update your `routes/api.php` to include the status update route:

```php
<?php

use App\Http\Controllers\Api\PaymentController;
// ... other imports ...

Route::middleware(['auth:sanctum'])->group(function () {
    // ... existing routes ...

    // Payment status update
    Route::patch('/payments/{payment}/status', [PaymentController::class, 'updateStatus']);

    // ... other payment routes ...
});
```

---

## Step 3: Update Payment Model

Ensure your Payment model has the correct fillable fields and relationships:

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
}
```

---

## Step 4: Test the Endpoint

Test the endpoint with curl:

```bash
# Update payment status to completed
curl -X PATCH http://127.0.0.1:8000/api/payments/019b36a8-e7bd-7286-857c-ba46ef3b30ca/status \
  -H "Authorization: Bearer YOUR_LANDLORD_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

Expected response:
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
```

---

## Key Points

1. **Authorization**: Only landlords can update payment status
2. **Invoice Check**: For invoice-linked payments, verifies landlord owns the property
3. **Tenant Check**: For tenant payments (no invoice), verifies tenant belongs to landlord's property
5. **Status Values**: Supports `pending`, `recorded`, `completed`, `partially_paid`, `failed`
5. **Logging**: Logs all status changes for audit purposes
6. **Error Handling**: Comprehensive error handling with appropriate HTTP status codes

This implementation handles both tenant payments (no invoice) and landlord-recorded payments (with invoices), resolving the "Payment invoice not found" error.</content>
<parameter name="filePath">d:\Work Environment\MarBarnes\final\Property-Management-System-Frontend\PAYMENT_STATUS_UPDATE_BACKEND_GUIDE.md