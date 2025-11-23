/**
 * Invoices Slice - Minimal Redux slice for backward compatibility
 */

import { createSlice } from "@reduxjs/toolkit";

interface InvoicesState {
  invoices: any[];
  loading: boolean;
  error: string | null;
}

const initialState: InvoicesState = {
  invoices: [],
  loading: false,
  error: null,
};

const invoicesSlice = createSlice({
  name: "invoices",
  initialState,
  reducers: {},
});

export default invoicesSlice.reducer;

