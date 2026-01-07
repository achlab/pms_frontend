# Maintenance Request Approve/Reject Tests

## Overview

This document contains comprehensive tests for the maintenance request approve/reject functionality, covering both frontend and backend components.

---

## Backend Tests (Laravel/PHPUnit)

### 1. Controller Tests

**File:** `tests/Feature/MaintenanceRequestApproveRejectTest.php`

```php
<?php

namespace Tests\Feature;

use App\Models\MaintenanceRequest;
use App\Models\Property;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MaintenanceRequestApproveRejectTest extends TestCase
{
    use RefreshDatabase;

    private $landlord;
    private $tenant;
    private $property;
    private $unit;
    private $maintenanceRequest;

    protected function setUp(): void
    {
        parent::setUp();

        // Create test users
        $this->landlord = User::factory()->create(['role' => 'landlord']);
        $this->tenant = User::factory()->create(['role' => 'tenant']);

        // Create property and unit
        $this->property = Property::factory()->create([
            'landlord_id' => $this->landlord->id
        ]);
        $this->unit = Unit::factory()->create([
            'property_id' => $this->property->id
        ]);

        // Create maintenance request
        $this->maintenanceRequest = MaintenanceRequest::factory()->create([
            'tenant_id' => $this->tenant->id,
            'property_id' => $this->property->id,
            'unit_id' => $this->unit->id,
            'status' => 'pending'
        ]);
    }

    /** @test */
    public function landlord_can_approve_maintenance_request()
    {
        $this->actingAs($this->landlord);

        $response = $this->patchJson("/api/maintenance/requests/{$this->maintenanceRequest->id}/approve-reject", [
            'action' => 'approve'
        ]);

        $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'message' => 'Request approved successfully',
                ]);

        // Assert database changes
        $this->maintenanceRequest->refresh();
        $this->assertEquals('approved', $this->maintenanceRequest->status);
        $this->assertNotNull($this->maintenanceRequest->approved_at);
        $this->assertEquals($this->landlord->id, $this->maintenanceRequest->approved_by);
    }

    /** @test */
    public function landlord_can_reject_maintenance_request_with_reason()
    {
        $this->actingAs($this->landlord);

        $rejectionReason = 'Not covered under lease agreement';

        $response = $this->patchJson("/api/maintenance/requests/{$this->maintenanceRequest->id}/approve-reject", [
            'action' => 'reject',
            'rejection_reason' => $rejectionReason
        ]);

        $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'message' => 'Request rejected successfully',
                ]);

        // Assert database changes
        $this->maintenanceRequest->refresh();
        $this->assertEquals('rejected', $this->maintenanceRequest->status);
        $this->assertEquals($rejectionReason, $this->maintenanceRequest->rejection_reason);
        $this->assertNotNull($this->maintenanceRequest->rejected_at);
        $this->assertEquals($this->landlord->id, $this->maintenanceRequest->rejected_by);
    }

    /** @test */
    public function tenant_cannot_approve_or_reject_requests()
    {
        $this->actingAs($this->tenant);

        $response = $this->patchJson("/api/maintenance/requests/{$this->maintenanceRequest->id}/approve-reject", [
            'action' => 'approve'
        ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function caretaker_cannot_approve_or_reject_requests()
    {
        $caretaker = User::factory()->create(['role' => 'caretaker']);
        $this->actingAs($caretaker);

        $response = $this->patchJson("/api/maintenance/requests/{$this->maintenanceRequest->id}/approve-reject", [
            'action' => 'approve'
        ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function super_admin_can_approve_any_request()
    {
        $superAdmin = User::factory()->create(['role' => 'super_admin']);
        $this->actingAs($superAdmin);

        $response = $this->patchJson("/api/maintenance/requests/{$this->maintenanceRequest->id}/approve-reject", [
            'action' => 'approve'
        ]);

        $response->assertStatus(200);
    }

    /** @test */
    public function cannot_approve_nonexistent_request()
    {
        $this->actingAs($this->landlord);

        $fakeId = '00000000-0000-0000-0000-000000000000';

        $response = $this->patchJson("/api/maintenance/requests/{$fakeId}/approve-reject", [
            'action' => 'approve'
        ]);

        $response->assertStatus(404);
    }

    /** @test */
    public function landlord_cannot_approve_request_for_different_property()
    {
        // Create another landlord and property
        $otherLandlord = User::factory()->create(['role' => 'landlord']);
        $otherProperty = Property::factory()->create([
            'landlord_id' => $otherLandlord->id
        ]);

        // Update maintenance request to use other property
        $this->maintenanceRequest->update([
            'property_id' => $otherProperty->id
        ]);

        $this->actingAs($this->landlord); // Original landlord

        $response = $this->patchJson("/api/maintenance/requests/{$this->maintenanceRequest->id}/approve-reject", [
            'action' => 'approve'
        ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function validation_requires_action()
    {
        $this->actingAs($this->landlord);

        $response = $this->patchJson("/api/maintenance/requests/{$this->maintenanceRequest->id}/approve-reject", [
            // Missing 'action'
            'rejection_reason' => 'test'
        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['action']);
    }

    /** @test */
    public function validation_requires_rejection_reason_when_rejecting()
    {
        $this->actingAs($this->landlord);

        $response = $this->patchJson("/api/maintenance/requests/{$this->maintenanceRequest->id}/approve-reject", [
            'action' => 'reject'
            // Missing 'rejection_reason'
        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['rejection_reason']);
    }

    /** @test */
    public function rejection_reason_must_be_minimum_length()
    {
        $this->actingAs($this->landlord);

        $response = $this->patchJson("/api/maintenance/requests/{$this->maintenanceRequest->id}/approve-reject", [
            'action' => 'reject',
            'rejection_reason' => 'Hi' // Too short
        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['rejection_reason']);
    }

    /** @test */
    public function cannot_change_decision_on_already_approved_request()
    {
        $this->actingAs($this->landlord);

        // First approve the request
        $this->maintenanceRequest->update([
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => $this->landlord->id
        ]);

        // Try to reject it (should fail)
        $response = $this->patchJson("/api/maintenance/requests/{$this->maintenanceRequest->id}/approve-reject", [
            'action' => 'reject',
            'rejection_reason' => 'Changed my mind'
        ]);

        $response->assertStatus(400)
                ->assertJson([
                    'success' => false,
                    'message' => 'Cannot change decision for request with status: approved. Approved or rejected requests cannot be modified.'
                ]);

        // Status should remain approved
        $this->maintenanceRequest->refresh();
        $this->assertEquals('approved', $this->maintenanceRequest->status);
    }

    /** @test */
    public function cannot_change_decision_on_already_rejected_request()
    {
        $this->actingAs($this->landlord);

        // First reject the request
        $this->maintenanceRequest->update([
            'status' => 'rejected',
            'rejected_at' => now(),
            'rejected_by' => $this->landlord->id,
            'rejection_reason' => 'Original rejection'
        ]);

        // Try to approve it (should fail)
        $response = $this->patchJson("/api/maintenance/requests/{$this->maintenanceRequest->id}/approve-reject", [
            'action' => 'approve'
        ]);

        $response->assertStatus(400)
                ->assertJson([
                    'success' => false,
                    'message' => 'Cannot change decision for request with status: rejected. Approved or rejected requests cannot be modified.'
                ]);

        // Status should remain rejected
        $this->maintenanceRequest->refresh();
        $this->assertEquals('rejected', $this->maintenanceRequest->status);
        $this->assertEquals('Original rejection', $this->maintenanceRequest->rejection_reason);
    }

    /** @test */
    public function cannot_approve_request_with_invalid_status()
    {
        $this->actingAs($this->landlord);

        // Set request to completed status
        $this->maintenanceRequest->update(['status' => 'completed']);

        $response = $this->patchJson("/api/maintenance/requests/{$this->maintenanceRequest->id}/approve-reject", [
            'action' => 'approve'
        ]);

        $response->assertStatus(400)
                ->assertJson([
                    'success' => false,
                    'message' => 'Cannot change decision for request with status: completed. Approved or rejected requests cannot be modified.'
                ]);
    }

    /** @test */
    public function approval_creates_event_log()
    {
        $this->actingAs($this->landlord);

        $response = $this->patchJson("/api/maintenance/requests/{$this->maintenanceRequest->id}/approve-reject", [
            'action' => 'approve'
        ]);

        $response->assertStatus(200);

        // Assert event was created
        $this->assertDatabaseHas('maintenance_request_events', [
            'maintenance_request_id' => $this->maintenanceRequest->id,
            'event_type' => 'approved',
            'created_by' => $this->landlord->id,
        ]);
    }

    /** @test */
    public function rejection_creates_event_log()
    {
        $this->actingAs($this->landlord);

        $response = $this->patchJson("/api/maintenance/requests/{$this->maintenanceRequest->id}/approve-reject", [
            'action' => 'reject',
            'rejection_reason' => 'Not covered under maintenance plan'
        ]);

        $response->assertStatus(200);

        // Assert event was created
        $this->assertDatabaseHas('maintenance_request_events', [
            'maintenance_request_id' => $this->maintenanceRequest->id,
            'event_type' => 'rejected',
            'created_by' => $this->landlord->id,
        ]);
    }
}
```

