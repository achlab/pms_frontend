import { apiClient } from '../api-client';

export interface DashboardOverview {
  total_properties: number;
  total_units: number;
  occupied_units: number;
  occupancy_rate: number;
  total_tenants: number;
  expiring_leases: number;
}

export interface DashboardRevenue {
  total: number;
  this_period: number;
  previous_period: number;
  change_percentage: number;
  pending: number;
  pending_count: number;
  overdue: number;
  overdue_count: number;
}

export interface DashboardMaintenance {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  urgent: number;
}

export interface MonthlyRevenueData {
  month: string;
  revenue: number;
}

export interface PropertyPerformance {
  id: string;
  name: string;
  address: string;
  units: number;
  occupied_units: number;
  occupancy_rate: number;
  revenue: number;
}

export interface RecentActivity {
  id: string;
  type: 'payment' | 'maintenance';
  amount?: number;
  status: string;
  title?: string;
  priority?: string;
  tenant?: string;
  property?: string;
  date?: string;
  created_at: string;
}

export interface DashboardData {
  overview: DashboardOverview;
  revenue: DashboardRevenue;
  maintenance: DashboardMaintenance;
  charts: {
    monthly_revenue: MonthlyRevenueData[];
  };
  property_performance: PropertyPerformance[];
  recent_activity: RecentActivity[];
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
  timeframe: string;
}

export const landlordDashboardService = {
  /**
   * Get landlord dashboard statistics
   */
  getDashboard: async (timeframe: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<DashboardResponse> => {
    const response = await apiClient.get<DashboardResponse>('/landlord/dashboard', {
      params: { timeframe }
    });
    return response.data;
  },
};

