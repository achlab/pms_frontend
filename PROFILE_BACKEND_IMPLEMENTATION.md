# Profile Backend Implementation Guide (Laravel)

This guide provides the Laravel backend implementation for landlord, caretaker, and tenant profile management.

## Database Migration

Add columns to existing `users` table or create a separate profiles table:

### Option 1: Add to Users Table (Recommended)

Create migration: `php artisan make:migration add_profile_fields_to_users_table`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('full_name')->nullable()->after('name');
            $table->string('phone')->nullable()->after('email');
            $table->text('bio')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('country')->default('Ghana');
            $table->string('photo_url')->nullable();
            
            // Caretaker specific fields
            $table->string('emergency_contact')->nullable();
            $table->string('working_hours')->nullable();
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'full_name',
                'phone',
                'bio',
                'address',
                'city',
                'country',
                'photo_url',
                'emergency_contact',
                'working_hours',
            ]);
        });
    }
};
```

Run: `php artisan migrate`

## Controller

Create: `app/Http/Controllers/ProfileController.php`

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ProfileController extends Controller
{
    /**
     * Get landlord profile
     */
    public function getLandlordProfile(): JsonResponse
    {
        $user = auth()->user();

        if ($user->role !== 'landlord') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Landlord access required.',
            ], 403);
        }

        $profileData = [
            'id' => $user->id,
            'email' => $user->email,
            'full_name' => $user->full_name,
            'phone' => $user->phone,
            'bio' => $user->bio,
            'address' => $user->address,
            'city' => $user->city,
            'country' => $user->country,
            'photo_url' => $user->photo_url,
        ];

        return response()->json([
            'success' => true,
            'data' => $profileData,
        ]);
    }

    /**
     * Update landlord profile
     */
    public function updateLandlordProfile(Request $request): JsonResponse
    {
        $user = auth()->user();

        if ($user->role !== 'landlord') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Landlord access required.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'full_name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'bio' => 'sometimes|string|max:1000',
            'address' => 'sometimes|string|max:500',
            'city' => 'sometimes|string|max:100',
            'country' => 'sometimes|string|max:100',
            'photo_url' => 'sometimes|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user->update($request->only([
            'full_name',
            'phone',
            'bio',
            'address',
            'city',
            'country',
            'photo_url',
        ]));

        $profileData = [
            'id' => $user->id,
            'email' => $user->email,
            'full_name' => $user->full_name,
            'phone' => $user->phone,
            'bio' => $user->bio,
            'address' => $user->address,
            'city' => $user->city,
            'country' => $user->country,
            'photo_url' => $user->photo_url,
        ];

        return response()->json([
            'success' => true,
            'data' => $profileData,
            'message' => 'Profile updated successfully',
        ]);
    }

    /**
     * Get caretaker profile
     */
    public function getCaretakerProfile(): JsonResponse
    {
        $user = auth()->user();

        if ($user->role !== 'caretaker') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Caretaker access required.',
            ], 403);
        }

        $profileData = [
            'id' => $user->id,
            'email' => $user->email,
            'full_name' => $user->full_name,
            'phone' => $user->phone,
            'bio' => $user->bio,
            'address' => $user->address,
            'city' => $user->city,
            'country' => $user->country,
            'photo_url' => $user->photo_url,
            'emergency_contact' => $user->emergency_contact,
            'working_hours' => $user->working_hours,
        ];

        return response()->json([
            'success' => true,
            'data' => $profileData,
        ]);
    }

    /**
     * Update caretaker profile
     */
    public function updateCaretakerProfile(Request $request): JsonResponse
    {
        $user = auth()->user();

        if ($user->role !== 'caretaker') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Caretaker access required.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'full_name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'bio' => 'sometimes|string|max:1000',
            'address' => 'sometimes|string|max:500',
            'city' => 'sometimes|string|max:100',
            'country' => 'sometimes|string|max:100',
            'photo_url' => 'sometimes|string|max:500',
            'emergency_contact' => 'sometimes|string|max:20',
            'working_hours' => 'sometimes|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user->update($request->only([
            'full_name',
            'phone',
            'bio',
            'address',
            'city',
            'country',
            'photo_url',
            'emergency_contact',
            'working_hours',
        ]));

        $profileData = [
            'id' => $user->id,
            'email' => $user->email,
            'full_name' => $user->full_name,
            'phone' => $user->phone,
            'bio' => $user->bio,
            'address' => $user->address,
            'city' => $user->city,
            'country' => $user->country,
            'photo_url' => $user->photo_url,
            'emergency_contact' => $user->emergency_contact,
            'working_hours' => $user->working_hours,
        ];

        return response()->json([
            'success' => true,
            'data' => $profileData,
            'message' => 'Profile updated successfully',
        ]);
    }

    /**
     * Get tenant profile
     */
    public function getTenantProfile(): JsonResponse
    {
        $user = auth()->user();

        if ($user->role !== 'tenant') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Tenant access required.',
            ], 403);
        }

        $profileData = [
            'id' => $user->id,
            'email' => $user->email,
            'full_name' => $user->full_name,
            'phone' => $user->phone,
            'bio' => $user->bio,
            'address' => $user->address,
            'city' => $user->city,
            'country' => $user->country,
            'photo_url' => $user->photo_url,
        ];

        return response()->json([
            'success' => true,
            'data' => $profileData,
        ]);
    }

    /**
     * Update tenant profile
     */
    public function updateTenantProfile(Request $request): JsonResponse
    {
        $user = auth()->user();

        if ($user->role !== 'tenant') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Tenant access required.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'full_name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'bio' => 'sometimes|string|max:1000',
            'address' => 'sometimes|string|max:500',
            'city' => 'sometimes|string|max:100',
            'country' => 'sometimes|string|max:100',
            'photo_url' => 'sometimes|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user->update($request->only([
            'full_name',
            'phone',
            'bio',
            'address',
            'city',
            'country',
            'photo_url',
        ]));

        $profileData = [
            'id' => $user->id,
            'email' => $user->email,
            'full_name' => $user->full_name,
            'phone' => $user->phone,
            'bio' => $user->bio,
            'address' => $user->address,
            'city' => $user->city,
            'country' => $user->country,
            'photo_url' => $user->photo_url,
        ];

        return response()->json([
            'success' => true,
            'data' => $profileData,
            'message' => 'Profile updated successfully',
        ]);
    }

    /**
     * Get current user profile (works for all roles)
     * IMPORTANT: This endpoint is required for frontend auth context refresh
     */
    public function getProfile(): JsonResponse
    {
        $user = auth()->user();

        $profileData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'phone' => $user->phone,
            'address' => $user->address,
            'full_name' => $user->full_name,
            'bio' => $user->bio,
            'city' => $user->city,
            'country' => $user->country,
            'photo_url' => $user->photo_url,
            'profile_picture' => $user->profile_picture,
            'profile_picture_url' => $user->profile_picture ? Storage::disk('public')->url($user->profile_picture) : null,
            'is_verified' => $user->email_verified_at !== null,
            'email_verified_at' => $user->email_verified_at,
            'landlord_id' => $user->landlord_id ?? null,
            'created_at' => $user->created_at->toISOString(),
            'updated_at' => $user->updated_at->toISOString(),
        ];

        // Add role-specific fields
        if ($user->role === 'caretaker') {
            $profileData['emergency_contact'] = $user->emergency_contact;
            $profileData['working_hours'] = $user->working_hours;
        }

        return response()->json([
            'success' => true,
            'data' => $profileData,
        ]);
    }

    /**
     * Change password (works for all roles)
     */
    public function changePassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = auth()->user();

        // Verify current password
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect',
            ], 422);
        }

        // Update password
        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully',
        ]);
    }

    /**
     * Upload profile photo
     */
    public function uploadProfilePhoto(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'photo' => 'required|image|mimes:jpeg,jpg,png,gif|max:5120', // 5MB max
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = auth()->user();
        
       Change password (works for all roles)
    Route::put('/profile/password', [ProfileController::class, 'changePassword']);
    
    //  // Delete old photo if exists
        if ($user->photo_url && Storage::disk('public')->exists($user->photo_url)) {
            Storage::disk('public')->delete($user->photo_url);
        }

        // Store new photo
        $file = $request->file('photo');
        $fileName = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('profile-photos', $fileName, 'public');

        // Generate full URL
        $url = Storage::disk('public')->url($path);

        // Update user photo_url
        $user->update([
            'photo_url' => $url,
            'profile_picture' => $path
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'url' => $url,
                'profile_picture' => $path,
                'profile_picture_url' => $url,
            ],
            'message' => 'Photo uploaded successfully',
        ]);
    }

    /**
     * Upload profile picture (returns profile_picture and profile_picture_url)
     */
    public function uploadProfilePicture(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'profile_picture' => 'required|image|mimes:jpeg,jpg,png,gif|max:5120', // 5MB max
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = auth()->user();
        
        // Delete old photo if exists
        if ($user->profile_picture && Storage::disk('public')->exists($user->profile_picture)) {
            Storage::disk('public')->delete($user->profile_picture);
        }

        // Store new photo
        $file = $request->file('profile_picture');
        $fileName = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('profile-pictures', $fileName, 'public');

        // Update user profile_picture
        $user->update(['profile_picture' => $path]);

        return response()->json([
            'success' => true,
            'data' => [
                'profile_picture' => $path,
                'profile_picture_url' => Storage::disk('public')->url($path),
            ],
            'message' => 'Profile picture uploaded successfully',
        ]);
    }

    /**
     * Delete profile picture
     */
    public function deleteProfilePicture(): JsonResponse
    {
        $user = auth()->user();
        
        if ($user->profile_picture && Storage::disk('public')->exists($user->profile_picture)) {
            Storage::disk('public')->delete($user->profile_picture);
        }

        $user->update(['profile_picture' => null]);

        return response()->json([
            'success' => true,
            'message' => 'Profile picture deleted successfully',
        ]);
    }
}
```

