# Backend URL Configuration Fix

## 🚨 **The Issue**
You're getting a 404 error because the frontend is trying to connect to `http://127.0.0.1:8000/api` but your backend is running on a different URL.

## 🔧 **Quick Fix**

### Step 1: Identify Your Backend URL
Since you're using Laragon (based on your file path `d:\laragon\www\pms_backend\`), your backend URL is likely one of these:

- `http://localhost/pms_backend/api`
- `http://pms_backend.test/api` (if you have virtual hosts set up)
- `http://127.0.0.1/pms_backend/api`

### Step 2: Create/Update .env.local File
Create a file called `.env.local` in your project root with:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost/pms_backend/api
```

**Or try these alternatives if the above doesn't work:**
```env
# Option 1: With virtual host
NEXT_PUBLIC_API_BASE_URL=http://pms_backend.test/api

# Option 2: With IP
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1/pms_backend/api

# Option 3: If using Laravel Artisan serve
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

### Step 3: Test Your Backend URL
Open your browser and try to access:
- `http://localhost/pms_backend/api/properties` 
- Or whatever URL you set in the .env.local file

You should see either:
- A JSON response (if the endpoint works)
- A Laravel error page (means Laravel is running but endpoint might not exist)
- A 404 error (means the URL is wrong)

### Step 4: Restart Your Frontend
After creating/updating `.env.local`, restart your Next.js development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

## 🧪 **Testing Steps**

1. **Create the .env.local file** with the correct backend URL
2. **Restart your frontend server**
3. **Go to the Invoices page** 
4. **Check the browser console** - you should see detailed API request logs
5. **Try the debug component** to test the API calls

## 🔍 **Debug Information**

The API client will log detailed information in the browser console:
- ✅ **Request logs**: Show the exact URL being called
- ❌ **Error logs**: Show detailed error information
- 🔧 **Response logs**: Show successful API responses

## 📝 **Common Laragon URLs**

If you're using Laragon, try these URLs in order:

1. **Default Laragon**: `http://localhost/pms_backend/api`
2. **Virtual Host**: `http://pms_backend.test/api`
3. **With Port**: `http://localhost:80/pms_backend/api`

## 🚀 **Quick Test**

To quickly test which URL works, open these in your browser:
- `http://localhost/pms_backend/` (should show your Laravel app)
- `http://localhost/pms_backend/api/` (should show API response or error)

## ⚡ **Alternative: Temporary Fix**

If you want to test immediately, you can temporarily change the config directly:

In `lib/config.ts`, change line 9 to:
```typescript
baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost/pms_backend/api",
```

But it's better to use the `.env.local` file approach above.
