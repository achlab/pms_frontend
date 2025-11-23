/**
 * Dashboard Slice - Minimal Redux slice for backward compatibility
 */

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface DashboardState {
  stats: any;
  activities: any[];
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: null,
  activities: [],
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setStats: (state, action: PayloadAction<any>) => {
      state.stats = action.payload;
    },
    setActivities: (state, action: PayloadAction<any[]>) => {
      state.activities = action.payload;
    },
  },
});

export const { setStats, setActivities } = dashboardSlice.actions;
export const fetchDashboardStats = () => (dispatch: any) => {
  // Placeholder - use service hooks instead
};
export const fetchActivities = () => (dispatch: any) => {
  // Placeholder - use service hooks instead
};
export default dashboardSlice.reducer;

