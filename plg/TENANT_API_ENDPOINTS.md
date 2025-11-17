# 🏠 Tenant-Side API Endpoints Documentation

**Base URL:** `http://your-domain.com/api`  
**Authentication:** Bearer Token (Sanctum)  
**Content-Type:** `application/json`

---

## 📋 Table of Contents
1. [Authentication](#authentication)
2. [Profile Management](#profile-management)
3. [Dashboard & Analytics](#dashboard--analytics)
4. [My Lease](#my-lease)
5. [My Unit](#my-unit)
6. [Invoices & Payments](#invoices--payments)
7. [Maintenance Requests](#maintenance-requests)

---

## 🔐 Authentication

### Login
```http
POST /api/login
```

**Request Body:**
```json
{
  "email": "tenant1@pms.com",
  "password": "Tenant123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "name": "Akosua Frimpong",
    "email": "tenant1@pms.com",
    "role": "tenant",
    "phone": "+233244900123",
    "address": "Tenant Address 1, Ghana",
    "profile_picture": null,
    "bio": "Reliable tenant with good payment history.",
    "is_verified": true,
    "email_verified_at": "2025-11-12T16:22:53.000000Z",
    "landlord_id": "uuid",
    "created_at": "2025-11-12T16:22:53.000000Z"
  },
  "token": "1|abcdef123456..."
}
```

### Logout
```http
POST /api/logout
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### Forgot Password
```http
POST /api/password/forgot
```

**Request Body:**
```json
{
  "email": "tenant1@pms.com"
}
```

### Reset Password
```http
POST /api/password/reset
```

**Request Body:**
```json
{
  "email": "tenant1@pms.com",
  "token": "reset-token",
  "password": "NewPassword123!",
  "password_confirmation": "NewPassword123!"
}
```

---

## 👤 Profile Management

### Get My Profile
```http
GET /api/profile
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Akosua Frimpong",
    "email": "tenant1@pms.com",
    "role": "tenant",
    "phone": "+233244900123",
    "address": "Tenant Address 1, Ghana",
    "profile_picture": "profile-pictures/tenant1.jpg",
    "bio": "Reliable tenant with good payment history.",
    "is_verified": true,
    "landlord": {
      "id": "uuid",
      "name": "John Kwame Asante",
      "email": "landlord1@pms.com",
      "phone": "+233244567890"
    }
  }
}
```

### Update Profile
```http
PUT /api/profile
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "Akosua Frimpong Updated",
  "phone": "+233244900999",
  "address": "New Address, Accra",
  "bio": "Updated bio"
}
```

### Upload Profile Picture
```http
POST /api/profile/picture
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body:**
```
picture: (file)
```

### Delete Profile Picture
```http
DELETE /api/profile/picture
Authorization: Bearer {token}
```

### Change Password
```http
PUT /api/profile/password
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "current_password": "Tenant123!",
  "password": "NewPassword123!",
  "password_confirmation": "NewPassword123!"
}
```

### Verify Password
```http
POST /api/profile/password/verify
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "password": "Tenant123!"
}
```

---

## 📊 Dashboard & Analytics

### Get Dashboard Summary
```http
GET /api/analytics/dashboard
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_invoices": 10,
      "paid_invoices": 6,
      "pending_invoices": 3,
      "overdue_invoices": 1,
      "total_amount_paid": 12500.00,
      "outstanding_balance": 2500.00
    },
    "current_lease": {
      "id": "uuid",
      "start_date": "2024-06-01",
      "end_date": "2025-06-01",
      "monthly_rent": 1500.00,
      "status": "active",
      "days_until_expiration": 201,
      "property": {
        "name": "Ocean View Towers",
        "address": "Cantonments, Accra"
      },
      "unit": {
        "unit_number": "A01",
        "bedrooms": 2,
        "bathrooms": 2
      }
    },
    "maintenance_requests": {
      "total": 5,
      "received": 1,
      "in_progress": 2,
      "resolved": 2,
      "urgent_count": 1
    },
    "recent_payments": [
      {
        "id": "uuid",
        "amount": 1500.00,
        "payment_date": "2025-11-01",
        "payment_method": "mobile_money",
        "status": "completed"
      }
    ],
    "upcoming_due_date": "2025-12-01"
  }
}
```

### Get Payment Analytics
```http
GET /api/analytics/payments
Authorization: Bearer {token}
```

**Query Parameters:**
- `period` (optional): `month`, `quarter`, `year` (default: `month`)
- `start_date` (optional): YYYY-MM-DD
- `end_date` (optional): YYYY-MM-DD

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_paid": 9000.00,
    "total_invoices": 6,
    "average_payment": 1500.00,
    "payment_trend": [
      {
        "month": "June 2025",
        "amount": 1500.00,
        "status": "paid"
      },
      {
        "month": "July 2025",
        "amount": 1500.00,
        "status": "paid"
      }
    ],
    "payment_methods": {
      "mobile_money": 4500.00,
      "bank_transfer": 3000.00,
      "cash": 1500.00
    }
  }
}
```

---

## 📄 My Lease

### Get My Lease(s)
```http
GET /api/leases
Authorization: Bearer {token}
```

**Query Parameters:**
- `status` (optional): `active`, `expired`, `terminated`
- `per_page` (optional): Number of results per page (default: 15)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "property": {
        "id": "uuid",
        "name": "Ocean View Towers",
        "address": "Cantonments, Accra, Ghana",
        "property_type": "apartment",
        "gps_code": "GA-123-4567"
      },
      "unit": {
        "id": "uuid",
        "unit_number": "A01",
        "floor": "Ground Floor",
        "bedrooms": 2,
        "bathrooms": 2,
        "square_footage": 1200
      },
      "tenant": {
        "id": "uuid",
        "name": "Akosua Frimpong",
        "phone": "+233244900123"
      },
      "landlord": {
        "id": "uuid",
        "name": "John Kwame Asante",
        "email": "landlord1@pms.com",
        "phone": "+233244567890"
      },
      "start_date": "2024-06-01",
      "end_date": "2025-06-01",
      "monthly_rent": 1500.00,
      "security_deposit": 3000.00,
      "advance_rent_months": 3,
      "total_advance_rent": 4500.00,
      "payment_due_day": 1,
      "status": "active",
      "lease_type": "new",
      "security_deposit_status": "held",
      "security_deposit_paid_at": "2024-06-05T10:00:00.000000Z",
      "utilities_responsibility": {
        "electricity": "tenant",
        "water": "landlord",
        "gas": "tenant",
        "internet": "tenant"
      },
      "late_payment_penalty_percentage": 2.0,
      "late_payment_grace_days": 5,
      "termination_notice_days": 30,
      "special_terms": "No pets allowed on the property.",
      "document_url": "http://domain.com/storage/lease-documents/lease-1.pdf",
      "days_until_expiration": 201,
      "is_expiring_soon": false,
      "is_active": true,
      "ghana_rent_act_compliant": true
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 1
  }
}
```

### Get Specific Lease Details
```http
GET /api/leases/{leaseId}
Authorization: Bearer {token}
```

**Response (200):** Same structure as single lease above

### Get Leases Expiring Soon
```http
GET /api/leases/expiring-soon
Authorization: Bearer {token}
```

**Query Parameters:**
- `days` (optional): Number of days to look ahead (default: 60)

---

## 🏢 My Unit

### Get My Current Unit
```http
GET /api/units?tenant_id={myUserId}
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "property_id": "uuid",
      "unit_number": "A01",
      "floor": "Ground Floor",
      "unit_type": "2bedroom",
      "bedrooms": 2,
      "bathrooms": 2,
      "square_footage": 1200,
      "monthly_rent": 1500.00,
      "is_available": false,
      "is_active": true,
      "features": ["Balcony", "Parking", "AC"],
      "description": "Spacious 2-bedroom unit with modern amenities",
      "property": {
        "id": "uuid",
        "name": "Ocean View Towers",
        "address": "Cantonments, Accra, Ghana",
        "property_type": "apartment"
      },
      "tenant": {
        "id": "uuid",
        "name": "Akosua Frimpong",
        "email": "tenant1@pms.com",
        "phone": "+233244900123"
      },
      "caretaker": {
        "id": "uuid",
        "name": "Samuel Mensah",
        "phone": "+233244800123"
      }
    }
  ]
}
```

### Get Unit Details
```http
GET /api/units/{unitId}
Authorization: Bearer {token}
```

---

## 💰 Invoices & Payments

### Get My Invoices
```http
GET /api/invoices
Authorization: Bearer {token}
```

**Query Parameters:**
- `status` (optional): `pending`, `paid`, `overdue`, `partially_paid`
- `invoice_type` (optional): `rent`, `utility`, `maintenance`, `other`
- `start_date` (optional): YYYY-MM-DD
- `end_date` (optional): YYYY-MM-DD
- `per_page` (optional): Number of results (default: 15)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "invoice_number": "INV-202511-001",
      "property": {
        "id": "uuid",
        "name": "Ocean View Towers",
        "address": "Cantonments, Accra"
      },
      "unit": {
        "id": "uuid",
        "unit_number": "A01"
      },
      "tenant": {
        "id": "uuid",
        "name": "Akosua Frimpong"
      },
      "landlord": {
        "id": "uuid",
        "name": "John Kwame Asante"
      },
      "invoice_date": "2025-11-01",
      "due_date": "2025-11-05",
      "period_start": "2025-11-01",
      "period_end": "2025-11-30",
      "base_rent_amount": 1500.00,
      "additional_charges": 0.00,
      "total_amount": 1500.00,
      "outstanding_balance": 1500.00,
      "status": "pending",
      "paid_at": null,
      "notes": "Monthly rent for November 2025",
      "is_overdue": false,
      "days_overdue": 0
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 6
  },
  "summary": {
    "total_invoices": 6,
    "total_amount": 9000.00,
    "total_paid": 6000.00,
    "total_outstanding": 3000.00
  }
}
```

### Get Specific Invoice
```http
GET /api/invoices/{invoiceId}
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "Success": true,
  "Data": {
    "id": "uuid",
    "invoice_number": "INV-202511-001",
    "invoice_date": "2025-11-01",
    "due_date": "2025-11-05",
    "period_start": "2025-11-01",
    "period_end": "2025-11-30",
    "base_rent_amount": 1500.00,
    "additional_charges": 0.00,
    "total_amount": 1500.00,
    "outstanding_balance": 1500.00,
    "status": "pending",
    "property": {...},
    "unit": {...},
    "tenant": {...},
    "landlord": {...},
    "payments": []
  }
}
```

### Get Payment History
```http
GET /api/payments/history
Authorization: Bearer {token}
```

**Query Parameters:**
- `start_date` (optional): YYYY-MM-DD
- `end_date` (optional): YYYY-MM-DD
- `payment_method` (optional): `mobile_money`, `bank_transfer`, `cash`, `cheque`
- `per_page` (optional): Number of results (default: 15)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "payment_number": "PAY-000001",
      "invoice": {
        "id": "uuid",
        "invoice_number": "INV-202510-001",
        "total_amount": 1500.00
      },
      "tenant": {
        "id": "uuid",
        "name": "Akosua Frimpong"
      },
      "landlord": {
        "id": "uuid",
        "name": "John Kwame Asante"
      },
      "amount": 1500.00,
      "payment_method": "mobile_money",
      "payment_reference": "REF-MTN123456",
      "payment_date": "2025-10-05",
      "status": "completed",
      "notes": "Monthly rent payment via mobile money transfer",
      "recorded_by": {
        "id": "uuid",
        "name": "Akosua Frimpong"
      },
      "created_at": "2025-10-05T14:30:00.000000Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 6
  },
  "summary": {
    "total_payments": 6,
    "total_amount_paid": 9000.00,
    "payment_methods_breakdown": {
      "mobile_money": 4500.00,
      "bank_transfer": 3000.00,
      "cash": 1500.00
    }
  }
}
```

