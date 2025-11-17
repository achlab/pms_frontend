# Environment Variables Setup Guide

## Required Environment Files

Create these files in your project root:

### 1. `.env.local` (For Local Development)

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api

# Application Configuration
NEXT_PUBLIC_APP_NAME="Property Management System"
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

### 2. `.env.example` (Template for Team)

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api

# Application Configuration
NEXT_PUBLIC_APP_NAME="Property Management System"
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Analytics
# NEXT_PUBLIC_GA_ID=your-google-analytics-id

# Optional: Error Tracking
# NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# Environment
NODE_ENV=development
```

### 3. `.env.production` (For Production)

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api

# Application Configuration
NEXT_PUBLIC_APP_NAME="Property Management System"
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Optional: Analytics
# NEXT_PUBLIC_GA_ID=your-google-analytics-id

# Optional: Error Tracking
# NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# Environment
NODE_ENV=production
```

## Quick Setup Commands

```bash
# Copy example to local
cp .env.example .env.local

# Edit with your API URL
# Update NEXT_PUBLIC_API_BASE_URL with your backend URL
```

## Important Notes

1. **Never commit `.env.local`** - It's in `.gitignore`
2. **Update API URL** - Change `http://localhost:8000/api` to your actual backend URL
3. **NEXT_PUBLIC_ prefix** - Required for client-side environment variables in Next.js
4. **Restart dev server** - After changing env variables, restart `npm run dev`

## Verifying Environment Variables

Check if variables are loaded:

```bash
# In your browser console (after running the app)
console.log(process.env.NEXT_PUBLIC_API_BASE_URL)
```

## Common Issues

### Issue: Environment variables not loading
**Solution:** 
- Ensure file is named exactly `.env.local`
- Restart dev server (`npm run dev`)
- Check for typos in variable names

### Issue: API calls failing
**Solution:**
- Verify `NEXT_PUBLIC_API_BASE_URL` is correct
- Ensure backend is running
- Check CORS settings on backend
- Verify API endpoint paths match documentation

