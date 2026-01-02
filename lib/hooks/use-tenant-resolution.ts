import { useApiMutation } from './use-api-mutation';
import { tenantResolutionService, TenantResolutionData } from '../services/tenant-resolution.service';
import { ApiResponse, MaintenanceRequest } from '../api-types';

export function useTenantResolveRequest() {
  return useApiMutation<
    ApiResponse<MaintenanceRequest>,
    { requestId: string; data: TenantResolutionData }
  >(
    ({ requestId, data }) => tenantResolutionService.resolveRequest(requestId, data),
    {
      onSuccess: () => {
        console.log('✅ Maintenance request resolution submitted');
      },
      onError: (error) => {
        console.error('❌ Resolution failed:', error);
      },
    }
  );
}
