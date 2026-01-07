# Maintenance Simplified Workflow - Test Suite

## Overview
Comprehensive test suite for the simplified maintenance workflow with no SLA tracking, no artisan assignment in UI, and streamlined approve/reject process.

## Test Files Created

### 1. Component Tests

#### `__tests__/components/maintenance/approve-reject-modal.test.tsx`
Tests for the simplified ApproveRejectModal component.

**Test Coverage:**
- ✅ Modal display and visibility
- ✅ Request details rendering
- ✅ Approve action (no additional fields required)
- ✅ Reject action (requires 10+ character reason)
- ✅ Form validation
- ✅ API integration
- ✅ Modal behavior (open/close/reset)
- ✅ Error handling
- ✅ Different request statuses
- ✅ Accessibility (ARIA labels, keyboard navigation)
- ✅ **Verification that artisan fields are NOT present**

**Key Test Cases:**
```typescript
// Approve without artisan assignment
it('should submit approval without requiring additional fields')
it('should NOT show artisan assignment fields')

// Reject with reason
it('should require rejection reason with minimum 10 characters')
it('should submit rejection with reason')

// API payload validation
expect(mockMutateAsync).toHaveBeenCalledWith({
  requestId: 1,
  action: 'approve',
  rejection_reason: undefined, // No artisan data
});
```

#### `__tests__/components/maintenance/maintenance-request-card.test.tsx`
Tests for the simplified MaintenanceRequestCard component.

**Test Coverage:**
- ✅ Card display with essential information only
- ✅ Status and priority badges
- ✅ Role-based Review button visibility
- ✅ View Details button
- ✅ ApproveRejectModal integration
- ✅ Different request statuses
- ✅ Different priority levels
- ✅ **Verification that SLA indicators are NOT displayed**
- ✅ **Verification that escalation warnings are NOT displayed**
- ✅ **Verification that removed elements are NOT present**

**Key Test Cases:**
```typescript
// Simplified UI
it('should NOT display SLA indicators')
it('should NOT display escalation warnings')
it('should NOT display estimated cost')
it('should NOT display scheduled date')
it('should NOT display caretaker information')
it('should NOT display category expected resolution hours')

// Role-based access
it('should show Review button for Super Admin on pending request')
it('should show Review button for Landlord-Owner on pending request')
it('should show Review button for assigned Caretaker on pending request')
it('should NOT show Review button for non-owner Landlord')
it('should NOT show Review button for unassigned Caretaker')
it('should NOT show Review button for Tenant')
```

### 2. Service Tests

#### `__tests__/lib/services/maintenance.service.test.ts`
Tests for the maintenance service layer.

**Test Coverage:**
- ✅ `approveRejectMaintenanceRequest` endpoint
- ✅ Approve action API call
- ✅ Reject action with reason API call
- ✅ Error handling
- ✅ **Verification that NO assignment data is sent**
- ✅ Other maintenance service methods
- ✅ URL construction (no double slashes)
- ✅ **Verification that deprecated endpoints are removed**

**Key Test Cases:**
```typescript
// Simplified approve/reject
it('should call PATCH /approve-reject endpoint with approve action')
it('should call PATCH /approve-reject endpoint with reject action and reason')
it('should NOT send assignment data (simplified workflow)')

// Deprecated methods removed
it('should NOT have acceptMaintenanceRequest method')
it('should NOT have useUrgentMaintenanceRequests')
it('should NOT have useInProgressMaintenanceRequests')

// Payload validation
const callPayload = mockApiClient.patch.mock.calls[0][1];
expect(callPayload).not.toHaveProperty('artisan_name');
expect(callPayload).not.toHaveProperty('artisan_phone');
expect(callPayload).not.toHaveProperty('offline_artisan_name');
```

### 3. Integration Tests

#### `__tests__/integration/maintenance-workflow.test.tsx`
End-to-end integration tests for the complete workflow.