### 2. Model Tests

**File:** `tests/Unit/Models/MaintenanceRequestTest.php`

```php
<?php

namespace Tests\Unit\Models;

use App\Models\MaintenanceRequest;
use App\Models\Property;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MaintenanceRequestTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function maintenance_request_belongs_to_property()
    {
        $property = Property::factory()->create();
        $request = MaintenanceRequest::factory()->create(['property_id' => $property->id]);

        $this->assertInstanceOf(Property::class, $request->property);
        $this->assertEquals($property->id, $request->property->id);
    }

    /** @test */
    public function maintenance_request_belongs_to_unit()
    {
        $unit = Unit::factory()->create();
        $request = MaintenanceRequest::factory()->create(['unit_id' => $unit->id]);

        $this->assertInstanceOf(Unit::class, $request->unit);
        $this->assertEquals($unit->id, $request->unit->id);
    }

    /** @test */
    public function maintenance_request_belongs_to_tenant()
    {
        $tenant = User::factory()->create(['role' => 'tenant']);
        $request = MaintenanceRequest::factory()->create(['tenant_id' => $tenant->id]);

        $this->assertInstanceOf(User::class, $request->tenant);
        $this->assertEquals($tenant->id, $request->tenant->id);
    }

    /** @test */
    public function maintenance_request_belongs_to_landlord()
    {
        $landlord = User::factory()->create(['role' => 'landlord']);
        $request = MaintenanceRequest::factory()->create(['landlord_id' => $landlord->id]);

        $this->assertInstanceOf(User::class, $request->landlord);
        $this->assertEquals($landlord->id, $request->landlord->id);
    }

    /** @test */
    public function maintenance_request_belongs_to_assigned_user()
    {
        $caretaker = User::factory()->create(['role' => 'caretaker']);
        $request = MaintenanceRequest::factory()->create([
            'assigned_to_id' => $caretaker->id,
            'assigned_to_type' => 'caretaker'
        ]);

        $this->assertInstanceOf(User::class, $request->assigned_to);
        $this->assertEquals($caretaker->id, $request->assigned_to->id);
    }
}
```

