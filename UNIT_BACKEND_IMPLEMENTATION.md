# Unit Backend Implementation (Laravel)

## 1. Unit Model Updates

Update your `Unit` model to include the new fields:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Unit extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_id',
        'unit_number',
        'unit_type',
        'rental_amount',
        'description',
        'floor_number',
        'bedrooms',
        'bathrooms',
        'is_furnished',
        'utilities_included',
        'is_active',
    ];

    protected $casts = [
        'rental_amount' => 'decimal:2',
        'floor_number' => 'integer',
        'bedrooms' => 'integer',
        'bathrooms' => 'integer',
        'is_furnished' => 'boolean',
        'utilities_included' => 'boolean',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function tenant()
    {
        return $this->belongsTo(User::class, 'tenant_id');
    }

    // Helper methods
    public function isOccupied(): bool
    {
        return !is_null($this->tenant_id);
    }

    public function getStatusAttribute(): string
    {
        if (!$this->is_active) {
            return 'disabled';
        }

        return $this->isOccupied() ? 'occupied' : 'vacant';
    }
}
```

## 2. Unit Migration

Create migration for the units table:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->onDelete('cascade');
            $table->string('unit_number');
            $table->enum('unit_type', ['studio', 'apartment', 'penthouse', 'villa', 'townhouse', 'duplex'])->default('apartment');
            $table->decimal('rental_amount', 10, 2);
            $table->text('description')->nullable();
            $table->integer('floor_number')->nullable();
            $table->integer('bedrooms')->nullable();
            $table->integer('bathrooms')->nullable();
            $table->boolean('is_furnished')->default(false);
            $table->boolean('utilities_included')->default(false);
            $table->boolean('is_active')->default(true);
            $table->foreignId('tenant_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->unique(['property_id', 'unit_number']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('units');
    }
};
```

## 3. UnitController Implementation

