# Complete Maintenance Workflow - All Parties

## Overview
This document outlines the complete maintenance request workflow involving all parties: **Tenant**, **Landlord**, **Caretaker**, and **Artisan**.

---

## Workflow States

### Status Progression
```
pending → under_review → approved → assigned → in_progress → completed → closed
                ↓
            rejected
                ↓
            cancelled

        (Rework Flow)
completed → rework_required → in_progress → completed

        (Escalation)
rework_required (multiple) → escalated
```

---

## Complete Flow Diagram

### Phase 1: Request Creation & Review

```
┌─────────────────────────────────────────────────────────────┐
│                    TENANT CREATES REQUEST                    │
│  • Selects property/unit                                      │
│  • Chooses category (plumbing, electrical, etc.)              │
│  • Sets priority (low, normal, urgent, emergency)              │
│  • Provides description and photos                            │
│  • Submits request                                            │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              STATUS: pending                                │
│  • Request appears in landlord's dashboard                  │
│  • Tenant receives confirmation notification                │
│  • SLA Response Deadline: 24 hours starts                  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              LANDLORD REVIEWS REQUEST                       │
│  • Views request details                                     │
│  • Sees SLA deadline (24 hours to respond)                  │
│  • Can: Approve, Reject, or Request More Info               │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   APPROVE    │ │   REJECT     │ │ UNDER REVIEW  │
│              │ │              │ │              │
│ Status:      │ │ Status:      │ │ Status:      │
│ approved     │ │ rejected     │ │ under_review │
│              │ │              │ │              │
│ → Next:      │ │ → End:       │ │ → Next:      │
│ Assignment   │ │ Closed       │ │ Approval/    │
│              │ │              │ │ Rejection    │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                 │
       │                │                 │
       └────────────────┴─────────────────┘
                        │
                        ▼
```

### Phase 2: Assignment

```
┌─────────────────────────────────────────────────────────────┐
│              STATUS: approved                               │
│  • Landlord can now assign the request                      │
│  • SLA Assignment Deadline: 48 hours from approval           │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│         LANDLORD ASSIGNS REQUEST                            │
│  Options:                                                   │
│  1. Auto-Assign (System suggests best match)                 │
│     • Based on category expertise                            │
│     • Location proximity                                     │
│     • Current workload                                       │
│     • Performance metrics (rating, completion rate)         │
│                                                              │
│  2. Manual Assign                                           │
│     • Select Caretaker                                       │
│     • Select Artisan                                         │
│     • Assign to Self (Landlord handles)                     │
│                                                              │
│  • Set scheduled date                                        │
│  • Set priority (if different)                              │
│  • Add assignment notes                                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              STATUS: assigned                               │
│  • Assignee receives notification                           │
│  • SLA Acceptance Deadline: 24 hours starts                 │
│  • Request appears in assignee's "New Assignments" tab      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│    CARETAKER/ARTISAN REVIEWS ASSIGNMENT                     │
│  • Views request details                                    │
│  • Sees SLA deadline (24 hours to accept)                   │
│  • Can: Accept or Reject                                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   ACCEPT     │ │   REJECT     │ │   TIMEOUT     │
│              │ │              │ │              │
│ Status:      │ │ Status:      │ │ Status:      │
│ in_progress  │ │ assigned     │ │ assigned     │
│              │ │              │ │              │
│ → Next:      │ │ → Next:      │ │ → Next:      │
│ Start Work   │ │ Reassign     │ │ Escalate/    │
│              │ │              │ │ Reassign     │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                 │
       │                │                 │
       └────────────────┴─────────────────┘
                        │
                        ▼
```

### Phase 3: Work Execution

