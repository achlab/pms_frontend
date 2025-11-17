# 🚀 Deployment Guide - Property Management System Frontend

## Overview
This guide covers deploying the Property Management System Frontend to production environments.

---

## 📋 Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing
- [ ] No console errors or warnings
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Code reviewed and approved
- [ ] All features tested

### Environment
- [ ] Environment variables configured
- [ ] API endpoints verified
- [ ] SSL certificates ready
- [ ] Domain configured
- [ ] CDN setup (if applicable)

### Documentation
- [ ] README updated
- [ ] API documentation complete
- [ ] User manual ready
- [ ] Deployment notes documented

---

## 🔧 Environment Setup

### 1. Environment Variables

Create a `.env.production` file:

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api

# Application Configuration
NEXT_PUBLIC_APP_NAME="Property Management System"
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your-ga-id

# Optional: Error Tracking
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

### 2. Build Configuration

Update `next.config.js` if needed:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['your-api-domain.com'], // Add your API domain for images
  },
  // Enable compression
  compress: true,
  // Production optimizations
  swcMinify: true,
};

module.exports = nextConfig;
```

---

## 🌐 Deployment Options

### Option 1: Vercel (Recommended for Next.js)

#### Prerequisites
- Vercel account
- GitHub repository

#### Steps

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy
   vercel
   ```

2. **Configure Project**
   - Go to Vercel Dashboard
   - Select your project
   - Go to Settings → Environment Variables
   - Add all environment variables from `.env.production`

3. **Deploy**
   ```bash
   # Production deployment
   vercel --prod
   ```

4. **Custom Domain**
   - Go to Settings → Domains
   - Add your custom domain
   - Configure DNS records as instructed

#### Automatic Deployments
- Push to `main` branch → Auto-deploy to production
- Push to other branches → Preview deployments

---

### Option 2: Netlify

#### Prerequisites
- Netlify account
- GitHub repository

#### Steps

1. **Connect Repository**
   - Go to Netlify Dashboard
   - Click "New site from Git"
   - Connect your repository

2. **Build Settings**
   ```
   Build command: npm run build
   Publish directory: .next
   ```

3. **Environment Variables**
   - Go to Site settings → Build & deploy → Environment
   - Add all variables from `.env.production`

4. **Deploy**
   - Netlify auto-deploys on push to main branch

---

### Option 3: AWS (S3 + CloudFront)

#### Prerequisites
- AWS account
- AWS CLI configured

#### Steps

1. **Build the Application**
   ```bash
   npm run build
   npm run export  # If using static export
   ```

2. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://your-bucket-name
   ```

3. **Configure Bucket for Static Hosting**
   ```bash
   aws s3 website s3://your-bucket-name \
     --index-document index.html \
     --error-document 404.html
   ```

4. **Upload Files**
   ```bash
   aws s3 sync out/ s3://your-bucket-name --delete
   ```

5. **Setup CloudFront**
   - Create CloudFront distribution
   - Set S3 bucket as origin
   - Configure SSL certificate
   - Set custom domain

---

### Option 4: Docker + Any Cloud Provider

#### Dockerfile

Create `Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

#### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api
    restart: unless-stopped
```

#### Build and Run

```bash
# Build image
docker build -t pms-frontend .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api \
  pms-frontend
```

---

## 🔐 Security Configuration

### 1. HTTPS/SSL
- Always use HTTPS in production
- Obtain SSL certificate (Let's Encrypt, CloudFlare, etc.)
- Configure automatic renewal

### 2. Environment Variables
- Never commit `.env` files to Git
- Use platform-specific secret management
- Rotate sensitive keys regularly

### 3. CORS Configuration
Ensure backend API allows requests from your frontend domain:

```javascript
// Backend CORS config example
cors({
  origin: ['https://yourdomain.com'],
  credentials: true
})
```

### 4. Content Security Policy
Add CSP headers in `next.config.js`:

```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

---

## 📊 Monitoring & Analytics

### 1. Error Tracking (Sentry)

Install Sentry:

```bash
npm install @sentry/nextjs
```

Configure `sentry.client.config.js`:

```javascript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### 2. Analytics (Google Analytics)

Add to `_app.tsx`:

```typescript
import { useEffect } from 'react';
import { useRouter } from 'next/router';

// Google Analytics
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export function reportWebVitals(metric) {
  if (GA_ID) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.value),
      event_label: metric.id,
    });
  }
}
```

### 3. Performance Monitoring

Use Vercel Analytics or similar:

```bash
npm install @vercel/analytics
```

```typescript
import { Analytics } from '@vercel/analytics/react';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_API_BASE_URL: ${{ secrets.API_BASE_URL }}
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 🌍 Domain Configuration

### DNS Records

Add these DNS records for your domain:

```
Type    Name    Value                           TTL
A       @       your-server-ip                  3600
CNAME   www     your-deployment-url.com         3600
```

For Vercel:
```
Type    Name    Value                           TTL
CNAME   @       cname.vercel-dns.com           3600
CNAME   www     cname.vercel-dns.com           3600
```

---

## 🔧 Post-Deployment

### 1. Verification
- [ ] Visit production URL
- [ ] Test all major features
- [ ] Check API connectivity
- [ ] Verify SSL certificate
- [ ] Test on multiple devices
- [ ] Check analytics tracking

### 2. Performance Testing
```bash
# Use Lighthouse
npx lighthouse https://yourdomain.com --view

# Check bundle size
npm run build
npm run analyze  # If bundle analyzer configured
```

### 3. Monitoring Setup
- [ ] Configure uptime monitoring (UptimeRobot, Pingdom)
- [ ] Set up error alerts (Sentry)
- [ ] Configure performance monitoring
- [ ] Set up log aggregation

---

## 🔄 Rollback Procedure

### Vercel
```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]
```

### Docker
```bash
# Tag previous version
docker tag pms-frontend:latest pms-frontend:backup

# Rollback
docker stop pms-frontend
docker run pms-frontend:backup
```

### Git
```bash
# Revert to previous commit
git revert HEAD
git push origin main
```

---

## 📝 Maintenance

### Regular Tasks
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Review security updates
- [ ] Update dependencies monthly
- [ ] Backup data regularly
- [ ] Review logs weekly

### Dependency Updates
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Update Next.js
npm install next@latest react@latest react-dom@latest

# Test after updates
npm test
npm run build
```

---

## 🆘 Troubleshooting

### Build Failures
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Environment Variable Issues
```bash
# Verify variables are set
echo $NEXT_PUBLIC_API_BASE_URL

# Check in build output
npm run build | grep NEXT_PUBLIC
```

### API Connection Issues
- Verify CORS configuration
- Check API URL is correct
- Verify SSL certificates
- Check network/firewall rules

---

## 📞 Support

### Resources
- Next.js Documentation: https://nextjs.org/docs
- Vercel Documentation: https://vercel.com/docs
- GitHub Issues: [Your Repo URL]

### Contact
- Technical Lead: [Email]
- DevOps Team: [Email]
- Emergency: [Phone/Slack]

---

## ✅ Deployment Checklist

- [ ] Environment variables configured
- [ ] Build successful
- [ ] Tests passing
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] Monitoring setup
- [ ] Analytics configured
- [ ] Error tracking enabled
- [ ] Performance optimized
- [ ] Security headers configured
- [ ] CORS configured
- [ ] Backup strategy in place
- [ ] Rollback procedure documented
- [ ] Team notified
- [ ] Documentation updated

---

**Deployment Complete!** 🎉

Your Property Management System Frontend is now live and ready for users! 🚀

