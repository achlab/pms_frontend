# Maintenance Request Workflow Design

## Overview
This document outlines the complete workflow for maintenance requests in the Property Management System, including all actors, states, and actions.

## Actors & Roles

### 1. **Tenant**
- **Can**: Create requests, add updates/comments, upload photos, review completed work, rate quality
- **Cannot**: Assign, approve/reject, or change status directly

### 2. **Landlord**
- **Can**: Review requests, approve/reject, assign to caretaker/artisan, review completion, reject completion
- **Cannot**: Accept assignments (but can self-assign)

### 3. **Caretaker**
- **Can**: Accept/reject assignments, update status, mark in progress, mark completed, add notes
- **Cannot**: Approve/reject initial requests, assign to others

### 4. **Super Admin**
- **Can**: All actions (full access)

### 5. **Artisan/Contractor** (External)
- **Can**: Accept/reject assignments, update status, mark in progress, mark completed, add notes
- **Cannot**: Approve/reject initial requests

---

## Workflow States

### Primary States

1. **Pending/Submitted** (Initial)
   - Tenant has created the request
   - Waiting for landlord/admin review
   - **Next**: Approved, Rejected, or Cancelled

2. **Under Review**
   - Landlord/admin is reviewing the request
   - **Next**: Approved or Rejected

3. **Approved**
   - Request has been approved
   - Ready for assignment
   - **Next**: Assigned

4. **Rejected**
   - Request was rejected by landlord/admin
   - Request is closed
   - Tenant can see rejection reason

5. **Assigned**
   - Assigned to caretaker, artisan, or landlord
   - Waiting for acceptance
   - **Next**: Accepted → In Progress, or Rejected → Reassign

6. **In Progress**
   - Work has started
   - Caretaker/artisan is actively working
   - **Next**: Completed

7. **Completed**
   - Work is finished
   - Waiting for quality review
   - **Next**: Approved (Completion), Rejected (Completion) → Rework

8. **Rework Required**
   - Completion was rejected
   - Work needs to be redone
   - **Next**: In Progress

9. **Closed**
   - Request is fully resolved
   - Final state

---

## Detailed Workflow

### Phase 1: Request Creation & Review

```
Tenant Creates Request
    ↓
[Pending/Submitted]
    ↓
Landlord/Admin Reviews
    ├─→ [Approved] → Continue to Assignment
    └─→ [Rejected] → [Closed] (with reason)
```

**Actions:**
- Tenant: Create, add details, upload photos
- Landlord/Admin: Approve, Reject (with reason), Request More Info

---

### Phase 2: Assignment

```
[Approved]
    ↓
Landlord/Admin Assigns To:
    ├─→ Caretaker
    ├─→ Artisan/Contractor
    └─→ Self (Landlord)
    ↓
[Assigned]
    ↓
Assignee Accepts/Rejects
    ├─→ Accepts → [In Progress]
    └─→ Rejects → Reassign
```

**Actions:**
- Landlord/Admin: Assign to caretaker/artisan, set priority, set deadline
- Caretaker/Artisan: Accept assignment, Reject assignment (with reason)
- If rejected: Landlord/Admin can reassign

---

### Phase 3: Work Execution

```
[In Progress]
    ↓
Caretaker/Artisan Works
    ↓
Updates Status, Adds Notes
    ↓
Marks Work as Complete
    ↓
[Completed]
```

**Actions:**
- Caretaker/Artisan: Update status, add progress notes, upload photos, mark completed
- Tenant: Add comments/questions
- Landlord: Monitor progress, add notes

---

### Phase 4: Quality Review

```
[Completed]
    ↓
Quality Review
    ├─→ Tenant Reviews
    │   ├─→ Satisfied → [Closed]
    │   └─→ Not Satisfied → [Rework Required]
    │
    └─→ Landlord Reviews
        ├─→ Satisfied → [Closed]
        └─→ Not Satisfied → [Rework Required]
```

**Actions:**
- Tenant: Review completion, rate quality (1-5 stars), add feedback, approve/reject completion
- Landlord: Review completion, approve/reject completion
- If rejected: Returns to [Rework Required] → [In Progress]

---

### Phase 5: Rework (If Needed)

```
[Rework Required]
    ↓
Back to [In Progress]
    ↓
Caretaker/Artisan Fixes Issues
    ↓
Marks Complete Again
    ↓
[Completed] → Quality Review (Repeat)
```

**Actions:**
- Caretaker/Artisan: Address feedback, redo work, mark completed again
- Tenant/Landlord: Review again

---

## Status Flow Diagram

```
Pending → Under Review → Approved → Assigned → In Progress → Completed → Closed
                              ↓                                    ↓
                           Rejected                            Rework Required
                              ↓                                    ↓
                            Closed                            In Progress (loop)
```

---

## Key Features & Rules

### 1. **Assignment Rules**
- Only Landlord/Admin can assign
- Caretaker/Artisan can accept or reject assignments
- If rejected, must provide reason
- Landlord can reassign to someone else

### 2. **Status Transition Rules**
- Only assigned person can move from "Assigned" → "In Progress"
- Only assigned person can move from "In Progress" → "Completed"
- Tenant/Landlord can reject completion, sending back to "Rework Required"
- "Rework Required" automatically goes back to "In Progress"

### 3. **Quality Control**
- When work is marked "Completed", it requires approval
- Tenant gets notification to review
- Landlord can also review independently
- Either can reject, triggering rework
- Both must be satisfied (or landlord override) to close

### 4. **Artisan Management**
- Artisans are external contractors
- Same workflow as caretakers
- Can be rated after completion
- Poor performance can lead to:
  - Not being assigned future work
  - Requesting rework
  - Escalation to landlord

