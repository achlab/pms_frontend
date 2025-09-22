import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"

export interface MaintenanceTicket {
  id: number
  propertyId: number
  tenantId?: number
  title: string
  description: string
  priority: "low" | "medium" | "high"
  status: "open" | "in-progress" | "resolved" | "closed"
  assignedTo?: number
  assignedToType?: "caretaker" | "vendor"
  category: "plumbing" | "electrical" | "hvac" | "appliance" | "structural" | "other"
  estimatedCost?: number
  actualCost?: number
  scheduledDate?: string
  completedDate?: string
  images?: string[]
  notes?: string[]
  createdAt: string
  updatedAt: string
}

interface MaintenanceState {
  tickets: MaintenanceTicket[]
  loading: boolean
  error: string | null
  filters: {
    status: string
    priority: string
    property: string
    assignee: string
    category: string
  }
  selectedTickets: number[]
}

const initialState: MaintenanceState = {
  tickets: [
    {
      id: 1,
      propertyId: 1,
      tenantId: 1,
      title: "Leaky Faucet",
      description: "Kitchen faucet is dripping constantly, causing water waste and potential damage",
      priority: "medium",
      status: "open",
      category: "plumbing",
      estimatedCost: 150,
      createdAt: "2024-01-20",
      updatedAt: "2024-01-20",
      images: ["/placeholder.svg?key=zlhhm"],
      notes: ["Tenant reported issue via portal", "Scheduled for inspection"],
    },
    {
      id: 2,
      propertyId: 2,
      tenantId: 2,
      title: "HVAC Not Working",
      description: "Air conditioning unit not cooling properly, temperature not reaching set point",
      priority: "high",
      status: "in-progress",
      category: "hvac",
      assignedTo: 2,
      assignedToType: "caretaker",
      estimatedCost: 300,
      actualCost: 275,
      scheduledDate: "2024-01-25",
      createdAt: "2024-01-18",
      updatedAt: "2024-01-24",
      notes: ["Assigned to John (Caretaker)", "Parts ordered", "Repair in progress"],
    },
    {
      id: 3,
      propertyId: 1,
      title: "Broken Window",
      description: "Living room window cracked, needs replacement for security",
      priority: "high",
      status: "resolved",
      category: "structural",
      assignedTo: 3,
      assignedToType: "vendor",
      actualCost: 450,
      completedDate: "2024-01-22",
      createdAt: "2024-01-15",
      updatedAt: "2024-01-22",
      notes: ["Emergency repair completed", "Window replaced with upgraded glass"],
    },
  ],
  loading: false,
  error: null,
  filters: {
    status: "all",
    priority: "all",
    property: "all",
    assignee: "all",
    category: "all",
  },
  selectedTickets: [],
}

// Async thunks
export const fetchTickets = createAsyncThunk("maintenance/fetchTickets", async () => {
  // Mock API call
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return initialState.tickets
})

export const createTicket = createAsyncThunk(
  "maintenance/createTicket",
  async (ticketData: Omit<MaintenanceTicket, "id" | "createdAt" | "updatedAt">) => {
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    const newTicket: MaintenanceTicket = {
      ...ticketData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return newTicket
  }
)

export const assignTicket = createAsyncThunk(
  "maintenance/assignTicket",
  async ({ ticketId, assignedTo, assignedToType }: { ticketId: number; assignedTo: number; assignedToType: "caretaker" | "vendor" }) => {
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { ticketId, assignedTo, assignedToType, updatedAt: new Date().toISOString() }
  }
)

export const updateTicketStatus = createAsyncThunk(
  "maintenance/updateTicketStatus",
  async ({ ticketId, status, notes }: { ticketId: number; status: MaintenanceTicket["status"]; notes?: string }) => {
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { 
      ticketId, 
      status, 
      updatedAt: new Date().toISOString(),
      completedDate: status === "resolved" ? new Date().toISOString() : undefined,
      notes
    }
  }
)

const maintenanceSlice = createSlice({
  name: "maintenance",
  initialState,
  reducers: {
    addTicket: (state, action: PayloadAction<MaintenanceTicket>) => {
      state.tickets.push(action.payload)
    },
    updateTicket: (state, action: PayloadAction<MaintenanceTicket>) => {
      const index = state.tickets.findIndex((t) => t.id === action.payload.id)
      if (index !== -1) {
        state.tickets[index] = action.payload
      }
    },
    deleteTicket: (state, action: PayloadAction<number>) => {
      state.tickets = state.tickets.filter((t) => t.id !== action.payload)
      state.selectedTickets = state.selectedTickets.filter((id) => id !== action.payload)
    },
    setFilters: (state, action: PayloadAction<Partial<MaintenanceState["filters"]>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    toggleTicketSelection: (state, action: PayloadAction<number>) => {
      const ticketId = action.payload
      const index = state.selectedTickets.indexOf(ticketId)
      if (index > -1) {
        state.selectedTickets.splice(index, 1)
      } else {
        state.selectedTickets.push(ticketId)
      }
    },
    clearSelectedTickets: (state) => {
      state.selectedTickets = []
    },
    addTicketNote: (state, action: PayloadAction<{ ticketId: number; note: string }>) => {
      const ticket = state.tickets.find((t) => t.id === action.payload.ticketId)
      if (ticket) {
        if (!ticket.notes) ticket.notes = []
        ticket.notes.push(`${new Date().toLocaleString()}: ${action.payload.note}`)
        ticket.updatedAt = new Date().toISOString()
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tickets
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false
        state.tickets = action.payload
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch tickets"
      })
      // Create ticket
      .addCase(createTicket.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.loading = false
        state.tickets.unshift(action.payload)
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to create ticket"
      })
      // Assign ticket
      .addCase(assignTicket.fulfilled, (state, action) => {
        const ticket = state.tickets.find((t) => t.id === action.payload.ticketId)
        if (ticket) {
          ticket.assignedTo = action.payload.assignedTo
          ticket.assignedToType = action.payload.assignedToType
          ticket.updatedAt = action.payload.updatedAt
          ticket.status = "in-progress"
          if (!ticket.notes) ticket.notes = []
          ticket.notes.push(`${new Date().toLocaleString()}: Assigned to ${action.payload.assignedToType}`)
        }
      })
      // Update ticket status
      .addCase(updateTicketStatus.fulfilled, (state, action) => {
        const ticket = state.tickets.find((t) => t.id === action.payload.ticketId)
        if (ticket) {
          ticket.status = action.payload.status
          ticket.updatedAt = action.payload.updatedAt
          if (action.payload.completedDate) {
            ticket.completedDate = action.payload.completedDate
          }
          if (action.payload.notes) {
            if (!ticket.notes) ticket.notes = []
            ticket.notes.push(`${new Date().toLocaleString()}: ${action.payload.notes}`)
          }
        }
      })
  },
})

export const {
  addTicket,
  updateTicket,
  deleteTicket,
  setFilters,
  toggleTicketSelection,
  clearSelectedTickets,
  addTicketNote,
} = maintenanceSlice.actions

export default maintenanceSlice.reducer
