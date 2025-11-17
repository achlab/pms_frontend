# 🚀 Quick Testing Guide

## 🔴 IMPORTANT: You Need to Login First!

The "Access Denied" message you're seeing is because **you're not logged in yet**. The tenant dashboard requires authentication.

---

## ✅ Step-by-Step Testing Instructions

### Step 1: Start the Backend API

Before testing the frontend, make sure your backend API is running:

```bash
# Navigate to your backend directory
cd path/to/your/backend

# Start the API server
php artisan serve
# Should run on http://localhost:8000
```

**Important:** The frontend expects the API at `http://localhost:8000/api`

---

### Step 2: Update Environment Variables (If Needed)

If your backend is running on a different URL, update `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://your-backend-url/api
```

Then restart the frontend server:

```bash
npm run dev
```

---

### Step 3: Login to the System

#### Option A: Use the Login Page

1. **Navigate to:** http://localhost:3000/login

2. **Enter credentials:**
   - Email or Phone: Your tenant email/phone
   - Password: Your password

3. **Click "Sign In"**

4. **You'll be redirected** to `/tenant/dashboard` automatically

#### Option B: Register a New Account (If backend supports it)

1. **Navigate to:** http://localhost:3000/register
2. **Fill in the form** with your details
3. **Select role:** Tenant
4. **Click "Register"**
5. **You'll be logged in** and redirected to dashboard

---

### Step 4: Test Backend API Connection

If login fails, test the API connection:

#### Test 1: Check API is Running

Open your browser and visit:
```
http://localhost:8000/api/health
```

You should see a response from the backend.

#### Test 2: Check CORS Settings

The backend must allow requests from `http://localhost:3000`. Check your backend's CORS configuration.

**Laravel CORS Config (backend):**
```php
// config/cors.php
'allowed_origins' => [
    'http://localhost:3000',
],
```

---

## 🔍 Troubleshooting

### Issue 1: "Access Denied" on Dashboard

**Cause:** You're not logged in.

**Solution:**
1. Go to http://localhost:3000/login
2. Login with valid credentials
3. You'll be redirected to the tenant dashboard

---

### Issue 2: Login Button Not Working

**Cause:** Backend API is not running or not accessible.

**Solution:**
1. **Check backend is running:** http://localhost:8000
2. **Check API endpoint:** http://localhost:8000/api/health
3. **Check browser console** for error messages (F12)
4. **Check CORS settings** in backend

---

### Issue 3: "Network Error" on Login

**Cause:** Frontend can't reach the backend.

**Solution:**
1. **Verify backend URL** in `.env.local`:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
   ```
2. **Restart frontend server:**
   ```bash
   # Stop with Ctrl+C
   npm run dev
   ```
3. **Check backend is running** on port 8000

---

### Issue 4: "Invalid Credentials" Error

**Cause:** Username/password is incorrect or user doesn't exist.

**Solution:**
1. **Check credentials** - make sure email and password are correct
2. **Create a test user** in your backend database
3. **Try the register page** if available
4. **Check backend logs** for authentication errors

---

## 🧪 Testing Workflow

### 1. Test Authentication ✅

```
1. Visit http://localhost:3000
2. Click "Login" or go to http://localhost:3000/login
3. Enter credentials
4. Click "Sign In"
5. Should redirect to /tenant/dashboard
```

### 2. Test Dashboard ✅

```
After logging in, you should see:
- Statistics cards (rent, payments, maintenance)
- Current lease information
- Recent payments
- Maintenance overview
```

### 3. Test Navigation ✅

```
Click through the menu:
- Dashboard
- My Lease
- My Unit
- Invoices
- Payments
- Maintenance
- Profile
- Settings
```

### 4. Test Features ✅

**Lease:**
- View lease details
- Check utilities

**Unit:**
- View unit information
- See property details
- Contact caretaker

**Invoices:**
- View invoice list
- Filter by status
- View invoice details

**Payments:**
- View payment history
- Record new payment

**Maintenance:**
- View requests
- Create new request
- Upload attachments

**Profile:**
- View profile
- Edit profile
- Change password
- Upload profile picture

---

## 📝 Test Credentials Template

If you need to create test data in your backend:

```
Tenant User:
-----------
Name: Test Tenant
Email: tenant@test.com
Phone: +233241234567
Password: password123
Role: tenant