### Get Invoice Payments
```http
GET /api/payments/invoices/{invoiceId}
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "invoice": {
      "id": "uuid",
      "invoice_number": "INV-202511-001",
      "total_amount": 1500.00,
      "outstanding_balance": 500.00
    },
    "payments": [
      {
        "id": "uuid",
        "payment_number": "PAY-000005",
        "amount": 500.00,
        "payment_method": "mobile_money",
        "payment_date": "2025-11-03",
        "status": "completed"
      },
      {
        "id": "uuid",
        "payment_number": "PAY-000006",
        "amount": 500.00,
        "payment_method": "bank_transfer",
        "payment_date": "2025-11-05",
        "status": "completed"
      }
    ],
    "total_paid": 1000.00,
    "remaining_balance": 500.00
  }
}
```

### Record Payment (Tenant can record their own payments)
```http
POST /api/payments/invoices/{invoiceId}/record
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "amount": 1500.00,
  "payment_method": "mobile_money",
  "payment_reference": "REF-MTN987654",
  "payment_date": "2025-11-05",
  "notes": "Payment via MTN Mobile Money"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Payment recorded successfully",
  "data": {
    "payment": {
      "id": "uuid",
      "payment_number": "PAY-000007",
      "amount": 1500.00,
      "payment_method": "mobile_money",
      "payment_reference": "REF-MTN987654",
      "payment_date": "2025-11-05",
      "status": "completed"
    },
    "invoice": {
      "id": "uuid",
      "invoice_number": "INV-202511-001",
      "status": "paid",
      "outstanding_balance": 0.00
    }
  }
}
```

