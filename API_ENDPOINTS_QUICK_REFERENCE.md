# 🔗 API Endpoints Quick Reference

## Authentication Required
All endpoints require `Authorization: Bearer {token}` header.

---

## 👥 User Management

### Create User (Caretaker/Tenant)
```http
POST /api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "password_confirmation": "SecurePass123!",
  "role": "caretaker" | "tenant",
  "phone": "+233244567890",
  "address": "123 Main St" (optional),
  "bio": "Additional info" (optional)
}

Response: 200 OK
{
  "Success": true,
  "Data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "caretaker",
      "phone": "+233244567890",
      "created_at": "2025-11-19T..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  },
  "Message": "User created successfully"
}
```

### Get All Users (Landlord)
```http
GET /api/users?role=caretaker|tenant&is_active=true&per_page=50&page=1

Response: 200 OK
{
  "Success": true,
  "Data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "caretaker",
      "phone": "+233244567890",
      ...
    }
  ]
}
```

---

## 🏢 Property Management

### Create Property
```http
POST /api/properties
Content-Type: application/json

{
  "name": "Sunset Apartments",
  "street_address": "123 Independence Avenue, Accra",
  "ghana_post_gps_address": "GA-123-4567" (optional),
  "description": "Modern apartments" (optional),
  "caretaker_id": "uuid" (optional)
}

Response: 200 OK
{
  "Success": true,
  "Data": {
    "id": "uuid",
    "name": "Sunset Apartments",
    "street_address": "123 Independence Avenue, Accra",
    "ghana_post_gps_address": "GA-123-4567",
    "landlord_id": "uuid",
    "caretaker_id": "uuid",
    "verification_status": "verified",
    "is_active": true,
    "created_at": "2025-11-19T..."
  },
  "Message": "Property created successfully"
}
```

### Get All Properties (Landlord)
```http
GET /api/properties

Response: 200 OK
{
  "Success": true,
  "Data": [
    {
      "id": "uuid",
      "name": "Sunset Apartments",
      "street_address": "123 Independence Avenue, Accra",
      "caretaker_id": "uuid",
      ...
    }
  ]
}
```

### Assign Caretaker to Property
```http
PATCH /api/properties/{property-id}/assign-caretaker
Content-Type: application/json

{
  "caretaker_id": "uuid" | null
}

Response: 200 OK
{
  "Success": true,
  "Data": {
    "id": "uuid",
    "name": "Sunset Apartments",
    "caretaker_id": "uuid",
    "caretaker": {
      "id": "uuid",
      "name": "John Caretaker",
      "email": "john@example.com",
      "role": "caretaker"
    },
    ...
  },
  "Message": "Caretaker assigned to property successfully"
}
```

---

## 🏠 Unit Management

### Create Unit
```http
POST /api/properties/{property-id}/units
Content-Type: application/json

{
  "unit_number": "A101",
  "unit_type": "studio" | "1bedroom" | "2bedroom" | "3bedroom" | "4bedroom" | "penthouse",
  "rental_amount": 1200.00,
  "floor_number": 1 (optional),
  "description": "Spacious unit" (optional)
}

Response: 200 OK
{
  "Success": true,
  "Data": {
    "id": "uuid",
    "property_id": "uuid",
    "unit_number": "A101",
    "unit_type": "2bedroom",
    "rental_amount": 1200.00,
    "floor_number": 1,
    "tenant_id": null,
    "is_occupied": false,
    "is_active": true,
    "created_at": "2025-11-19T..."
  },
  "Message": "Unit created successfully"
}
```

### Get All Units (Landlord)
```http
GET /api/units?property_id=uuid&is_occupied=false&per_page=50&page=1

Response: 200 OK
{
  "Success": true,
  "Data": [
    {
      "id": "uuid",
      "property_id": "uuid",
      "unit_number": "A101",
      "unit_type": "2bedroom",
      "rental_amount": 1200.00,
      "tenant_id": null,
      "is_occupied": false,
      ...
    }
  ]
}
```

