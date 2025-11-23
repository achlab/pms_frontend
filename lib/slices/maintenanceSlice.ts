/**
 * Maintenance Slice - Minimal Redux slice for backward compatibility
 */

import { createSlice } from "@reduxjs/toolkit";

interface MaintenanceState {
  tickets: any[];
  loading: boolean;
  error: string | null;
}

const initialState: MaintenanceState = {
  tickets: [],
  loading: false,
  error: null,
};

const maintenanceSlice = createSlice({
  name: "maintenance",
  initialState,
  reducers: {},
});

export default maintenanceSlice.reducer;