## Routes

Add to `routes/api.php`:

```php
use App\Http\Controllers\ProfileController;

// Profile Routes
Route::middleware(['auth:sanctum'])->group(function () {
    // General profile endpoint (works for all roles) - REQUIRED for auth refresh
    Route::get('/profile', [ProfileController::class, 'getProfile']);
    
    // Landlord profile
    Route::get('/landlord/profile', [ProfileController::class, 'getLandlordProfile']);
    Route::put('/landlord/profile', [ProfileController::class, 'updateLandlordProfile']);
    
    // Caretaker profile
    Route::get('/caretaker/profile', [ProfileController::class, 'getCaretakerProfile']);
    Route::put('/caretaker/profile', [ProfileController::class, 'updateCaretakerProfile']);
    
    // Tenant profile
    Route::get('/tenant/profile', [ProfileController::class, 'getTenantProfile']);
    Route::put('/tenant/profile', [ProfileController::class, 'updateTenantProfile']);
    
    // Photo upload (shared by all roles)
    Route::post('/profile/upload-photo', [ProfileController::class, 'uploadProfilePhoto']);
    Route::post('/profile/picture', [ProfileController::class, 'uploadProfilePicture']);
    Route::delete('/profile/picture', [ProfileController::class, 'deleteProfilePicture']);
});
```

