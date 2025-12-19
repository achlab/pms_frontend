# Tenant Profile Debugging Guide

## Issue Description
- Tenant profile page shows error when trying to change bio data
- Sidebar disappears
- User is asked to refresh

## Common Causes & Solutions

### 1. Backend Not Implemented
**Symptom**: 404 error in console
**Solution**: Verify backend endpoints exist

Check backend routes:
```bash
php artisan route:list | grep tenant
```

Should show:
```
GET|HEAD  api/tenant/profile
PUT       api/tenant/profile
```

### 2. Authentication Token Issue
**Symptom**: 401 Unauthorized error
**Solution**: Check token is valid

Open browser DevTools Console and run:
```javascript
localStorage.getItem('pms_auth_token')
```

Should return a valid token. If null, user needs to login again.

### 3. CORS Issue
**Symptom**: Network error, no response from server
**Solution**: Check Laravel CORS configuration

In Laravel `config/cors.php`:
```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => ['http://localhost:3000', 'http://127.0.0.1:3000'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'supports_credentials' => true,
```

### 4. Wrong Base URL
**Symptom**: Connection refused or timeout
**Solution**: Verify API base URL

Check `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api
```

Make sure Laravel is running on port 8000:
```bash
php artisan serve
```

### 5. User Role Mismatch
**Symptom**: 403 Forbidden error
**Solution**: Verify user has 'tenant' role

In Laravel, check user role:
```sql
SELECT id, name, email, role FROM users WHERE email='tenant@example.com';
```

Role should be 'tenant' (lowercase).

### 6. Missing Profile Data
**Symptom**: Page loads but shows empty fields or errors
**Solution**: Ensure tenant has profile data

Check if tenant user has profile fields:
```sql
SELECT id, name, email, full_name, phone, bio FROM users WHERE role='tenant';
```

If NULL, add some data:
```sql
UPDATE users 
SET full_name = 'John Tenant', phone = '0244123456', bio = 'Test tenant'
WHERE role = 'tenant';
```

## Debugging Steps

### Step 1: Check Browser Console
Open DevTools (F12) → Console tab

Look for errors:
- ❌ 404 Not Found → Backend route missing
- ❌ 401 Unauthorized → Token invalid/expired
- ❌ 403 Forbidden → Wrong role
- ❌ 422 Validation Error → Invalid data
- ❌ Network Error → Backend not running or CORS issue
- ❌ 500 Server Error → Backend code error

### Step 2: Check Network Tab
Open DevTools (F12) → Network tab

1. Go to tenant profile page
2. Look for request to `/api/tenant/profile`
3. Check:
   - Request URL: Should be `http://127.0.0.1:8000/api/tenant/profile`
   - Status Code: Should be 200
   - Response: Should have `success: true` and profile data

### Step 3: Check Backend Logs
In Laravel terminal, watch for errors:
```bash
tail -f storage/logs/laravel.log
```

Common backend errors:
- Column not found → Run migrations
- Method not allowed → Wrong HTTP method
- Unauthorized → Sanctum middleware issue

### Step 4: Test Backend Directly
Use Postman or curl:

```bash
# Get tenant profile
curl -X GET http://127.0.0.1:8000/api/tenant/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

Should return:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "tenant@example.com",
    "full_name": "John Doe",
    "phone": "0244123456",
    ...
  }
}
```

### Step 5: Check Frontend Build
Clear Next.js cache and rebuild:
```bash
# Delete .next folder
Remove-Item -Recurse -Force .next

# Rebuild
npm run dev
```

## Quick Fixes

### Fix 1: Clear All Cache
```bash
# Frontend
Remove-Item -Recurse -Force .next
npm run dev

# Backend
php artisan config:clear
php artisan route:clear
php artisan cache:clear
```

### Fix 2: Verify Environment
```bash
# Check frontend .env.local
cat .env.local

# Check backend .env
cat .env (on backend)
```

### Fix 3: Re-login
Sometimes token gets corrupted. Clear and re-login:

Browser Console:
```javascript
localStorage.clear()
// Then navigate to /login
```

### Fix 4: Verify Sanctum Setup
In Laravel `.env`:
```env
SESSION_DRIVER=cookie
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000
```

## Error Messages & Solutions

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Network error. Please check your internet connection" | Backend not running | `php artisan serve` |
| "404 Not Found" | Route doesn't exist | Check `routes/api.php` |
| "401 Unauthorized" | Token invalid | Re-login |
| "403 Forbidden" | Wrong role | Check user role in database |
| "422 Validation failed" | Invalid data | Check required fields |
| "Failed to fetch profile" | Generic error | Check browser console |
| Sidebar disappears | Component crashed | Check error boundary |

## Testing Checklist

- [ ] Backend server is running (`php artisan serve`)
- [ ] Frontend server is running (`npm run dev`)
- [ ] Tenant user exists with role='tenant'
- [ ] Token is valid and present in localStorage
- [ ] `/api/tenant/profile` route exists in backend
- [ ] CORS is configured correctly
- [ ] Migration has been run (profile fields exist)
- [ ] ProfileController has getTenantProfile and updateTenantProfile methods
- [ ] Browser console shows no errors
- [ ] Network tab shows 200 response

## Still Not Working?

If you've tried everything above and it still doesn't work:

1. **Share the error message** from browser console
2. **Check the Network tab** - what's the exact response?
3. **Test backend directly** with Postman/curl
4. **Verify user role** in database
5. **Check Laravel logs** for backend errors

## Updated Implementation

The tenant profile page now has:
- ✅ Better error handling with try-catch
- ✅ Error state to show error messages
- ✅ Console logging for debugging
- ✅ Proper response checking
- ✅ Alert component to display errors
- ✅ MainLayout wrapper (sidebar won't disappear)

The page should now:
- ✅ Show loading spinner while fetching
- ✅ Display error alert if fetch fails
- ✅ Show form with profile data if successful
- ✅ Keep sidebar visible even on errors
- ✅ Show detailed error messages in console

## Next Steps

1. Open browser DevTools Console (F12)
2. Navigate to `/tenant/profile`
3. Look for error messages (red text)
4. Share the error here so we can fix it

The most common issues are:
1. Backend not running
2. Backend route not implemented
3. User doesn't have tenant role
4. Token expired

Check these first!
