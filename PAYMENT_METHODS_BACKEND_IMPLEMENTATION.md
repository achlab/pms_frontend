# Payment Methods Backend Implementation Guide (Laravel)

This guide provides complete Laravel backend implementation for the payment methods management system.

## Database Migration

Create migration: `php artisan make:migration create_landlord_payment_methods_table`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Mobile Money Methods
        Schema::create('landlord_mobile_money_methods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('landlord_id')->constrained('users')->onDelete('cascade');
            $table->enum('provider', ['mtn_momo', 'vodafone_cash', 'airteltigo_money']);
            $table->string('account_number');
            $table->string('account_name');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index('landlord_id');
        });

        // Bank Transfer Methods
        Schema::create('landlord_bank_transfer_methods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('landlord_id')->constrained('users')->onDelete('cascade');
            $table->string('bank_name');
            $table->string('account_number');
            $table->string('account_name');
            $table->string('branch')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index('landlord_id');
        });

        // Cash Settings
        Schema::create('landlord_cash_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('landlord_id')->constrained('users')->onDelete('cascade');
            $table->boolean('cash_enabled')->default(false);
            $table->timestamps();
            
            $table->unique('landlord_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('landlord_mobile_money_methods');
        Schema::dropIfExists('landlord_bank_transfer_methods');
        Schema::dropIfExists('landlord_cash_settings');
    }
};
```

Run: `php artisan migrate`

## Models

### MobileMoneyMethod Model
Create: `app/Models/MobileMoneyMethod.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MobileMoneyMethod extends Model
{
    protected $table = 'landlord_mobile_money_methods';

    protected $fillable = [
        'landlord_id',
        'provider',
        'account_number',
        'account_name',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function landlord(): BelongsTo
    {
        return $this->belongsTo(User::class, 'landlord_id');
    }
}
```

### BankTransferMethod Model
Create: `app/Models/BankTransferMethod.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BankTransferMethod extends Model
{
    protected $table = 'landlord_bank_transfer_methods';

    protected $fillable = [
        'landlord_id',
        'bank_name',
        'account_number',
        'account_name',
        'branch',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function landlord(): BelongsTo
    {
        return $this->belongsTo(User::class, 'landlord_id');
    }
}
```

### CashSetting Model
Create: `app/Models/CashSetting.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashSetting extends Model
{
    protected $table = 'landlord_cash_settings';

    protected $fillable = [
        'landlord_id',
        'cash_enabled',
    ];

    protected $casts = [
        'cash_enabled' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function landlord(): BelongsTo
    {
        return $this->belongsTo(User::class, 'landlord_id');
    }
}
```

## Controller

Create: `app/Http/Controllers/LandlordPaymentMethodController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\MobileMoneyMethod;
use App\Models\BankTransferMethod;
use App\Models\CashSetting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class LandlordPaymentMethodController extends Controller
{
    /**
     * Get all payment methods for authenticated landlord
     */
    public function index(): JsonResponse
    {
        $landlordId = auth()->id();

        $mobileMoneyMethods = MobileMoneyMethod::where('landlord_id', $landlordId)
            ->orderBy('created_at', 'desc')
            ->get();

        $bankTransferMethods = BankTransferMethod::where('landlord_id', $landlordId)
            ->orderBy('created_at', 'desc')
            ->get();

        $cashSetting = CashSetting::where('landlord_id', $landlordId)->first();

        $data = [
            'mobile_money' => $mobileMoneyMethods,
            'bank_transfer' => $bankTransferMethods,
            'cash_enabled' => $cashSetting ? $cashSetting->cash_enabled : false,
        ];

        // If no payment methods exist at all, return helpful message
        if ($mobileMoneyMethods->isEmpty() && $bankTransferMethods->isEmpty() && !$cashSetting) {
            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'Payment methods not found. Create one to get started.',
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Add a mobile money method
     */
    public function storeMobileMoney(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'provider' => 'required|in:mtn_momo,vodafone_cash,airteltigo_money',
            'account_number' => 'required|string|max:20',
            'account_name' => 'required|string|max:255',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $method = MobileMoneyMethod::create([
            'landlord_id' => auth()->id(),
            'provider' => $request->provider,
            'account_number' => $request->account_number,
            'account_name' => $request->account_name,
            'is_active' => $request->is_active ?? true,
        ]);

        return response()->json([
            'success' => true,
            'data' => $method,
            'message' => 'Mobile money method added successfully',
        ], 201);
    }

    /**
     * Update a mobile money method
     */
    public function updateMobileMoney(Request $request, int $id): JsonResponse
    {
        $method = MobileMoneyMethod::where('landlord_id', auth()->id())
            ->where('id', $id)
            ->first();

        if (!$method) {
            return response()->json([
                'success' => false,
                'message' => 'Mobile money method not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'provider' => 'sometimes|in:mtn_momo,vodafone_cash,airteltigo_money',
            'account_number' => 'sometimes|string|max:20',
            'account_name' => 'sometimes|string|max:255',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $method->update($request->only([
            'provider',
            'account_number',
            'account_name',
            'is_active',
        ]));

        return response()->json([
            'success' => true,
            'data' => $method,
            'message' => 'Mobile money method updated successfully',
        ]);
    }

    /**
     * Delete a mobile money method
     */
    public function destroyMobileMoney(int $id): JsonResponse
    {
        $method = MobileMoneyMethod::where('landlord_id', auth()->id())
            ->where('id', $id)
            ->first();

        if (!$method) {
            return response()->json([
                'success' => false,
                'message' => 'Mobile money method not found',
            ], 404);
        }

        $method->delete();

        return response()->json([
            'success' => true,
            'message' => 'Mobile money method deleted successfully',
        ]);
    }

    /**
     * Add a bank transfer method
     */
    public function storeBankTransfer(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'bank_name' => 'required|string|max:255',
            'account_number' => 'required|string|max:50',
            'account_name' => 'required|string|max:255',
            'branch' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $method = BankTransferMethod::create([
            'landlord_id' => auth()->id(),
            'bank_name' => $request->bank_name,
            'account_number' => $request->account_number,
            'account_name' => $request->account_name,
            'branch' => $request->branch,
            'is_active' => $request->is_active ?? true,
        ]);

        return response()->json([
            'success' => true,
            'data' => $method,
            'message' => 'Bank account added successfully',
        ], 201);
    }

    /**
     * Update a bank transfer method
     */
    public function updateBankTransfer(Request $request, int $id): JsonResponse
    {
        $method = BankTransferMethod::where('landlord_id', auth()->id())
            ->where('id', $id)
            ->first();

        if (!$method) {
            return response()->json([
                'success' => false,
                'message' => 'Bank account not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'bank_name' => 'sometimes|string|max:255',
            'account_number' => 'sometimes|string|max:50',
            'account_name' => 'sometimes|string|max:255',
            'branch' => 'nullable|string|max:255',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $method->update($request->only([
            'bank_name',
            'account_number',
            'account_name',
            'branch',
            'is_active',
        ]));

        return response()->json([
            'success' => true,
            'data' => $method,
            'message' => 'Bank account updated successfully',
        ]);
    }

    /**
     * Delete a bank transfer method
     */
    public function destroyBankTransfer(int $id): JsonResponse
    {
        $method = BankTransferMethod::where('landlord_id', auth()->id())
            ->where('id', $id)
            ->first();

        if (!$method) {
            return response()->json([
                'success' => false,
                'message' => 'Bank account not found',
            ], 404);
        }

        $method->delete();

        return response()->json([
            'success' => true,
            'message' => 'Bank account deleted successfully',
        ]);
    }

    /**
     * Update cash payment settings
     */
    public function updateCashSettings(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'cash_enabled' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $setting = CashSetting::updateOrCreate(
            ['landlord_id' => auth()->id()],
            ['cash_enabled' => $request->cash_enabled]
        );

        return response()->json([
            'success' => true,
            'data' => ['cash_enabled' => $setting->cash_enabled],
            'message' => 'Cash payment settings updated successfully',
        ]);
    }
}
```

## Routes

Add to `routes/api.php`:

```php
use App\Http\Controllers\LandlordPaymentMethodController;

// Payment Methods Routes (Landlord only)
Route::middleware(['auth:sanctum'])->group(function () {
    Route::prefix('landlord/payment-methods')->group(function () {
        // Get all payment methods
        Route::get('/', [LandlordPaymentMethodController::class, 'index']);
        
        // Mobile Money routes
        Route::post('/mobile-money', [LandlordPaymentMethodController::class, 'storeMobileMoney']);
        Route::put('/mobile-money/{id}', [LandlordPaymentMethodController::class, 'updateMobileMoney']);
        Route::delete('/mobile-money/{id}', [LandlordPaymentMethodController::class, 'destroyMobileMoney']);
        
        // Bank Transfer routes
        Route::post('/bank-transfer', [LandlordPaymentMethodController::class, 'storeBankTransfer']);
        Route::put('/bank-transfer/{id}', [LandlordPaymentMethodController::class, 'updateBankTransfer']);
        Route::delete('/bank-transfer/{id}', [LandlordPaymentMethodController::class, 'destroyBankTransfer']);
        
        // Cash settings route
        Route::put('/cash', [LandlordPaymentMethodController::class, 'updateCashSettings']);
    });
});
```

## Middleware (Optional - Role Check)

If you want to restrict to landlords only, add this middleware to the route group:

```php
Route::middleware(['auth:sanctum', 'role:landlord'])->group(function () {
    // ... payment method routes
});
```

Or create a middleware to check role:

```php
// app/Http/Middleware/EnsureLandlord.php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureLandlord
{
    public function handle(Request $request, Closure $next)
    {
        if (auth()->user()->role !== 'landlord') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Landlord access required.',
            ], 403);
        }

        return $next($request);
    }
}
```

Register in `app/Http/Kernel.php`:

```php
protected $middlewareAliases = [
    // ... other middleware
    'landlord' => \App\Http\Middleware\EnsureLandlord::class,
];
```

## Testing with Postman/Thunder Client

### 1. Get Payment Methods
```
GET http://localhost:8000/api/landlord/payment-methods
Headers:
  Authorization: Bearer YOUR_TOKEN
  Accept: application/json
```

### 2. Add Mobile Money
```
POST http://localhost:8000/api/landlord/payment-methods/mobile-money
Headers:
  Authorization: Bearer YOUR_TOKEN
  Accept: application/json
  Content-Type: application/json
Body:
{
  "provider": "mtn_momo",
  "account_number": "0244123456",
  "account_name": "John Doe",
  "is_active": true
}
```

### 3. Update Mobile Money
```
PUT http://localhost:8000/api/landlord/payment-methods/mobile-money/1
Headers:
  Authorization: Bearer YOUR_TOKEN
  Accept: application/json
  Content-Type: application/json
Body:
{
  "is_active": false
}
```

### 4. Delete Mobile Money
```
DELETE http://localhost:8000/api/landlord/payment-methods/mobile-money/1
Headers:
  Authorization: Bearer YOUR_TOKEN
  Accept: application/json
```

### 5. Add Bank Account
```
POST http://localhost:8000/api/landlord/payment-methods/bank-transfer
Headers:
  Authorization: Bearer YOUR_TOKEN
  Accept: application/json
  Content-Type: application/json
Body:
{
  "bank_name": "GCB Bank",
  "account_number": "1234567890",
  "account_name": "John Doe",
  "branch": "Osu Branch",
  "is_active": true
}
```

### 6. Update Cash Settings
```
PUT http://localhost:8000/api/landlord/payment-methods/cash
Headers:
  Authorization: Bearer YOUR_TOKEN
  Accept: application/json
  Content-Type: application/json
Body:
{
  "cash_enabled": true
}
```

## Quick Setup Commands

```bash
# Create migration
php artisan make:migration create_landlord_payment_methods_table

# Create models
php artisan make:model MobileMoneyMethod
php artisan make:model BankTransferMethod
php artisan make:model CashSetting

# Create controller
php artisan make:controller LandlordPaymentMethodController

# Run migrations
php artisan migrate

# Clear cache
php artisan config:clear
php artisan route:clear
php artisan cache:clear
```

## Verification

After implementation, verify routes exist:
```bash
php artisan route:list | grep payment-methods
```

You should see:
```
GET|HEAD  api/landlord/payment-methods
POST      api/landlord/payment-methods/mobile-money
PUT       api/landlord/payment-methods/mobile-money/{id}
DELETE    api/landlord/payment-methods/mobile-money/{id}
POST      api/landlord/payment-methods/bank-transfer
PUT       api/landlord/payment-methods/bank-transfer/{id}
DELETE    api/landlord/payment-methods/bank-transfer/{id}
PUT       api/landlord/payment-methods/cash
```

## Common Issues

1. **405 Method Not Allowed**: Routes not registered correctly
2. **401 Unauthorized**: Token not sent or invalid
3. **403 Forbidden**: User doesn't have landlord role
4. **404 Not Found**: Route path doesn't match
5. **422 Validation Error**: Request data doesn't match validation rules

## Expected Response Formats

All responses follow this structure:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": { ... }
}
```

This matches the frontend's normalized response handling.
