/**
 * Redux Store - Minimal configuration
 * Note: Gradually migrating to service/hooks architecture
 */

import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "./slices/usersSlice";
import dashboardReducer from "./slices/dashboardSlice";
import propertiesReducer from "./slices/propertiesSlice";
import maintenanceReducer from "./slices/maintenanceSlice";
import invoicesReducer from "./slices/invoicesSlice";
import uiReducer from "./slices/uiSlice";

// Create store with minimal reducers for backward compatibility
export const store = configureStore({
  reducer: {
    users: usersReducer,
    dashboard: dashboardReducer,
    properties: propertiesReducer,
    maintenance: maintenanceReducer,
    invoices: invoicesReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

