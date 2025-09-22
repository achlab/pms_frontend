import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import type { DashboardStats, Activity } from "@/types/dashboard"
import { api } from "@/lib/api"

interface TenantStats {
  unitAddress: string
  moveInDate: string
  currentBalance: number
  status: "paid" | "pending" | "overdue"
  nextRentDue: string
  nextRentAmount: number
  lastPaymentDate: string
  lastPaymentAmount: number
}

interface DashboardState {
  stats: DashboardStats | null
  tenantStats: TenantStats | null
  activities: Activity[]
  loading: boolean
  error: string | null
  widgetVisibility: {
    revenue: boolean
    occupancy: boolean
    payments: boolean
    maintenance: boolean
    activities: boolean
  }
}

const initialState: DashboardState = {
  stats: null,
  tenantStats: null,
  activities: [],
  loading: false,
  error: null,
  widgetVisibility: {
    revenue: true,
    occupancy: true,
    payments: true,
    maintenance: true,
    activities: true,
  },
}

// Mock data for development
const mockTenantStats: TenantStats = {
  unitAddress: "East Legon Heights, Unit B12",
  moveInDate: "Jan 15, 2023",
  currentBalance: 925.0,
  status: "overdue",
  nextRentDue: "Nov 5, 2023",
  nextRentAmount: 800.0,
  lastPaymentDate: "Sep 28, 2023",
  lastPaymentAmount: 800.0,
}

const mockActivities: Activity[] = [
  {
    id: "1",
    type: "maintenance_request",
    title: "submitted a maintenance request for leaking tap",
    description: "Kitchen tap leaking - urgent repair needed",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    type: "payment_confirmed",
    title: "confirmed cash payment of ₵800",
    description: "Monthly rent payment - awaiting landlord verification",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    type: "lease_viewed",
    title: "viewed your lease agreement",
    description: "Accessed lease document for reference",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchStats",
  async (_, { getState }) => {
    try {
      // For development, return mock data based on user role
      const state = getState() as { users: { currentUser: { role: string } } }
      const userRole = state.users.currentUser?.role

      if (userRole === "tenant") {
        return {
          tenantStats: mockTenantStats,
          activities: mockActivities,
        }
      }

      const stats = await api.getDashboardStats()
      return { stats }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      return { stats: null }
    }
  }
)

export const fetchActivities = createAsyncThunk(
  "dashboard/fetchActivities",
  async (_, { getState }) => {
    try {
      // For development, return mock data based on user role
      const state = getState() as { users: { currentUser: { role: string } } }
      const userRole = state.users.currentUser?.role

      if (userRole === "tenant") {
        return mockActivities
      }

      const activities = await api.getActivities()
      return activities
    } catch (error) {
      console.error("Error fetching activities:", error)
      return []
    }
  }
)

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    toggleWidget: (state, action) => {
      const widget = action.payload
      state.widgetVisibility[widget] = !state.widgetVisibility[widget]
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload.tenantStats) {
          state.tenantStats = action.payload.tenantStats
        } else {
          state.stats = action.payload.stats
        }
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch dashboard stats"
      })
      // Fetch activities
      .addCase(fetchActivities.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.loading = false
        state.activities = action.payload
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch activities"
      })
  },
})

export const { toggleWidget, clearError } = dashboardSlice.actions
export default dashboardSlice.reducer