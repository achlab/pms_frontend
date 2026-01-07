# Backend SLA Configuration for Testing

## Current Frontend Implementation

The **frontend calculates SLA deadlines independently** on the client side. It does NOT use the backend-provided deadline fields (`sla_response_deadline`, `sla_assignment_deadline`, `sla_completion_deadline`).

### What the Frontend Does:
- ✅ Calculates deadlines based on timestamps (`created_at`, `approved_at`, `assigned_at`, `accepted_at`)
- ✅ Uses configurable SLA times (currently set to 2 minutes for testing)
- ✅ Only uses backend's `sla_*_met` boolean flags to show if SLAs were met

### What the Frontend Needs from Backend:
- ✅ Timestamps: `created_at`, `approved_at`, `assigned_at`, `accepted_at`
- ✅ SLA met flags: `sla_response_met`, `sla_assignment_met`, `sla_completion_met`
- ❌ Does NOT need: `sla_response_deadline`, `sla_assignment_deadline`, `sla_completion_deadline` (frontend calculates these)

---

## Backend Changes Required

### Option 1: Backend Only Stores Flags (Recommended for Testing)
**If your backend only stores the `sla_*_met` boolean flags and doesn't calculate deadlines:**

✅ **NO BACKEND CHANGES NEEDED**

The frontend will work perfectly with 2-minute deadlines for testing. The backend just needs to:
- Track when actions happen (approve, assign, accept, complete)
- Set `sla_response_met = true` when landlord responds within deadline
- Set `sla_assignment_met = true` when assigned within deadline
- Set `sla_completion_met = true` when completed within deadline

**For testing with 2-minute deadlines:**
- Backend should check if actions happened within 2 minutes (instead of 24 hours)
- This allows you to test SLA compliance quickly

---

### Option 2: Backend Also Calculates Deadlines
**If your backend calculates and stores `sla_*_deadline` fields:**

⚠️ **BACKEND CHANGES NEEDED**

You need to update the backend SLA calculation logic to use testing values.

#### Backend Configuration (PHP/Laravel Example)

Create a configuration file or environment variable:

```php
// config/maintenance.php or .env

// For Testing
MAINTENANCE_SLA_RESPONSE_HOURS=0.033  // 2 minutes
MAINTENANCE_SLA_ASSIGNMENT_HOURS=0.067  // 4 minutes
MAINTENANCE_SLA_ACCEPTANCE_HOURS=0.033  // 2 minutes

// For Production
// MAINTENANCE_SLA_RESPONSE_HOURS=24
// MAINTENANCE_SLA_ASSIGNMENT_HOURS=48
// MAINTENANCE_SLA_ACCEPTANCE_HOURS=24

// Completion deadlines based on priority
MAINTENANCE_SLA_COMPLETION_EMERGENCY_HOURS=0.008  // 30 seconds
MAINTENANCE_SLA_COMPLETION_URGENT_HOURS=0.033     // 2 minutes
MAINTENANCE_SLA_COMPLETION_NORMAL_HOURS=0.1       // 6 minutes
MAINTENANCE_SLA_COMPLETION_LOW_HOURS=0.233        // 14 minutes
```

#### Backend Code Update (Example)