---

## 🔧 Maintenance Requests

### Get Maintenance Categories
```http
GET /api/maintenance/categories
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Plumbing",
      "description": "Water-related issues including leaks, clogs, and fixture problems",
      "urgency_level": "urgent",
      "icon": "🔧",
      "color": "#2563eb",
      "expected_resolution_hours": 24,
      "requires_landlord_approval": false,
      "auto_approval_limit": 500.00,
      "is_active": true,
      "sort_order": 1
    },
    {
      "id": "uuid",
      "name": "Electrical",
      "description": "Electrical issues including power outages, wiring problems",
      "urgency_level": "urgent",
      "icon": "⚡",
      "color": "#eab308",
      "expected_resolution_hours": 12,
      "requires_landlord_approval": false,
      "auto_approval_limit": 500.00,
      "is_active": true,
      "sort_order": 2
    }
  ]
}
```

### Get My Maintenance Requests
```http
GET /api/maintenance/requests
Authorization: Bearer {token}
```

**Query Parameters:**
- `status` (optional): `received`, `assigned`, `in_progress`, `pending_approval`, `approved`, `resolved`, `closed`
- `priority` (optional): `low`, `normal`, `urgent`, `emergency`
- `category_id` (optional): UUID of category
- `per_page` (optional): Number of results (default: 15)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "request_number": "MNT-000001",
      "title": "Kitchen Sink Leaking",
      "description": "The kitchen sink has been leaking water continuously for the past 2 days.",
      "status": "in_progress",
      "priority": "urgent",
      "property": {
        "id": "uuid",
        "name": "Ocean View Towers",
        "address": "Cantonments, Accra"
      },
      "unit": {
        "id": "uuid",
        "unit_number": "A01"
      },
      "tenant": {
        "id": "uuid",
        "name": "Akosua Frimpong",
        "phone": "+233244900123"
      },
      "landlord": {
        "id": "uuid",
        "name": "John Kwame Asante"
      },
      "caretaker": {
        "id": "uuid",
        "name": "Samuel Mensah",
        "phone": "+233244800123"
      },
      "category": {
        "id": "uuid",
        "name": "Plumbing",
        "icon": "🔧",
        "color": "#2563eb",
        "urgency_level": "urgent"
      },
      "estimated_cost": 350.00,
      "actual_cost": null,
      "requires_approval": true,
      "approved_at": "2025-10-21T10:00:00.000000Z",
      "preferred_start_date": "2025-10-26T00:00:00.000000Z",
      "scheduled_date": "2025-10-26T09:00:00.000000Z",
      "started_at": "2025-10-26T09:30:00.000000Z",
      "completed_at": null,
      "resolved_at": null,
      "resolution_time_hours": null,
      "tenant_rating": null,
      "tenant_feedback": null,
      "created_at": "2025-10-20T16:25:06.000000Z",
      "updated_at": "2025-10-26T09:30:00.000000Z",
      "updates": [
        {
          "id": "uuid",
          "update_type": "status_change",
          "previous_status": "received",
          "new_status": "assigned",
          "note": "Request assigned to caretaker.",
          "created_by": {
            "id": "uuid",
            "name": "John Kwame Asante",
            "role": "landlord"
          },
          "is_internal": false,
          "created_at": "2025-10-20T18:25:06.000000Z"
        }
      ],
      "media": []
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 5
  }
}
```

### Get Specific Maintenance Request
```http
GET /api/maintenance/requests/{requestId}
Authorization: Bearer {token}
```

**Response (200):** Same structure as single request above

### Create Maintenance Request
```http
POST /api/maintenance/requests
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body:**
```
title: Kitchen Sink Leaking
description: The kitchen sink has been leaking water continuously...
priority: urgent
category_id: uuid
unit_id: uuid (optional, will use tenant's current unit if not provided)
preferred_start_date: 2025-11-20 (optional)
media[]: (file - optional, can attach multiple images/videos)
```

