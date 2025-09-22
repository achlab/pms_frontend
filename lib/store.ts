import { configureStore } from "@reduxjs/toolkit"
import propertiesReducer from "./slices/propertiesSlice"
import dashboardReducer from "./slices/dashboardSlice"
import usersReducer from "./slices/usersSlice"
import invoicesReducer from "./slices/invoicesSlice"
import maintenanceReducer from "./slices/maintenanceSlice"
import uiReducer from "./slices/uiSlice"

export const store = configureStore({
  reducer: {
    properties: propertiesReducer,
    dashboard: dashboardReducer,
    users: usersReducer,
    invoices: invoicesReducer,
    maintenance: maintenanceReducer,
    ui: uiReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
