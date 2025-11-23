# 🔧 API Configuration Guide - LOCAL BACKEND SETUP

## 🚨 NETWORK ERROR FIX

If you're getting **"Network error"** when trying to register, follow these steps:

---

## ✅ STEP 1: Create `.env.local` File

Create a file named `.env.local` in the **root of your project** (same folder as `package.json`):

```bash
# API Configuration for Local Development

# Backend API Base URL - CHANGE THIS TO MATCH YOUR BACKEND
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api

# API Timeout (milliseconds)
NEXT_PUBLIC_API_TIMEOUT=30000

# App Configuration
NEXT_PUBLIC_APP_NAME=PropertyHub
NEXT_PUBLIC_APP_VERSION=1.0.0
```

**Important:** Change `http://localhost:8000/api` to match your Laravel backend URL!

---

## 🔍 STEP 2: Find Your Laravel Backend URL

### Option A: Standard Laravel Development Server
```bash
php artisan serve
# Usually runs on: http://127.0.0.1:8000
```
**Use in .env.local:** `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api`

### Option B: Laravel with Custom Port
```bash
php artisan serve --port=8080
# Runs on: http://127.0.0.1:8080
```
**Use in .env.local:** `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8080/api`

### Option C: Laravel Valet (Mac/Linux)
```bash
# If using Valet with domain: pms.test
```
**Use in .env.local:** `NEXT_PUBLIC_API_BASE_URL=http://pms.test/api`

### Option D: XAMPP/WAMP
```bash
# Usually runs on: http://localhost/your-project-folder/public
```
**Use in .env.local:** `NEXT_PUBLIC_API_BASE_URL=http://localhost/your-project-folder/public/api`

---

## 🛠️ STEP 3: Update Your Laravel Backend CORS Settings

Your Laravel backend needs to allow requests from the frontend.

**File:** `config/cors.php`

```php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    
    'allowed_methods' => ['*'],
    
    'allowed_origins' => [
        'http://localhost:3000',  // ✅ Add this
        'http://127.0.0.1:3000',  // ✅ Add this
    ],
    
    'allowed_origins_patterns' => [],
    
    'allowed_headers' => ['*'],
    
    'exposed_headers' => [],
    
    'max_age' => 0,
    
    'supports_credentials' => true,  // ✅ Set to true
];
```

**OR** for development, you can temporarily allow all origins:

```php
'allowed_origins' => ['*'],  // ⚠️ Only for development!
```

---

## 🔄 STEP 4: Restart Everything

1. **Stop your Next.js dev server** (Ctrl+C)
2. **Restart Next.js:**
   ```bash
   npm run dev
   ```
3. **Make sure Laravel is running:**
   ```bash
   php artisan serve
   ```

---

## 🧪 STEP 5: Test the Connection

### Test 1: Check if Backend is Running
Open browser and visit:
```
http://localhost:8000/api
# or
http://127.0.0.1:8000/api
```

You should see a JSON response (not a 404).

### Test 2: Test Registration Endpoint
Use curl or Postman:

```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "0241234567",
    "password": "Password123!",
    "password_confirmation": "Password123!"
  }'
```

### Test 3: Check Frontend Console
1. Open your app: `http://localhost:3000/register`
2. Open browser console (F12)
3. Try to register
4. Look for:
   - ✅ "Registration attempt with data: ..."
   - ❌ "Registration error: ..."

---

## 🚨 COMMON ISSUES & FIXES

### Issue 1: "Network Error" or "Failed to fetch"

**Cause:** Frontend can't reach backend

**Solutions:**
- ✅ Make sure Laravel is running: `php artisan serve`
- ✅ Check if API URL in `.env.local` matches Laravel URL
- ✅ Try using `127.0.0.1` instead of `localhost`
- ✅ Check firewall isn't blocking port 8000

### Issue 2: "CORS Policy Error"

**Error in console:** 
```
Access to XMLHttpRequest at 'http://localhost:8000/api/register' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Fix:** Update Laravel `config/cors.php` (see Step 3 above)

### Issue 3: "404 Not Found"

**Cause:** API endpoint doesn't exist

**Fix:** 
- Check Laravel routes: `php artisan route:list`
- Verify `/api/register` endpoint exists
- Check `routes/api.php` file

### Issue 4: Laravel Shows 500 Error

**Cause:** Backend error

**Fix:**
- Check Laravel logs: `storage/logs/laravel.log`
- Run migrations: `php artisan migrate`
- Check database connection in `.env`

---

## 📝 QUICK CHECKLIST

Before trying to register again:

- [ ] Created `.env.local` file in project root
- [ ] Added `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api`
- [ ] Laravel backend is running (`php artisan serve`)
- [ ] Updated Laravel CORS settings
- [ ] Restarted Next.js dev server
- [ ] Tested backend URL in browser
- [ ] Checked browser console for errors

---

## 🎯 EXAMPLE .env.local FILE

Create this file: **`.env.local`**

```env
# If Laravel is running on http://localhost:8000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api

# OR if using 127.0.0.1
# NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api

# OR if using different port
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api

NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_APP_NAME=PropertyHub
NEXT_PUBLIC_APP_VERSION=1.0.0
```

---

## 🔧 ALTERNATIVE: Use Environment Variable Directly

If you can't create `.env.local`, you can temporarily modify `lib/config.ts`:

```typescript
export const config = {
  api: {
    // Change this to your backend URL
    baseUrl: "http://127.0.0.1:8000/api",  // ✅ Update this
    timeout: 30000,
  },
  // ... rest of config
}
```

**⚠️ Remember to revert this before committing!**

---

## 📞 NEED MORE HELP?

If you're still having issues:

1. **Check browser console** (F12 → Console tab)
2. **Check network tab** (F12 → Network tab → Look for failed requests)
3. **Check Laravel logs** (`storage/logs/laravel.log`)
4. **Share the exact error message** you're seeing

---

## ✅ SUCCESS!

Once configured correctly, you should see:
- ✅ Registration form submits
- ✅ Browser console shows: "Registration attempt with data: ..."
- ✅ Success toast appears
- ✅ Redirects to `/landlord/dashboard`

**Now try registering again!** 🚀