### Assign Tenant to Unit
```http
PATCH /api/properties/{property-id}/units/{unit-id}/assign
Content-Type: application/json

{
  "tenant_id": "uuid" | null
}

Response: 200 OK
{
  "Success": true,
  "Data": {
    "id": "uuid",
    "property_id": "uuid",
    "unit_number": "A101",
    "tenant_id": "uuid",
    "is_occupied": true,
    "tenant": {
      "id": "uuid",
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "role": "tenant"
    },
    ...
  },
  "Message": "Tenant assigned to unit successfully"
}
```

---

## 🔄 Complete Workflow API Calls

### Step 1: Create Caretaker
```bash
POST /api/users
{
  "name": "John Caretaker",
  "email": "john.caretaker@example.com",
  "password": "SecurePass123!",
  "password_confirmation": "SecurePass123!",
  "role": "caretaker",
  "phone": "+233244567890"
}
```

### Step 2: Create Property
```bash
POST /api/properties
{
  "name": "Sunset Apartments",
  "street_address": "123 Main Street",
  "ghana_post_gps_address": "GA-123-4567"
}
```

### Step 3: Assign Caretaker to Property
```bash
PATCH /api/properties/{property-id}/assign-caretaker
{
  "caretaker_id": "{caretaker-uuid}"
}
```

### Step 4: Create Unit
```bash
POST /api/properties/{property-id}/units
{
  "unit_number": "A101",
  "unit_type": "2bedroom",
  "rental_amount": 1200.00
}
```

### Step 5: Create Tenant
```bash
POST /api/users
{
  "name": "Alice Johnson",
  "email": "alice.johnson@example.com",
  "password": "SecurePass123!",
  "password_confirmation": "SecurePass123!",
  "role": "tenant",
  "phone": "+233244123456"
}
```

### Step 6: Assign Tenant to Unit
```bash
PATCH /api/properties/{property-id}/units/{unit-id}/assign
{
  "tenant_id": "{tenant-uuid}"
}
```

---

## ⚠️ Common Error Responses

### 404 Not Found
```json
{
  "Success": false,
  "Message": "Resource not found"
}
```
**Cause:** Endpoint doesn't exist or backend is not running.

### 401 Unauthorized
```json
{
  "Success": false,
  "Message": "Unauthenticated"
}
```
**Cause:** Missing or invalid auth token.

### 403 Forbidden
```json
{
  "Success": false,
  "Message": "You are not authorized to perform this action"
}
```
**Cause:** User doesn't have permission for this action.

### 422 Validation Error
```json
{
  "Success": false,
  "Message": "Validation failed",
  "Errors": {
    "email": ["The email has already been taken."],
    "password": ["The password must be at least 8 characters."]
  }
}
```
**Cause:** Invalid input data.

### 500 Server Error
```json
{
  "Success": false,
  "Message": "Internal server error"
}
```
**Cause:** Backend server error.

---

## 🔧 Testing with cURL

### Test Backend is Running
```bash
curl http://127.0.0.1:8000/api
```

### Test User Creation (with auth token)
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

### Test Property Creation
```bash
curl -X POST http://127.0.0.1:8000/api/properties \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Property",
    "street_address": "123 Test Street",
    "ghana_post_gps_address": "GA-123-4567"
  }'
```

---

## 📝 Notes

1. **All responses use uppercase keys**: `Success`, `Data`, `Message`, `Errors`
2. **Frontend normalizes to lowercase**: `success`, `data`, `message`, `errors`
3. **UUIDs are used** for all IDs (not integers)
4. **Timestamps are ISO 8601 format**: `2025-11-19T10:30:00.000000Z`
5. **Phone numbers** should include country code: `+233244567890`
6. **Passwords** must be at least 8 characters
7. **Email addresses** must be unique across all users

---

**Last Updated:** November 19, 2025  
**API Version:** 1.0  
**Base URL:** `http://127.0.0.1:8000/api` (default)

