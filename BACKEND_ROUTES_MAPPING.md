# Backend Routes Mapping & Enhancement Requirements

## Overview
This document maps the existing backend maintenance routes to the frontend implementation and outlines what needs to be added or enhanced.

---

## ✅ Existing Routes (Already Implemented)

### General Maintenance Routes (`/api/maintenance`)

#### Categories
- ✅ `GET /api/maintenance/categories` - **Used by:** `useMaintenanceCategories()` hook
- ✅ `GET /api/maintenance/categories/{id}` - Available but not currently used in frontend

#### Requests
- ✅ `GET /api/maintenance/requests` - **Used by:** `useMaintenanceRequests()` hook
  - **Current Usage:** Basic filtering via query params
  - **Needs Enhancement:** Advanced filtering, sorting, pagination (see below)
  
- ✅ `POST /api/maintenance/requests` - **Used by:** `useCreateMaintenanceRequest()` hook
- ✅ `GET /api/maintenance/requests/statistics` - **Used by:** `useMaintenanceStatistics()` hook
- ✅ `GET /api/maintenance/requests/open` - Available but not currently used in frontend
- ✅ `GET /api/maintenance/requests/{id}` - **Used by:** `useMaintenanceRequest()` hook
- ✅ `PATCH /api/maintenance/requests/{id}/status` - **Used by:** Caretaker maintenance service
- ✅ `PATCH /api/maintenance/requests/{id}/approve-reject` - **Used by:** `useApproveRejectMaintenanceRequest()` hook
- ✅ `GET /api/maintenance/requests/{id}/events` - **Used by:** Maintenance approval service
- ✅ `POST /api/maintenance/requests/{id}/notes` - **Used by:** `useAddMaintenanceNote()` hook
- ✅ `PATCH /api/maintenance/requests/{id}/mark-resolution` - **Used by:** `useMarkResolution()` hook

---

## 🆕 New Routes Needed (For Bulk Operations)

### Bulk Operations Endpoints

These endpoints need to be added to support the new bulk operations feature:

#### 1. Bulk Assign
```
POST /api/maintenance/requests/bulk/assign
```
**Access Control:** Landlords, Super Admins only

**Request Body:**
```json
{
  "request_ids": ["uuid1", "uuid2", "uuid3"],
  "assignee_id": "uuid-of-assignee",
  "assignee_type": "caretaker" | "artisan" | "landlord",
  "note": "Optional assignment note",
  "scheduled_date": "2026-01-15", // Optional
  "priority": "low" | "normal" | "urgent" | "emergency" // Optional
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

#### 2. Bulk Status Update
```
POST /api/maintenance/requests/bulk/status
```
**Access Control:** Landlords, Super Admins only

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
    "failed_requests": []
  }
}
```

#### 3. Bulk Priority Update
```
POST /api/maintenance/requests/bulk/priority
```
**Access Control:** Landlords, Super Admins only

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

---

## 🔧 Enhancements Needed for Existing Routes

### Enhanced GET /api/maintenance/requests

The existing `GET /api/maintenance/requests` endpoint needs to support advanced filtering, sorting, and pagination.

#### Current Query Parameters (if any):
- Basic filtering may already exist

#### New Query Parameters Needed:

**Advanced Filtering:**
- `status[]` - Array of statuses (e.g., `status[]=pending&status[]=approved`)
- `priority[]` - Array of priorities (e.g., `priority[]=urgent&priority[]=emergency`)
- `property_id` - Filter by property ID
- `category_id` - Filter by category ID
- `assigned_to` - Filter by assignee ID
- `escalated` - Boolean: `true` for escalated requests only
- `date_from` - Filter requests created on or after this date (ISO 8601)
- `date_to` - Filter requests created on or before this date (ISO 8601)
- `cost_min` - Minimum cost (actual_cost or estimated_cost)
- `cost_max` - Maximum cost (actual_cost or estimated_cost)
- `sla_status` - Filter by SLA status: `on_time`, `approaching`, `overdue`, `met`
- `search` - Full-text search (title, request_number, description, category name)

**Sorting:**
- `sort_by` - Field to sort by: `created_at`, `updated_at`, `priority`, `status`, `title`, `cost`
- `sort_direction` - Sort direction: `asc` or `desc` (default: `desc`)