```php
// In your MaintenanceRequest model or service

class MaintenanceRequestService 
{
    private function getSLAConfig()
    {
        return [
            'response_hours' => env('MAINTENANCE_SLA_RESPONSE_HOURS', 24),
            'assignment_hours' => env('MAINTENANCE_SLA_ASSIGNMENT_HOURS', 48),
            'acceptance_hours' => env('MAINTENANCE_SLA_ACCEPTANCE_HOURS', 24),
            'completion' => [
                'emergency' => env('MAINTENANCE_SLA_COMPLETION_EMERGENCY_HOURS', 4),
                'urgent' => env('MAINTENANCE_SLA_COMPLETION_URGENT_HOURS', 24),
                'normal' => env('MAINTENANCE_SLA_COMPLETION_NORMAL_HOURS', 72),
                'low' => env('MAINTENANCE_SLA_COMPLETION_LOW_HOURS', 168),
            ],
        ];
    }

    public function calculateSLADeadlines(MaintenanceRequest $request)
    {
        $config = $this->getSLAConfig();
        $createdAt = $request->created_at;
        
        // Response deadline
        $request->sla_response_deadline = $createdAt->copy()
            ->addHours($config['response_hours']);
        
        // Assignment deadline (if approved)
        if ($request->approved_at) {
            $request->sla_assignment_deadline = $request->approved_at->copy()
                ->addHours($config['assignment_hours']);
        }
        
        // Acceptance deadline (if assigned)
        if ($request->assigned_at) {
            $request->sla_acceptance_deadline = $request->assigned_at->copy()
                ->addHours($config['acceptance_hours']);
        }
        
        // Completion deadline (if assigned/accepted)
        if ($request->assigned_at || $request->accepted_at) {
            $startTime = $request->accepted_at ?? $request->assigned_at;
            $hours = $config['completion'][$request->priority] ?? $config['completion']['normal'];
            $request->sla_completion_deadline = $startTime->copy()
                ->addHours($hours);
        }
        
        return $request;
    }
    
    public function checkSLACompliance(MaintenanceRequest $request)
    {
        $now = now();
        
        // Check response SLA
        if ($request->sla_response_deadline && $request->approved_at) {
            $request->sla_response_met = $request->approved_at <= $request->sla_response_deadline;
        }
        
        // Check assignment SLA
        if ($request->sla_assignment_deadline && $request->assigned_at) {
            $request->sla_assignment_met = $request->assigned_at <= $request->sla_assignment_deadline;
        }
        
        // Check completion SLA
        if ($request->sla_completion_deadline && $request->completed_at) {
            $request->sla_completion_met = $request->completed_at <= $request->sla_completion_deadline;
        }
        
        return $request;
    }
}
```

---

## Testing vs Production

### For Testing (Current Setup)
```env
MAINTENANCE_SLA_RESPONSE_HOURS=0.033      # 2 minutes
MAINTENANCE_SLA_ASSIGNMENT_HOURS=0.067    # 4 minutes
MAINTENANCE_SLA_ACCEPTANCE_HOURS=0.033    # 2 minutes
MAINTENANCE_SLA_COMPLETION_EMERGENCY_HOURS=0.008   # 30 seconds
MAINTENANCE_SLA_COMPLETION_URGENT_HOURS=0.033      # 2 minutes
MAINTENANCE_SLA_COMPLETION_NORMAL_HOURS=0.1        # 6 minutes
MAINTENANCE_SLA_COMPLETION_LOW_HOURS=0.233         # 14 minutes
```

### For Production
```env
MAINTENANCE_SLA_RESPONSE_HOURS=24
MAINTENANCE_SLA_ASSIGNMENT_HOURS=48
MAINTENANCE_SLA_ACCEPTANCE_HOURS=24
MAINTENANCE_SLA_COMPLETION_EMERGENCY_HOURS=4
MAINTENANCE_SLA_COMPLETION_URGENT_HOURS=24
MAINTENANCE_SLA_COMPLETION_NORMAL_HOURS=72
MAINTENANCE_SLA_COMPLETION_LOW_HOURS=168
```

---

## What to Check in Your Backend

1. **Does backend calculate SLA deadlines?**
   - If YES → Update backend configuration
   - If NO → No changes needed

2. **Does backend send notifications based on SLA deadlines?**
   - If YES → Update notification logic to use configurable times
   - If NO → No changes needed

3. **Does backend validate SLA compliance?**
   - If YES → Update validation to use configurable times
   - If NO → No changes needed

4. **Does backend store `sla_*_deadline` fields?**
   - If YES → Update calculation logic
   - If NO → No changes needed (frontend calculates independently)

---

## Recommendation

**For testing purposes, you have two options:**

### Option A: Frontend-Only Testing (Easiest)
- ✅ No backend changes needed
- ✅ Frontend calculates deadlines with 2-minute values
- ✅ Backend just needs to set `sla_*_met` flags correctly
- ⚠️ Backend notifications might use wrong times (if they exist)

### Option B: Full Stack Testing (More Accurate)
- ✅ Update backend configuration to use 2-minute deadlines
- ✅ Backend notifications will use correct times
- ✅ Backend analytics will use correct times
- ✅ More accurate testing of complete system

**For quick testing, Option A is sufficient. For comprehensive testing, use Option B.**

---

## Frontend Configuration Location

The frontend SLA configuration is in:
```
lib/utils/sla-tracking.ts
```

Change `IS_TESTING = false` when going to production.

