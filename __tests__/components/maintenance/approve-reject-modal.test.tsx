import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApproveRejectModal } from '@/components/maintenance/approve-reject-modal';
import { MaintenanceRequest } from '@/lib/api-types';
import * as maintenanceApprovalHooks from '@/lib/hooks/use-maintenance-approval';

// Mock the hooks
jest.mock('@/lib/hooks/use-maintenance-approval');
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockMaintenanceRequest: MaintenanceRequest = {
  id: '123',
  request_number: 'MR2025110001',
  title: 'Leaky faucet in kitchen',
  description: 'The kitchen faucet has been leaking for two days and needs immediate attention.',
  status: 'received',
  priority: 'urgent',
  property: {
    id: 'prop-1',
    name: 'Test Property',
    address: '123 Test St',
    landlord_id: 'landlord-1'
  },
  unit: {
    id: 'unit-1',
    unit_number: '101',
    property_id: 'prop-1'
  },
  tenant: {
    id: 'tenant-1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'tenant'
  },
  category: {
    id: 'cat-1',
    name: 'Plumbing',
    icon: 'wrench',
    color: '#3B82F6'
  },
  created_at: '2025-11-27T10:00:00Z',
  updated_at: '2025-11-27T10:00:00Z'
};

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('ApproveRejectModal', () => {
  const mockMutateAsync = jest.fn();
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    (maintenanceApprovalHooks.useApproveRejectMaintenanceRequest as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });

  it('renders modal with maintenance request details', () => {
    renderWithQueryClient(
      <ApproveRejectModal
        isOpen={true}
        onClose={mockOnClose}
        maintenanceRequest={mockMaintenanceRequest}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('Review Maintenance Request')).toBeInTheDocument();
    expect(screen.getByText('Leaky faucet in kitchen')).toBeInTheDocument();
    expect(screen.getByText('The kitchen faucet has been leaking for two days and needs immediate attention.')).toBeInTheDocument();
    expect(screen.getByText('Test Property - Unit 101')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Plumbing')).toBeInTheDocument();
  });

  it('shows approve and reject buttons', () => {
    renderWithQueryClient(
      <ApproveRejectModal
        isOpen={true}
        onClose={mockOnClose}
        maintenanceRequest={mockMaintenanceRequest}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('Approve Request')).toBeInTheDocument();
    expect(screen.getByText('Reject Request')).toBeInTheDocument();
  });

  it('shows rejection reason field when reject is selected', async () => {
    renderWithQueryClient(
      <ApproveRejectModal
        isOpen={true}
        onClose={mockOnClose}
        maintenanceRequest={mockMaintenanceRequest}
        onSuccess={mockOnSuccess}
      />
    );

    const rejectButton = screen.getByText('Reject Request');
    fireEvent.click(rejectButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/Rejection Reason/)).toBeInTheDocument();
      expect(screen.getByText('Minimum 10 characters required')).toBeInTheDocument();
    });
  });

  it('validates rejection reason length', async () => {
    renderWithQueryClient(
      <ApproveRejectModal
        isOpen={true}
        onClose={mockOnClose}
        maintenanceRequest={mockMaintenanceRequest}
        onSuccess={mockOnSuccess}
      />
    );

    // Select reject
    const rejectButton = screen.getByText('Reject Request');
    fireEvent.click(rejectButton);

    // Try to submit with short reason
    const reasonField = await screen.findByLabelText(/Rejection Reason/);
    fireEvent.change(reasonField, { target: { value: 'Too short' } });

    const submitButton = screen.getByRole('button', { name: /Reject Request/ });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when rejection reason is long enough', async () => {
    renderWithQueryClient(
      <ApproveRejectModal
        isOpen={true}
        onClose={mockOnClose}
        maintenanceRequest={mockMaintenanceRequest}
        onSuccess={mockOnSuccess}
      />
    );

    // Select reject
    const rejectButton = screen.getByText('Reject Request');
    fireEvent.click(rejectButton);

    // Enter valid reason
    const reasonField = await screen.findByLabelText(/Rejection Reason/);
    fireEvent.change(reasonField, { 
      target: { value: 'This is a valid rejection reason that is long enough' } 
    });

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /Reject Request/ });
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('submits approval successfully', async () => {
    mockMutateAsync.mockResolvedValue({});

    renderWithQueryClient(
      <ApproveRejectModal
        isOpen={true}
        onClose={mockOnClose}
        maintenanceRequest={mockMaintenanceRequest}
        onSuccess={mockOnSuccess}
      />
    );

    // Select approve
    const approveButton = screen.getByText('Approve Request');
    fireEvent.click(approveButton);

    // Submit
    const submitButton = screen.getByRole('button', { name: /Approve Request/ });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        requestId: '123',
        action: 'approve',
        rejection_reason: undefined,
      });
    });

    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('submits rejection with reason successfully', async () => {
    mockMutateAsync.mockResolvedValue({});

    renderWithQueryClient(
      <ApproveRejectModal
        isOpen={true}
        onClose={mockOnClose}
        maintenanceRequest={mockMaintenanceRequest}
        onSuccess={mockOnSuccess}
      />
    );

    // Select reject
    const rejectButton = screen.getByText('Reject Request');
    fireEvent.click(rejectButton);

    // Enter reason
    const reasonField = await screen.findByLabelText(/Rejection Reason/);
    const rejectionReason = 'This issue is tenant responsibility according to lease agreement.';
    fireEvent.change(reasonField, { target: { value: rejectionReason } });

    // Submit
    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /Reject Request/ });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        requestId: '123',
        action: 'reject',
        rejection_reason: rejectionReason,
      });
    });

    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('closes modal when cancel is clicked', () => {
    renderWithQueryClient(
      <ApproveRejectModal
        isOpen={true}
        onClose={mockOnClose}
        maintenanceRequest={mockMaintenanceRequest}
        onSuccess={mockOnSuccess}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows loading state during submission', () => {
    (maintenanceApprovalHooks.useApproveRejectMaintenanceRequest as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
    });

    renderWithQueryClient(
      <ApproveRejectModal
        isOpen={true}
        onClose={mockOnClose}
        maintenanceRequest={mockMaintenanceRequest}
        onSuccess={mockOnSuccess}
      />
    );

    // Select approve
    const approveButton = screen.getByText('Approve Request');
    fireEvent.click(approveButton);

    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });
});
