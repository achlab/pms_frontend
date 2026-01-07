/**
 * Tests for ApproveRejectModal Component
 * Simplified workflow: approve or reject with reason, no artisan assignment
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApproveRejectModal } from '@/components/maintenance/approve-reject-modal';
import { useApproveRejectMaintenanceRequest } from '@/lib/hooks/use-maintenance-approval';
import type { MaintenanceRequest } from '@/lib/api-types';

// Mock the hooks
jest.mock('@/lib/hooks/use-maintenance-approval');
jest.mock('@/hooks/use-toast');

const mockMutateAsync = jest.fn();
const mockUseApproveRejectMaintenanceRequest = useApproveRejectMaintenanceRequest as jest.MockedFunction<
  typeof useApproveRejectMaintenanceRequest
>;

describe('ApproveRejectModal - Simplified Workflow', () => {
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
    created_at: '2026-01-07T10:00:00Z',
    updated_at: '2026-01-07T10:00:00Z',
  } as MaintenanceRequest;

  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseApproveRejectMaintenanceRequest.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      isError: false,
      error: null,
    } as any);
  });

  describe('Modal Display', () => {
    it('should render modal when open', () => {
      render(
        <ApproveRejectModal
          isOpen={true}
          onClose={mockOnClose}
          maintenanceRequest={mockMaintenanceRequest}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByText('Review Maintenance Request')).toBeInTheDocument();
      expect(screen.getByText('MNT-2026-001')).toBeInTheDocument();
      expect(screen.getByText('Sunset Apartments')).toBeInTheDocument();
    });

    it('should not render modal when closed', () => {
      render(
        <ApproveRejectModal
          isOpen={false}
          onClose={mockOnClose}
          maintenanceRequest={mockMaintenanceRequest}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.queryByText('Review Maintenance Request')).not.toBeInTheDocument();
    });

    it('should display request details correctly', () => {
      render(
        <ApproveRejectModal
          isOpen={true}
          onClose={mockOnClose}
          maintenanceRequest={mockMaintenanceRequest}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByText('Leaking faucet in kitchen')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('A101')).toBeInTheDocument();
      expect(screen.getByText('Plumbing')).toBeInTheDocument();
    });
  });

  describe('Approve Action', () => {
    it('should allow selecting approve action', async () => {
      const user = userEvent.setup();
      render(
        <ApproveRejectModal
          isOpen={true}
          onClose={mockOnClose}
          maintenanceRequest={mockMaintenanceRequest}
          onSuccess={mockOnSuccess}
        />
      );

      const approveButton = screen.getByRole('button', { name: /approve/i });
      await user.click(approveButton);

      expect(approveButton).toHaveClass('bg-green-600');
    });

    it('should submit approval without requiring additional fields', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValueOnce({ success: true });

      render(
        <ApproveRejectModal
          isOpen={true}
          onClose={mockOnClose}
          maintenanceRequest={mockMaintenanceRequest}
          onSuccess={mockOnSuccess}
        />
      );

      // Select approve
      const approveButton = screen.getByRole('button', { name: /approve/i });
      await user.click(approveButton);

      // Submit should be enabled immediately
      const submitButton = screen.getByRole('button', { name: /confirm approval/i });
      expect(submitButton).not.toBeDisabled();

      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          requestId: 1,
          action: 'approve',
          rejection_reason: undefined,
        });
      });

      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should NOT show artisan assignment fields', () => {
      render(
        <ApproveRejectModal
          isOpen={true}
          onClose={mockOnClose}
          maintenanceRequest={mockMaintenanceRequest}
          onSuccess={mockOnSuccess}
        />
      );

      // These fields should NOT exist in simplified workflow
      expect(screen.queryByLabelText(/artisan name/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/phone/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/company/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/notes/i)).not.toBeInTheDocument();
    });
  });

  describe('Reject Action', () => {
    it('should allow selecting reject action', async () => {
      const user = userEvent.setup();
      render(
        <ApproveRejectModal
          isOpen={true}
          onClose={mockOnClose}
          maintenanceRequest={mockMaintenanceRequest}
          onSuccess={mockOnSuccess}
        />
      );

      const rejectButton = screen.getByRole('button', { name: /reject/i });
      await user.click(rejectButton);

      expect(rejectButton).toHaveClass('bg-red-600');
    });

    it('should show rejection reason field when reject is selected', async () => {
      const user = userEvent.setup();
      render(
        <ApproveRejectModal
          isOpen={true}
          onClose={mockOnClose}
          maintenanceRequest={mockMaintenanceRequest}
          onSuccess={mockOnSuccess}
        />
      );

      const rejectButton = screen.getByRole('button', { name: /reject/i });
      await user.click(rejectButton);

      expect(screen.getByLabelText(/rejection reason/i)).toBeInTheDocument();
    });

    it('should require rejection reason with minimum 10 characters', async () => {
      const user = userEvent.setup();
      render(
        <ApproveRejectModal
          isOpen={true}
          onClose={mockOnClose}
          maintenanceRequest={mockMaintenanceRequest}
          onSuccess={mockOnSuccess}
        />
      );

      // Select reject
      const rejectButton = screen.getByRole('button', { name: /reject/i });
      await user.click(rejectButton);

      const submitButton = screen.getByRole('button', { name: /confirm rejection/i });

      // Should be disabled without reason
      expect(submitButton).toBeDisabled();

      // Enter short reason (less than 10 chars)
      const reasonField = screen.getByLabelText(/rejection reason/i);
      await user.type(reasonField, 'Too short');

      // Should still be disabled
      expect(submitButton).toBeDisabled();

      // Enter valid reason (10+ chars)
      await user.clear(reasonField);
      await user.type(reasonField, 'Not covered under lease agreement');

      // Should now be enabled
      expect(submitButton).not.toBeDisabled();
    });

    it('should submit rejection with reason', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValueOnce({ success: true });

      render(
        <ApproveRejectModal
          isOpen={true}
          onClose={mockOnClose}
          maintenanceRequest={mockMaintenanceRequest}
          onSuccess={mockOnSuccess}
        />
      );

      // Select reject
      const rejectButton = screen.getByRole('button', { name: /reject/i });
      await user.click(rejectButton);

      // Enter rejection reason
      const reasonField = screen.getByLabelText(/rejection reason/i);
      await user.type(reasonField, 'Not covered under lease agreement');

      // Submit
      const submitButton = screen.getByRole('button', { name: /confirm rejection/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          requestId: 1,
          action: 'reject',
          rejection_reason: 'Not covered under lease agreement',
        });
      });

      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should show character count for rejection reason', async () => {
      const user = userEvent.setup();
      render(
        <ApproveRejectModal
          isOpen={true}
          onClose={mockOnClose}
          maintenanceRequest={mockMaintenanceRequest}
          onSuccess={mockOnSuccess}
        />
      );

      // Select reject
      const rejectButton = screen.getByRole('button', { name: /reject/i });
      await user.click(rejectButton);

      const reasonField = screen.getByLabelText(/rejection reason/i);
      await user.type(reasonField, 'Test reason');

      expect(screen.getByText(/11 characters/i)).toBeInTheDocument();
    });
  });

  describe('Modal Behavior', () => {
    it('should reset form when closed', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <ApproveRejectModal
          isOpen={true}
          onClose={mockOnClose}
          maintenanceRequest={mockMaintenanceRequest}
          onSuccess={mockOnSuccess}
        />
      );

      // Select reject and enter reason
      const rejectButton = screen.getByRole('button', { name: /reject/i });
      await user.click(rejectButton);

      const reasonField = screen.getByLabelText(/rejection reason/i);
      await user.type(reasonField, 'Test rejection reason');

      // Close modal
      rerender(
        <ApproveRejectModal
          isOpen={false}
          onClose={mockOnClose}
          maintenanceRequest={mockMaintenanceRequest}
          onSuccess={mockOnSuccess}
        />
      );

      // Reopen modal
      rerender(
        <ApproveRejectModal
          isOpen={true}
          onClose={mockOnClose}
          maintenanceRequest={mockMaintenanceRequest}
          onSuccess={mockOnSuccess}
        />
      );

      // Form should be reset (no action selected)
      const submitButtons = screen.queryByRole('button', { name: /confirm/i });
      expect(submitButtons).not.toBeInTheDocument();
    });

    it('should disable submit button while submitting', async () => {
      const user = userEvent.setup();
      mockUseApproveRejectMaintenanceRequest.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: true,
        isError: false,
        error: null,
      } as any);

      render(
        <ApproveRejectModal
          isOpen={true}
          onClose={mockOnClose}
          maintenanceRequest={mockMaintenanceRequest}
          onSuccess={mockOnSuccess}
        />
      );

      // Select approve
      const approveButton = screen.getByRole('button', { name: /approve/i });
      await user.click(approveButton);

      const submitButton = screen.getByRole('button', { name: /confirm approval/i });
      expect(submitButton).toBeDisabled();
    });

    it('should call onClose when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(
        <ApproveRejectModal
          isOpen={true}
          onClose={mockOnClose}
          maintenanceRequest={mockMaintenanceRequest}
          onSuccess={mockOnSuccess}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockRejectedValueOnce(new Error('API Error'));

      render(
        <ApproveRejectModal
          isOpen={true}
          onClose={mockOnClose}
          maintenanceRequest={mockMaintenanceRequest}
          onSuccess={mockOnSuccess}
        />
      );

      // Select approve and submit
      const approveButton = screen.getByRole('button', { name: /approve/i });
      await user.click(approveButton);

      const submitButton = screen.getByRole('button', { name: /confirm approval/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalled();
      });

      // Should not call success or close on error
      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Different Request Statuses', () => {
    it('should show appropriate title for pending status', () => {
      render(
        <ApproveRejectModal
          isOpen={true}
          onClose={mockOnClose}
          maintenanceRequest={{ ...mockMaintenanceRequest, status: 'pending' }}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByText('Review Maintenance Request')).toBeInTheDocument();
    });

    it('should show appropriate title for under_review status', () => {
      render(
        <ApproveRejectModal
          isOpen={true}
          onClose={mockOnClose}
          maintenanceRequest={{ ...mockMaintenanceRequest, status: 'under_review' }}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByText('Review & Decide')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <ApproveRejectModal
          isOpen={true}
          onClose={mockOnClose}
          maintenanceRequest={mockMaintenanceRequest}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByLabelText(/rejection reason/i)).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(
        <ApproveRejectModal
          isOpen={true}
          onClose={mockOnClose}
          maintenanceRequest={mockMaintenanceRequest}
          onSuccess={mockOnSuccess}
        />
      );

      // Tab through elements
      await user.tab();
      expect(screen.getByRole('button', { name: /approve/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /reject/i })).toHaveFocus();
    });
  });
});