**Pagination:**
- `page` - Page number (default: 1)
- `per_page` - Items per page (default: 12, max: 100)

#### Enhanced Response Format:

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
    "last_page": 3,
    "from": 1,
    "to": 12
  }
}
```

#### Example Request:
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

## 📋 Implementation Priority

### Phase 1: Critical (Required for Bulk Operations)
1. ✅ Add `POST /api/maintenance/requests/bulk/assign`
2. ✅ Add `POST /api/maintenance/requests/bulk/status`
3. ✅ Add `POST /api/maintenance/requests/bulk/priority`

### Phase 2: Important (Required for Enhanced Filtering)
1. ✅ Enhance `GET /api/maintenance/requests` with:
   - Array-based filtering (`status[]`, `priority[]`)
   - Advanced filters (property_id, category_id, assigned_to, escalated, date ranges, cost ranges, sla_status)
   - Full-text search
   - Sorting (sort_by, sort_direction)
   - Pagination (page, per_page) with meta information

### Phase 3: Nice to Have
1. Add database indexes for performance
2. Implement caching for filter options
3. Add full-text search indexes

---

## 🔍 Frontend Code References

### Bulk Operations Hooks
- **File:** `lib/hooks/use-bulk-maintenance.ts`
- **Endpoints Used:**
  - `POST /maintenance/requests/bulk/assign`
  - `POST /maintenance/requests/bulk/status`
  - `POST /maintenance/requests/bulk/priority`

### Enhanced List Component
- **File:** `components/maintenance/maintenance-request-list-enhanced.tsx`
- **Filters Applied:** All advanced filters are applied client-side currently
- **Note:** Once backend supports filtering, move filtering logic to backend for better performance

### Advanced Filters Component
- **File:** `components/maintenance/advanced-filters.tsx`
- **Filters Supported:**
  - Search (text)
  - Status (multi-select)
  - Priority (multi-select)
  - Property
  - Category
  - Date range
  - Cost range
  - Assigned to
  - Escalated
  - SLA status

---

## 🎯 Testing Checklist

### Bulk Operations
- [ ] Bulk assign with valid request IDs
- [ ] Bulk assign with invalid request IDs (graceful failure)
- [ ] Bulk assign with mixed valid/invalid IDs (partial success)
- [ ] Bulk status update with valid transitions
- [ ] Bulk status update with invalid transitions (skip invalid ones)
- [ ] Bulk priority update
- [ ] Access control (only landlords/super admins)

### Enhanced Filtering
- [ ] Array-based status filtering
- [ ] Array-based priority filtering
- [ ] Property filtering
- [ ] Category filtering
- [ ] Assignee filtering
- [ ] Date range filtering
- [ ] Cost range filtering
- [ ] Escalated filter
- [ ] SLA status filtering
- [ ] Full-text search
- [ ] Combined filters

### Sorting
- [ ] Sort by created_at
- [ ] Sort by updated_at
- [ ] Sort by priority
- [ ] Sort by status
- [ ] Sort by title
- [ ] Sort by cost
- [ ] Sort direction (asc/desc)

### Pagination
- [ ] Page navigation
- [ ] Per page options
- [ ] Meta information accuracy
- [ ] Performance with large datasets

---

## 📝 Notes

1. **Backward Compatibility:** All new features should be optional query parameters to maintain backward compatibility with existing frontend code.

2. **Performance:** Consider implementing:
   - Database indexes on frequently filtered fields
   - Caching for filter options (properties, categories, assignees)
   - Query optimization for complex filters

3. **Error Handling:** Bulk operations should return partial success information, not fail completely if some requests cannot be processed.

4. **Notifications:** Trigger notifications for bulk operations (assignees, status changes, priority upgrades).

5. **Audit Trail:** Log all bulk operations with user ID, timestamp, and affected request IDs.

---

## Summary

**Existing Routes:** ✅ All working, no changes needed

**New Routes Needed:**
- `POST /api/maintenance/requests/bulk/assign`
- `POST /api/maintenance/requests/bulk/status`
- `POST /api/maintenance/requests/bulk/priority`

**Enhancements Needed:**
- `GET /api/maintenance/requests` - Add advanced filtering, sorting, and pagination support

Once these are implemented, the frontend bulk operations and enhanced filtering features will be fully functional.

