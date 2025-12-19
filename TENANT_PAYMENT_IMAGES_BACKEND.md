# Backend Update for Tenant Payment Images

## Issue
Tenant payment form now sends `receipt_images` array, but the backend needs to handle it.

## Required Backend Changes

### 1. Update TenantPaymentController Validation

```php
// In app/Http/Controllers/Api/TenantPaymentController.php

$validator = Validator::make($request->all(), [
    'amount' => 'required|numeric|min:0.01',
    'payment_method' => 'required|in:mtn_momo,vodafone_cash,airtel_tigo,bank_transfer,cash',
    'reference_number' => 'required|string|max:100',
    'payment_date' => 'required|date|before_or_equal:today',
    'notes' => 'nullable|string|max:500',
    'payment_status' => 'required|in:pending,recorded,verified,rejected',
    'receipt_images' => 'nullable|array', // Add this
    'receipt_images.*' => 'url', // Validate each image URL
]);
```

### 2. Update Payment Creation

```php
// In the store method, add receipt_images to the payment creation:

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
    'receipt_images' => $request->receipt_images ? json_encode($request->receipt_images) : null, // Add this
    'recorded_by' => $user->id,
]);
```

### 3. Update Payment Model

```php
// In app/Models/Payment.php

protected $fillable = [
    // ... existing fields
    'receipt_images', // Add this
];

protected $casts = [
    'payment_date' => 'date',
    'amount' => 'decimal:2',
    'receipt_images' => 'array', // Add this cast
];
```

### 4. Update API Response

Make sure the API returns the receipt_images in the response:

```php
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
        'receipt_images' => $payment->receipt_images, // Add this
        'property' => $property->name,
        'unit' => $unit->unit_number
    ]
], 201);
```

## Testing

After implementing these changes:

1. **Submit a tenant payment with images**
2. **Check payment history** - images should now display
3. **Verify invoice column** shows "Tenant-[ID]" instead of "N/A"

## Alternative: File Upload Instead of URLs

If you want to handle actual file uploads instead of image URLs:

```php
// For file uploads, change validation:
'receipt_images' => 'nullable|array',
'receipt_images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048', // 2MB max

// Handle file storage in controller:
$imageUrls = [];
if ($request->hasFile('receipt_images')) {
    foreach ($request->file('receipt_images') as $image) {
        $path = $image->store('payment-receipts', 'public');
        $imageUrls[] = asset('storage/' . $path);
    }
}

$payment = Payment::create([
    // ... other fields
    'receipt_images' => json_encode($imageUrls),
]);
```

But for now, the URL approach should work with the base64 images from the frontend.</content>
<parameter name="filePath">d:\Work Environment\MarBarnes\final\Property-Management-System-Frontend\TENANT_PAYMENT_IMAGES_BACKEND.md