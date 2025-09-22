import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import type { Property } from "@/lib/types"
import { api } from "@/lib/api"

interface PropertiesState {
  properties: Property[]
  selectedProperty: Property | null
  loading: boolean
  error: string | null
  filters: {
    search: string
    status: string
    location: string
    minRevenue: number
  }
  viewMode: "grid" | "list"
  selectedProperties: number[]
}

const initialState: PropertiesState = {
  properties: [],
  selectedProperty: null,
  loading: false,
  error: null,
  filters: {
    search: "",
    status: "all",
    location: "all",
    minRevenue: 0,
  },
  viewMode: "grid",
  selectedProperties: [],
}

// Async thunks
export const fetchProperties = createAsyncThunk("properties/fetchProperties", async () => {
  const properties = await api.getProperties()
  return properties
})

export const createProperty = createAsyncThunk(
  "properties/createProperty",
  async (propertyData: Omit<Property, "id" | "createdAt" | "updatedAt">) => {
    const newProperty = await api.createProperty(propertyData)
    return newProperty
  },
)

export const updateProperty = createAsyncThunk(
  "properties/updateProperty",
  async ({ id, updates }: { id: number; updates: Partial<Property> }) => {
    const updatedProperty = await api.updateProperty(id, updates)
    return updatedProperty
  },
)

export const deleteProperty = createAsyncThunk("properties/deleteProperty", async (id: number) => {
  await api.deleteProperty(id)
  return id
})

const propertiesSlice = createSlice({
  name: "properties",
  initialState,
  reducers: {
    setSelectedProperty: (state, action: PayloadAction<Property | null>) => {
      state.selectedProperty = action.payload
    },
    setFilters: (state, action: PayloadAction<Partial<PropertiesState["filters"]>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setViewMode: (state, action: PayloadAction<"grid" | "list">) => {
      state.viewMode = action.payload
    },
    togglePropertySelection: (state, action: PayloadAction<number>) => {
      const propertyId = action.payload
      const index = state.selectedProperties.indexOf(propertyId)
      if (index > -1) {
        state.selectedProperties.splice(index, 1)
      } else {
        state.selectedProperties.push(propertyId)
      }
    },
    clearSelectedProperties: (state) => {
      state.selectedProperties = []
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch properties
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false
        state.properties = action.payload
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch properties"
      })
      // Create property
      .addCase(createProperty.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createProperty.fulfilled, (state, action) => {
        state.loading = false
        state.properties.push(action.payload)
      })
      .addCase(createProperty.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to create property"
      })
      // Update property
      .addCase(updateProperty.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.properties.findIndex((p) => p.id === action.payload!.id)
          if (index !== -1) {
            state.properties[index] = action.payload
          }
        }
      })
      // Delete property
      .addCase(deleteProperty.fulfilled, (state, action) => {
        state.properties = state.properties.filter((p) => p.id !== action.payload)
        state.selectedProperties = state.selectedProperties.filter((id) => id !== action.payload)
      })
  },
})

export const {
  setSelectedProperty,
  setFilters,
  setViewMode,
  togglePropertySelection,
  clearSelectedProperties,
  clearError,
} = propertiesSlice.actions

export default propertiesSlice.reducer