Update your UnitController with proper response formatting:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UnitController extends Controller
{
    public function index(Request $request, Property $property): JsonResponse
    {
        $units = $property->units()
            ->with('tenant:id,name,email')
            ->when($request->has('is_active'), function ($query) use ($request) {
                $query->where('is_active', $request->boolean('is_active'));
            })
            ->when($request->has('is_occupied'), function ($query) use ($request) {
                if ($request->boolean('is_occupied')) {
                    $query->whereNotNull('tenant_id');
                } else {
                    $query->whereNull('tenant_id');
                }
            })
            ->orderBy('unit_number')
            ->get()
            ->map(function ($unit) {
                return $this->formatUnitResponse($unit);
            });

        return response()->json([
            'Success' => true,
            'Data' => $units,
            'Message' => 'Units retrieved successfully'
        ]);
    }

    public function store(Request $request, Property $property): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'unit_number' => [
                'required',
                'string',
                'max:50',
                Rule::unique('units')->where('property_id', $property->id)
            ],
            'unit_type' => 'required|in:studio,apartment,penthouse,villa,townhouse,duplex',
            'rental_amount' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:1000',
            'floor_number' => 'nullable|integer|min:0|max:100',
            'bedrooms' => 'nullable|integer|min:0|max:20',
            'bathrooms' => 'nullable|integer|min:0|max:20',
            'is_furnished' => 'boolean',
            'utilities_included' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'Success' => false,
                'Message' => 'Validation failed',
                'Errors' => $validator->errors()
            ], 422);
        }

        $unit = $property->units()->create($request->all());

        return response()->json([
            'Success' => true,
            'Data' => $this->formatUnitResponse($unit->load('tenant:id,name,email')),
            'Message' => 'Unit created successfully'
        ], 201);
    }

    public function show(Property $property, Unit $unit): JsonResponse
    {
        // Ensure unit belongs to property
        if ($unit->property_id !== $property->id) {
            return response()->json([
                'Success' => false,
                'Message' => 'Unit not found in this property'
            ], 404);
        }

        return response()->json([
            'Success' => true,
            'Data' => $this->formatUnitResponse($unit->load('tenant:id,name,email')),
            'Message' => 'Unit retrieved successfully'
        ]);
    }

    public function update(Request $request, Property $property, Unit $unit): JsonResponse
    {
        // Ensure unit belongs to property
        if ($unit->property_id !== $property->id) {
            return response()->json([
                'Success' => false,
                'Message' => 'Unit not found in this property'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'unit_number' => [
                'sometimes',
                'string',
                'max:50',
                Rule::unique('units')->where('property_id', $property->id)->ignore($unit->id)
            ],
            'unit_type' => 'sometimes|in:studio,apartment,penthouse,villa,townhouse,duplex',
            'rental_amount' => 'sometimes|numeric|min:0',
            'description' => 'nullable|string|max:1000',
            'floor_number' => 'nullable|integer|min:0|max:100',
            'bedrooms' => 'nullable|integer|min:0|max:20',
            'bathrooms' => 'nullable|integer|min:0|max:20',
            'is_furnished' => 'boolean',
            'utilities_included' => 'boolean',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'Success' => false,
                'Message' => 'Validation failed',
                'Errors' => $validator->errors()
            ], 422);
        }

        $unit->update($request->all());

        return response()->json([
            'Success' => true,
            'Data' => $this->formatUnitResponse($unit->fresh()->load('tenant:id,name,email')),
            'Message' => 'Unit updated successfully'
        ]);
    }

    public function destroy(Property $property, Unit $unit): JsonResponse
    {
        // Ensure unit belongs to property
        if ($unit->property_id !== $property->id) {
            return response()->json([
                'Success' => false,
                'Message' => 'Unit not found in this property'
            ], 404);
        }

        $unit->delete();

        return response()->json([
            'Success' => true,
            'Message' => 'Unit deleted successfully'
        ]);
    }

    // Assign tenant to unit
    public function assignTenant(Request $request, Property $property, Unit $unit): JsonResponse
    {
        // Ensure unit belongs to property
        if ($unit->property_id !== $property->id) {
            return response()->json([
                'Success' => false,
                'Message' => 'Unit not found in this property'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'tenant_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'Success' => false,
                'Message' => 'Validation failed',
                'Errors' => $validator->errors()
            ], 422);
        }

        // Check if tenant is already assigned to another unit
        $existingUnit = Unit::where('tenant_id', $request->tenant_id)
            ->where('id', '!=', $unit->id)
            ->first();

        if ($existingUnit) {
            return response()->json([
                'Success' => false,
                'Message' => 'Tenant is already assigned to another unit'
            ], 422);
        }

        $unit->update(['tenant_id' => $request->tenant_id]);

        return response()->json([
            'Success' => true,
            'Data' => $this->formatUnitResponse($unit->fresh()->load('tenant:id,name,email')),
            'Message' => 'Tenant assigned to unit successfully'
        ]);
    }

    // Remove tenant from unit
    public function removeTenant(Property $property, Unit $unit): JsonResponse
    {
        // Ensure unit belongs to property
        if ($unit->property_id !== $property->id) {
            return response()->json([
                'Success' => false,
                'Message' => 'Unit not found in this property'
            ], 404);
        }

        $unit->update(['tenant_id' => null]);

        return response()->json([
            'Success' => true,
            'Data' => $this->formatUnitResponse($unit->fresh()->load('tenant:id,name,email')),
            'Message' => 'Tenant removed from unit successfully'
        ]);
    }

    // Enable/disable unit
    public function toggleActive(Request $request, Property $property, Unit $unit): JsonResponse
    {
        // Ensure unit belongs to property
        if ($unit->property_id !== $property->id) {
            return response()->json([
                'Success' => false,
                'Message' => 'Unit not found in this property'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'is_active' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'Success' => false,
                'Message' => 'Validation failed',
                'Errors' => $validator->errors()
            ], 422);
        }

        $unit->update(['is_active' => $request->is_active]);

        $action = $request->is_active ? 'enabled' : 'disabled';

        return response()->json([
            'Success' => true,
            'Data' => $this->formatUnitResponse($unit->fresh()->load('tenant:id,name,email')),
            'Message' => "Unit {$action} successfully"
        ]);
    }

    /**
     * Format unit response to match frontend expectations
     */
    private function formatUnitResponse(Unit $unit): array
    {
        return [
            'id' => $unit->id,
            'property_id' => $unit->property_id,
            'unit_number' => $unit->unit_number,
            'unit_type' => $unit->unit_type,
            'rental_amount' => $unit->rental_amount,
            'description' => $unit->description,
            'floor_number' => $unit->floor_number,
            'bedrooms' => $unit->bedrooms,
            'bathrooms' => $unit->bathrooms,
            'is_furnished' => $unit->is_furnished,
            'utilities_included' => $unit->utilities_included,
            'is_active' => $unit->is_active,
            'tenant_id' => $unit->tenant_id,
            'is_occupied' => $unit->isOccupied(),
            'status' => $unit->status,
            'tenant' => $unit->tenant ? [
                'id' => $unit->tenant->id,
                'name' => $unit->tenant->name,
                'email' => $unit->tenant->email,
            ] : null,
            'created_at' => $unit->created_at,
            'updated_at' => $unit->updated_at,
        ];
    }
}
```

## 4. Property Controller Updates

**CRITICAL**: Update your PropertyController to include units with complete data:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class PropertyController extends Controller
{
    public function show(Request $request, Property $property): JsonResponse
    {
        // Load property with units and their tenants
        $property->load([
            'units' => function ($query) {
                $query->with('tenant:id,name,email')
                      ->orderBy('unit_number');
            },
            'landlord:id,name,email',
            'caretaker:id,name,email'
        ]);

        // Format units using the UnitController's formatUnitResponse method
        $units = $property->units->map(function ($unit) {
            $unitController = new UnitController();
            return $unitController->formatUnitResponse($unit);
        });

        $propertyData = [
            'id' => $property->id,
            'name' => $property->name,
            'street_address' => $property->street_address,
            'ghana_post_gps_address' => $property->ghana_post_gps_address,
            'description' => $property->description,
            'landlord_id' => $property->landlord_id,
            'caretaker_id' => $property->caretaker_id,
            'verification_status' => $property->verification_status,
            'is_active' => $property->is_active,
            'units' => $units, // Include formatted units
            'landlord' => $property->landlord,
            'caretaker' => $property->caretaker,
            'created_at' => $property->created_at,
            'updated_at' => $property->updated_at,
        ];

        return response()->json([
            'Success' => true,
            'Data' => $propertyData,
            'Message' => 'Property retrieved successfully'
        ]);
    }

    // ... other methods
}
```

