# 🚀 Tenant API - Quick Start Guide

## Base URL
```
http://localhost:8000/api
# or
http://your-domain.com/api
```

## Test Credentials
```
Email: tenant1@pms.com
Password: Tenant123!
```

---

## 1️⃣ Authentication Flow

### Step 1: Login
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tenant1@pms.com",
    "password": "Tenant123!"
  }'
```

**Response:**
```json
{
  "success": true,
  "token": "1|abcdef123456...",
  "user": { ... }
}
```

**💾 Save the token** - You'll need it for all subsequent requests!

---

## 2️⃣ Essential Endpoints

### Get Dashboard (Home Screen Data)
```bash
curl http://localhost:8000/api/analytics/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get My Active Lease
```bash
curl http://localhost:8000/api/leases?status=active \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Pending Invoices
```bash
curl http://localhost:8000/api/invoices?status=pending \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Maintenance Requests
```bash
curl http://localhost:8000/api/maintenance/requests \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 3️⃣ Common Actions

### Create Maintenance Request
```bash
curl -X POST http://localhost:8000/api/maintenance/requests \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "AC Not Working",
    "description": "The air conditioner stopped working yesterday",
    "priority": "urgent",
    "category_id": "CATEGORY_UUID"
  }'
```

### Record Payment
```bash
curl -X POST http://localhost:8000/api/payments/invoices/INVOICE_ID/record \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1500.00,
    "payment_method": "mobile_money",
    "payment_reference": "REF-MTN123456",
    "payment_date": "2025-11-12",
    "notes": "Payment via MTN Mobile Money"
  }'
```

---

## 4️⃣ Frontend Integration

### React/Next.js Example

```javascript
// lib/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Usage in Components

```javascript
// pages/dashboard.jsx
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await api.get('/analytics/dashboard');
      setDashboard(data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      <div>Current Lease: {dashboard?.current_lease?.property?.name}</div>
      <div>Pending Invoices: {dashboard?.overview?.pending_invoices}</div>
      {/* More dashboard content */}
    </div>
  );
}
```

---

## 5️⃣ Key Features by Screen

### 🏠 Home/Dashboard
- `GET /api/analytics/dashboard` - All dashboard data
- `GET /api/leases?status=active` - Current lease
- `GET /api/invoices?status=pending` - Pending bills

### 👤 Profile
- `GET /api/profile` - View profile
- `PUT /api/profile` - Update profile
- `PUT /api/profile/password` - Change password
- `POST /api/profile/picture` - Upload photo

### 💰 Payments
- `GET /api/invoices` - All invoices
- `GET /api/payments/history` - Payment history
- `POST /api/payments/invoices/:id/record` - Record payment

### 🔧 Maintenance
- `GET /api/maintenance/categories` - Available categories
- `GET /api/maintenance/requests` - My requests
- `POST /api/maintenance/requests` - Create request
- `POST /api/maintenance/requests/:id/notes` - Add note

### 📄 Lease
- `GET /api/leases` - View lease(s)
- `GET /api/leases/:id` - Lease details
- `GET /api/leases/expiring-soon` - Check renewal

---

## 6️⃣ Response Structure

All responses follow this pattern:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": { ... }  // validation errors
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 50
  }
}
```

---

## 7️⃣ Common Filters

### Invoices
- `?status=pending|paid|overdue|partially_paid`
- `?invoice_type=rent|utility|maintenance`
- `?start_date=2025-01-01`
- `?end_date=2025-12-31`

### Maintenance Requests
- `?status=received|assigned|in_progress|resolved|closed`
- `?priority=low|normal|urgent|emergency`
- `?category_id=UUID`

### Leases
- `?status=active|expired|terminated`

---

## 8️⃣ Postman Setup

1. Import the collection: `docs/PMS_Tenant_API.postman_collection.json`
2. Set environment variables:
   - `base_url`: `http://localhost:8000/api`
   - `tenant_email`: `tenant1@pms.com`
   - `tenant_password`: `Tenant123!`
3. Run "Login" request first
4. Token will auto-save for other requests

---

## 9️⃣ Error Handling

```javascript
try {
  const response = await api.get('/invoices');
  // Handle success
} catch (error) {
  if (error.response) {
    // Server responded with error
    switch (error.response.status) {
      case 401:
        // Redirect to login
        break;
      case 403:
        // Show permission error
        break;
      case 422:
        // Show validation errors
        console.log(error.response.data.errors);
        break;
      case 500:
        // Show server error
        break;
    }
  } else if (error.request) {
    // Network error
    console.error('Network error');
  }
}
```

---

## 🔟 Best Practices

1. **Always include Authorization header** for protected routes
2. **Check `success` field** before using data
3. **Handle loading states** in UI
4. **Cache frequently used data** (profile, categories)
5. **Implement token refresh** logic
6. **Show user-friendly error messages**
7. **Validate before submitting** forms
8. **Use optimistic updates** for better UX

---

## 📱 Mobile App Integration

### Flutter Example
```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class ApiService {
  static const String baseUrl = 'http://your-domain.com/api';
  String? token;

  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      token = data['token'];
      return data;
    }
    throw Exception('Login failed');
  }

  Future<Map<String, dynamic>> getDashboard() async {
    final response = await http.get(
      Uri.parse('$baseUrl/analytics/dashboard'),
      headers: {
        'Authorization': 'Bearer $token',
        'Accept': 'application/json',
      },
    );
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to load dashboard');
  }
}
```

---

## 🎯 Quick Testing Checklist

- [ ] Login successfully
- [ ] Get dashboard data
- [ ] View current lease
- [ ] Get pending invoices
- [ ] View payment history
- [ ] Get maintenance categories
- [ ] Create maintenance request
- [ ] View maintenance request details
- [ ] Update profile
- [ ] Change password
- [ ] Logout

---

## 🆘 Troubleshooting

### "Unauthenticated" Error
- Check if token is included in Authorization header
- Verify token hasn't expired
- Re-login to get fresh token

### "Forbidden" Error
- Endpoint requires specific role
- Tenant trying to access other tenant's data

### "Not Found" Error
- Check if UUID is correct
- Verify resource exists in database

### CORS Issues
- Backend must allow your frontend domain
- Check `config/cors.php` settings

---

## 📚 Additional Resources

- [Full API Documentation](./TENANT_API_ENDPOINTS.md)
- [Postman Collection](./PMS_Tenant_API.postman_collection.json)
- Backend Repository: [Link]
- Frontend Repository: [Link]

---

**Need Help?** Contact the development team or check backend logs for detailed error messages.

**Happy Coding! 🚀**