```
┌─────────────────────────────────────────────────────────────┐
│              STATUS: in_progress                            │
│  • Assignee starts work                                     │
│  • SLA Completion Deadline starts (based on priority):      │
│    - Emergency: 4 hours                                      │
│    - Urgent: 24 hours                                        │
│    - Normal: 3 days                                          │
│    - Low: 7 days                                             │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│         CARETAKER/ARTISAN PERFORMS WORK                     │
│  • Updates progress (optional notes)                         │
│  • Can upload progress photos                                │
│  • Monitors SLA deadline                                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│         CARETAKER/ARTISAN MARKS COMPLETION                  │
│  Required:                                                   │
│  • Completion notes (description of work done)              │
│  • Labor cost                                                │
│  • Material cost                                             │
│  • Artisan fee (if applicable)                              │
│  • Additional expenses                                       │
│  • Completion photos (optional but recommended)              │
│                                                              │
│  → Total cost calculated automatically                      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              STATUS: completed                               │
│  • Request moves to "Completed" status                      │
│  • Tenant and Landlord receive notification                 │
│  • Both can review the completion                           │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
```

### Phase 4: Quality Review

```
┌─────────────────────────────────────────────────────────────┐
│         TENANT REVIEWS COMPLETION                           │
│  Required Actions:                                           │
│  • Rate quality (1-5 stars)                                 │
│  • Provide feedback (optional)                               │
│  • Approve or Reject completion                             │
│                                                              │
│  If Rejected:                                                │
│  • Must provide rejection reason                             │
│  • Request moves to rework_required                          │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   APPROVE    │ │   REJECT     │ │   PENDING    │
│              │ │              │ │              │
│ Tenant       │ │ Status:      │ │ Waiting for  │
│ satisfied    │ │ rework_      │ │ review       │
│              │ │ required     │ │              │
│ → Next:      │ │ → Next:      │ │ → Next:      │
│ Landlord     │ │ Rework Flow  │ │ Review      │
│ Review       │ │              │ │              │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                 │
       │                │                 │
       └────────────────┴─────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│         LANDLORD REVIEWS COMPLETION                         │
│  Actions:                                                    │
│  • Review completion notes                                   │
│  • Review costs                                              │
│  • Review photos                                             │
│  • Approve or Reject completion                              │
│                                                              │
│  If Rejected:                                                │
│  • Must provide rejection reason                             │
│  • Request moves to rework_required                          │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   APPROVE    │ │   REJECT     │ │   PENDING    │
│              │ │              │ │              │
│ Both         │ │ Status:      │ │ Waiting for  │
│ approved     │ │ rework_      │ │ approval     │
│              │ │ required     │ │              │
│ → Next:      │ │ → Next:      │ │ → Next:      │
│ Close        │ │ Rework Flow  │ │ Review      │
│              │ │              │ │              │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                 │
       │                │                 │
       └────────────────┴─────────────────┘
                        │
                        ▼
```

### Phase 5: Rework Flow (If Quality Issues)

```
┌─────────────────────────────────────────────────────────────┐
│              STATUS: rework_required                        │
│  • Rework count incremented                                  │
│  • Assignee receives notification                            │
│  • Request appears in assignee's "Rework Required" tab       │
│  • Rejection reason visible                                  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│         CARETAKER/ARTISAN ADDRESSES ISSUES                  │
│  • Reviews rejection reason                                  │
│  • Fixes the issues                                          │
│  • Updates status to in_progress                              │
│  • Can add notes about fixes                                 │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│         CARETAKER/ARTISAN MARKS COMPLETION (AGAIN)          │
│  • Provides updated completion notes                         │
│  • Updates costs if needed                                   │
│  • Uploads new photos                                        │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              STATUS: completed (again)                       │
│  • Goes back to Quality Review Phase                        │
│  • If rejected again: rework_count increments               │
│  • If rework_count >= 3: Request escalates                 │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
```

### Phase 6: Escalation (Multiple Reworks)

```
┌─────────────────────────────────────────────────────────────┐
│              STATUS: escalated                               │
│  • Triggered when rework_count >= 3                         │
│  • Requires landlord intervention                            │
│  • Escalation reason recorded                                │
│  • Landlord receives urgent notification                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│         LANDLORD HANDLES ESCALATED REQUEST                  │
│  Options:                                                    │
│  1. Reassign to different artisan/caretaker                  │
│  2. Handle personally                                        │
│  3. Cancel request (if not feasible)                         │
│                                                              │
│  • Can view rework history                                   │
│  • Can see all rejection reasons                             │
│  • Makes final decision                                      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
```

### Phase 7: Final Closure

