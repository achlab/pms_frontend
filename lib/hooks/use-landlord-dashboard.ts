import { useQuery } from '@tanstack/react-query';
import { landlordDashboardService, DashboardResponse } from '../services/landlord-dashboard.service';

export function useLandlordDashboard(timeframe: 'week' | 'month' | 'quarter' | 'year' = 'month') {
  return useQuery<DashboardResponse>({
    queryKey: ['landlord-dashboard', timeframe],
    queryFn: async () => {
      console.log('🔄 Fetching dashboard data for timeframe:', timeframe);
      try {
        const result = await landlordDashboardService.getDashboard(timeframe);
        console.log('✅ Dashboard data fetched successfully:', result);
        return result;
      } catch (error) {
        console.error('❌ Dashboard fetch error:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1, // Retry once on failure
  });
}

