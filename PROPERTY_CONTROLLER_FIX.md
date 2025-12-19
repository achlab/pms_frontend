# Property Controller Fix

## Issue Identified

The caretaker phone number is showing as "undefined" because the PropertyController is not loading the `phone` field for the caretaker relationship.

## Current Code (Broken)
```php
'caretaker:id,name,email'  // Missing phone field
```

## Fixed Code
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
                $query->with('tenant:id,name,email,phone')  // Added phone to tenant
                      ->orderBy('unit_number');
            },
            'landlord:id,name,email,phone',  // Added phone to landlord
            'caretaker:id,name,email,phone'  // Added phone to caretaker
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
            'landlord' => $property->landlord ? [
                'id' => $property->landlord->id,
                'name' => $property->landlord->name,
                'email' => $property->landlord->email,
                'phone' => $property->landlord->phone,
            ] : null,
            'caretaker' => $property->caretaker ? [
                'id' => $property->caretaker->id,
                'name' => $property->caretaker->name,
                'email' => $property->caretaker->email,
                'phone' => $property->caretaker->phone,  // This was missing!
            ] : null,
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

## What Changed

1. **Added `phone` to all relationship loads**:
   - `'landlord:id,name,email,phone'`
   - `'caretaker:id,name,email,phone'`
   - `'tenant:id,name,email,phone'`

2. **Explicitly formatted the response** to ensure all fields are included

## Result

After this fix, the caretaker will show:
- **Before**: "Mrs. Gifty Osei (undefined)"
- **After**: "Mrs. Gifty Osei (+233xxxxxxxxx)"

The issue was that Laravel's eager loading was only selecting the specified fields (`id,name,email`) but not `phone`, so when the frontend tried to access `caretaker.phone`, it returned `undefined`.</content>
<parameter name="filePath">d:\Work Environment\MarBarnes\final\Property-Management-System-Frontend\PROPERTY_CONTROLLER_FIX.md