Landlord User:
-------------
Name: Test Landlord
Email: landlord@test.com
Phone: +233241234568
Password: password123
Role: landlord

Admin User:
----------
Name: Admin User
Email: admin@test.com
Phone: +233241234569
Password: password123
Role: super_admin
```

---

## 🔧 Development Tools

### Check Current Auth State

Open browser console (F12) and run:
```javascript
// Check if user is logged in
console.log(localStorage.getItem('auth_token'))
console.log(localStorage.getItem('auth_user'))

// Check cookies
console.log(document.cookie)
```

### Clear Auth State (Logout Manually)

If you get stuck, clear auth manually:
```javascript
localStorage.removeItem('auth_token')
localStorage.removeItem('auth_user')
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
location.reload()
```

---

## 📊 Backend API Endpoints Used

The frontend integrates with these backend endpoints:

### Authentication
- `POST /api/login` - User login
- `POST /api/register` - User registration
- `POST /api/logout` - User logout
- `GET /api/profile` - Get user profile

### Dashboard
- `GET /api/tenant/dashboard` - Dashboard statistics

### Leases
- `GET /api/tenant/leases` - Get leases
- `GET /api/tenant/leases/{id}` - Get lease details

### Units
- `GET /api/units?tenant_id={id}` - Get tenant's unit
- `GET /api/units/{id}` - Get unit details

### Invoices
- `GET /api/tenant/invoices` - Get invoices
- `GET /api/tenant/invoices/{id}` - Get invoice details

### Payments
- `GET /api/tenant/payments` - Get payments
- `POST /api/tenant/payments` - Record payment

### Maintenance
- `GET /api/tenant/maintenance-requests` - Get requests
- `POST /api/tenant/maintenance-requests` - Create request
- `GET /api/tenant/maintenance-requests/{id}` - Get request details
- `POST /api/tenant/maintenance-requests/{id}/notes` - Add note

---

## ✅ Expected Results

### After Successful Login:

1. **You should be redirected** to `/tenant/dashboard`
2. **Dashboard should load** with your data
3. **Navigation menu should work**
4. **All pages should be accessible**
5. **Data should load from API**

### If Not Logged In:

1. **Protected pages redirect to** `/login`
2. **Login page is accessible**
3. **Register page is accessible**
4. **Home page is accessible**

---

## 🎯 Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| Frontend Build | ✅ Success | All routes compiled |
| Dev Server | ✅ Running | http://localhost:3000 |
| Environment | ✅ Configured | .env.local created |
| Dependencies | ✅ Installed | 732 packages, 0 vulnerabilities |
| Authentication | ⚠️ Needs Backend | Login page ready |
| API Integration | ⚠️ Needs Backend | All services integrated |

**Status:** Frontend is 100% complete. Needs backend API to test full functionality.

---

## 🚀 Quick Start (Summary)

```bash
# 1. Start Backend API (in backend directory)
php artisan serve

# 2. Frontend is already running on http://localhost:3000

# 3. Login
Visit: http://localhost:3000/login
Enter: Your tenant credentials
Click: Sign In

# 4. Test Dashboard
Visit: http://localhost:3000/tenant/dashboard
Should see: Your tenant dashboard with data

# 5. Test All Features
Navigate through: All menu items
Test: All features listed above
```

---

## 📞 Need Help?

### Check These First:
1. ✅ Backend API is running
2. ✅ CORS is configured correctly
3. ✅ .env.local has correct API URL
4. ✅ Frontend server is running
5. ✅ Browser console for errors (F12)

### Common Fixes:
- **Restart backend:** Stop and start `php artisan serve`
- **Restart frontend:** Stop (Ctrl+C) and run `npm run dev`
- **Clear browser cache:** Ctrl+Shift+Delete
- **Check browser console:** F12 → Console tab
- **Check network tab:** F12 → Network tab

---

## 🎉 Success Indicators

You'll know everything is working when:

✅ Login redirects to dashboard  
✅ Dashboard shows your tenant data  
✅ Navigation works smoothly  
✅ All pages load without errors  
✅ Data fetches from API  
✅ Forms submit successfully  
✅ File uploads work  
✅ Error messages are helpful  
✅ Loading states show correctly  

---

**Remember:** The "Access Denied" error simply means you need to login first! The system is working correctly - it's protecting the tenant dashboard from unauthorized access.

Visit **http://localhost:3000/login** to get started! 🚀

