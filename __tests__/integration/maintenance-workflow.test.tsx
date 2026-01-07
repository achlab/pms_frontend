/**
 * Integration Tests for Simplified Maintenance Workflow
 * End-to-end flow: Submit → Review → Approve/Reject
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/auth-context';
import { MaintenanceRequestCard } from '@/components/maintenance/maintenance-request-card';
import { maintenanceService } from '@/lib/services/maintenance.service';
import type { MaintenanceRequest } from '@/lib/api-types';

// Mock the service
jest.mock('@/lib/services/maintenance.service');
jest.mock('@/hooks/use-toast');

const mockMaintenanceService = maintenanceService as jest.Mocked<typeof maintenanceService>;

describe('Maintenance Workflow Integration - Simplified Flow', () => {
  let queryClient: QueryClient;

  const mockPendingRequest: MaintenanceRequest = {
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
  } as MaintenanceRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  const renderWithProviders = (ui: React.ReactElement, user: any) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider value={{ user, login: jest.fn(), logout: jest.fn(), isLoading: false }}>
          {ui}
        </AuthProvider>
      </QueryClientProvider>
    );
  };

  describe('Complete Workflow: Tenant → Landlord Approval', () => {
    it('should complete full approval workflow', async () => {
      const user = userEvent.setup();

      // Step 1: Tenant submits request (mocked as already submitted)
      const landlordUser = {
        id: 100,
        role: 'landlord',
        email: 'landlord@example.com',
      };

      mockMaintenanceService.approveRejectMaintenanceRequest.mockResolvedValueOnce({
        success: true,
        message: 'Maintenance request approved successfully',
        data: {
          ...mockPendingRequest,
          status: 'approved',
        },
      });

      // Step 2: Landlord views and approves request
      renderWithProviders(
        <MaintenanceRequestCard
          request={mockPendingRequest}
          onUpdate={jest.fn()}
        />,
        landlordUser
      );

      // Landlord sees Review button
      const reviewButton = screen.getByRole('button', { name: /review/i });
      expect(reviewButton).toBeInTheDocument();

      // Click Review
      await user.click(reviewButton);

      // Modal opens
      await waitFor(() => {
        expect(screen.getByText('Review Maintenance Request')).toBeInTheDocument();
      });

      // Select Approve
      const approveButton = screen.getByRole('button', { name: /approve/i });
      await user.click(approveButton);

      // Confirm approval
      const confirmButton = screen.getByRole('button', { name: /confirm approval/i });
      await user.click(confirmButton);

      // Verify API call
      await waitFor(() => {
        expect(mockMaintenanceService.approveRejectMaintenanceRequest).toHaveBeenCalledWith(
          1,
          {
            action: 'approve',
            rejection_reason: undefined,
          }
        );
      });
    });

    it('should complete full rejection workflow', async () => {
      const user = userEvent.setup();

      const landlordUser = {
        id: 100,
        role: 'landlord',
        email: 'landlord@example.com',
      };

      mockMaintenanceService.approveRejectMaintenanceRequest.mockResolvedValueOnce({
        success: true,
        message: 'Maintenance request rejected successfully',
        data: {
          ...mockPendingRequest,
          status: 'rejected',
        },
      });

      renderWithProviders(
        <MaintenanceRequestCard
          request={mockPendingRequest}
          onUpdate={jest.fn()}
        />,
        landlordUser
      );

      // Click Review
      const reviewButton = screen.getByRole('button', { name: /review/i });
      await user.click(reviewButton);

      // Modal opens
      await waitFor(() => {
        expect(screen.getByText('Review Maintenance Request')).toBeInTheDocument();
      });

      // Select Reject
      const rejectButton = screen.getByRole('button', { name: /reject/i });
      await user.click(rejectButton);

      // Enter rejection reason
      const reasonField = screen.getByLabelText(/rejection reason/i);
      await user.type(reasonField, 'Not covered under lease agreement');

      // Confirm rejection
      const confirmButton = screen.getByRole('button', { name: /confirm rejection/i });
      await user.click(confirmButton);

      // Verify API call
      await waitFor(() => {
        expect(mockMaintenanceService.approveRejectMaintenanceRequest).toHaveBeenCalledWith(
          1,
          {
            action: 'reject',
            rejection_reason: 'Not covered under lease agreement',
          }
        );
      });
    });
  });

  describe('Role-Based Workflow Access', () => {
    it('should allow Super Admin to approve any request', async () => {
      const user = userEvent.setup();

      const superAdminUser = {
        id: 999,
        role: 'super_admin',
        email: 'admin@example.com',
      };

      mockMaintenanceService.approveRejectMaintenanceRequest.mockResolvedValueOnce({
        success: true,
        message: 'Maintenance request approved successfully',
        data: {
          ...mockPendingRequest,
          status: 'approved',
        },
      });

      renderWithProviders(
        <MaintenanceRequestCard
          request={mockPendingRequest}
          onUpdate={jest.fn()}
        />,
        superAdminUser
      );

      // Super admin sees Review button
      expect(screen.getByRole('button', { name: /review/i })).toBeInTheDocument();
    });

    it('should allow assigned Caretaker to approve request', async () => {
      const caretakerUser = {
        id: 200,
        role: 'caretaker',
        email: 'caretaker@example.com',
      };

      const requestWithCaretaker = {
        ...mockPendingRequest,
        caretaker: {
          id: 200,
          first_name: 'Jane',
          last_name: 'Smith',
        },
      };

      renderWithProviders(
        <MaintenanceRequestCard
          request={requestWithCaretaker}
          onUpdate={jest.fn()}
        />,
        caretakerUser
      );

      // Assigned caretaker sees Review button
      expect(screen.getByRole('button', { name: /review/i })).toBeInTheDocument();
    });

    it('should NOT allow non-owner Landlord to review', () => {
      const otherLandlordUser = {
        id: 999,
        role: 'landlord',
        email: 'other@example.com',
      };

      renderWithProviders(
        <MaintenanceRequestCard
          request={mockPendingRequest}
          onUpdate={jest.fn()}
        />,
        otherLandlordUser
      );

      // Non-owner landlord should NOT see Review button
      expect(screen.queryByRole('button', { name: /review/i })).not.toBeInTheDocument();
    });

    it('should NOT allow Tenant to approve/reject', () => {
      const tenantUser = {
        id: 1,
        role: 'tenant',
        email: 'tenant@example.com',
      };

      renderWithProviders(
        <MaintenanceRequestCard
          request={mockPendingRequest}
          onUpdate={jest.fn()}
        />,
        tenantUser
      );

      // Tenant should NOT see Review button
      expect(screen.queryByRole('button', { name: /review/i })).not.toBeInTheDocument();
    });
  });

  describe('Workflow State Transitions', () => {
    it('should not show Review button after approval', () => {
      const landlordUser = {
        id: 100,
        role: 'landlord',
        email: 'landlord@example.com',
      };

      const approvedRequest = {
        ...mockPendingRequest,
        status: 'approved' as const,
      };

      renderWithProviders(
        <MaintenanceRequestCard
          request={approvedRequest}
          onUpdate={jest.fn()}
        />,
        landlordUser
      );

      // Review button should not be visible for approved request
      expect(screen.queryByRole('button', { name: /review/i })).not.toBeInTheDocument();
    });

    it('should not show Review button after rejection', () => {
      const landlordUser = {
        id: 100,
        role: 'landlord',
        email: 'landlord@example.com',
      };

      const rejectedRequest = {
        ...mockPendingRequest,
        status: 'rejected' as const,
      };

      renderWithProviders(
        <MaintenanceRequestCard
          request={rejectedRequest}
          onUpdate={jest.fn()}
        />,
        landlordUser
      );

      // Review button should not be visible for rejected request
      expect(screen.queryByRole('button', { name: /review/i })).not.toBeInTheDocument();
    });

    it('should show Review button for under_review status', () => {
      const landlordUser = {
        id: 100,
        role: 'landlord',
        email: 'landlord@example.com',
      };

      const underReviewRequest = {
        ...mockPendingRequest,
        status: 'under_review' as const,
      };

      renderWithProviders(
        <MaintenanceRequestCard
          request={underReviewRequest}
          onUpdate={jest.fn()}
        />,
        landlordUser
      );

      // Review button should be visible for under_review status
      expect(screen.getByRole('button', { name: /review/i })).toBeInTheDocument();
    });
  });

  describe('Simplified Workflow Validation', () => {
    it('should NOT include artisan assignment in approval', async () => {
      const user = userEvent.setup();

      const landlordUser = {
        id: 100,
        role: 'landlord',
        email: 'landlord@example.com',
      };

      mockMaintenanceService.approveRejectMaintenanceRequest.mockResolvedValueOnce({
        success: true,
        message: 'Maintenance request approved successfully',
        data: {
          ...mockPendingRequest,
          status: 'approved',
        },
      });

      renderWithProviders(
        <MaintenanceRequestCard
          request={mockPendingRequest}
          onUpdate={jest.fn()}
        />,
        landlordUser
      );

      // Open modal
      const reviewButton = screen.getByRole('button', { name: /review/i });
      await user.click(reviewButton);

      // Verify NO artisan fields are present
      expect(screen.queryByLabelText(/artisan name/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/phone/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/company/i)).not.toBeInTheDocument();

      // Approve
      const approveButton = screen.getByRole('button', { name: /approve/i });
      await user.click(approveButton);

      const confirmButton = screen.getByRole('button', { name: /confirm approval/i });
      await user.click(confirmButton);

      // Verify payload has NO artisan data
      await waitFor(() => {
        const callPayload = mockMaintenanceService.approveRejectMaintenanceRequest.mock.calls[0][1];
        expect(callPayload).not.toHaveProperty('artisan_name');
        expect(callPayload).not.toHaveProperty('offline_artisan_name');
      });
    });

    it('should NOT display SLA indicators', () => {
      const landlordUser = {
        id: 100,
        role: 'landlord',
        email: 'landlord@example.com',
      };

      renderWithProviders(
        <MaintenanceRequestCard
          request={mockPendingRequest}
          onUpdate={jest.fn()}
        />,
        landlordUser
      );

      // No SLA-related text should be visible
      expect(screen.queryByText(/hours remaining/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/overdue/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/deadline/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/escalated/i)).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle approval API errors gracefully', async () => {
      const user = userEvent.setup();

      const landlordUser = {
        id: 100,
        role: 'landlord',
        email: 'landlord@example.com',
      };

      mockMaintenanceService.approveRejectMaintenanceRequest.mockRejectedValueOnce(
        new Error('Network error')
      );

      renderWithProviders(
        <MaintenanceRequestCard
          request={mockPendingRequest}
          onUpdate={jest.fn()}
        />,
        landlordUser
      );

      // Open modal and approve
      const reviewButton = screen.getByRole('button', { name: /review/i });
      await user.click(reviewButton);

      const approveButton = screen.getByRole('button', { name: /approve/i });
      await user.click(approveButton);

      const confirmButton = screen.getByRole('button', { name: /confirm approval/i });
      await user.click(confirmButton);

      // Modal should remain open on error
      await waitFor(() => {
        expect(screen.getByText('Review Maintenance Request')).toBeInTheDocument();
      });
    });
  });
});

