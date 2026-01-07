# Backend API Requirements: Maintenance Request Bulk Operations & Enhanced Features

## Overview
This document outlines the backend API requirements to support the new maintenance request bulk operations, advanced filtering, sorting, and pagination features implemented in the frontend.

**Note:** These new endpoints should be added to the existing maintenance routes structure (`/api/maintenance`). The existing routes remain unchanged for backward compatibility.

**See `BACKEND_ROUTES_MAPPING.md` for a complete mapping of existing routes and what needs to be added.**

---

## 1. New Bulk Operations Endpoints

### 1.1 Bulk Assign Maintenance Requests

**Endpoint:** `POST /api/maintenance/requests/bulk/assign`

**Access Control:** Landlords, Super Admins only

**Request Body:**
```json
{
  "request_ids": ["uuid1", "uuid2", "uuid3"],
  "assignee_id": "uuid-of-assignee",
  "assignee_type": "caretaker" | "artisan" | "landlord",
  "note": "Optional assignment note",
  "scheduled_date": "2026-01-15", // Optional
  "priority": "low" | "normal" | "urgent" | "emergency" // Optional, updates priority if provided
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully assigned 3 request(s)",
  "data": {
    "assigned_count": 3,
    "failed_count": 0,
    "failed_requests": []
  }
}
```

**Validation:**
- All `request_ids` must exist and be valid UUIDs
- `assignee_id` must exist and match the `assignee_type`
- `assignee_type` must be one of: `caretaker`, `artisan`, `landlord`
- All requests must be in a state that allows assignment (e.g., `approved`, `pending`)
- If a request cannot be assigned, include it in `failed_requests` with a reason

**Business Logic:**
- Update `assigned_to_id` and `assigned_to_type` for all valid requests
- Set `assigned_at` timestamp
- Update status to `assigned` if currently `approved` or `pending`
- Add assignment note if provided
- Send notifications to assignees
- Update SLA deadlines if applicable

---

### 1.2 Bulk Update Status

**Endpoint:** `POST /api/maintenance/requests/bulk/status`

**Request Body:**
```json
{
  "request_ids": ["uuid1", "uuid2", "uuid3"],
  "status": "pending" | "under_review" | "approved" | "rejected" | "assigned" | "in_progress" | "completed" | "rework_required" | "closed" | "escalated" | "cancelled",
  "note": "Optional status change note"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully updated status for 3 request(s)",
  "data": {
    "updated_count": 3,
    "failed_count": 0,
    "failed_requests": [
      {
        "request_id": "uuid4",
        "reason": "Invalid status transition from 'completed' to 'pending'"
      }
    ]
  }
}
```

**Validation:**
- All `request_ids` must exist
- `status` must be a valid maintenance status
- Validate status transitions using workflow rules (see maintenance workflow documentation)
- Only update requests where the transition is valid

**Business Logic:**
- Validate status transitions for each request
- Update `status` and `updated_at` timestamp
- Add status change note if provided
- Update SLA tracking if applicable
- Send notifications to relevant parties (tenant, landlord, assignee)
- Log status changes for audit trail

---

### 1.3 Bulk Update Priority

**Endpoint:** `POST /api/maintenance/requests/bulk/priority`

**Request Body:**
```json
{
  "request_ids": ["uuid1", "uuid2", "uuid3"],
  "priority": "low" | "normal" | "urgent" | "emergency"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully updated priority for 3 request(s)",
  "data": {
    "updated_count": 3,
    "failed_count": 0,
    "failed_requests": []
  }
}
```

**Validation:**
- All `request_ids` must exist
- `priority` must be one of: `low`, `normal`, `urgent`, `emergency`

**Business Logic:**
- Update `priority` field for all requests
- Recalculate SLA deadlines if priority affects deadlines
- Send notifications if priority is upgraded to `urgent` or `emergency`
- Update `updated_at` timestamp

---

## 2. Enhanced Filtering & Search

### 2.1 Updated GET Endpoint with Advanced Filters

**Endpoint:** `GET /api/maintenance/requests`

**Query Parameters:**

#### Basic Filters (existing)
- `status` - Single status filter (for backward compatibility)
- `priority` - Single priority filter (for backward compatibility)
- `search` - Text search (searches title, request_number, description, category name)

