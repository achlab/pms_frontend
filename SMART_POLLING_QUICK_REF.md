# 🚀 Quick Reference: Smart Polling

## Import
```typescript
import { useSmartPolling, useVisibilityAwarePolling } from "@/lib/hooks/use-smart-polling";
```

---

## 🎯 Common Patterns

### 1. Simple - Just Pause When Hidden
```typescript
const refetchInterval = useVisibilityAwarePolling(30000); // 30s

useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  refetchInterval, // ← Add this
});
```

### 2. Advanced - Smart Backoff
```typescript
const { refetchInterval, updateInterval } = useSmartPolling({
  initialInterval: 30000,
  maxInterval: 120000,
  backoffMultiplier: 1.5,
});

useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  refetchInterval, // ← Add this
  onSuccess: updateInterval, // ← Add this
});
```

### 3. Manual Refresh Only
```typescript
useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  refetchInterval: false, // ← Disable polling
  refetchOnWindowFocus: true, // ← Refresh when user returns
});
```

---

## ⚡ Migration Checklist

For each `useQuery` with `refetchInterval`:

- [ ] Import smart polling hook
- [ ] Replace fixed interval with `useVisibilityAwarePolling(interval)`
- [ ] Add `refetchOnWindowFocus: true`
- [ ] Test with tab switching
- [ ] Update documentation

**Before:**
```typescript
refetchInterval: 15000, // ❌ Always polling
```

**After:**
```typescript
const refetchInterval = useVisibilityAwarePolling(30000); // ✅ Smart
// ... in useQuery:
refetchInterval,
refetchOnWindowFocus: true,
```

---

## 🎨 When to Use What

| Use Case | Solution | Example |
|----------|----------|---------|
| Notifications | Smart Polling | 30s → 2min backoff |
| Dashboard | Visibility-aware | 60s, pauses when hidden |
| Static data | Manual only | `refetchInterval: false` |
| Real-time | WebSocket | Consider upgrading |

---

## 📊 Expected Savings

| Before | After | Savings |
|--------|-------|---------|
| 240 calls/hour | 30-120 calls/hour | 50-87% |

**Impact**: If 10 users → **2,400 → 300-600** calls/hour 🎉