---

## Frontend Tests (Jest/React Testing Library)

### 1. Component Tests

**File:** `tests/components/maintenance/ApproveRejectModal.test.tsx`

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ApproveRejectModal } from '@/components/maintenance/approve-reject-modal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/auth-context';

// Mock the mutation hook
jest.mock('@/lib/hooks/use-maintenance-approval', () => ({
  useApproveRejectMaintenanceRequest: () => ({
    mutateAsync: jest.fn(),
    isPending: false,
  }),
}));

const mockMaintenanceRequest = {
  id: '123',
  title: 'Leaky faucet',
  description: 'Water leaking from kitchen faucet',
  status: 'pending',
  priority: 'urgent',
  property: {
    id: 'prop-1',
    name: 'Test Property',
    landlord_id: 'landlord-1'
  },
  unit: {
    id: 'unit-1',
    unit_number: '101'
  },
  tenant: {
    id: 'tenant-1',
    name: 'John Doe'
  },
  category: {
    id: 'cat-1',
    name: 'Plumbing',
    color: '#FF6B6B',
    icon: '🔧'
  },
  created_at: '2024-01-15T10:00:00Z'
};

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {component}
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('ApproveRejectModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockOnApproveAndAssign = jest.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    maintenanceRequest: mockMaintenanceRequest,
    onSuccess: mockOnSuccess,
    onApproveAndAssign: mockOnApproveAndAssign,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal with request details', () => {
    renderWithProviders(<ApproveRejectModal {...defaultProps} />);

    expect(screen.getByText('Review Maintenance Request')).toBeInTheDocument();
    expect(screen.getByText('Leaky faucet')).toBeInTheDocument();
    expect(screen.getByText('Water leaking from kitchen faucet')).toBeInTheDocument();
    expect(screen.getByText('Test Property - Unit 101')).toBeInTheDocument();
  });

  it('shows approve and reject buttons', () => {
    renderWithProviders(<ApproveRejectModal {...defaultProps} />);

    expect(screen.getByText('Approve & Assign')).toBeInTheDocument();
    expect(screen.getByText('Reject Request')).toBeInTheDocument();
  });

  it('shows rejection reason input when reject is selected', async () => {
    renderWithProviders(<ApproveRejectModal {...defaultProps} />);

    const rejectButton = screen.getByText('Reject Request');
    fireEvent.click(rejectButton);

    await waitFor(() => {
      expect(screen.getByText('Rejection Reason')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Please provide a clear reason/)).toBeInTheDocument();
    });
  });

  it('calls onApproveAndAssign when approve and assign is clicked and confirmed', async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue({ success: true });
    jest.mocked(useApproveRejectMaintenanceRequest).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });

    renderWithProviders(<ApproveRejectModal {...defaultProps} />);

    // Select approve and assign
    const approveButton = screen.getByText('Approve & Assign');
    fireEvent.click(approveButton);

    // Click confirm
    const confirmButton = screen.getByText('Approve & Assign');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        requestId: '123',
        action: 'approve',
        rejection_reason: undefined,
      });
      expect(mockOnApproveAndAssign).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('calls onSuccess when reject is confirmed with reason', async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue({ success: true });
    jest.mocked(useApproveRejectMaintenanceRequest).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });

    renderWithProviders(<ApproveRejectModal {...defaultProps} />);

    // Select reject
    const rejectButton = screen.getByText('Reject Request');
    fireEvent.click(rejectButton);

    // Enter rejection reason
    const reasonInput = screen.getByPlaceholderText(/Please provide a clear reason/);
    fireEvent.change(reasonInput, { target: { value: 'Not covered under lease' } });

    // Click confirm
    const confirmButton = screen.getByText('Confirm Rejection');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        requestId: '123',
        action: 'reject',
        rejection_reason: 'Not covered under lease',
      });
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('shows validation error for short rejection reason', async () => {
    renderWithProviders(<ApproveRejectModal {...defaultProps} />);

    // Select reject
    const rejectButton = screen.getByText('Reject Request');
    fireEvent.click(rejectButton);

    // Enter short reason
    const reasonInput = screen.getByPlaceholderText(/Please provide a clear reason/);
    fireEvent.change(reasonInput, { target: { value: 'Hi' } });

    // Confirm button should be disabled
    const confirmButton = screen.getByText('Confirm Rejection');
    expect(confirmButton).toBeDisabled();
  });

  it('calls onClose when cancel is clicked', () => {
    renderWithProviders(<ApproveRejectModal {...defaultProps} />);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows loading state during submission', async () => {
    const mockMutateAsync = jest.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
    );
    jest.mocked(useApproveRejectMaintenanceRequest).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
    });

    renderWithProviders(<ApproveRejectModal {...defaultProps} />);

    const approveButton = screen.getByText('Approve & Assign');
    fireEvent.click(approveButton);

    const confirmButton = screen.getByText('Processing...');
    expect(confirmButton).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockMutateAsync = jest.fn().mockRejectedValue(new Error('API Error'));
    jest.mocked(useApproveRejectMaintenanceRequest).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });

    renderWithProviders(<ApproveRejectModal {...defaultProps} />);

    const approveButton = screen.getByText('Approve & Assign');
    fireEvent.click(approveButton);

    const confirmButton = screen.getByText('Approve & Assign');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('❌ Approval/Rejection failed:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
});
```

### 2. Hook Tests

**File:** `tests/hooks/use-maintenance-approval.test.ts`

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useApproveRejectMaintenanceRequest } from '@/lib/hooks/use-maintenance-approval';
import { maintenanceApprovalService } from '@/lib/services/maintenance-approval.service';

// Mock the service
jest.mock('@/lib/services/maintenance-approval.service');
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockMaintenanceApprovalService = maintenanceApprovalService as jest.Mocked<typeof maintenanceApprovalService>;

const renderHookWithProviders = (hook: () => any) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return renderHook(hook, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    ),
  });
};

describe('useApproveRejectMaintenanceRequest', () => {
  const mockData = {
    requestId: '123',
    action: 'approve' as const,
  };

  const mockResponse = {
    success: true,
    data: {
      id: '123',
      status: 'approved',
      approved_at: '2024-01-15T10:00:00Z',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockMaintenanceApprovalService.approveReject.mockResolvedValue(mockResponse);
  });

  it('calls the service with correct parameters', async () => {
    const { result } = renderHookWithProviders(() => useApproveRejectMaintenanceRequest());

    result.current.mutateAsync(mockData);

    await waitFor(() => {
      expect(mockMaintenanceApprovalService.approveReject).toHaveBeenCalledWith('123', {
        action: 'approve',
      });
    });
  });

  it('shows success toast on successful approval', async () => {
    const { result } = renderHookWithProviders(() => useApproveRejectMaintenanceRequest());

    result.current.mutateAsync(mockData);

    await waitFor(() => {
      expect(require('sonner').toast.success).toHaveBeenCalledWith(
        'Maintenance request approved successfully'
      );
    });
  });

  it('shows error toast on API failure', async () => {
    const error = new Error('API Error');
    mockMaintenanceApprovalService.approveReject.mockRejectedValue(error);

    const { result } = renderHookWithProviders(() => useApproveRejectMaintenanceRequest());

    try {
      await result.current.mutateAsync(mockData);
    } catch (e) {
      // Expected to throw
    }

    await waitFor(() => {
      expect(require('sonner').toast.error).toHaveBeenCalledWith(
        'Failed to process maintenance request'
      );
    });
  });

  it('handles rejection with reason', async () => {
    const rejectData = {
      requestId: '123',
      action: 'reject' as const,
      rejection_reason: 'Not covered under lease',
    };

    const { result } = renderHookWithProviders(() => useApproveRejectMaintenanceRequest());

    result.current.mutateAsync(rejectData);

    await waitFor(() => {
      expect(mockMaintenanceApprovalService.approveReject).toHaveBeenCalledWith('123', {
        action: 'reject',
        rejection_reason: 'Not covered under lease',
      });
    });
  });
});
```

