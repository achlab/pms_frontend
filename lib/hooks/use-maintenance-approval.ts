import { useApiMutation } from '@/lib/hooks/use-api-mutation';
import { maintenanceApprovalService, ApproveRejectData, ApproveRejectResponse } from '@/lib/services/maintenance-approval.service';
import { toast } from 'sonner';

export function useApproveRejectMaintenanceRequest() {
  return useApiMutation<ApproveRejectResponse, ApproveRejectData & { requestId: string }>(
    async ({ requestId, ...data }) => {
      console.log('🔄 useApproveRejectMaintenanceRequest mutation function called', { requestId, data });
      const response = await maintenanceApprovalService.approveReject(requestId, data);
      console.log('✅ useApproveRejectMaintenanceRequest mutation successful', response.data);
      return response.data;
    },
    {
      onSuccess: (data) => {
        console.log('🎉 Mutation onSuccess callback', data);
        toast.success(`Maintenance request ${data.status === 'approved' ? 'approved' : 'rejected'} successfully`);
      },
      onError: (error) => {
        console.error('💥 Mutation onError callback', error);
        toast.error(`Failed to process maintenance request`);
      },
    }
  );
}