```
┌─────────────────────────────────────────────────────────────┐
│              STATUS: closed                                  │
│  • Both tenant and landlord approved completion              │
│  • Request archived                                          │
│  • Performance metrics updated:                              │
│    - Artisan rating (from tenant)                            │
│    - Completion time                                         │
│    - Cost tracking                                           │
│    - SLA compliance                                          │
│  • Request appears in history                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Role-Based Actions Summary

### 👤 TENANT
- ✅ Create maintenance request
- ✅ View own requests
- ✅ Track request status
- ✅ Review completed work
- ✅ Rate artisan quality (1-5 stars)
- ✅ Approve/reject completion
- ✅ Mark as resolved/unresolved

### 🏢 LANDLORD
- ✅ View all requests (own properties)
- ✅ Review pending requests
- ✅ Approve/reject requests
- ✅ Assign to caretaker/artisan/self
- ✅ Auto-assign with suggestions
- ✅ View SLA deadlines
- ✅ Review completed work
- ✅ Approve/reject completion
- ✅ Handle escalated requests
- ✅ Reassign requests
- ✅ View analytics and reports

### 🔧 CARETAKER
- ✅ View assigned requests
- ✅ Accept/reject assignments
- ✅ Start work
- ✅ Update progress
- ✅ Mark completion
- ✅ Add completion notes and costs
- ✅ Upload completion photos
- ✅ Handle rework requests

### 👷 ARTISAN
- ✅ View assigned requests
- ✅ Accept/reject assignments
- ✅ Start work
- ✅ Update progress
- ✅ Mark completion
- ✅ Add completion notes and costs
- ✅ Upload completion photos
- ✅ Handle rework requests
- ✅ View performance metrics

---

## SLA Deadlines

### Response SLA
- **Who**: Landlord
- **Deadline**: 24 hours from request creation
- **Action**: Review and approve/reject request
- **Status**: `pending` → `approved`/`rejected`

### Assignment SLA
- **Who**: Landlord
- **Deadline**: 48 hours from approval
- **Action**: Assign request to caretaker/artisan
- **Status**: `approved` → `assigned`

### Acceptance SLA
- **Who**: Caretaker/Artisan
- **Deadline**: 24 hours from assignment
- **Action**: Accept or reject assignment
- **Status**: `assigned` → `in_progress` (if accepted)

### Completion SLA
- **Who**: Caretaker/Artisan
- **Deadline**: Based on priority
  - Emergency: 4 hours
  - Urgent: 24 hours
  - Normal: 3 days
  - Low: 7 days
- **Action**: Complete work and mark as completed
- **Status**: `in_progress` → `completed`

---

## Status Transition Rules

### Valid Transitions

| From Status | To Status | Who Can Do | Conditions |
|------------|-----------|------------|------------|
| `pending` | `under_review` | Landlord | - |
| `pending` | `approved` | Landlord | - |
| `pending` | `rejected` | Landlord | Requires reason |
| `under_review` | `approved` | Landlord | - |
| `under_review` | `rejected` | Landlord | Requires reason |
| `approved` | `assigned` | Landlord | Must assign to someone |
| `assigned` | `in_progress` | Caretaker/Artisan | Must accept first |
| `assigned` | `assigned` | Landlord | Reassignment |
| `in_progress` | `completed` | Caretaker/Artisan | Requires completion notes |
| `completed` | `rework_required` | Tenant/Landlord | Reject completion |
| `rework_required` | `in_progress` | Caretaker/Artisan | Start fixing issues |
| `rework_required` | `escalated` | System | Auto-escalate if rework_count >= 3 |
| `escalated` | `assigned` | Landlord | Reassign |
| `completed` | `closed` | System | Both tenant & landlord approved |
| Any | `cancelled` | Landlord | - |

---

## Notification Flow

### Request Created
- **Tenant**: Confirmation notification
- **Landlord**: New request notification with SLA deadline

### Request Approved
- **Tenant**: Approval notification
- **Landlord**: Ready for assignment reminder

### Request Rejected
- **Tenant**: Rejection notification with reason

### Request Assigned
- **Assignee**: Assignment notification with SLA deadline
- **Tenant**: Assignment notification
- **Landlord**: Assignment confirmation

### Assignment Accepted
- **Landlord**: Acceptance notification
- **Tenant**: Work started notification

### Assignment Rejected
- **Landlord**: Rejection notification (can reassign)
- **Tenant**: Assignment rejection notification

### Work Completed
- **Tenant**: Completion notification (review required)
- **Landlord**: Completion notification (review required)

### Completion Approved
- **Assignee**: Approval notification
- **Tenant**: Work approved notification

### Completion Rejected (Rework)
- **Assignee**: Rework notification with reason
- **Tenant**: Rework notification

### Request Escalated
- **Landlord**: Urgent escalation notification
- **Assignee**: Escalation notification

### SLA Approaching/Overdue
- **Relevant Party**: SLA warning notification
- **Landlord**: SLA overdue notification (for all SLAs)

---

## Key Features

### 1. Auto-Assignment
- System suggests best caretaker/artisan based on:
  - Category expertise
  - Location proximity
  - Current workload
  - Performance metrics (rating, completion rate, on-time rate)

### 2. SLA Tracking
- Real-time SLA deadline monitoring
- Visual indicators (green/yellow/red)
- Automatic notifications for approaching/overdue deadlines
- SLA compliance metrics

### 3. Quality Control
- Tenant rating system (1-5 stars)
- Completion review by both tenant and landlord
- Rework flow for quality issues
- Escalation after multiple reworks

### 4. Cost Tracking
- Labor cost
- Material cost
- Artisan fee
- Additional expenses
- Total cost calculation
- Cost analytics and reporting

### 5. Performance Metrics
- Artisan ratings (average)
- Completion rate
- On-time completion rate
- Rework rate
- Average completion time
- Cost per request

### 6. Escalation System
- Automatic escalation after 3 reworks
- Manual escalation option
- Escalation reason tracking
- Landlord intervention required

---

## Example Scenarios

### Scenario 1: Happy Path
1. Tenant creates urgent plumbing request
2. Landlord approves within 2 hours ✅ (SLA met)
3. Landlord auto-assigns to best plumber within 1 day ✅ (SLA met)
4. Plumber accepts within 6 hours ✅ (SLA met)
5. Plumber completes work in 18 hours ✅ (SLA met)
6. Tenant reviews: 5 stars, approves ✅
7. Landlord reviews: approves ✅
8. Request closed ✅

### Scenario 2: Rework Required
1. Tenant creates request → Approved → Assigned → Completed
2. Tenant reviews: 2 stars, rejects (reason: "Leak still present")
3. Status: `rework_required`, rework_count = 1
4. Artisan fixes issue → Marks completed again
5. Tenant reviews: 4 stars, approves ✅
6. Landlord approves ✅
7. Request closed ✅

### Scenario 3: Escalation
1. Request goes through 3 rework cycles
2. After 3rd rejection, system auto-escalates
3. Status: `escalated`
4. Landlord receives urgent notification
5. Landlord reassigns to different artisan
6. New artisan completes successfully
7. Request closed ✅

### Scenario 4: Assignment Rejection
1. Request assigned to Artisan A
2. Artisan A rejects (reason: "Too busy")
3. Status remains `assigned`
4. Landlord receives rejection notification
5. Landlord reassigns to Artisan B
6. Artisan B accepts → Work proceeds ✅

---

## Dashboard Views

### Tenant Dashboard
- My Requests (all statuses)
- Pending Review (completed requests awaiting review)
- Request History

### Landlord Dashboard
- All Requests (filterable)
- Pending Review (awaiting approval)
- Assigned Requests
- Escalated Requests
- Analytics & Reports

### Caretaker/Artisan Dashboard
- New Assignments (awaiting acceptance)
- Active Requests (in progress)
- Rework Required
- Completed Requests
- Performance Metrics

---

## End of Flow

This workflow ensures:
- ✅ Clear accountability at each stage
- ✅ SLA compliance tracking
- ✅ Quality assurance through reviews
- ✅ Performance tracking
- ✅ Cost transparency
- ✅ Automatic escalation for problematic requests
- ✅ Comprehensive notifications
- ✅ Analytics and reporting