#### Advanced Filters (new)
- `status[]` - Array of statuses to filter by (e.g., `status[]=pending&status[]=approved`)
- `priority[]` - Array of priorities to filter by (e.g., `priority[]=urgent&priority[]=emergency`)
- `property_id` - Filter by property ID
- `category_id` - Filter by category ID
- `assigned_to` - Filter by assignee ID (caretaker, artisan, or landlord)
- `escalated` - Boolean: `true` to show only escalated requests
- `date_from` - Filter requests created on or after this date (ISO 8601 format)
- `date_to` - Filter requests created on or before this date (ISO 8601 format)
- `cost_min` - Minimum cost (actual_cost or estimated_cost)
- `cost_max` - Maximum cost (actual_cost or estimated_cost)
- `sla_status` - Filter by SLA status: `on_time`, `approaching`, `overdue`, `met`

**Example Request:**
```
GET /api/maintenance/requests?status[]=pending&status[]=approved&priority[]=urgent&property_id=uuid&date_from=2026-01-01&escalated=true
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "request_number": "MR-2026-001",
      "title": "Leaky faucet",
      "status": "pending",
      "priority": "urgent",
      "category": {
        "id": "uuid",
        "name": "Plumbing"
      },
      "property": {
        "id": "uuid",
        "name": "Property Name"
      },
      "assigned_to": {
        "id": "uuid",
        "name": "John Doe",
        "type": "caretaker"
      },
      "escalated": false,
      "sla_response_deadline": "2026-01-05T12:00:00Z",
      "sla_assignment_deadline": "2026-01-06T12:00:00Z",
      "sla_completion_deadline": "2026-01-10T12:00:00Z",
      "actual_cost": 150.00,
      "estimated_cost": 200.00,
      "created_at": "2026-01-01T10:00:00Z",
      "updated_at": "2026-01-02T14:30:00Z"
    }
  ],
  "meta": {
    "total": 25,
    "per_page": 12,
    "current_page": 1,
    "last_page": 3
  }
}
```

---

## 3. Sorting

**Query Parameters:**
- `sort_by` - Field to sort by: `created_at`, `updated_at`, `priority`, `status`, `title`, `cost`
- `sort_direction` - Sort direction: `asc` or `desc` (default: `desc`)

**Example:**
```
GET /api/maintenance/requests?sort_by=priority&sort_direction=desc
```

**Sorting Logic:**
- `created_at` / `updated_at`: Sort by timestamp
- `priority`: Sort by priority order (emergency=4, urgent=3, normal=2, low=1)
- `status`: Alphabetical sort
- `title`: Alphabetical sort (case-insensitive)
- `cost`: Sort by `actual_cost` if available, otherwise `estimated_cost`, otherwise 0

---

## 4. Pagination

**Query Parameters:**
- `page` - Page number (default: 1)
- `per_page` - Items per page (default: 12, max: 100)

**Response Meta:**
```json
{
  "meta": {
    "total": 150,
    "per_page": 12,
    "current_page": 1,
    "last_page": 13,
    "from": 1,
    "to": 12
  }
}
```

---

## 5. Combined Request Example

**Full Request with All Features:**
```
GET /api/maintenance/requests?
  status[]=pending&
  status[]=approved&
  priority[]=urgent&
  property_id=uuid&
  escalated=false&
  date_from=2026-01-01&
  cost_min=100&
  cost_max=500&
  sort_by=priority&
  sort_direction=desc&
  page=1&
  per_page=12
```

---

## 6. Error Responses