### 5. **Notifications**
- Tenant: Request approved/rejected, assigned, completed, status updates
- Landlord: New request, assignment accepted/rejected, completed, rework needed
- Caretaker/Artisan: New assignment, tenant comments, completion review

---

## UI/UX Considerations

### Tenant View
- Create request form with photos
- View request status and timeline
- Add comments/updates
- Review completion and rate quality
- See rejection reasons

### Landlord/Admin View
- Dashboard with all requests
- Review queue (pending requests)
- Assignment interface
- Progress monitoring
- Quality review interface
- Analytics (response times, completion rates, artisan ratings)

### Caretaker/Artisan View
- My assignments dashboard
- Accept/reject interface
- Status update interface
- Completion form with photos
- View tenant feedback

---

## Data Model Considerations

### Request Fields
- `id`, `request_number`
- `tenant_id`, `property_id`, `unit_id`
- `title`, `description`, `category`
- `priority` (Low, Normal, Urgent, Emergency)
- `status` (Pending, Under Review, Approved, Rejected, Assigned, In Progress, Completed, Rework Required, Closed, Escalated)
- `assigned_to_type` (caretaker, artisan, landlord)
- `assigned_to_id`
- `assigned_at`, `accepted_at`, `started_at`, `completed_at`, `closed_at`
- `rejection_reason`, `completion_notes`
- `tenant_rating`, `tenant_feedback`
- `media` (photos)
- `updates` (timeline of status changes and notes)
- **SLA Fields:**
  - `sla_response_deadline`, `sla_assignment_deadline`, `sla_completion_deadline`
  - `sla_response_met`, `sla_assignment_met`, `sla_completion_met`
- **Cost Fields:**
  - `estimated_cost`, `actual_cost`
  - `labor_cost`, `material_cost`, `artisan_fee`, `additional_expenses`
  - `cost_breakdown` (JSON)
- **Escalation Fields:**
  - `rework_count`, `escalated`, `escalated_at`, `escalation_reason`

### Assignment Fields
- `assignee_id`, `assignee_type`
- `assigned_by_id`
- `assigned_at`
- `accepted_at`, `rejected_at`
- `rejection_reason`

### Quality Review Fields
- `reviewed_by` (tenant/landlord)
- `reviewed_at`
- `approved`, `rejected`
- `rating` (1-5 stars)
- `feedback`
- `rework_reason` (if rejected)

### Artisan Performance Fields
- `artisan_id`
- `total_requests`, `completed_requests`, `in_progress_requests`
- `average_rating`, `total_ratings`
- `completion_rate` (percentage)
- `average_completion_time` (hours)
- `on_time_completion_rate` (percentage)
- `rework_rate` (percentage)
- `average_cost_per_request`
- `specializations` (categories they excel in)
- `location` (for proximity matching)
- `is_active`, `is_blacklisted`

---

## Recommended Implementation Order

### Phase 1: Core Workflow (Foundation)
- Basic status flow (Pending → Approved → Assigned → In Progress → Completed → Closed)
- Request creation (tenant)
- Review and approval (landlord)
- Assignment system
- Status updates

### Phase 2: Quality Control
- Rejection flow and reassignment
- Quality review system
- Rework flow
- Tenant rating system

### Phase 3: Advanced Features
- Auto-assignment suggestions
- SLA tracking and alerts
- Escalation system (after 2-3 reworks)
- Cost tracking

### Phase 4: Performance & Analytics
- Artisan performance history
- Performance dashboard
- Analytics and reporting
- SLA compliance metrics

### Phase 5: Optimization
- Performance optimization
- Advanced filtering and search
- Bulk operations
- Export capabilities

---

## Confirmed Features

### 1. **Escalation System** ✅
- After 2-3 reworks, automatically escalate to landlord for manual resolution
- Landlord receives priority notification
- Escalated requests marked with special badge
- Landlord can assign to different artisan or handle personally

### 2. **Auto-Assignment Suggestions** ✅
- System suggests assignments based on:
  - Category expertise (artisan's past work in category)
  - Location proximity (artisan's location vs property)
  - Current workload (availability)
  - Performance rating (top performers prioritized)
- Suggestions shown to landlord with reasoning
- Landlord can accept suggestion or manually assign
- Always requires manual approval (no auto-assignment)

### 3. **SLA & Time Limits** ✅
- **Response Time**: Landlord must respond (approve/reject) within 24 hours
- **Assignment Time**: Assign within 48 hours of approval
- **Acceptance Time**: Caretaker/Artisan must accept within 24 hours
- **Completion Time**: Based on priority:
  - Emergency: 4 hours
  - Urgent: 24 hours
  - Normal: 3 days
  - Low: 7 days
- Visual indicators:
  - Green: On time
  - Yellow: Approaching deadline (80% of time elapsed)
  - Red: Overdue
- Automatic alerts when approaching/overdue
- Analytics dashboard showing SLA compliance

### 4. **Cost Tracking** ✅
- Track costs per maintenance request:
  - Labor costs
  - Material costs
  - Artisan fees
  - Additional expenses
- Cost breakdown by category
- Budget vs actual comparison
- Financial reporting for landlords
- Cost history per property/unit
- Export cost data for accounting

### 5. **Artisan Performance History** ✅
- Performance metrics displayed when assigning:
  - Average rating (1-5 stars)
  - Total completed requests
  - Completion rate (%)
  - Average completion time
  - On-time completion rate
  - Rework rate (% of requests requiring rework)
  - Cost efficiency (average cost per request)
- Performance dashboard for artisans
- Historical trends (improving/declining)
- Top performers highlighted
- Poor performers flagged (can be blacklisted)

---

## Next Steps

1. Review and approve this design
2. Update data models to support all states
3. Implement status transition logic
4. Build UI components for each actor
5. Add notification system
6. Implement quality review flow
7. Add analytics and reporting

