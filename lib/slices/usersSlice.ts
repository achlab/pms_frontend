import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { AuthService } from "@/lib/auth"

export interface User {
  id: number
  name: string
  email: string
  role: "tenant" | "caretaker" | "landlord" | "super_admin"
  propertyId?: number
  phone?: string
  ghanaCardId?: string
  createdAt: string
  status: "active" | "inactive" | "pending_approval"
}

interface UsersState {
  users: User[]
  currentUser: User | null
  loading: boolean
  error: string | null
}

const initialState: UsersState = {
  users: [
    {
      id: 1,
      name: "Kofi Mensah",
      email: "kofi.mensah@gmail.com",
      role: "tenant",
      propertyId: 1,
      phone: "+233 24 123 4567",
      ghanaCardId: "GHA-123456789-0",
      createdAt: "2024-01-15",
      status: "active",
    },
    {
      id: 2,
      name: "Akosua Osei",
      email: "akosua.osei@gmail.com",
      role: "caretaker",
      phone: "+233 20 987 6543",
      ghanaCardId: "GHA-987654321-0",
      createdAt: "2024-02-01",
      status: "active",
    },
    {
      id: 3,
      name: "Kwame Asante",
      email: "kwame.asante@gmail.com",
      role: "super_admin",
      phone: "+233 26 555 0123",
      ghanaCardId: "GHA-555000123-0",
      createdAt: "2024-01-01",
      status: "active",
    },
  ],
  // Set the first user (tenant) as the current user for development
  currentUser: {
    id: 1,
    name: "Kofi Mensah",
    email: "kofi.mensah@gmail.com",
    role: "tenant",
    propertyId: 1,
    phone: "+233 24 123 4567",
    ghanaCardId: "GHA-123456789-0",
    createdAt: "2024-01-15",
    status: "active",
  },
  loading: false,
  error: null,
}

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    addUser: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload)
    },
    updateUser: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex((u) => u.id === action.payload.id)
      if (index !== -1) {
        state.users[index] = action.payload
      }
    },
    deleteUser: (state, action: PayloadAction<number>) => {
      state.users = state.users.filter((u) => u.id !== action.payload)
    },
    setCurrentUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload
    },
    clearCurrentUser: (state) => {
      state.currentUser = null
    },
  },
})

export const { addUser, updateUser, deleteUser, setCurrentUser, clearCurrentUser } = usersSlice.actions

// Thunk to sync auth state with Redux
export const syncAuthState = () => async (dispatch: any) => {
  console.log("syncAuthState - Starting sync...")
  try {
    const user = await AuthService.getStoredUser()
    console.log("syncAuthState - Retrieved user:", user)
    
    if (user) {
      console.log("syncAuthState - Setting current user...")
      dispatch(setCurrentUser({
        id: Number(user.id), // Convert string ID to number
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || "",
        ghanaCardId: "",
        createdAt: user.createdAt,
        status: "active",
      }))
      console.log("syncAuthState - User set in Redux")
    } else {
      console.log("syncAuthState - No user found, clearing current user")
      dispatch(clearCurrentUser())
    }
  } catch (error) {
    console.error("syncAuthState - Error syncing auth state:", error)
    dispatch(clearCurrentUser())
  }
}

export const createUser = addUser

export default usersSlice.reducer
