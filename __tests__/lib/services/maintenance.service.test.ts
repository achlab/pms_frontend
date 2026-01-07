/**
 * Tests for Maintenance Service
 * Simplified workflow API integration
 */

import { maintenanceService } from '@/lib/services/maintenance.service';
import { apiClient } from '@/lib/api-client';
import type { ApproveRejectMaintenancePayload } from '@/lib/api-types';

// Mock the API client
jest.mock('@/lib/api-client');

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('MaintenanceService - Simplified Workflow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('approveRejectMaintenanceRequest', () => {
    it('should call PATCH /approve-reject endpoint with approve action', async () => {
      const mockResponse = {
        success: true,
        message: 'Maintenance request approved successfully',
        data: {
          id: 1,
          status: 'approved',
          request_number: 'MNT-2026-001',
        },
      };

      mockApiClient.patch.mockResolvedValueOnce({ data: mockResponse });

      const payload: ApproveRejectMaintenancePayload = {
        action: 'approve',
      };

      const result = await maintenanceService.approveRejectMaintenanceRequest(1, payload);

      expect(mockApiClient.patch).toHaveBeenCalledWith(
        '/maintenance/requests/1/approve-reject',
        payload
      );
      expect(result).toEqual(mockResponse);
    });

    it('should call PATCH /approve-reject endpoint with reject action and reason', async () => {
      const mockResponse = {
        success: true,
        message: 'Maintenance request rejected successfully',
        data: {
          id: 1,
          status: 'rejected',
          request_number: 'MNT-2026-001',
        },
      };

      mockApiClient.patch.mockResolvedValueOnce({ data: mockResponse });

      const payload: ApproveRejectMaintenancePayload = {
        action: 'reject',
        rejection_reason: 'Not covered under lease agreement',
      };

      const result = await maintenanceService.approveRejectMaintenanceRequest(1, payload);

      expect(mockApiClient.patch).toHaveBeenCalledWith(
        '/maintenance/requests/1/approve-reject',
        payload
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      const mockError = new Error('API Error');
      mockApiClient.patch.mockRejectedValueOnce(mockError);

      const payload: ApproveRejectMaintenancePayload = {
        action: 'approve',
      };

      await expect(
        maintenanceService.approveRejectMaintenanceRequest(1, payload)
      ).rejects.toThrow('API Error');
    });

    it('should NOT send assignment data (simplified workflow)', async () => {
      const mockResponse = {
        success: true,
        message: 'Maintenance request approved successfully',
        data: { id: 1, status: 'approved' },
      };

      mockApiClient.patch.mockResolvedValueOnce({ data: mockResponse });

      const payload: ApproveRejectMaintenancePayload = {
        action: 'approve',
        // No artisan assignment fields
      };

      await maintenanceService.approveRejectMaintenanceRequest(1, payload);

      const callPayload = mockApiClient.patch.mock.calls[0][1];
      
      // Verify no assignment fields are sent
      expect(callPayload).not.toHaveProperty('artisan_name');
      expect(callPayload).not.toHaveProperty('artisan_phone');
      expect(callPayload).not.toHaveProperty('artisan_company');
      expect(callPayload).not.toHaveProperty('artisan_notes');
      expect(callPayload).not.toHaveProperty('offline_artisan_name');
      expect(callPayload).not.toHaveProperty('offline_artisan_phone');
    });
  });

  describe('getMaintenanceRequests', () => {
    it('should fetch maintenance requests with filters', async () => {
      const mockResponse = {
        success: true,
        data: [
          { id: 1, request_number: 'MNT-2026-001', status: 'pending' },
          { id: 2, request_number: 'MNT-2026-002', status: 'approved' },
        ],
        meta: {
          current_page: 1,
          total: 2,
        },
      };

      mockApiClient.get.mockResolvedValueOnce({ data: mockResponse });

      const filters = {
        status: 'pending',
        priority: 'urgent',
        page: 1,
      };

      const result = await maintenanceService.getMaintenanceRequests(filters);

      expect(mockApiClient.get).toHaveBeenCalledWith('/maintenance/requests', {
        params: filters,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getMaintenanceRequest', () => {
    it('should fetch single maintenance request', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 1,
          request_number: 'MNT-2026-001',
          status: 'pending',
          description: 'Leaking faucet',
        },
      };

      mockApiClient.get.mockResolvedValueOnce({ data: mockResponse });

      const result = await maintenanceService.getMaintenanceRequest(1);

      expect(mockApiClient.get).toHaveBeenCalledWith('/maintenance/requests/1');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getMaintenanceStatistics', () => {
    it('should fetch maintenance statistics', async () => {
      const mockResponse = {
        success: true,
        data: {
          total: 100,
          open: 25,
          resolved: 75,
          by_status: {
            pending: 10,
            approved: 5,
            in_progress: 10,
            completed: 50,
            closed: 25,
          },
        },
      };

      mockApiClient.get.mockResolvedValueOnce({ data: mockResponse });

      const result = await maintenanceService.getMaintenanceStatistics();

      expect(mockApiClient.get).toHaveBeenCalledWith('/maintenance/requests/statistics');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createMaintenanceRequest', () => {
    it('should create maintenance request with FormData', async () => {
      const mockResponse = {
        success: true,
        message: 'Maintenance request created successfully',
        data: {
          id: 1,
          request_number: 'MNT-2026-001',
          status: 'pending',
        },
      };

      mockApiClient.post.mockResolvedValueOnce({ data: mockResponse });

      const formData = new FormData();
      formData.append('property_id', '1');
      formData.append('unit_id', '1');
      formData.append('category_id', '1');
      formData.append('description', 'Leaking faucet');
      formData.append('priority', 'normal');

      const result = await maintenanceService.createMaintenanceRequest(formData);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/maintenance/requests',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateMaintenanceStatus', () => {
    it('should update maintenance request status', async () => {
      const mockResponse = {
        success: true,
        message: 'Status updated successfully',
        data: {
          id: 1,
          status: 'in_progress',
        },
      };

      mockApiClient.patch.mockResolvedValueOnce({ data: mockResponse });

      const payload = {
        status: 'in_progress' as const,
        notes: 'Starting work on this request',
      };

      const result = await maintenanceService.updateMaintenanceStatus(1, payload);

      expect(mockApiClient.patch).toHaveBeenCalledWith(
        '/maintenance/requests/1/status',
        payload
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('addMaintenanceNote', () => {
    it('should add note to maintenance request', async () => {
      const mockResponse = {
        success: true,
        message: 'Note added successfully',
        data: {
          id: 1,
          content: 'This is a note',
          created_at: '2026-01-07T10:00:00Z',
        },
      };

      mockApiClient.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await maintenanceService.addMaintenanceNote(1, 'This is a note');

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/maintenance/requests/1/notes',
        { content: 'This is a note' }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getMaintenanceEvents', () => {
    it('should fetch maintenance request event history', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: 1,
            event_type: 'created',
            created_at: '2026-01-07T10:00:00Z',
          },
          {
            id: 2,
            event_type: 'approved',
            created_at: '2026-01-07T11:00:00Z',
          },
        ],
      };

      mockApiClient.get.mockResolvedValueOnce({ data: mockResponse });

      const result = await maintenanceService.getMaintenanceEvents(1);

      expect(mockApiClient.get).toHaveBeenCalledWith('/maintenance/requests/1/events');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('markMaintenanceResolution', () => {
    it('should mark request as resolved', async () => {
      const mockResponse = {
        success: true,
        message: 'Request marked as resolved',
        data: {
          id: 1,
          status: 'resolved',
        },
      };

      mockApiClient.patch.mockResolvedValueOnce({ data: mockResponse });

      const result = await maintenanceService.markMaintenanceResolution(1, {
        is_resolved: true,
      });

      expect(mockApiClient.patch).toHaveBeenCalledWith(
        '/maintenance/requests/1/mark-resolution',
        { is_resolved: true }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should mark request as unresolved with reason', async () => {
      const mockResponse = {
        success: true,
        message: 'Request marked as unresolved',
        data: {
          id: 1,
          status: 'in_progress',
        },
      };

      mockApiClient.patch.mockResolvedValueOnce({ data: mockResponse });

      const result = await maintenanceService.markMaintenanceResolution(1, {
        is_resolved: false,
        reason: 'Issue persists',
      });

      expect(mockApiClient.patch).toHaveBeenCalledWith(
        '/maintenance/requests/1/mark-resolution',
        { is_resolved: false, reason: 'Issue persists' }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('URL Construction', () => {
    it('should construct URLs without double slashes', async () => {
      mockApiClient.patch.mockResolvedValueOnce({ data: { success: true } });

      await maintenanceService.approveRejectMaintenanceRequest(1, { action: 'approve' });

      const calledUrl = mockApiClient.patch.mock.calls[0][0];
      expect(calledUrl).not.toMatch(/\/\//);
      expect(calledUrl).toBe('/maintenance/requests/1/approve-reject');
    });
  });

  describe('Deprecated Endpoints', () => {
    it('should NOT have acceptMaintenanceRequest method', () => {
      expect((maintenanceService as any).acceptMaintenanceRequest).toBeUndefined();
    });

    it('should NOT have useUrgentMaintenanceRequests', () => {
      expect((maintenanceService as any).useUrgentMaintenanceRequests).toBeUndefined();
    });

    it('should NOT have useInProgressMaintenanceRequests', () => {
      expect((maintenanceService as any).useInProgressMaintenanceRequests).toBeUndefined();
    });
  });
});

