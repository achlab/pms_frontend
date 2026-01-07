# Test Instructions - Maintenance Simplified Workflow

## Quick Start

### Run All Maintenance Tests
```bash
# Using the test script (recommended)
bash scripts/test-maintenance.sh

# Or using npm directly
npm test -- __tests__/components/maintenance/
npm test -- __tests__/lib/services/maintenance.service.test.ts
npm test -- __tests__/integration/maintenance-workflow.test.tsx
```

### Run Individual Test Files
```bash
# Approve/Reject Modal Tests
npm test approve-reject-modal.test

# Request Card Tests
npm test maintenance-request-card.test

# Service Tests
npm test maintenance.service.test

# Integration Tests
npm test maintenance-workflow.test
```

### Run with Coverage
```bash
npm test -- --coverage --collectCoverageFrom='components/maintenance/**/*.{ts,tsx}' --collectCoverageFrom='lib/services/maintenance.service.ts'
```

### Watch Mode (for development)
```bash
npm test -- --watch __tests__/components/maintenance/
```

## Test Setup Requirements

### 1. Install Dependencies
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install --save-dev jest jest-environment-jsdom
npm install --save-dev @types/jest
```

### 2. Jest Configuration
Ensure your `jest.config.js` includes:

```javascript
module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['@swc/jest', {
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: true,
        },
        transform: {
          react: {
            runtime: 'automatic',
          },
        },
      },
    }],
  },
};
```

### 3. Jest Setup File
Create `jest.setup.js`:

```javascript
import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
```

## What Each Test File Covers

### 1. `approve-reject-modal.test.tsx` (50+ assertions)
**Purpose**: Test the simplified approve/reject modal

**Key Validations**:
- ✅ Modal opens and closes correctly
- ✅ Approve action works without artisan fields
- ✅ Reject action requires 10+ character reason
- ✅ NO artisan assignment fields are present
- ✅ API calls are made with correct payload
- ✅ Form resets on close
- ✅ Error handling works

**Run Time**: ~3-5 seconds

### 2. `maintenance-request-card.test.tsx` (40+ assertions)
**Purpose**: Test the simplified request card component

**Key Validations**:
- ✅ Card displays essential info only
- ✅ Review button shows for authorized roles
- ✅ NO SLA indicators displayed
- ✅ NO escalation warnings displayed
- ✅ NO removed elements (cost, schedule, etc.)
- ✅ Role-based access control works
- ✅ Status-based visibility works

**Run Time**: ~3-5 seconds

### 3. `maintenance.service.test.ts` (30+ assertions)
**Purpose**: Test the maintenance service API layer

**Key Validations**:
- ✅ `approveRejectMaintenanceRequest` calls correct endpoint
- ✅ Approve payload has NO artisan data
- ✅ Reject payload includes reason
- ✅ Deprecated methods are removed
- ✅ URL construction is correct
- ✅ Error handling works

**Run Time**: ~2-3 seconds

### 4. `maintenance-workflow.test.tsx` (25+ assertions)
**Purpose**: End-to-end integration tests

**Key Validations**:
- ✅ Complete approval workflow works
- ✅ Complete rejection workflow works
- ✅ Role-based access enforced
- ✅ State transitions work correctly
- ✅ NO artisan assignment in flow
- ✅ NO SLA indicators in flow

**Run Time**: ~5-7 seconds

## Expected Test Results

### Success Output
```
PASS __tests__/components/maintenance/approve-reject-modal.test.tsx
  ✓ Modal Display (4 tests)
  ✓ Approve Action (3 tests)
  ✓ Reject Action (4 tests)
  ✓ Modal Behavior (3 tests)
  ✓ Error Handling (1 test)
  ✓ Different Request Statuses (2 tests)
  ✓ Accessibility (2 tests)

PASS __tests__/components/maintenance/maintenance-request-card.test.tsx
  ✓ Card Display (5 tests)
  ✓ Review Button - Role-Based Access (7 tests)
  ✓ View Details Button (2 tests)
  ✓ Approve/Reject Modal Integration (2 tests)
  ✓ Different Request Statuses (7 tests)
  ✓ Different Priority Levels (4 tests)
  ✓ Simplified UI - Removed Elements (5 tests)
  ✓ Accessibility (1 test)

PASS __tests__/lib/services/maintenance.service.test.ts
  ✓ approveRejectMaintenanceRequest (4 tests)
  ✓ getMaintenanceRequests (1 test)
  ✓ getMaintenanceRequest (1 test)
  ✓ getMaintenanceStatistics (1 test)
  ✓ createMaintenanceRequest (1 test)
  ✓ updateMaintenanceStatus (1 test)
  ✓ addMaintenanceNote (1 test)
  ✓ getMaintenanceEvents (1 test)
  ✓ markMaintenanceResolution (2 tests)
  ✓ URL Construction (1 test)
  ✓ Deprecated Endpoints (3 tests)