**Response (201):**
```json
{
  "success": true,
  "message": "Maintenance request created successfully",
  "data": {
    "id": "uuid",
    "request_number": "MNT-000013",
    "title": "Kitchen Sink Leaking",
    "status": "received",
    "priority": "urgent",
    "estimated_cost": null,
    "requires_approval": true,
    "created_at": "2025-11-12T10:00:00.000000Z"
  }
}
```

### Add Note to Maintenance Request
```http
POST /api/maintenance/requests/{requestId}/notes
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "note": "The leak has gotten worse. Please attend to it urgently.",
  "is_internal": false
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Note added successfully",
  "data": {
    "id": "uuid",
    "update_type": "note",
    "note": "The leak has gotten worse. Please attend to it urgently.",
    "created_by": {
      "id": "uuid",
      "name": "Akosua Frimpong",
      "role": "tenant"
    },
    "is_internal": false,
    "created_at": "2025-11-12T14:30:00.000000Z"
  }
}
```

### Get Maintenance Request Statistics
```http
GET /api/maintenance/requests/statistics
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_requests": 5,
    "by_status": {
      "received": 1,
      "assigned": 0,
      "in_progress": 2,
      "pending_approval": 0,
      "approved": 0,
      "resolved": 1,
      "closed": 1
    },
    "by_priority": {
      "low": 0,
      "normal": 2,
      "urgent": 2,
      "emergency": 1
    },
    "average_resolution_time_hours": 48,
    "response_rate": "80%",
    "satisfaction_rating": 4.5
  }
}
```

