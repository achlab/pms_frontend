# Payment Notification System - Backend Implementation Guide

## Overview
This guide provides the complete backend implementation for sending in-app notifications when landlords receive payments from tenants.

## Prerequisites
- Laravel 10+ with Sanctum authentication
- Existing notification system (Laravel Notifications)
- Payment recording endpoint already implemented

---

## Step 1: Create Payment Received Notification Class

Create a new notification class for payment receipts:

```bash
php artisan make:notification PaymentReceivedNotification
```

Update `app/Notifications/PaymentReceivedNotification.php`:

```php
<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Payment;

class PaymentReceivedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $payment;

    /**
     * Create a new notification instance.
     */
    public function __construct(Payment $payment)
    {
        $this->payment = $payment;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail']; // Add 'mail' if you want email notifications
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Payment Received - ₵' . number_format($this->payment->amount, 2))
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('You have received a payment from ' . $this->payment->tenant->user->name)
            ->line('Property: ' . $this->payment->property->name)
            ->line('Unit: ' . $this->payment->unit->unit_number)
            ->line('Amount: ₵' . number_format($this->payment->amount, 2))
            ->line('Payment Method: ' . ucwords(str_replace('_', ' ', $this->payment->payment_method)))
            ->action('View Payment Details', url('/payments'))
            ->line('Thank you for using our platform!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'payment_received',
            'title' => 'Payment Received',
            'message' => $this->payment->tenant->user->name . ' paid ₵' . number_format($this->payment->amount, 2) . ' for ' . $this->payment->property->name . ' - Unit ' . $this->payment->unit->unit_number,
            'data' => [
                'payment_id' => $this->payment->id,
                'payment_reference' => $this->payment->payment_reference,
                'amount' => $this->payment->amount,
                'payment_method' => $this->payment->payment_method,
                'payment_date' => $this->payment->payment_date,
                'receipt_number' => $this->payment->receipt_number,
                'property_name' => $this->payment->property->name,
                'unit_number' => $this->payment->unit->unit_number,
                'tenant_name' => $this->payment->tenant->user->name,
            ],
            'action_url' => '/payments',
        ];
    }
}
```

---

## Step 2: Update Payment Model Relationships

Ensure your `Payment` model has the necessary relationships:

```php
<?php

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
        'payment_reference',
        'receipt_number',
        'notes',
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

## Step 3: Update Payment Controller to Send Notifications

Update your `PaymentController@store` method to send notifications when payments are recorded:

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Notifications\PaymentReceivedNotification;

class PaymentController extends Controller
{
    /**
     * Record a new payment
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'property_id' => 'required|uuid|exists:properties,id',
            'unit_id' => 'required|uuid|exists:units,id',
            'tenant_id' => 'required|uuid|exists:tenants,id',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,mtn_momo,vodafone_cash,bank_transfer',
            'payment_date' => 'required|date',
            'payment_reference' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Get the landlord from the property
            $property = \App\Models\Property::findOrFail($request->property_id);
            $landlord = $property->landlord;

            // Create payment record
            $payment = Payment::create([
                'property_id' => $request->property_id,
                'unit_id' => $request->unit_id,
                'tenant_id' => $request->tenant_id,
                'landlord_id' => $landlord->id,
                'amount' => $request->amount,
                'payment_method' => $request->payment_method,
                'payment_date' => $request->payment_date,
                'payment_reference' => $request->payment_reference,
                'receipt_number' => $this->generateReceiptNumber(),
                'notes' => $request->notes,
                'recorded_by' => auth()->id(),
            ]);

            // Load relationships for notification
            $payment->load(['property', 'unit', 'tenant.user']);

            // Send notification to landlord
            $landlord->notify(new PaymentReceivedNotification($payment));

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Payment recorded successfully',
                'data' => $payment->load(['property', 'unit', 'tenant.user', 'recordedBy'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to record payment',
                'error' => $e->getMessage()
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

## Step 4: Update Notification Retrieval Endpoint

Ensure your notifications endpoint returns all notification types (not just maintenance):

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get all notifications for authenticated user
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $page = $request->get('page', 1);

        $notifications = auth()->user()
            ->notifications()
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        $formattedNotifications = $notifications->map(function ($notification) {
            return [
                'ID' => $notification->id,
                'Type' => class_basename($notification->type),
                'Data' => $notification->data,
                'ReadAt' => $notification->read_at,
                'IsRead' => $notification->read_at !== null,
                'CreatedAt' => $notification->created_at->toISOString(),
                'TimeAgo' => $notification->created_at->diffForHumans(),
                'Title' => $notification->data['title'] ?? 'Notification',
                'Message' => $notification->data['message'] ?? '',
                'Icon' => $this->getNotificationIcon($notification->data['type'] ?? 'default'),
                'ActionUrl' => $notification->data['action_url'] ?? null,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formattedNotifications,
            'meta' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
            ]
        ]);
    }

    /**
     * Get unread notification count
     */
    public function unreadCount()
    {
        $count = auth()->user()->unreadNotifications()->count();

        return response()->json([
            'success' => true,
            'data' => [
                'UnreadCount' => $count
            ]
        ]);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead($notificationId)
    {
        $notification = auth()->user()
            ->notifications()
            ->where('id', $notificationId)
            ->firstOrFail();

        $notification->markAsRead();

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read',
            'data' => [
                'ID' => $notification->id,
                'IsRead' => true,
                'ReadAt' => $notification->read_at
            ]
        ]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead()
    {
        auth()->user()->unreadNotifications->markAsRead();

        return response()->json([
            'success' => true,
            'message' => 'All notifications marked as read'
        ]);
    }

    /**
     * Get notification icon based on type
     */
    private function getNotificationIcon($type)
    {
        return match($type) {
            'payment_received' => 'dollar-sign',
            'maintenance_request_submitted' => 'wrench',
            'maintenance_request_status_updated' => 'bell',
            default => 'bell'
        };
    }
}
```