PASS __tests__/integration/maintenance-workflow.test.tsx
  ✓ Complete Workflow: Tenant → Landlord Approval (2 tests)
  ✓ Role-Based Workflow Access (4 tests)
  ✓ Workflow State Transitions (3 tests)
  ✓ Simplified Workflow Validation (2 tests)
  ✓ Error Handling (1 test)

Test Suites: 4 passed, 4 total
Tests:       145 passed, 145 total
Time:        15.234s
```

## Troubleshooting

### Issue: Tests Fail with "Cannot find module '@/...'"
**Solution**: Check `jest.config.js` has correct `moduleNameMapper`

### Issue: "ReferenceError: window is not defined"
**Solution**: Ensure `testEnvironment: 'jest-environment-jsdom'` in jest.config.js

### Issue: "Cannot read property 'user' of undefined"
**Solution**: Ensure all mocks are set up in `beforeEach`:
```typescript
beforeEach(() => {
  jest.clearAllMocks();
  mockUseAuth.mockReturnValue({
    user: { id: 1, role: 'tenant' },
  } as any);
});
```

### Issue: Tests timeout
**Solution**: Increase timeout in jest.config.js:
```javascript
testTimeout: 10000, // 10 seconds
```

### Issue: "Act" warnings
**Solution**: Wrap state updates in `waitFor`:
```typescript
await waitFor(() => {
  expect(mockMutateAsync).toHaveBeenCalled();
});
```

## Manual Testing Checklist

After automated tests pass, manually verify:

### 1. Approve Flow
- [ ] Open maintenance request list
- [ ] Click "Review" on pending request
- [ ] Modal opens with request details
- [ ] Click "Approve" button
- [ ] NO artisan fields are shown
- [ ] Click "Confirm Approval"
- [ ] Success toast appears
- [ ] Request status updates to "approved"
- [ ] Modal closes

### 2. Reject Flow
- [ ] Open maintenance request list
- [ ] Click "Review" on pending request
- [ ] Modal opens with request details
- [ ] Click "Reject" button
- [ ] Rejection reason field appears
- [ ] Enter short reason (< 10 chars)
- [ ] Submit button is disabled
- [ ] Enter valid reason (10+ chars)
- [ ] Submit button is enabled
- [ ] Click "Confirm Rejection"
- [ ] Success toast appears
- [ ] Request status updates to "rejected"
- [ ] Modal closes

### 3. Role-Based Access
- [ ] Login as Tenant - NO Review button
- [ ] Login as Landlord (owner) - Review button visible
- [ ] Login as Landlord (non-owner) - NO Review button
- [ ] Login as Caretaker (assigned) - Review button visible
- [ ] Login as Caretaker (unassigned) - NO Review button
- [ ] Login as Super Admin - Review button visible

### 4. Simplified UI Verification
- [ ] NO SLA indicators on cards
- [ ] NO escalation warnings
- [ ] NO estimated cost display
- [ ] NO scheduled date display
- [ ] NO caretaker info on card
- [ ] NO expected resolution hours
- [ ] Clean, minimal card design

## CI/CD Integration

### GitHub Actions Workflow
```yaml
name: Maintenance Tests

on:
  push:
    branches: [ main, develop ]
    paths:
      - 'components/maintenance/**'
      - 'lib/services/maintenance.service.ts'
      - 'lib/hooks/use-maintenance*.ts'
      - '__tests__/**'
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run maintenance tests
        run: bash scripts/test-maintenance.sh
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: maintenance
```

## Coverage Goals

### Minimum Required Coverage
- **Statements**: 90%
- **Branches**: 85%
- **Functions**: 90%
- **Lines**: 90%

### Check Coverage
```bash
npm test -- --coverage --coverageReporters=text --coverageReporters=html
```

View detailed report: `open coverage/index.html`

## Next Steps After Tests Pass

1. ✅ Run all tests locally
2. ✅ Verify coverage meets goals
3. ✅ Run manual testing checklist
4. ✅ Commit test files
5. ✅ Push to repository
6. ✅ Verify CI/CD pipeline passes
7. ✅ Deploy to staging
8. ✅ Run smoke tests on staging
9. ✅ Deploy to production

---

**Test Suite Version**: 1.0.0  
**Last Updated**: January 7, 2026  
**Maintainer**: Development Team  
**Status**: ✅ Ready for Use