---

## 📝 Common Response Codes

| Code | Meaning |
|------|---------|
| 200  | Success |
| 201  | Created |
| 400  | Bad Request |
| 401  | Unauthorized (not logged in) |
| 403  | Forbidden (no permission) |
| 404  | Not Found |
| 422  | Validation Error |
| 500  | Server Error |

---

## 🔒 Authorization Notes

- All endpoints require `Authorization: Bearer {token}` header
- Tenants can only access their own data
- Attempting to access other tenant's data will return 403 Forbidden
- Token expires after inactivity (configurable in backend)

---

## 📱 Example Frontend Integration

### JavaScript/Axios Example

```javascript
// Login and store token
const login = async (email, password) => {
  const response = await axios.post('http://your-domain.com/api/login', {
    email,
    password
  });
  
  // Store token
  localStorage.setItem('token', response.data.token);
  localStorage.setItem('user', JSON.stringify(response.data.user));
  
  return response.data;
};

// Create axios instance with auth
const api = axios.create({
  baseURL: 'http://your-domain.com/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add token to all requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get dashboard data
const getDashboard = async () => {
  const response = await api.get('/analytics/dashboard');
  return response.data;
};

// Get invoices
const getInvoices = async (status = null) => {
  const params = status ? { status } : {};
  const response = await api.get('/invoices', { params });
  return response.data;
};

// Create maintenance request
const createMaintenanceRequest = async (formData) => {
  const response = await api.post('/maintenance/requests', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};
```

---

## 🎯 Test Credentials

Use these credentials from your seeded database:

| Email | Password | Description |
|-------|----------|-------------|
| tenant1@pms.com | Tenant123! | First tenant |
| tenant2@pms.com | Tenant123! | Second tenant |
| tenant3@pms.com | Tenant123! | Third tenant |
| demo@pms.com | Demo123! | Demo tenant account |

---

## 🚀 Quick Start Checklist

1. ✅ Login with tenant credentials
2. ✅ Get profile information
3. ✅ Fetch dashboard summary
4. ✅ View current lease details
5. ✅ Check pending invoices
6. ✅ View payment history
7. ✅ Create a maintenance request
8. ✅ View maintenance request status

---

## 💡 Best Practices

1. **Always check response status** before processing data
2. **Handle token expiration** - redirect to login on 401
3. **Show loading states** during API calls
4. **Cache user data** locally to reduce API calls
5. **Implement refresh mechanism** for real-time updates
6. **Validate data** before sending to API
7. **Handle errors gracefully** with user-friendly messages
8. **Use debouncing** for search/filter inputs

---

**Need help?** Check the backend logs or contact the development team.

**API Version:** 1.0  
**Last Updated:** November 12, 2025