### 6.1 Validation Errors
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "request_ids": ["The request_ids field is required."],
    "assignee_type": ["The assignee_type must be one of: caretaker, artisan, landlord."]
  }
}
```

### 6.2 Partial Success (Bulk Operations)
```json
{
  "success": true,
  "message": "Partially completed",
  "data": {
    "assigned_count": 2,
    "failed_count": 1,
    "failed_requests": [
      {
        "request_id": "uuid3",
        "reason": "Request is already in 'completed' status and cannot be reassigned"
      }
    ]
  }
}
```

---

## 7. Database Considerations

### 7.1 Indexes Required
- `maintenance_requests.status` - For status filtering
- `maintenance_requests.priority` - For priority filtering
- `maintenance_requests.property_id` - For property filtering
- `maintenance_requests.category_id` - For category filtering
- `maintenance_requests.assigned_to_id` - For assignee filtering
- `maintenance_requests.created_at` - For date range and sorting
- `maintenance_requests.updated_at` - For sorting
- Composite index: `(status, priority, created_at)` - For common filter combinations

### 7.2 Full-Text Search
Consider implementing full-text search on:
- `title`
- `description`
- `request_number`
- Category name (via join)

---

## 8. Performance Requirements

1. **Bulk Operations:**
   - Process up to 100 requests per bulk operation
   - Use database transactions for atomicity
   - Return results within 5 seconds for 100 requests

2. **Filtering & Search:**
   - Return filtered results within 2 seconds
   - Support pagination efficiently using LIMIT/OFFSET or cursor-based pagination

3. **Caching:**
   - Cache filter options (properties, categories, assignees) for 5 minutes
   - Cache statistics for 1 minute

---

## 9. Notification Requirements

When bulk operations are performed, send notifications for:
- **Bulk Assign:** Notify all assignees about their new assignments
- **Bulk Status Update:** Notify tenants, landlords, and assignees about status changes
- **Bulk Priority Update:** Notify relevant parties if priority is upgraded to `urgent` or `emergency`

---

## 10. Audit Trail

Log all bulk operations with:
- User ID who performed the action
- Timestamp
- Request IDs affected
- Action type (bulk_assign, bulk_status_update, bulk_priority_update)
- Previous and new values
- Success/failure status

---

## 11. Testing Checklist

- [ ] Bulk assign with valid request IDs
- [ ] Bulk assign with invalid request IDs (should fail gracefully)
- [ ] Bulk assign with mixed valid/invalid IDs (partial success)
- [ ] Bulk status update with valid transitions
- [ ] Bulk status update with invalid transitions (should skip invalid ones)
- [ ] Bulk priority update
- [ ] Advanced filtering with multiple statuses
- [ ] Advanced filtering with date ranges
- [ ] Advanced filtering with cost ranges
- [ ] Sorting by all supported fields
- [ ] Pagination with various page sizes
- [ ] Combined filtering, sorting, and pagination
- [ ] Performance with large datasets (1000+ requests)
- [ ] Error handling for invalid parameters
- [ ] Notification delivery for bulk operations

---

## 12. Migration Notes

If implementing incrementally:

1. **Phase 1:** Implement bulk operations endpoints
2. **Phase 2:** Add advanced filtering parameters to existing GET endpoint
3. **Phase 3:** Add sorting support
4. **Phase 4:** Add pagination meta information
5. **Phase 5:** Optimize with indexes and caching

---

## 13. API Versioning

Consider versioning if breaking changes are needed:
- Current: `/api/maintenance/requests`
- New: `/api/v2/maintenance/requests` (if breaking backward compatibility)

---

## 14. Example Laravel Implementation Structure

```php
// Routes
Route::post('/maintenance/requests/bulk/assign', [MaintenanceBulkController::class, 'bulkAssign']);
Route::post('/maintenance/requests/bulk/status', [MaintenanceBulkController::class, 'bulkStatusUpdate']);
Route::post('/maintenance/requests/bulk/priority', [MaintenanceBulkController::class, 'bulkPriorityUpdate']);
Route::get('/maintenance/requests', [MaintenanceRequestController::class, 'index']); // Enhanced with filters

// Controller Methods
public function bulkAssign(Request $request) {
    // Validate request
    // Process bulk assignment
    // Return response
}

public function index(Request $request) {
    // Apply filters
    // Apply sorting
    // Apply pagination
    // Return paginated results
}
```

---

## Summary

The backend needs to support:
1. ✅ Three bulk operation endpoints (assign, status, priority)
2. ✅ Enhanced GET endpoint with advanced filtering
3. ✅ Sorting by multiple fields
4. ✅ Pagination with meta information
5. ✅ Proper error handling and validation
6. ✅ Performance optimizations (indexes, caching)
7. ✅ Notification triggers for bulk operations
8. ✅ Audit trail logging

This will enable the frontend to provide a powerful, efficient maintenance request management experience with bulk operations, advanced filtering, and optimized performance.