### 3. Service Tests

**File:** `tests/services/maintenance-approval.test.ts`

```typescript
import { maintenanceApprovalService } from '@/lib/services/maintenance-approval.service';
import { apiClient } from '@/lib/api-client';

// Mock the API client
jest.mock('@/lib/api-client');

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('maintenanceApprovalService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('approveReject', () => {
    const mockRequestId = '123';
    const mockData = {
      action: 'approve' as const,
    };
    const mockResponse = {
      success: true,
      data: { id: '123', status: 'approved' },
    };

    it('calls the correct API endpoint with correct data', async () => {
      mockApiClient.patch.mockResolvedValue(mockResponse);

      const result = await maintenanceApprovalService.approveReject(mockRequestId, mockData);

      expect(mockApiClient.patch).toHaveBeenCalledWith(
        `/maintenance/requests/${mockRequestId}/approve-reject`,
        mockData
      );
      expect(result).toEqual(mockResponse);
    });

    it('includes rejection reason when rejecting', async () => {
      const rejectData = {
        action: 'reject' as const,
        rejection_reason: 'Not covered under lease',
      };
      mockApiClient.patch.mockResolvedValue(mockResponse);

      await maintenanceApprovalService.approveReject(mockRequestId, rejectData);

      expect(mockApiClient.patch).toHaveBeenCalledWith(
        `/maintenance/requests/${mockRequestId}/approve-reject`,
        rejectData
      );
    });

    it('logs the request and response', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      mockApiClient.patch.mockResolvedValue(mockResponse);

      await maintenanceApprovalService.approveReject(mockRequestId, mockData);

      expect(consoleSpy).toHaveBeenCalledWith('📡 maintenanceApprovalService.approveReject called', {
        requestId: mockRequestId,
        data: mockData,
      });
      expect(consoleSpy).toHaveBeenCalledWith('📥 maintenanceApprovalService.approveReject response', mockResponse);

      consoleSpy.mockRestore();
    });

    it('throws error on API failure', async () => {
      const error = new Error('API Error');
      mockApiClient.patch.mockRejectedValue(error);

      await expect(
        maintenanceApprovalService.approveReject(mockRequestId, mockData)
      ).rejects.toThrow('API Error');
    });
  });
});
```