---

## Step 5: Update Routes

Ensure your routes are properly configured in `routes/api.php`:

```php
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\NotificationController;

Route::middleware(['auth:sanctum'])->group(function () {
    // Payment routes
    Route::prefix('payments')->group(function () {
        Route::get('/history', [PaymentController::class, 'index']);
        Route::post('/', [PaymentController::class, 'store']);
        Route::get('/{payment}', [PaymentController::class, 'show']);
        Route::put('/{payment}', [PaymentController::class, 'update']);
        Route::delete('/{payment}', [PaymentController::class, 'destroy']);
    });

    // Notification routes
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
        Route::patch('/{notification}/mark-as-read', [NotificationController::class, 'markAsRead']);
        Route::patch('/mark-all-as-read', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/{notification}', [NotificationController::class, 'destroy']);
    });
});
```

---

## Step 6: Add Sorting to Payment History Endpoint

Update the payment history query to support sorting:

```php
public function index(Request $request)
{
    $query = Payment::query()
        ->where('landlord_id', auth()->id())
        ->with(['property', 'unit', 'tenant.user']);

    // Filter by date range
    if ($request->has('start_date')) {
        $query->whereDate('payment_date', '>=', $request->start_date);
    }
    if ($request->has('end_date')) {
        $query->whereDate('payment_date', '<=', $request->end_date);
    }

    // Filter by payment method
    if ($request->has('payment_method')) {
        $query->where('payment_method', $request->payment_method);
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
}
```

---

## Step 7: Testing the Implementation

### Test Payment Notification

1. **Record a payment** via API or admin panel:
```bash
POST /api/payments
{
  "property_id": "uuid",
  "unit_id": "uuid",
  "tenant_id": "uuid",
  "amount": 925.00,
  "payment_method": "mtn_momo",
  "payment_date": "2024-01-15",
  "payment_reference": "MTN-123456"
}
```

2. **Check notifications** for the landlord:
```bash
GET /api/notifications
```

Expected response:
```json
{
  "success": true,
  "data": [
    {
      "ID": "uuid",
      "Type": "PaymentReceivedNotification",
      "Data": {
        "type": "payment_received",
        "title": "Payment Received",
        "message": "John Doe paid ₵925.00 for Sunset Apartments - Unit A101",
        "data": {
          "payment_id": "uuid",
          "amount": 925.00,
          "payment_method": "mtn_momo",
          "property_name": "Sunset Apartments",
          "unit_number": "A101",
          "tenant_name": "John Doe"
        },
        "action_url": "/payments"
      },
      "IsRead": false,
      "TimeAgo": "2 minutes ago"
    }
  ]
}
```

3. **Check unread count**:
```bash
GET /api/notifications/unread-count
```

4. **Mark as read**:
```bash
PATCH /api/notifications/{notification_id}/mark-as-read
```

---

## Step 8: Queue Configuration (Optional but Recommended)

For better performance, configure queue workers:

1. **Update `.env`**:
```env
QUEUE_CONNECTION=database
```

2. **Create jobs table**:
```bash
php artisan queue:table
php artisan migrate
```

3. **Run queue worker**:
```bash
php artisan queue:work
```

4. **Supervisor configuration** (production):
```ini
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/path/to/worker.log
```

---

## Summary

✅ **Frontend Changes** (Already Implemented):
- Added `payment_received` to NotificationType
- Updated NotificationData interface with payment fields
- Enhanced notification bell to show payment notifications with green dollar icon
- Added payment amount display in notifications
- Updated action URL routing for payment notifications

✅ **Backend Implementation Required**:
1. Create PaymentReceivedNotification class
2. Update Payment model with relationships
3. Send notification in PaymentController@store
4. Update notification endpoint to handle all types
5. Add sorting to payment history endpoint (sort_by, sort_order)
6. Configure queues for async notifications

🔔 **Notification Flow**:
1. Tenant/landlord records payment → PaymentController@store
2. Payment saved → landlord.notify(new PaymentReceivedNotification($payment))
3. Notification stored in database → Frontend polls /api/notifications
4. Bell icon shows unread count → User clicks to view
5. Payment notification displays with green dollar icon and amount
6. Click navigates to /payments page

---

## Troubleshooting

**Notifications not appearing?**
- Check if notification was created: `SELECT * FROM notifications WHERE notifiable_id = 'landlord_id'`
- Verify relationships are loaded: `$payment->load(['property', 'unit', 'tenant.user'])`
- Check notification data structure matches frontend expectations

**Frontend not showing payment notifications?**
- Verify NotificationType includes "payment_received"
- Check notification bell icon logic handles payment type
- Ensure notification service polls regularly (useMaintenanceNotifications hook)

**Sorting not working?**
- Verify sort_by and sort_order are passed from frontend
- Check Payment model has sortable fields (created_at, amount, payment_date)
- Validate query builder applies sorting: `->orderBy($sortBy, $sortOrder)`
