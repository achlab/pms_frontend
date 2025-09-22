import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface Invoice {
  id: number
  propertyId: number
  tenantId: number
  amount: number
  dueDate: string
  status: "pending" | "paid" | "overdue"
  description: string
  createdAt: string
}

interface InvoicesState {
  invoices: Invoice[]
  loading: boolean
  error: string | null
}

const initialState: InvoicesState = {
  invoices: [
    {
      id: 1,
      propertyId: 1,
      tenantId: 1,
      amount: 2500,
      dueDate: "2024-02-01",
      status: "pending",
      description: "Monthly Rent - January 2024",
      createdAt: "2024-01-01",
    },
  ],
  loading: false,
  error: null,
}

const invoicesSlice = createSlice({
  name: "invoices",
  initialState,
  reducers: {
    addInvoice: (state, action: PayloadAction<Invoice>) => {
      state.invoices.push(action.payload)
    },
    updateInvoice: (state, action: PayloadAction<Invoice>) => {
      const index = state.invoices.findIndex((i) => i.id === action.payload.id)
      if (index !== -1) {
        state.invoices[index] = action.payload
      }
    },
    deleteInvoice: (state, action: PayloadAction<number>) => {
      state.invoices = state.invoices.filter((i) => i.id !== action.payload)
    },
  },
})

export const { addInvoice, updateInvoice, deleteInvoice } = invoicesSlice.actions
export default invoicesSlice.reducer
