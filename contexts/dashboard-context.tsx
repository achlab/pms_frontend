"use client"

import type React from "react"
import { createContext, useContext, useReducer } from "react"
import type { DashboardStats, Activity } from "@/lib/types"
import { api } from "@/lib/api"

interface DashboardState {
  stats: DashboardStats | null
  activities: Activity[]
  loading: boolean
  error: string | null
}

type DashboardAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_STATS"; payload: DashboardStats }
  | { type: "SET_ACTIVITIES"; payload: Activity[] }
  | { type: "ADD_ACTIVITY"; payload: Activity }

const initialState: DashboardState = {
  stats: null,
  activities: [],
  loading: false,
  error: null,
}

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false }
    case "SET_STATS":
      return { ...state, stats: action.payload, loading: false, error: null }
    case "SET_ACTIVITIES":
      return { ...state, activities: action.payload, loading: false, error: null }
    case "ADD_ACTIVITY":
      return { ...state, activities: [action.payload, ...state.activities] }
    default:
      return state
  }
}

interface DashboardContextType extends DashboardState {
  fetchStats: () => Promise<void>
  fetchActivities: () => Promise<void>
  addActivity: (activity: Omit<Activity, "id" | "timestamp">) => Promise<void>
  clearError: () => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState)

  const fetchStats = async () => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      const stats = await api.getDashboardStats()
      dispatch({ type: "SET_STATS", payload: stats })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to fetch dashboard stats" })
    }
  }

  const fetchActivities = async () => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      const activities = await api.getRecentActivities()
      dispatch({ type: "SET_ACTIVITIES", payload: activities })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to fetch activities" })
    }
  }

  const addActivity = async (activityData: Omit<Activity, "id" | "timestamp">) => {
    try {
      const newActivity = await api.createActivity(activityData)
      dispatch({ type: "ADD_ACTIVITY", payload: newActivity })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to add activity" })
    }
  }

  const clearError = () => {
    dispatch({ type: "SET_ERROR", payload: null })
  }

  return (
    <DashboardContext.Provider
      value={{
        ...state,
        fetchStats,
        fetchActivities,
        addActivity,
        clearError,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider")
  }
  return context
}
