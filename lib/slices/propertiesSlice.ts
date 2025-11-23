/**
 * Properties Slice - Minimal Redux slice for backward compatibility
 */

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface PropertiesState {
  properties: any[];
  selectedProperties: number[];
  loading: boolean;
  error: string | null;
  filters: {
    search: string;
    status: string;
    location: string;
    type: string;
  };
  viewMode: "grid" | "list";
}

const initialState: PropertiesState = {
  properties: [],
  selectedProperties: [],
  loading: false,
  error: null,
  filters: {
    search: "",
    status: "all",
    location: "all",
    type: "all",
  },
  viewMode: "grid",
};

const propertiesSlice = createSlice({
  name: "properties",
  initialState,
  reducers: {
    setProperties: (state, action: PayloadAction<any[]>) => {
      state.properties = action.payload;
    },
    setViewMode: (state, action: PayloadAction<"grid" | "list">) => {
      state.viewMode = action.payload;
    },
    setFilters: (state, action: PayloadAction<any>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    togglePropertySelection: (state, action: PayloadAction<number>) => {
      const index = state.selectedProperties.indexOf(action.payload);
      if (index > -1) {
        state.selectedProperties.splice(index, 1);
      } else {
        state.selectedProperties.push(action.payload);
      }
    },
  },
});

export const { setProperties, setViewMode, setFilters, togglePropertySelection } = propertiesSlice.actions;

// Add missing action
export const clearSelectedProperties = () => (dispatch: any) => {
  dispatch({ type: "properties/clearSelected" });
};

export const fetchProperties = () => (dispatch: any) => {
  // Placeholder - use service hooks instead
};
export const createProperty = (data: any) => (dispatch: any) => {
  // Placeholder - use service hooks instead
};
export const updateProperty = (id: number, data: any) => (dispatch: any) => {
  // Placeholder - use service hooks instead
};
export default propertiesSlice.reducer;