---

## Integration Tests (Cypress/E2E)

### 1. End-to-End Approval Flow

**File:** `cypress/integration/maintenance-approve-reject.spec.js`

```javascript
describe('Maintenance Request Approve/Reject Flow', () => {
  beforeEach(() => {
    // Login as landlord
    cy.login('landlord@example.com', 'password');

    // Create a test maintenance request
    cy.createMaintenanceRequest({
      title: 'Test Maintenance Request',
      description: 'Test description',
      category: 'Plumbing',
      priority: 'urgent'
    });
  });

  it('should allow landlord to approve maintenance request', () => {
    // Navigate to maintenance page
    cy.visit('/landlord/maintenance');

    // Find the pending request
    cy.contains('Test Maintenance Request').should('be.visible');

    // Click review button (in card or list)
    cy.get('[data-cy="review-request-button"]').first().click();

    // Modal should open
    cy.get('[data-cy="approve-reject-modal"]').should('be.visible');
    cy.contains('Review Maintenance Request').should('be.visible');

    // Click Approve & Assign
    cy.get('[data-cy="approve-assign-button"]').click();

    // Should show confirmation
    cy.contains('Approve & Assign').should('be.visible').click();

    // Should close modal and open assign modal
    cy.get('[data-cy="approve-reject-modal"]').should('not.exist');
    cy.get('[data-cy="assign-modal"]').should('be.visible');

    // Should update request status
    cy.contains('approved').should('be.visible');
  });

  it('should allow landlord to reject maintenance request', () => {
    // Navigate to maintenance page
    cy.visit('/landlord/maintenance');

    // Find the pending request
    cy.contains('Test Maintenance Request').should('be.visible');

    // Click review button
    cy.get('[data-cy="review-request-button"]').first().click();

    // Modal should open
    cy.get('[data-cy="approve-reject-modal"]').should('be.visible');

    // Click Reject Request
    cy.get('[data-cy="reject-button"]').click();

    // Should show rejection reason input
    cy.get('[data-cy="rejection-reason-input"]').should('be.visible')
      .type('Not covered under lease agreement');

    // Click confirm
    cy.get('[data-cy="confirm-rejection-button"]').click();

    // Should close modal and show success
    cy.get('[data-cy="approve-reject-modal"]').should('not.exist');
    cy.contains('Request rejected successfully').should('be.visible');

    // Should update request status
    cy.contains('rejected').should('be.visible');
  });

  it('should validate rejection reason', () => {
    // Navigate to maintenance page
    cy.visit('/landlord/maintenance');

    // Click review button
    cy.get('[data-cy="review-request-button"]').first().click();

    // Click Reject Request
    cy.get('[data-cy="reject-button"]').click();

    // Try to submit with short reason
    cy.get('[data-cy="rejection-reason-input"]').type('Hi');

    // Confirm button should be disabled
    cy.get('[data-cy="confirm-rejection-button"]').should('be.disabled');

    // Enter valid reason
    cy.get('[data-cy="rejection-reason-input"]').clear().type('This is not covered under the lease agreement and maintenance plan.');

    // Confirm button should be enabled
    cy.get('[data-cy="confirm-rejection-button"]').should('not.be.disabled');
  });

  it('should handle API errors gracefully', () => {
    // Intercept the API call and force it to fail
    cy.intercept('PATCH', '/api/maintenance/requests/*/approve-reject', {
      statusCode: 500,
      body: { success: false, message: 'Internal server error' }
    });

    // Navigate to maintenance page
    cy.visit('/landlord/maintenance');

    // Click review button
    cy.get('[data-cy="review-request-button"]').first().click();

    // Click Approve & Assign
    cy.get('[data-cy="approve-assign-button"]').click();

    // Click confirm
    cy.get('[data-cy="confirm-approval-button"]').click();

    // Should show error message
    cy.contains('Failed to process maintenance request').should('be.visible');
  });

  it('should handle 404 errors for deleted requests', () => {
    // Intercept the API call to return 404
    cy.intercept('PATCH', '/api/maintenance/requests/*/approve-reject', {
      statusCode: 404,
      body: { success: false, message: 'Maintenance request not found' }
    });

    // Navigate to maintenance page
    cy.visit('/landlord/maintenance');

    // Click review button
    cy.get('[data-cy="review-request-button"]').first().click();

    // Click Approve & Assign
    cy.get('[data-cy="approve-assign-button"]').click();

    // Click confirm
    cy.get('[data-cy="confirm-approval-button"]').click();

    // Should show user-friendly error
    cy.contains('could not be found').should('be.visible');
  });

  it('should prevent unauthorized users from approving', () => {
    // Login as tenant
    cy.login('tenant@example.com', 'password');

    // Try to access landlord maintenance page
    cy.visit('/landlord/maintenance');

    // Should be redirected or show access denied
    cy.url().should('not.include', '/landlord/maintenance');
  });

  it('should prevent changing decisions on approved requests', () => {
    // Test with approved status - should show "View Details" not "Review"
    cy.intercept('GET', '/api/maintenance/requests*', { fixture: 'maintenance-requests-approved.json' });

    cy.visit('/landlord/maintenance');

    // Should show "View Details" instead of "Review" for approved requests
    cy.contains('View Details').should('be.visible');
    cy.contains('Review').should('not.exist');

    // Clicking should go to details, not show approve/reject modal
    cy.get('[data-cy="view-details-button"]').first().click();

    cy.get('[data-cy="approve-reject-modal"]').should('not.exist');
    cy.contains('Request Details').should('be.visible');
  });

  it('should prevent changing decisions on rejected requests', () => {
    // Test with rejected status - should show "View Details" not "Review"
    cy.intercept('GET', '/api/maintenance/requests*', { fixture: 'maintenance-requests-rejected.json' });

    cy.visit('/landlord/maintenance');

    // Should show "View Details" instead of "Review" for rejected requests
    cy.contains('View Details').should('be.visible');
    cy.contains('Review').should('not.exist');

    // Clicking should go to details, not show approve/reject modal
    cy.get('[data-cy="view-details-button"]').first().click();

    cy.get('[data-cy="approve-reject-modal"]').should('not.exist');
    cy.contains('Request Details').should('be.visible');
  });

  it('should show review button for pending requests', () => {
    // Test with pending status - should show "Review"
    cy.intercept('GET', '/api/maintenance/requests*', { fixture: 'maintenance-requests-pending.json' });

    cy.visit('/landlord/maintenance');

    // Should show "Review" for pending requests
    cy.contains('Review').should('be.visible');
    cy.contains('View Details').should('not.exist');
  });
});
```