**Test Coverage:**
- ✅ Complete approval workflow (Tenant → Landlord → Approve)
- ✅ Complete rejection workflow (Tenant → Landlord → Reject)
- ✅ Role-based workflow access
- ✅ Workflow state transitions
- ✅ Simplified workflow validation
- ✅ Error handling
- ✅ **Verification of simplified flow (no artisan, no SLA)**

**Key Test Cases:**
```typescript
// Complete workflows
it('should complete full approval workflow')
it('should complete full rejection workflow')

// Role-based access
it('should allow Super Admin to approve any request')
it('should allow assigned Caretaker to approve request')
it('should NOT allow non-owner Landlord to review')
it('should NOT allow Tenant to approve/reject')

// Simplified workflow validation
it('should NOT include artisan assignment in approval')
it('should NOT display SLA indicators')

// State transitions
it('should not show Review button after approval')
it('should not show Review button after rejection')
it('should show Review button for under_review status')
```

## Running the Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Suite
```bash
# Component tests
npm test approve-reject-modal.test
npm test maintenance-request-card.test

# Service tests
npm test maintenance.service.test

# Integration tests
npm test maintenance-workflow.test
```

### Run with Coverage
```bash
npm test -- --coverage
```

### Watch Mode
```bash
npm test -- --watch
```

## Test Assertions Summary

### What We Test FOR (Should Exist)
✅ Approve button
✅ Reject button with reason field
✅ Review button (for authorized roles)
✅ View Details button
✅ Status badges
✅ Priority badges
✅ Request number
✅ Property/Unit information
✅ Tenant name
✅ Submission date
✅ Rejection reason validation (min 10 chars)
✅ API endpoint calls (`PATCH /approve-reject`)
✅ Success callbacks
✅ Error handling

### What We Test AGAINST (Should NOT Exist)
❌ SLA indicators
❌ SLA deadlines
❌ Escalation warnings
❌ Escalation alerts
❌ Artisan assignment fields:
  - Artisan name
  - Artisan phone
  - Artisan company
  - Artisan notes
❌ Estimated cost display
❌ Scheduled date display
❌ Expected resolution hours
❌ Caretaker information on card
❌ Deprecated service methods:
  - `acceptMaintenanceRequest`
  - `useUrgentMaintenanceRequests`
  - `useInProgressMaintenanceRequests`

## API Endpoint Testing

### Approve Endpoint
```typescript
// Expected call
PATCH /maintenance/requests/1/approve-reject
Body: {
  action: "approve"
  // NO artisan fields
}

// Expected response
{
  success: true,
  message: "Maintenance request approved successfully",
  data: {
    id: 1,
    status: "approved",
    request_number: "MNT-2026-001"
  }
}
```

### Reject Endpoint
```typescript
// Expected call
PATCH /maintenance/requests/1/approve-reject
Body: {
  action: "reject",
  rejection_reason: "Not covered under lease agreement"
}

// Expected response
{
  success: true,
  message: "Maintenance request rejected successfully",
  data: {
    id: 1,
    status: "rejected",
    request_number: "MNT-2026-001"
  }
}
```

## Role-Based Access Matrix

| Role | Can View | Can Review | Can Approve | Can Reject |
|------|----------|------------|-------------|------------|
| **Tenant** | ✅ Own requests | ❌ | ❌ | ❌ |
| **Landlord (Owner)** | ✅ Own properties | ✅ | ✅ | ✅ |
| **Landlord (Non-Owner)** | ✅ Own properties | ❌ | ❌ | ❌ |
| **Caretaker (Assigned)** | ✅ Assigned requests | ✅ | ✅ | ✅ |
| **Caretaker (Unassigned)** | ✅ | ❌ | ❌ | ❌ |
| **Super Admin** | ✅ All requests | ✅ | ✅ | ✅ |

## Status-Based Action Matrix