## Storage Configuration

Make sure storage is linked:

```bash
php artisan storage:link
```

This creates a symbolic link from `public/storage` to `storage/app/public`.

## Testing with Postman

### 1. Get Landlord Profile
```
GET http://localhost:8000/api/landlord/profile
Headers:
  Authorization: Bearer YOUR_TOKEN
  Accept: application/json
```

Expected Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "landlord@example.com",
    "full_name": "John Doe",
    "phone": "0244123456",
    "bio": "Experienced property manager",
    "address": "123 Main Street",
    "city": "Accra",
    "country": "Ghana",
    "photo_url": "http://localhost:8000/storage/profile-photos/abc123.jpg"
  }
}
```

### 2. Update Landlord Profile
```
PUT http://localhost:8000/api/landlord/profile
Headers:
  Authorization: Bearer YOUR_TOKEN
  Accept: application/json
  Content-Type: application/json
Body:
{
  "full_name": "John Doe Updated",
  "phone": "0244999999",
  "bio": "Updated bio",
  "address": "456 New Street",
  "city": "Kumasi",
  "country": "Ghana"
}
```

### 3. Upload Profile Photo
```
POST http://localhost:8000/api/profile/upload-photo
Headers:
  Authorization: Bearer YOUR_TOKEN
  Accept: application/json
Body (form-data):
  photo: [select image file]
```

Expected Response:
```json
{
  "success": true,
  "data": {
    "url": "http://localhost:8000/storage/profile-photos/abc123-def456.jpg"
  },
  "message": "Photo uploaded successfully"
}
```

### 4. Get Caretaker Profile
```
GET http://localhost:8000/api/caretaker/profile
Headers:
  Authorization: Bearer YOUR_TOKEN
  Accept: application/json
```

### 5. Update Caretaker Profile
```
PUT http://localhost:8000/api/caretaker/profile
Headers:
  Authorization: Bearer YOUR_TOKEN
  Accept: application/json
  Content-Type: application/json
Body:
{
  "full_name": "Jane Smith",
  "phone": "0244888888",
  "bio": "Dedicated caretaker",
  "emergency_contact": "0244777777",
  "working_hours": "Mon-Fri 8AM-5PM"
}
```

### 6. Get Tenant Profile
```
GET http://localhost:8000/api/tenant/profile
Headers:
  Authorization: Bearer YOUR_TOKEN
  Accept: application/json