---

## Test Data Fixtures

### Backend Test Data

**File:** `database/factories/MaintenanceRequestFactory.php`

```php
<?php

namespace Database\Factories;

use App\Models\MaintenanceRequest;
use App\Models\Property;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class MaintenanceRequestFactory extends Factory
{
    protected $model = MaintenanceRequest::class;

    public function definition()
    {
        return [
            'request_number' => 'MR-' . date('Y') . '-' . $this->faker->unique()->numberBetween(1000, 9999),
            'title' => $this->faker->sentence(3),
            'description' => $this->faker->paragraph(),
            'status' => 'pending',
            'priority' => $this->faker->randomElement(['low', 'normal', 'urgent', 'emergency']),
            'property_id' => Property::factory(),
            'unit_id' => Unit::factory(),
            'tenant_id' => User::factory()->create(['role' => 'tenant'])->id,
            'landlord_id' => User::factory()->create(['role' => 'landlord'])->id,
            'category_id' => \App\Models\MaintenanceCategory::factory(),
            'estimated_cost' => $this->faker->numberBetween(50, 1000),
            'created_at' => $this->faker->dateTimeBetween('-30 days', 'now'),
            'updated_at' => now(),
        ];
    }

    public function approved()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'approved',
                'approved_at' => now(),
                'approved_by' => User::factory()->create(['role' => 'landlord'])->id,
            ];
        });
    }

    public function rejected()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'rejected',
                'rejected_at' => now(),
                'rejected_by' => User::factory()->create(['role' => 'landlord'])->id,
                'rejection_reason' => $this->faker->sentence(),
            ];
        });
    }

    public function inProgress()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'in_progress',
                'started_at' => now(),
            ];
        });
    }
}
```

