# 🧪 Quick API Connection Test

## Test Your Backend Connection

### Method 1: Browser Console Test

1. Open your browser console (F12)
2. Go to `http://localhost:3000` (your Next.js app)
3. Paste this in console:

```javascript
// Test API connection
fetch('http://127.0.0.1:8000/api', {
  method: 'GET',
  headers: {
    'Accept': 'application/json'
  }
})
.then(response => {
  console.log('✅ API Connection Status:', response.status)
  return response.json()
})
.then(data => {
  console.log('✅ API Response:', data)
})
.catch(error => {
  console.error('❌ API Connection Failed:', error)
})
```

**Expected Result:**
- ✅ Status: 200 or similar
- ✅ You see JSON response

**If you see error:**
- ❌ "Failed to fetch" = Backend not running or CORS issue
- ❌ "Network error" = Wrong URL or port

---

### Method 2: Test Registration Endpoint

```javascript
// Test registration endpoint
fetch('http://127.0.0.1:8000/api/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    name: 'Test User',
    email: 'test' + Date.now() + '@example.com',
    phone: '0241234567',
    password: 'Password123!',
    password_confirmation: 'Password123!'
  })
})
.then(response => {
  console.log('✅ Registration Status:', response.status)
  return response.json()
})
.then(data => {
  console.log('✅ Registration Response:', data)
})
.catch(error => {
  console.error('❌ Registration Failed:', error)
})
```

---

### Method 3: Check What URL Your App is Using

Open console and run:

```javascript
// Check configured API URL
console.log('Current API Base URL:', 'http://127.0.0.1:8000/api')

// Or check if env variable is set
console.log('NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL)
```

---

## Common Port Configurations

Your Laravel backend might be running on different ports:

| Configuration | URL | .env.local Setting |
|--------------|-----|-------------------|
| Default Laravel | http://127.0.0.1:8000 | `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api` |
| Custom Port | http://127.0.0.1:8080 | `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8080/api` |
| XAMPP | http://localhost/project/public | `NEXT_PUBLIC_API_BASE_URL=http://localhost/project/public/api` |
| Valet (Mac) | http://pms.test | `NEXT_PUBLIC_API_BASE_URL=http://pms.test/api` |

---

## Quick Fix Checklist

1. **Is Laravel running?**
   ```bash
   php artisan serve
   # Should show: Starting Laravel development server: http://127.0.0.1:8000
   ```

2. **Can you access it in browser?**
   - Visit: http://127.0.0.1:8000
   - Should see Laravel welcome page or API response

3. **Check API route exists:**
   ```bash
   php artisan route:list | grep register
   # Should show: POST api/register
   ```

4. **Restart Next.js:**
   - Stop: Ctrl+C
   - Start: `npm run dev`

5. **Try registration again:**
   - Go to: http://localhost:3000/register
   - Open console (F12)
   - Fill form and submit
   - Check console logs

---

## If Using 127.0.0.1 Works

The default config now uses `http://127.0.0.1:8000/api` instead of `http://localhost:8000/api`.

This often fixes network issues on Windows!

Just restart your Next.js dev server:
```bash
# Ctrl+C to stop
npm run dev  # Start again
```

---

## Still Not Working?

**Check Laravel CORS Settings:**

File: `config/cors.php`

```php
'allowed_origins' => ['*'],  // Temporarily allow all
'supports_credentials' => true,
```

Then restart Laravel:
```bash
php artisan config:clear
php artisan serve
```

---

## Success Indicators

When everything works, you'll see:

**Console:**
```
Registration attempt with data: {
  name: "John Doe",
  email: "john@example.com",
  ...
}
✅ API Connection Status: 200
✅ Registration Response: { user: {...}, token: "..." }
```

**UI:**
- Success toast appears
- Redirects to dashboard

**No errors in:**
- Browser console
- Network tab
- Laravel logs

---

🎯 **Current Config:** Your app is now configured to use `http://127.0.0.1:8000/api`

Try registering again! 🚀