| Status | Review Button Visible | Can Approve | Can Reject |
|--------|----------------------|-------------|------------|
| **pending** | ✅ | ✅ | ✅ |
| **received** | ✅ | ✅ | ✅ |
| **under_review** | ✅ | ✅ | ✅ |
| **approved** | ❌ | ❌ | ❌ |
| **rejected** | ❌ | ❌ | ❌ |
| **in_progress** | ❌ | ❌ | ❌ |
| **completed** | ❌ | ❌ | ❌ |
| **closed** | ❌ | ❌ | ❌ |

## Validation Rules Tested

### Approval
- ✅ No additional fields required
- ✅ Can submit immediately after selecting "Approve"
- ✅ No artisan information collected

### Rejection
- ✅ Rejection reason is required
- ✅ Minimum 10 characters
- ✅ Character count displayed
- ✅ Submit button disabled until valid reason entered

## Mock Data Structure

```typescript
const mockMaintenanceRequest: MaintenanceRequest = {
  id: 1,
  request_number: 'MNT-2026-001',
  status: 'pending',
  priority: 'normal',
  description: 'Leaking faucet in kitchen',
  property: {
    id: 1,
    name: 'Sunset Apartments',
    address: '123 Main St',
    landlord_id: 100,
  },
  unit: {
    id: 1,
    unit_number: 'A101',
  },
  tenant: {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
  },
  category: {
    id: 1,
    name: 'Plumbing',
    icon: '🔧',
  },
  landlord_id: 100,
  created_at: '2026-01-07T10:00:00Z',
  updated_at: '2026-01-07T10:00:00Z',
};
```

## Test Coverage Goals

### Target Coverage
- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 90%
- **Lines**: > 90%

### Critical Paths Covered
✅ Approve workflow (happy path)
✅ Reject workflow (happy path)
✅ Validation errors
✅ API errors
✅ Role-based access control
✅ Status-based visibility
✅ Modal open/close behavior
✅ Form reset on close

## Accessibility Testing

### ARIA Labels Tested
- ✅ Dialog role for modal
- ✅ Form labels for rejection reason
- ✅ Button labels (Approve, Reject, Confirm, Cancel)

### Keyboard Navigation Tested
- ✅ Tab navigation through form elements
- ✅ Focus management
- ✅ Enter key submission

## CI/CD Integration

### Pre-commit Hooks
```bash
# Run tests before commit
npm test -- --bail --findRelatedTests
```

### GitHub Actions
```yaml
- name: Run Tests
  run: npm test -- --coverage --ci

- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

## Debugging Failed Tests

### Common Issues

**1. Modal Not Opening**
```typescript
// Check if button is clickable
expect(reviewButton).not.toBeDisabled();

// Wait for modal
await waitFor(() => {
  expect(screen.getByRole('dialog')).toBeInTheDocument();
});
```

**2. API Mock Not Working**
```typescript
// Ensure mock is set up before render
mockMaintenanceService.approveRejectMaintenanceRequest.mockResolvedValueOnce({
  success: true,
  data: { ... }
});
```

**3. Role-Based Access Failing**
```typescript
// Verify user context is properly set
mockUseAuth.mockReturnValue({
  user: { id: 100, role: 'landlord' },
} as any);
```

## Test Maintenance

### When to Update Tests

1. **New Status Added**: Update status-based test cases
2. **Role Changes**: Update role-based access matrix tests
3. **Validation Rules Change**: Update validation test cases
4. **API Endpoint Changes**: Update service and integration tests
5. **UI Changes**: Update component snapshot tests (if using)

### Test Naming Convention
```typescript
describe('ComponentName - Feature', () => {
  describe('Sub-feature', () => {
    it('should do something specific', () => {
      // Test implementation
    });
  });
});
```

## Success Criteria

✅ All tests pass
✅ Coverage > 90%
✅ No console errors/warnings
✅ Tests run in < 30 seconds
✅ No flaky tests (consistent results)
✅ Proper cleanup (no memory leaks)

---

**Test Suite Status**: ✅ Complete  
**Last Updated**: January 7, 2026  
**Total Test Cases**: 50+  
**Estimated Run Time**: ~15-20 seconds