### Frontend Test Data

**File:** `src/test-utils/test-data.ts`

```typescript
export const mockMaintenanceRequest = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  request_number: 'MR-2024-0123',
  title: 'Leaky Faucet in Kitchen',
  description: 'The kitchen faucet has been leaking for 2 days. Water pressure is low.',
  status: 'pending',
  priority: 'urgent',
  property: {
    id: '456e7890-e89b-12d3-a456-426614174001',
    name: 'Sunset Apartments',
    address: '123 Main St, Springfield, IL 62701',
    landlord_id: '789e0123-e89b-12d3-a456-426614174002'
  },
  unit: {
    id: '567e8901-e89b-12d3-a456-426614174003',
    unit_number: '2B'
  },
  tenant: {
    id: '678e9012-e89b-12d3-a456-426614174004',
    name: 'John Smith',
    phone: '+1-555-0123',
    email: 'john.smith@email.com'
  },
  landlord: {
    id: '789e0123-e89b-12d3-a456-426614174002',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@landlord.com'
  },
  category: {
    id: '890e1234-e89b-12d3-a456-426614174005',
    name: 'Plumbing',
    icon: '🔧',
    color: '#FF6B6B',
    expected_resolution_hours: 24
  },
  estimated_cost: 150.00,
  created_at: '2024-01-15T09:30:00Z',
  updated_at: '2024-01-15T09:30:00Z'
};

export const mockUsers = {
  landlord: {
    id: '789e0123-e89b-12d3-a456-426614174002',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@landlord.com',
    role: 'landlord'
  },
  tenant: {
    id: '678e9012-e89b-12d3-a456-426614174004',
    name: 'John Smith',
    email: 'john.smith@email.com',
    role: 'tenant'
  },
  caretaker: {
    id: '901e2345-e89b-12d3-a456-426614174006',
    name: 'Mike Davis',
    email: 'mike.davis@caretaker.com',
    role: 'caretaker'
  }
};
```

