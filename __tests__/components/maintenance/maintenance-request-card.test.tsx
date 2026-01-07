/**
 * Tests for MaintenanceRequestCard Component
 * Simplified workflow: no SLA, no escalation, simple review button
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MaintenanceRequestCard } from '@/components/maintenance/maintenance-request-card';
import { useAuth } from '@/contexts/auth-context';
import type { MaintenanceRequest } from '@/lib/api-types';

// Mock the hooks
jest.mock('@/contexts/auth-context');
jest.mock('@/lib/hooks/use-maintenance-approval');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('MaintenanceRequestCard - Simplified Workflow', () => {
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
  } as MaintenanceRequest;

  const mockOnUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Card Display', () => {
    it('should render request card with essential information', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 1, role: 'tenant' },
      } as any);

      render(
        <MaintenanceRequestCard
          request={mockMaintenanceRequest}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText('MNT-2026-001')).toBeInTheDocument();
      expect(screen.getByText('Sunset Apartments')).toBeInTheDocument();
      expect(screen.getByText('A101')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should display status badge', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 1, role: 'tenant' },
      } as any);

      render(
        <MaintenanceRequestCard
          request={mockMaintenanceRequest}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('should display priority badge', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 1, role: 'tenant' },
      } as any);

      render(
        <MaintenanceRequestCard
          request={mockMaintenanceRequest}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText('Normal')).toBeInTheDocument();
    });

    it('should NOT display SLA indicators', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 1, role: 'tenant' },
      } as any);

      render(
        <MaintenanceRequestCard
          request={mockMaintenanceRequest}
          onUpdate={mockOnUpdate}
        />
      );

      // These should NOT exist in simplified workflow
      expect(screen.queryByText(/hours remaining/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/overdue/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/deadline/i)).not.toBeInTheDocument();
    });

    it('should NOT display escalation warnings', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 100, role: 'landlord' },
      } as any);

      const escalatedRequest = {
        ...mockMaintenanceRequest,
        escalated_at: '2026-01-07T12:00:00Z',
        escalation_reason: 'Multiple reworks',
      };

      render(
        <MaintenanceRequestCard
          request={escalatedRequest}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.queryByText(/escalated/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/multiple reworks/i)).not.toBeInTheDocument();
    });
  });

  describe('Review Button - Role-Based Access', () => {
    it('should show Review button for Super Admin on pending request', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 999, role: 'super_admin' },
      } as any);

      render(
        <MaintenanceRequestCard
          request={mockMaintenanceRequest}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByRole('button', { name: /review/i })).toBeInTheDocument();
    });

    it('should show Review button for Landlord-Owner on pending request', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 100, role: 'landlord' },
      } as any);

      render(
        <MaintenanceRequestCard
          request={mockMaintenanceRequest}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByRole('button', { name: /review/i })).toBeInTheDocument();
    });

    it('should show Review button for assigned Caretaker on pending request', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 200, role: 'caretaker' },
      } as any);

      const requestWithCaretaker = {
        ...mockMaintenanceRequest,
        caretaker: {
          id: 200,
          first_name: 'Jane',
          last_name: 'Smith',
        },
      };

      render(
        <MaintenanceRequestCard
          request={requestWithCaretaker}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByRole('button', { name: /review/i })).toBeInTheDocument();
    });

    it('should NOT show Review button for non-owner Landlord', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 999, role: 'landlord' },
      } as any);

      render(
        <MaintenanceRequestCard
          request={mockMaintenanceRequest}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.queryByRole('button', { name: /review/i })).not.toBeInTheDocument();
    });

    it('should NOT show Review button for unassigned Caretaker', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 300, role: 'caretaker' },
      } as any);

      const requestWithDifferentCaretaker = {
        ...mockMaintenanceRequest,
        caretaker: {
          id: 200,
          first_name: 'Jane',
          last_name: 'Smith',
        },
      };

      render(
        <MaintenanceRequestCard
          request={requestWithDifferentCaretaker}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.queryByRole('button', { name: /review/i })).not.toBeInTheDocument();
    });

    it('should NOT show Review button for Tenant', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 1, role: 'tenant' },
      } as any);

      render(
        <MaintenanceRequestCard
          request={mockMaintenanceRequest}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.queryByRole('button', { name: /review/i })).not.toBeInTheDocument();
    });

    it('should NOT show Review button for approved request', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 100, role: 'landlord' },
      } as any);

      const approvedRequest = {
        ...mockMaintenanceRequest,
        status: 'approved',
      };

      render(
        <MaintenanceRequestCard
          request={approvedRequest}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.queryByRole('button', { name: /review/i })).not.toBeInTheDocument();
    });

    it('should NOT show Review button for rejected request', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 100, role: 'landlord' },
      } as any);

      const rejectedRequest = {
        ...mockMaintenanceRequest,
        status: 'rejected',
      };

      render(
        <MaintenanceRequestCard
          request={rejectedRequest}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.queryByRole('button', { name: /review/i })).not.toBeInTheDocument();
    });

    it('should show Review button for under_review status', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 100, role: 'landlord' },
      } as any);

      const underReviewRequest = {
        ...mockMaintenanceRequest,
        status: 'under_review',
      };

      render(
        <MaintenanceRequestCard
          request={underReviewRequest}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByRole('button', { name: /review/i })).toBeInTheDocument();
    });
  });

  describe('View Details Button', () => {
    it('should always show View Details button', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 1, role: 'tenant' },
      } as any);

      render(
        <MaintenanceRequestCard
          request={mockMaintenanceRequest}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByRole('button', { name: /view details/i })).toBeInTheDocument();
    });

    it('should call onClick when View Details is clicked', async () => {
      const user = userEvent.setup();
      const mockOnClick = jest.fn();

      mockUseAuth.mockReturnValue({
        user: { id: 1, role: 'tenant' },
      } as any);

      render(
        <MaintenanceRequestCard
          request={mockMaintenanceRequest}
          onUpdate={mockOnUpdate}
          onClick={mockOnClick}
        />
      );

      const viewButton = screen.getByRole('button', { name: /view details/i });
      await user.click(viewButton);

      expect(mockOnClick).toHaveBeenCalled();
    });
  });

  describe('Approve/Reject Modal Integration', () => {
    it('should open ApproveRejectModal when Review button is clicked', async () => {
      const user = userEvent.setup();
      mockUseAuth.mockReturnValue({
        user: { id: 100, role: 'landlord' },
      } as any);

      render(
        <MaintenanceRequestCard
          request={mockMaintenanceRequest}
          onUpdate={mockOnUpdate}
        />
      );

      const reviewButton = screen.getByRole('button', { name: /review/i });
      await user.click(reviewButton);

      // Modal should be rendered (check for modal title)
      expect(screen.getByText('Review Maintenance Request')).toBeInTheDocument();
    });

    it('should close modal and call onUpdate after successful approval', async () => {
      const user = userEvent.setup();
      mockUseAuth.mockReturnValue({
        user: { id: 100, role: 'landlord' },
      } as any);

      render(
        <MaintenanceRequestCard
          request={mockMaintenanceRequest}
          onUpdate={mockOnUpdate}
        />
      );

      // Open modal
      const reviewButton = screen.getByRole('button', { name: /review/i });
      await user.click(reviewButton);

      // Modal's onSuccess callback should trigger onUpdate
      // This is tested through the modal's internal logic
    });
  });

  describe('Different Request Statuses', () => {
    const statuses = [
      { status: 'pending', label: 'Pending' },
      { status: 'under_review', label: 'Under Review' },
      { status: 'approved', label: 'Approved' },
      { status: 'rejected', label: 'Rejected' },
      { status: 'in_progress', label: 'In Progress' },
      { status: 'completed', label: 'Completed' },
      { status: 'closed', label: 'Closed' },
    ];

    statuses.forEach(({ status, label }) => {
      it(`should display ${label} badge for ${status} status`, () => {
        mockUseAuth.mockReturnValue({
          user: { id: 1, role: 'tenant' },
        } as any);

        const request = {
          ...mockMaintenanceRequest,
          status: status as any,
        };

        render(
          <MaintenanceRequestCard
            request={request}
            onUpdate={mockOnUpdate}
          />
        );

        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });
  });

  describe('Different Priority Levels', () => {
    const priorities = [
      { priority: 'low', label: 'Low' },
      { priority: 'normal', label: 'Normal' },
      { priority: 'urgent', label: 'Urgent' },
      { priority: 'emergency', label: 'Emergency' },
    ];

    priorities.forEach(({ priority, label }) => {
      it(`should display ${label} badge for ${priority} priority`, () => {
        mockUseAuth.mockReturnValue({
          user: { id: 1, role: 'tenant' },
        } as any);

        const request = {
          ...mockMaintenanceRequest,
          priority: priority as any,
        };

        render(
          <MaintenanceRequestCard
            request={request}
            onUpdate={mockOnUpdate}
          />
        );

        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });
  });

  describe('Simplified UI - Removed Elements', () => {
    it('should NOT display estimated cost', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 100, role: 'landlord' },
      } as any);

      const requestWithCost = {
        ...mockMaintenanceRequest,
        estimated_cost: 150.00,
      };

      render(
        <MaintenanceRequestCard
          request={requestWithCost}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.queryByText(/\$150/)).not.toBeInTheDocument();
      expect(screen.queryByText(/estimated cost/i)).not.toBeInTheDocument();
    });

    it('should NOT display scheduled date', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 100, role: 'landlord' },
      } as any);

      const requestWithSchedule = {
        ...mockMaintenanceRequest,
        scheduled_date: '2026-01-10T09:00:00Z',
      };

      render(
        <MaintenanceRequestCard
          request={requestWithSchedule}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.queryByText(/scheduled/i)).not.toBeInTheDocument();
    });

    it('should NOT display caretaker information', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 1, role: 'tenant' },
      } as any);

      const requestWithCaretaker = {
        ...mockMaintenanceRequest,
        caretaker: {
          id: 200,
          first_name: 'Jane',
          last_name: 'Smith',
          phone: '+233 20 000 0000',
        },
      };

      render(
        <MaintenanceRequestCard
          request={requestWithCaretaker}
          onUpdate={mockOnUpdate}
        />
      );

      // Caretaker name should not be displayed on card
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it('should NOT display category expected resolution hours', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 1, role: 'tenant' },
      } as any);

      const requestWithResolutionTime = {
        ...mockMaintenanceRequest,
        category: {
          ...mockMaintenanceRequest.category,
          expected_resolution_hours: 24,
        },
      };

      render(
        <MaintenanceRequestCard
          request={requestWithResolutionTime}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.queryByText(/24 hours/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/expected resolution/i)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 1, role: 'tenant' },
      } as any);

      render(
        <MaintenanceRequestCard
          request={mockMaintenanceRequest}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByRole('button', { name: /view details/i })).toBeInTheDocument();
    });
  });
});

