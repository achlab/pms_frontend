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
        
        // Validate the response structure
        if (!result || typeof result !== 'object') {
          console.error('❌ Invalid response structure:', result);
          throw new Error('Invalid response structure from API');
        }
        
        if (!result.data) {
          console.warn('⚠️ Response has no data property, wrapping result:', result);
          // If the API returns data directly without wrapping, handle it
          return { success: true, data: result, timeframe } as DashboardResponse;
        }
        
        return result;
      } catch (error) {
        console.error('❌ Dashboard fetch error:', error);
        console.error('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        });
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2, // Retry twice on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