## 4. Property Controller Updates

**CRITICAL**: Update your PropertyController to include units with complete data:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class PropertyController extends Controller
{
    public function show(Request $request, Property $property): JsonResponse
    {
        // Load property with units and their tenants
        $property->load([
            'units' => function ($query) {
                $query->with('tenant:id,name,email')
                      ->orderBy('unit_number');
            },
            'landlord:id,name,email',
            'caretaker:id,name,email'
        ]);

        // Format units using the UnitController's formatUnitResponse method
        $units = $property->units->map(function ($unit) {
            $unitController = new UnitController();
            return $unitController->formatUnitResponse($unit);
        });

        $propertyData = [
            'id' => $property->id,
            'name' => $property->name,
            'street_address' => $property->street_address,
            'ghana_post_gps_address' => $property->ghana_post_gps_address,
            'description' => $property->description,
            'landlord_id' => $property->landlord_id,
            'caretaker_id' => $property->caretaker_id,
            'verification_status' => $property->verification_status,
            'is_active' => $property->is_active,
            'units' => $units, // Include formatted units
            'landlord' => $property->landlord,
            'caretaker' => $property->caretaker,
            'created_at' => $property->created_at,
            'updated_at' => $property->updated_at,
        ];

        return response()->json([
            'Success' => true,
            'Data' => $propertyData,
            'Message' => 'Property retrieved successfully'
        ]);
    }

    // ... other methods
}
```

## 5. API Routes

Add these routes to your `routes/api.php`:

```php
<?php

use App\Http\Controllers\UnitController;
use Illuminate\Support\Facades\Route;

// Unit management routes (nested under properties)
Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('properties/{property}/units')->group(function () {
        Route::get('/', [UnitController::class, 'index']);
        Route::post('/', [UnitController::class, 'store']);
        Route::get('/{unit}', [UnitController::class, 'show']);
        Route::put('/{unit}', [UnitController::class, 'update']);
        Route::delete('/{unit}', [UnitController::class, 'destroy']);

        // Additional unit operations
        Route::post('/{unit}/assign-tenant', [UnitController::class, 'assignTenant']);
        Route::post('/{unit}/remove-tenant', [UnitController::class, 'removeTenant']);
        Route::patch('/{unit}/toggle-active', [UnitController::class, 'toggleActive']);
    });
});
```

## 6. Property Model Relationship

Update your Property model to include the units relationship:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Property extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'street_address',
        'ghana_post_gps_address',
        'description',
        'landlord_id',
        'caretaker_id',
        'verification_status',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Relationships
    public function landlord(): BelongsTo
    {
        return $this->belongsTo(User::class, 'landlord_id');
    }

    public function caretaker(): BelongsTo
    {
        return $this->belongsTo(User::class, 'caretaker_id');
    }

    public function units(): HasMany
    {
        return $this->hasMany(Unit::class);
    }
}
```

## Key Points for Your Backend:

1. **`formatUnitResponse()`** - This method ensures all fields are returned in the correct format
2. **PropertyController `show()` method** - Must load units with complete data using the formatUnitResponse method
3. **Validation Rules** - Prevents unrealistic values (max 100 floors, max 20 bedrooms/bathrooms)
4. **Proper Casting** - Ensures numeric fields are returned as numbers, not strings
5. **Relationships** - Includes tenant data when loading units

After implementing this backend code, your units will display:
- ✅ **Type**: apartment/penthouse/etc (not N/A)
- ✅ **Floor**: 1, 2, 3, etc (not N/A)  
- ✅ **Bedrooms**: 1, 2, 3, etc (not 0)
- ✅ **Bathrooms**: 1, 2, 3, etc (not 0)
- ✅ **Monthly Rent**: ₵1200.00 (not ₵0)

The `formatUnitResponse()` method is crucial - it ensures the backend returns exactly what the frontend expects.</content>
<parameter name="filePath">d:\Work Environment\MarBarnes\final\Property-Management-System-Frontend\UNIT_BACKEND_IMPLEMENTATION.md