# 🏢 Landlord Property & Unit Management API Endpoints

Complete documentation for property and unit management endpoints available to landlords.

---

## Table of Contents
1. [Assign Caretaker to Property](#1-assign-caretaker-to-property)
2. [Create Units for a Property](#2-create-units-for-a-property)
3. [Assign Tenant to a Unit](#3-assign-tenant-to-a-unit)
4. [Disable Property](#4-disable-property)
5. [Disable Unit](#5-disable-unit)

---

## 1. Assign Caretaker to Property

### Endpoint Details
- **URL:** `/api/properties/{property}/assign-caretaker`
- **Method:** `PATCH`
- **Authentication:** Required (Bearer Token)
- **Authorization:** Landlords (own properties), Super Admins (all properties)

### Description
Assigns a caretaker to a specific property or removes the current caretaker assignment. The caretaker will be responsible for managing and maintaining the property.

### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| property | UUID | Yes | The unique identifier of the property |

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| caretaker_id | UUID/null | Yes | The unique identifier of the caretaker user, or null to remove |

### Request Example

**Assign Caretaker:**
```json
{
  "caretaker_id": "9d4f5c8a-3b2e-4d7c-9a1f-6e8b5d4c3a2b"
}
```

**Remove Caretaker:**
```json
{
  "caretaker_id": null
}
```

### Success Response (200 OK)
```json
{
  "Success": true,
  "Data": {
    "id": "9d4f5c8a-3b2e-4d7c-9a1f-6e8b5d4c3a2b",
    "name": "Sunset Apartments",
    "description": "Modern apartments in the city center",
    "street_address": "123 Main Street",
    "ghana_post_gps_address": "GA-123-4567",
    "landlord_id": "8c3e4d7a-2b1f-3c6d-8a0e-5d7b4c3a2b1c",
    "caretaker_id": "7b2d3c6a-1a0e-2b5c-7a9d-4c6b3a2b1c0d",
    "verification_status": "verified",
    "is_active": true,
    "created_at": "2025-01-15T10:30:00.000000Z",
    "updated_at": "2025-01-15T14:20:00.000000Z",
    "caretaker": {
      "id": "7b2d3c6a-1a0e-2b5c-7a9d-4c6b3a2b1c0d",
      "name": "John Caretaker",
      "email": "john.caretaker@example.com",
      "role": "caretaker",
      "phone": "+233244567890"
    }
  },
  "Message": "Caretaker assigned to property successfully"
}
```

### Error Responses

**403 Forbidden:**
```json
{
  "Success": false,
  "Message": "You are not authorized to assign caretakers to properties."
}
```

**422 Validation Error:**
```json
{
  "Success": false,
  "Message": "Validation failed",
  "Errors": {
    "caretaker_id": ["The selected user is not a caretaker."]
  }
}
```

### cURL Example
```bash
curl -X PATCH "https://api.example.com/api/properties/9d4f5c8a-3b2e-4d7c-9a1f-6e8b5d4c3a2b/assign-caretaker" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"caretaker_id": "7b2d3c6a-1a0e-2b5c-7a9d-4c6b3a2b1c0d"}'
```

### Notes
- Landlords can only assign their own caretakers (where caretaker's landlord_id matches)
- A property can only have one caretaker at a time
- Assigning a new caretaker replaces the existing one

---

## 2. Create Units for a Property

### Endpoint Details
- **URL:** `/api/properties/{property}/units`
- **Method:** `POST`
- **Authentication:** Required (Bearer Token)
- **Authorization:** Landlords (own properties), Super Admins (all properties)

### Description
Creates a new unit within a specific property. Units represent individual rental spaces like apartments, rooms, or commercial spaces.

### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| property | UUID | Yes | The unique identifier of the property |

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| unit_number | string | Yes | Unique identifier for the unit (e.g., "A101", "Suite 205") |
| unit_type | string | Yes | Type of unit (studio, 1bedroom, 2bedroom, 3bedroom, commercial, other) |
| rental_amount | decimal | No | Monthly rental amount |
| description | text | No | Description of the unit |
| floor_number | integer | No | Floor number where unit is located |
| is_furnished | boolean | No | Whether the unit is furnished (default: false) |
| utilities_included | boolean | No | Whether utilities are included in rent (default: false) |
| is_active | boolean | No | Whether the unit is active (default: true) |

### Request Example
```json
{
  "unit_number": "A101",
  "unit_type": "2bedroom",
  "rental_amount": 1200.00,
  "description": "Spacious 2-bedroom unit with balcony",
  "floor_number": 1,
  "is_furnished": true,
  "utilities_included": false,
  "is_active": true
}
```

### Success Response (201 Created)
```json
{
  "Success": true,
  "Data": {
    "id": "6a1c2b5a-0a9d-1b4c-6a8c-3b5a2b1c0d9e",
    "property_id": "9d4f5c8a-3b2e-4d7c-9a1f-6e8b5d4c3a2b",
    "unit_number": "A101",
    "unit_type": "2bedroom",
    "rental_amount": "1200.00",
    "description": "Spacious 2-bedroom unit with balcony",
    "floor_number": 1,
    "is_furnished": true,
    "utilities_included": false,
    "is_active": true,
    "is_occupied": false,
    "tenant_id": null,
    "caretaker_id": null,
    "created_at": "2025-01-15T10:30:00.000000Z",
    "updated_at": "2025-01-15T10:30:00.000000Z",
    "property": {
      "id": "9d4f5c8a-3b2e-4d7c-9a1f-6e8b5d4c3a2b",
      "name": "Sunset Apartments",
      "street_address": "123 Main Street"
    }
  },
  "Message": "Unit created successfully"
}
```

### Error Responses

**403 Forbidden:**
```json
{
  "Success": false,
  "Message": "You do not have permission to create units for this property"
}
```

**422 Validation Error:**
```json
{
  "Success": false,
  "Message": "Validation failed",
  "Errors": {
    "unit_number": ["The unit number has already been taken for this property."],
    "unit_type": ["The selected unit type is invalid."]
  }
}
```

### cURL Example
```bash
curl -X POST "https://api.example.com/api/properties/9d4f5c8a-3b2e-4d7c-9a1f-6e8b5d4c3a2b/units" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "unit_number": "A101",
    "unit_type": "2bedroom",
    "rental_amount": 1200.00,
    "description": "Spacious 2-bedroom unit with balcony",
    "floor_number": 1,
    "is_furnished": true
  }'
```

### Valid Unit Types
- `studio` - Studio apartment
- `1bedroom` - One bedroom unit
- `2bedroom` - Two bedroom unit
- `3bedroom` - Three bedroom unit
- `commercial` - Commercial space
- `other` - Other type

### Notes
- Unit number must be unique within the property
- Rental amount should be in decimal format (e.g., 1200.00)
- Landlords can only create units for their own properties

---

## 3. Assign Tenant to a Unit

### Endpoint Details
- **URL:** `/api/properties/{property}/units/{unit}/assign`
- **Method:** `PATCH`
- **Authentication:** Required (Bearer Token)
- **Authorization:** Landlords (own properties), Super Admins (all properties)

### Description
Assigns a tenant or caretaker to a specific unit, or removes the current assignment. This endpoint can be used to manage unit occupancy.

### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| property | UUID | Yes | The unique identifier of the property |
| unit | UUID | Yes | The unique identifier of the unit |

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| tenant_id | UUID/null | No | The unique identifier of the tenant user, or null to remove |
| caretaker_id | UUID/null | No | The unique identifier of the caretaker user, or null to remove |

### Request Examples

**Assign Tenant to Unit:**
```json
{
  "tenant_id": "5a8b7c6d-4e3f-2a1b-0c9d-8e7f6a5b4c3d"
}
```

**Assign Caretaker to Unit:**
```json
{
  "caretaker_id": "7b2d3c6a-1a0e-2b5c-7a9d-4c6b3a2b1c0d"
}
```

**Assign Both:**
```json
{
  "tenant_id": "5a8b7c6d-4e3f-2a1b-0c9d-8e7f6a5b4c3d",
  "caretaker_id": "7b2d3c6a-1a0e-2b5c-7a9d-4c6b3a2b1c0d"
}
```

**Remove Tenant:**
```json
{
  "tenant_id": null
}
```

### Success Response (200 OK)
```json
{
  "Success": true,
  "Data": {
    "id": "6a1c2b5a-0a9d-1b4c-6a8c-3b5a2b1c0d9e",
    "property_id": "9d4f5c8a-3b2e-4d7c-9a1f-6e8b5d4c3a2b",
    "unit_number": "A101",
    "unit_type": "2bedroom",
    "rental_amount": "1200.00",
    "is_active": true,
    "is_occupied": true,
    "tenant_id": "5a8b7c6d-4e3f-2a1b-0c9d-8e7f6a5b4c3d",
    "caretaker_id": "7b2d3c6a-1a0e-2b5c-7a9d-4c6b3a2b1c0d",
    "created_at": "2025-01-15T10:30:00.000000Z",
    "updated_at": "2025-01-15T14:45:00.000000Z",
    "property": {
      "id": "9d4f5c8a-3b2e-4d7c-9a1f-6e8b5d4c3a2b",
      "name": "Sunset Apartments"
    },
    "tenant": {
      "id": "5a8b7c6d-4e3f-2a1b-0c9d-8e7f6a5b4c3d",
      "name": "Alice Johnson",
      "email": "alice.johnson@example.com",
      "phone": "+233244123456"
    },
    "caretaker": {
      "id": "7b2d3c6a-1a0e-2b5c-7a9d-4c6b3a2b1c0d",
      "name": "John Caretaker",
      "email": "john.caretaker@example.com"
    }
  },
  "Message": "Unit assignment updated successfully"
}
```

### Error Responses

**400 Bad Request:**
```json
{
  "Success": false,
  "Message": "This unit does not belong to the specified property"
}
```

**422 Validation Error:**
```json
{
  "Success": false,
  "Message": "Validation failed",
  "Errors": {
    "unit": ["Cannot assign a disabled unit."]
  }
}
```

### cURL Example
```bash
curl -X PATCH "https://api.example.com/api/properties/9d4f5c8a-3b2e-4d7c-9a1f-6e8b5d4c3a2b/units/6a1c2b5a-0a9d-1b4c-6a8c-3b5a2b1c0d9e/assign" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "5a8b7c6d-4e3f-2a1b-0c9d-8e7f6a5b4c3d"
  }'
```

### Notes
- Assigning a tenant automatically marks the unit as occupied
- Removing a tenant (null) marks the unit as vacant
- Unit must be active to be assigned
- Landlords can only assign tenants to their own properties

---

## 4. Disable Property

### Endpoint Details
- **URL:** `/api/properties/{property}/disable`
- **Method:** `PATCH`
- **Authentication:** Required (Bearer Token)
- **Authorization:** Landlords (own properties), Super Admins (all properties)

### Description
Disables a property, preventing it from being used for new leases or assignments. A property can only be disabled if it has no active tenants.

### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| property | UUID | Yes | The unique identifier of the property |

### Request Body
No request body required.

### Request Example
```bash
# No body needed
```

### Success Response (200 OK)
```json
{
  "Success": true,
  "Data": {
    "id": "9d4f5c8a-3b2e-4d7c-9a1f-6e8b5d4c3a2b",
    "name": "Sunset Apartments",
    "description": "Modern apartments in the city center",
    "street_address": "123 Main Street",
    "ghana_post_gps_address": "GA-123-4567",
    "landlord_id": "8c3e4d7a-2b1f-3c6d-8a0e-5d7b4c3a2b1c",
    "caretaker_id": "7b2d3c6a-1a0e-2b5c-7a9d-4c6b3a2b1c0d",
    "verification_status": "verified",
    "is_active": false,
    "created_at": "2025-01-15T10:30:00.000000Z",
    "updated_at": "2025-01-15T16:00:00.000000Z",
    "landlord": {
      "id": "8c3e4d7a-2b1f-3c6d-8a0e-5d7b4c3a2b1c",
      "name": "Jane Landlord",
      "email": "jane.landlord@example.com"
    },
    "caretaker": {
      "id": "7b2d3c6a-1a0e-2b5c-7a9d-4c6b3a2b1c0d",
      "name": "John Caretaker",
      "email": "john.caretaker@example.com"
    },
    "units": []
  },
  "Message": "Property disabled successfully"
}
```

### Error Responses

**403 Forbidden:**
```json
{
  "Success": false,
  "Message": "Validation failed",
  "Errors": {
    "authorization": ["You are not authorized to disable this property."]
  }
}
```

**422 Validation Error:**
```json
{
  "Success": false,
  "Message": "Validation failed",
  "Errors": {
    "property": ["Cannot disable property with active tenants."]
  }
}
```

### cURL Example
```bash
curl -X PATCH "https://api.example.com/api/properties/9d4f5c8a-3b2e-4d7c-9a1f-6e8b5d4c3a2b/disable" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### Notes
- Property must have no active tenants before it can be disabled
- Disabled properties cannot accept new leases or unit assignments
- Landlords can only disable their own properties
- To re-enable, you would need to update the property directly

---

## 5. Disable Unit

### Endpoint Details
- **URL:** `/api/units/{unit}/disable`
- **Method:** `PATCH`
- **Authentication:** Required (Bearer Token)
- **Authorization:** Landlords (own properties), Super Admins (all properties)

### Description
Disables a specific unit, preventing it from being used for new leases. You can provide a reason for disabling the unit (e.g., maintenance, renovation).

### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| unit | UUID | Yes | The unique identifier of the unit |

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| reason | string | Yes | Reason for disabling the unit |

### Request Example
```json
{
  "reason": "Unit under renovation"
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "6a1c2b5a-0a9d-1b4c-6a8c-3b5a2b1c0d9e",
    "property_id": "9d4f5c8a-3b2e-4d7c-9a1f-6e8b5d4c3a2b",
    "unit_number": "A101",
    "unit_type": "2bedroom",
    "rental_amount": "1200.00",
    "is_active": false,
    "is_occupied": false,
    "disabled_reason": "Unit under renovation",
    "disabled_at": "2025-01-15T16:30:00.000000Z",
    "disabled_by": "8c3e4d7a-2b1f-3c6d-8a0e-5d7b4c3a2b1c",
    "created_at": "2025-01-15T10:30:00.000000Z",
    "updated_at": "2025-01-15T16:30:00.000000Z",
    "property": {
      "id": "9d4f5c8a-3b2e-4d7c-9a1f-6e8b5d4c3a2b",
      "name": "Sunset Apartments"
    },
    "disabledBy": {
      "id": "8c3e4d7a-2b1f-3c6d-8a0e-5d7b4c3a2b1c",
      "name": "Jane Landlord",
      "email": "jane.landlord@example.com"
    }
  },
  "message": "Unit disabled successfully"
}
```

### Error Responses

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "authorization": ["You can only disable units from your own properties."]
  }
}
```

**422 Validation Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "unit": ["This unit is already disabled."],
    "reason": ["The reason field is required."]
  }
}
```

### cURL Example
```bash
curl -X PATCH "https://api.example.com/api/units/6a1c2b5a-0a9d-1b4c-6a8c-3b5a2b1c0d9e/disable" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Unit under renovation"
  }'
```

### Notes
- A reason must be provided for disabling a unit
- Disabled units cannot accept new leases or tenant assignments
- Landlords can only disable units from their own properties
- The system tracks who disabled the unit and when
- To re-enable a unit, use the endpoint: `PATCH /api/units/{unit}/enable`

---

## Common Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created successfully |
| 400 | Bad Request - Invalid parameters |
| 403 | Forbidden - Not authorized |
| 422 | Validation Error - Invalid data |
| 500 | Internal Server Error |

---

## Authentication

All endpoints require authentication using Laravel Sanctum Bearer tokens.

**Header Format:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**How to Get Token:**
1. Login via `POST /api/login`
2. Use the returned token in all subsequent requests

---

## Rate Limiting

All endpoints are rate-limited to:
- **6 requests per minute** for property and unit creation/modification endpoints
- Exceeding the limit returns `429 Too Many Requests`

---

## Best Practices

1. **Property Setup Flow:**
   - Create property first
   - Create caretaker user
   - Assign caretaker to property
   - Create units for the property
   - Create tenant users
   - Assign tenants to units

2. **Error Handling:**
   - Always check the `Success` field in responses
   - Handle validation errors from the `Errors` object
   - Implement retry logic for 500 errors

3. **Data Validation:**
   - Validate UUIDs on client-side before sending
   - Ensure unit numbers are unique within a property
   - Check property ownership before operations

4. **Security:**
   - Never expose bearer tokens in URLs
   - Store tokens securely (e.g., httpOnly cookies)
   - Implement token refresh mechanisms

---

## Complete Workflow Example

### Step 1: Create Property
```bash
POST /api/properties
{
  "name": "Sunset Apartments",
  "street_address": "123 Main Street",
  "ghana_post_gps_address": "GA-123-4567"
}
```

### Step 2: Create Caretaker
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

### Step 3: Assign Caretaker to Property
```bash
PATCH /api/properties/{property-id}/assign-caretaker
{
  "caretaker_id": "caretaker-uuid"
}
```

### Step 4: Create Units
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
  "tenant_id": "tenant-uuid"
}
```

---

## Support

For additional support or questions:
- Check the main API documentation
- Review the Postman collection
- Contact the development team

---

**Last Updated:** November 17, 2025  
**API Version:** 1.0  
**Documentation Version:** 1.0

