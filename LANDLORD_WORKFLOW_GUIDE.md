# 🏢 Landlord Complete Workflow Guide

## ✅ Implementation Complete - Single Session

All features have been successfully implemented in **one session**! This guide walks you through the complete workflow for managing properties, caretakers, units, and tenants.

---

## 📋 Table of Contents

1. [What's Been Implemented](#whats-been-implemented)
2. [Error Logging](#error-logging)
3. [Complete Workflow](#complete-workflow)
4. [Troubleshooting the 404 Error](#troubleshooting-the-404-error)
5. [Testing Guide](#testing-guide)

---

## 🎯 What's Been Implemented

### ✅ 1. Enhanced Error Logging
**File: `lib/api-client.ts`**

Added comprehensive logging to help diagnose issues:
- 🚀 **Request Logging**: Full URL, headers, data, auth token
- ✅ **Response Logging**: Status, data for successful requests
- ❌ **Error Logging**: Detailed error information including:
  - Error object, message, code
  - Response status and data
  - Request URL and method
  - Normalized error messages and validation errors
  - Helpful troubleshooting hints for 404 errors

**Console Output Example:**
```
🚀 API Request: POST /users
Full URL: http://127.0.0.1:8000/api/users
Headers: {...}
Data: {name: "John Doe", email: "john@example.com", ...}
Auth Token: eyJhbGciOiJIUzI1NiIsIn...

✅ API Response: POST /users
Status: 200 OK
Data: {Success: true, Data: {...}, Message: "User created successfully"}
```

---

### ✅ 2. Caretaker Management
**File: `app/tenants/page.tsx`**

**Features:**
- ✅ Create caretakers with full form validation
- ✅ View all caretakers in a dedicated tab
- ✅ See which properties each caretaker manages
- ✅ Search caretakers by name, email, or phone
- ✅ Real-time stats (total caretakers, properties managed)

**How to Use:**
1. Navigate to **Tenants** page (sidebar)
2. Click **"Add User"** button
3. Select **"Caretaker"** role
4. Fill in the form:
   - Full Name *
   - Email Address *
   - Phone Number *
   - Address (optional)
   - Password * (min 8 characters)
   - Confirm Password *
   - Bio/Notes (optional)
5. Click **"Create Caretaker"**
6. View created caretaker in the **"Caretakers"** tab

---

### ✅ 3. Property Management with Caretaker Assignment
**File: `app/properties/page.tsx`**

**Features:**
- ✅ Create properties with optional caretaker assignment
- ✅ Assign caretaker to existing property
- ✅ Reassign caretaker to different property
- ✅ Remove caretaker from property
- ✅ View which caretaker manages each property
- ✅ Search properties by name or address

**How to Use:**

**Creating a Property:**
1. Navigate to **Properties** page (sidebar)
2. Click **"Add Property"** button
3. Fill in the form:
   - Property Name * (e.g., "Sunset Apartments")
   - Street Address * (e.g., "123 Independence Avenue, Accra")
   - Ghana Post GPS Address (e.g., "GA-123-4567")
   - Assign Caretaker (optional dropdown)
   - Description (optional)
4. Click **"Create Property"**

**Assigning/Reassigning Caretaker:**
1. Find the property card
2. Click **"Assign Caretaker"** (if no caretaker) or **"Reassign"** (if has caretaker)
3. Select caretaker from dropdown
4. Click **"Assign Caretaker"**

**Removing Caretaker:**
1. Find the property card with assigned caretaker
2. Click **"Remove"** button
3. Confirm the action

---

### ✅ 4. Unit Management with Tenant Assignment
**File: `app/units/page.tsx`**

**Features:**
- ✅ Create units for properties
- ✅ Assign tenant to unit
- ✅ Remove tenant from unit
- ✅ View unit details (type, rental amount, floor, status)
- ✅ Filter units by property
- ✅ Search units by unit number
- ✅ See which tenant occupies each unit

**How to Use:**

**Creating a Unit:**
1. Navigate to **Units** page (sidebar)
2. Click **"Add Unit"** button
3. Fill in the form:
   - Property * (select from dropdown)
   - Unit Number * (e.g., "A101", "B205")
   - Unit Type * (Studio, 1BR, 2BR, 3BR, 4BR, Penthouse)
   - Rental Amount * (e.g., 1200.00)
   - Floor Number (optional)
   - Description (optional)
4. Click **"Create Unit"**

**Assigning Tenant to Unit:**
1. Find the unit card
2. Click **"Assign Tenant"** button
3. Select tenant from dropdown
4. Click **"Assign Tenant"**

**Removing Tenant from Unit:**
1. Find the unit card with assigned tenant
2. Click **"Remove Tenant"** button
3. Confirm the action

---

### ✅ 5. Tenant Management with Unit Display
**File: `app/tenants/page.tsx`**

**Features:**
- ✅ Create tenants with full form validation
- ✅ View all tenants in a dedicated tab
- ✅ See which unit and property each tenant is assigned to
- ✅ Display "Assigned" or "Unassigned" status
- ✅ Search tenants by name, email, or phone
- ✅ Real-time stats (total tenants, assigned vs unassigned)

**How to Use:**
1. Navigate to **Tenants** page (sidebar)
2. Click **"Add User"** button
3. Select **"Tenant"** role
4. Fill in the form (same as caretaker)
5. Click **"Create Tenant"**
6. View created tenant in the **"Tenants"** tab
7. Tenant card shows:
   - Name, email, phone
   - Property name (if assigned)
   - Unit number (if assigned)
   - Assignment status badge

---

## 🔍 Error Logging

### Console Logs to Monitor

When you perform any action, check the browser console (F12 → Console tab) for:

**1. Request Logs (🚀):**
```
🚀 API Request: POST /users
Full URL: http://127.0.0.1:8000/api/users
Headers: {Authorization: "Bearer ...", Content-Type: "application/json", ...}
Data: {name: "John Doe", email: "john@example.com", role: "caretaker", ...}
Auth Token: eyJhbGciOiJIUzI1NiIsIn...
```

**2. Success Response Logs (✅):**
```
✅ API Response: POST /users
Status: 200 OK
Data: {Success: true, Data: {user: {...}, token: "..."}, Message: "User created successfully"}

API Response (raw): {Success: true, Data: {...}, ...}
API Response (normalized): {success: true, data: {...}, ...}
```

**3. Error Logs (❌):**
```
❌ API Error: POST /users
Error Object: AxiosError {...}
Error Message: Request failed with status code 404
Error Code: ERR_BAD_REQUEST
Response Status: 404
Response Data: {...}
Request URL: http://127.0.0.1:8000/api/users
Request Method: POST
Request Data: {...}
Normalized Error Message: "Endpoint not found..."
Normalized Error Errors: {...}
```

---

## 🚀 Complete Workflow

### Step-by-Step: From Caretaker to Tenant Assignment

#### **Step 1: Create a Caretaker**
1. Go to **Tenants** page
2. Click **"Add User"**
3. Select **"Caretaker"** role
4. Fill in:
   - Name: "John Caretaker"
   - Email: "john.caretaker@example.com"
   - Phone: "+233244567890"
   - Password: "SecurePass123!"
   - Confirm Password: "SecurePass123!"
5. Click **"Create Caretaker"**
6. ✅ **Expected Result**: Success toast, caretaker appears in "Caretakers" tab

---

#### **Step 2: Create a Property**
1. Go to **Properties** page
2. Click **"Add Property"**
3. Fill in:
   - Property Name: "Sunset Apartments"
   - Street Address: "123 Independence Avenue, Accra"
   - Ghana Post GPS: "GA-123-4567"
   - Assign Caretaker: Select "John Caretaker"
   - Description: "Modern apartments in the city center"
4. Click **"Create Property"**
5. ✅ **Expected Result**: Success toast, property appears with caretaker assigned

---

#### **Step 3: Create Units for the Property**
1. Go to **Units** page
2. Click **"Add Unit"**
3. Fill in:
   - Property: Select "Sunset Apartments"
   - Unit Number: "A101"
   - Unit Type: "2 Bedrooms"
   - Rental Amount: 1200.00
   - Floor Number: 1
   - Description: "Spacious 2BR with balcony"
4. Click **"Create Unit"**
5. Repeat for more units (A102, A103, B201, etc.)
6. ✅ **Expected Result**: Success toast, units appear under "Sunset Apartments"

---

#### **Step 4: Create a Tenant**
1. Go to **Tenants** page
2. Click **"Add User"**
3. Select **"Tenant"** role
4. Fill in:
   - Name: "Alice Johnson"
   - Email: "alice.johnson@example.com"
   - Phone: "+233244123456"
   - Password: "SecurePass123!"
   - Confirm Password: "SecurePass123!"
5. Click **"Create Tenant"**
6. ✅ **Expected Result**: Success toast, tenant appears in "Tenants" tab with "Unassigned" badge

---

#### **Step 5: Assign Tenant to Unit**
1. Go to **Units** page
2. Find unit "A101" in "Sunset Apartments"
3. Click **"Assign Tenant"** button
4. Select "Alice Johnson" from dropdown
5. Click **"Assign Tenant"**
6. ✅ **Expected Result**: 
   - Success toast: "Alice Johnson assigned to Unit A101"
   - Unit card shows tenant name and "Occupied" badge
   - Go to **Tenants** page → Alice's card shows "Unit A101" and "Sunset Apartments"

---

## 🔧 Troubleshooting the 404 Error

### The Problem

You're getting a **404 Not Found** error when trying to create caretakers/tenants. This means the backend API endpoint doesn't exist or isn't accessible.

**Error in Console:**
```
❌ API Error: POST /users
Response Status: 404
Request URL: http://127.0.0.1:8000/api/users
```

---

### Solution Steps

#### **1. Check if Backend is Running**

Open a new terminal and run:
```bash
# Windows PowerShell
curl http://127.0.0.1:8000/api

# Or visit in browser:
http://127.0.0.1:8000/api
```

**Expected:** Some JSON response (API info, health check, etc.)
**If you see "Connection refused":** Backend is not running → Start it!

---

#### **2. Start Your Laravel Backend**

Navigate to your backend directory and run:
```bash
cd path/to/your/laravel/backend
php artisan serve
```

**Expected Output:**
```
Laravel development server started: http://127.0.0.1:8000
```

---

#### **3. Verify the Endpoint Exists**

Check your Laravel `routes/api.php` file:
```php
Route::post('/users', [UserController::class, 'store']);
```

**If it doesn't exist:** You need to implement this endpoint in your backend.

---

#### **4. Test the Endpoint Manually**

Use curl or Postman to test:
```bash
curl -X POST http://127.0.0.1:8000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Password123!",
    "password_confirmation": "Password123!",
    "role": "caretaker",
    "phone": "+233244567890"
  }'
```

**Replace `YOUR_TOKEN_HERE`** with your actual auth token from LocalStorage:
1. Open DevTools (F12)
2. Go to **Application** tab → **Local Storage**
3. Find `pms_auth_token`
4. Copy the value

---

#### **5. Check API Base URL**

Create/update `.env.local` in your frontend root:
```env
# If your backend is at http://localhost:8000 (no /api prefix)
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000

# Or if it's on a different port
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8080/api

# Or if deployed
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

**After changing `.env.local`:**
```bash
# Stop the dev server (Ctrl+C)
npm run dev
```

---

#### **6. Check CORS Configuration**

If you get CORS errors, update your Laravel backend `config/cors.php`:
```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => ['http://localhost:3000', 'http://127.0.0.1:3000'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'supports_credentials' => true,
```

---

## 🧪 Testing Guide

### Manual Testing Checklist

#### **✅ Caretaker Creation**
- [ ] Navigate to Tenants page
- [ ] Click "Add User" → Select "Caretaker"
- [ ] Fill form with valid data
- [ ] Submit form
- [ ] Check console for request/response logs
- [ ] Verify success toast appears
- [ ] Verify caretaker appears in "Caretakers" tab
- [ ] Verify caretaker shows "0 properties" initially

#### **✅ Property Creation with Caretaker**
- [ ] Navigate to Properties page
- [ ] Click "Add Property"
- [ ] Fill form with valid data
- [ ] Select caretaker from dropdown
- [ ] Submit form
- [ ] Check console for request/response logs
- [ ] Verify success toast appears
- [ ] Verify property appears with caretaker name
- [ ] Go to Tenants page → Caretaker tab
- [ ] Verify caretaker now shows "Managing 1 Property"

#### **✅ Caretaker Assignment/Reassignment**
- [ ] Navigate to Properties page
- [ ] Find property with no caretaker
- [ ] Click "Assign Caretaker"
- [ ] Select caretaker from dropdown
- [ ] Submit
- [ ] Verify success toast
- [ ] Verify property card updates with caretaker info
- [ ] Click "Reassign" on same property
- [ ] Select different caretaker
- [ ] Submit
- [ ] Verify property updates with new caretaker

#### **✅ Caretaker Removal**
- [ ] Navigate to Properties page
- [ ] Find property with assigned caretaker
- [ ] Click "Remove" button
- [ ] Verify success toast
- [ ] Verify property card shows "No caretaker assigned"

#### **✅ Unit Creation**
- [ ] Navigate to Units page
- [ ] Click "Add Unit"
- [ ] Select property from dropdown
- [ ] Fill in unit details
- [ ] Submit form
- [ ] Check console for request/response logs
- [ ] Verify success toast appears
- [ ] Verify unit appears under correct property
- [ ] Verify unit shows "Available" status

#### **✅ Tenant Creation**
- [ ] Navigate to Tenants page
- [ ] Click "Add User" → Select "Tenant"
- [ ] Fill form with valid data
- [ ] Submit form
- [ ] Check console for request/response logs
- [ ] Verify success toast appears
- [ ] Verify tenant appears in "Tenants" tab
- [ ] Verify tenant shows "No unit assigned" with "Unassigned" badge

#### **✅ Tenant Assignment to Unit**
- [ ] Navigate to Units page
- [ ] Find available unit
- [ ] Click "Assign Tenant"
- [ ] Select tenant from dropdown
- [ ] Submit
- [ ] Check console for request/response logs
- [ ] Verify success toast
- [ ] Verify unit card shows tenant name and "Occupied" badge
- [ ] Go to Tenants page
- [ ] Verify tenant card shows unit number and property name
- [ ] Verify tenant has "Assigned" badge

#### **✅ Tenant Removal from Unit**
- [ ] Navigate to Units page
- [ ] Find occupied unit
- [ ] Click "Remove Tenant"
- [ ] Verify success toast
- [ ] Verify unit shows "Available" status
- [ ] Go to Tenants page
- [ ] Verify tenant shows "Unassigned" badge

---

## 📊 Expected Console Output

### Successful Caretaker Creation

```
🚀 API Request: POST /users
Full URL: http://127.0.0.1:8000/api/users
Data: {
  name: "John Caretaker",
  email: "john.caretaker@example.com",
  password: "SecurePass123!",
  password_confirmation: "SecurePass123!",
  role: "caretaker",
  phone: "+233244567890"
}

✅ API Response: POST /users
Status: 200 OK
Data: {
  Success: true,
  Data: {
    user: {
      id: "uuid-here",
      name: "John Caretaker",
      email: "john.caretaker@example.com",
      role: "caretaker",
      phone: "+233244567890",
      created_at: "2025-11-19T..."
    },
    token: "eyJhbGciOiJIUzI1NiIsIn..."
  },
  Message: "User created successfully"
}

API Response (normalized): {
  success: true,
  data: {
    user: {...},
    token: "..."
  },
  message: "User created successfully"
}

Creating user with data: {name: "John Caretaker", email: "john.caretaker@example.com", ...}
User creation result: {user: {...}, token: "..."}
```

---

## 🎉 Success Criteria

You'll know everything is working when:

1. ✅ **No 404 errors** in console
2. ✅ **All API requests** show `✅ API Response: 200 OK`
3. ✅ **Success toasts** appear after each action
4. ✅ **Data appears immediately** in the UI after creation
5. ✅ **Relationships are visible**:
   - Caretakers show properties they manage
   - Properties show assigned caretakers
   - Units show assigned tenants
   - Tenants show assigned units and properties

---

## 📞 Need Help?

If you're still experiencing issues:

1. **Share the complete console output** from the browser DevTools
2. **Check the Network tab** (F12 → Network) and share the failed request details
3. **Verify your backend** is running and accessible
4. **Check your `.env.local`** file for correct API base URL

---

**Last Updated:** November 19, 2025  
**Implementation Status:** ✅ Complete (Single Session)  
**Features Implemented:** 7/7  
**Error Logging:** ✅ Enhanced  
**Documentation:** ✅ Complete