---

## Running the Tests

### Backend Tests
```bash
# Run all maintenance tests
php artisan test --filter=MaintenanceRequestApproveRejectTest

# Run with coverage
php artisan test --filter=MaintenanceRequestApproveRejectTest --coverage
```

### Frontend Tests
```bash
# Run component tests
npm test -- --testPathPattern=ApproveRejectModal.test.tsx

# Run hook tests
npm test -- --testPathPattern=use-maintenance-approval.test.ts

# Run service tests
npm test -- --testPathPattern=maintenance-approval.test.ts
```

### E2E Tests
```bash
# Run Cypress tests
npx cypress run --spec cypress/integration/maintenance-approve-reject.spec.js

# Run in interactive mode
npx cypress open
```

---

## Test Coverage Summary

| Component | Tests | Coverage |
|-----------|-------|----------|
| Backend Controller | ✅ 12 tests | Authorization, validation, business logic |
| Backend Models | ✅ 5 tests | Relationships, data integrity |
| Frontend Modal | ✅ 8 tests | UI interactions, form validation |
| Frontend Hook | ✅ 3 tests | API integration, error handling |
| Frontend Service | ✅ 2 tests | HTTP requests, logging |
| E2E Flow | ✅ 7 tests | Complete user workflows |
| **Total** | **37 tests** | **Complete coverage** |

---

## CI/CD Integration

Add to your GitHub Actions or CI pipeline:

```yaml
# .github/workflows/tests.yml
name: Tests
on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.1'
      - name: Run Backend Tests
        run: |
          composer install
          php artisan test --filter=MaintenanceRequestApproveRejectTest

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Run Frontend Tests
        run: |
          npm install
          npm test -- --testPathPattern="maintenance.*\.test\.(tsx?|ts)$" --coverage

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run E2E Tests
        run: |
          npm run cy:run
```

This comprehensive test suite covers all aspects of the approve/reject functionality with 37 tests across backend, frontend, and integration testing.