```

Expected Response:
```json
{
  "success": true,
  "data": {
    "id": 3,
    "email": "tenant@example.com",
    "full_name": "Alice Johnson",
    "phone": "0244555555",
    "bio": "Responsible tenant",
    "address": "789 Oak Avenue",
    "city": "Accra",
    "country": "Ghana",
    "photo_url": "http://localhost:8000/storage/profile-photos/tenant123.jpg"
  }
}
```

### 7. Update Tenant Profile
```
PUT http://localhost:8000/api/tenant/profile
Headers:
  Authorization: Bearer YOUR_TOKEN
  Accept: application/json
  Content-Type: application/json
Body:
{
  "full_name": "Alice Johnson Updated",
  "phone": "0244666666",
  "bio": "Updated tenant bio",
  "address": "789 Oak Avenue Apt 2",
  "city": "Kumasi",
  "country": "Ghana"
}
```

Expected Response:
```json
{
  "success": true,
  "data": {
    "id": 3,
    "email": "tenant@example.com",
    "full_name": "Alice Johnson Updated",
    "phone": "0244666666",
    "bio": "Updated tenant bio",
    "address": "789 Oak Avenue Apt 2",
    "city": "Kumasi",
    "country": "Ghana",
    "photo_url": "http://localhost:8000/storage/profile-photos/tenant123.jpg"
  },
  "message": "Profile updated successfully"
}
```

### 8. Change Password (All Roles)
```
PUT http://localhost:8000/api/profile/password
Headers:
  Authorization: Bearer YOUR_TOKEN
  Accept: application/json
  Content-Type: application/json
Body:
{
  "current_password": "old_password",
  "password": "new_password123",
  "password_confirmation": "new_password123"
}
```

Expected Response:
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

Error Response (Wrong Current Password):
```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

Error Response (Password Mismatch):
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "password": ["The password confirmation does not match."]
  }
}
```

Error Response (Password Too Short):
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "password": ["The password must be at least 8 characters."]
  }
}
```

## File Upload Configuration

Make sure `.env` has correct filesystem configuration:

```env
FILESYSTEM_DISK=public
```

And `config/filesystems.php` has:

```php
'public' => [
    'driver' => 'local',
    'root' => storage_path('app/public'),
    'url' => env('APP_URL').'/storage',
    'visibility' => 'public',
    'throw' => false,
],
```

## Update User Model

Add fillable fields in `app/Models/User.php`:

```php
protected $fillable = [
    'name',
    'email',
    'password',
    'role',
    'full_name',
    'phone',
    'bio',
    'address',
    'city',
    'country',
    'photo_url',
    'emergency_contact',
    'working_hours',
];

protected $hidden = [
    'password',
    'remember_token',
];

protected $casts = [
    'email_verified_at' => 'datetime',
    'password' => 'hashed',
];
```

## Quick Setup Commands

```bash
# Create migration
php artisan make:migration add_profile_fields_to_users_table

# Create controller
php artisan make:controller ProfileController

# Run migrations
php artisan migrate

# Link storage
php artisan storage:link

# Clear cache
php artisan config:clear
php artisan route:clear
php artisan cache:clear

# Verify routes
php artisan route:list | grep profile
```

## Expected Routes

After adding routes, verify:

```bash
php artisan route:list | grep profile
```

You should see:
```
GET|HEAD  api/profile
PUT       api/profile/password
GET|HEAD  api/landlord/profile
PUT       api/landlord/profile
GET|HEAD  api/caretaker/profile
PUT       api/caretaker/profile
GET|HEAD  api/tenant/profile
PUT       api/tenant/profile
POST      api/profile/upload-photo
```

## Storage Permissions (Linux/Mac)

If you're on Linux/Mac, set proper permissions:

```bash
chmod -R 775 storage
chmod -R 775 bootstrap/cache
```

## Common Issues

1. **404 Not Found on photo URL**: Run `php artisan storage:link`
2. **413 Payload Too Large**: Increase upload size in `php.ini`:
   ```ini
   upload_max_filesize = 10M
   post_max_size = 10M
   ```
3. **403 Forbidden**: Check user role matches endpoint requirement
4. **500 Error on upload**: Check storage permissions
5. **Photo not deleting**: Verify old path format matches storage disk

## Frontend Integration

The frontend pages expect these exact endpoints:
- `/profile` - GET for current user profile (all roles)
- `/profile/password` - PUT for change password (all roles)
- `/landlord/profile` - GET/PUT for landlord profile
- `/caretaker/profile` - GET/PUT for caretaker profile
- `/tenant/profile` - GET/PUT for tenant profile
- `/profile/upload-photo` - POST for photo upload (all roles)
- `/profile/picture` - POST for profile picture upload (all roles)
- `/profile/picture` - DELETE for profile picture deletion (all roles)

Response format must match:
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
```

This matches the frontend's API client normalization.
