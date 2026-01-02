/**
 * Users Slice - Minimal Redux slice for backward compatibility
 * Gradually migrating to service/hooks architecture
 */

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  email: string;
  name: string;
  role: "super_admin" | "landlord" | "tenant" | "caretaker";
  phone?: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
}

interface UsersState {
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  currentUser: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    syncAuthState: (state, action) => {
      // Sync auth state from the AuthProvider (passed as payload) or localStorage as fallback
      const authState = action.payload;

      if (authState) {
        // Use auth context state if provided
        state.currentUser = authState.user;
        state.isAuthenticated = authState.isAuthenticated;
        state.loading = authState.isLoading;
      } else {
        // Fallback to localStorage (legacy compatibility)
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;

        if (token && userStr) {
          try {
            state.currentUser = JSON.parse(userStr);
            state.isAuthenticated = true;
          } catch {
            state.currentUser = null;
            state.isAuthenticated = false;
          }
        } else {
          state.currentUser = null;
          state.isAuthenticated = false;
        }
      }
    },
    clearUser: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    },
  },
});

export const { setCurrentUser, syncAuthState, clearUser } = usersSlice.actions;

// Placeholder thunk actions for compatibility
export const createUser = (userData: any) => (dispatch: any) => {
  // TODO: Migrate to super admin user service
  console.log("createUser placeholder called", userData);
};

export const updateUser = (userId: string, updates: any) => (dispatch: any) => {
  // TODO: Migrate to super admin user service
  console.log("updateUser placeholder called", userId, updates);
};

export const addUser = (userData: any) => (dispatch: any) => {
  // TODO: Migrate to tenant service
  console.log("addUser placeholder called", userData);
};

export default usersSlice.reducer;

