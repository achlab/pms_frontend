export interface User {
  id: string
  email: string
  name: string
  role: "super_admin" | "landlord" | "tenant" | "caretaker"
  phone?: string
  avatar?: string
  isVerified: boolean
  createdAt: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

// Mock user data for demonstration
const MOCK_USERS: User[] = [
  {
    id: "1",
    email: "admin@propertyhub.com",
    name: "Super Admin",
    role: "super_admin",
    phone: "+233 24 123 4567",
    isVerified: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    email: "landlord@example.com",
    name: "John Mensah",
    role: "landlord",
    phone: "+233 24 234 5678",
    isVerified: true,
    createdAt: "2024-01-02T00:00:00Z",
  },
  {
    id: "3",
    email: "tenant@example.com",
    name: "Ama Serwaa",
    role: "tenant",
    phone: "+233 24 345 6789",
    isVerified: true,
    createdAt: "2024-01-03T00:00:00Z",
  },
]

// Authentication utilities
export class AuthService {
  private static readonly TOKEN_KEY = "auth_token"
  private static readonly USER_KEY = "auth_user"

  // Get stored token
  static getToken(): string | null {
    if (typeof window === "undefined") return null
    const cookies = document.cookie.split(';')
    const tokenCookie = cookies.find(c => c.trim().startsWith(`${this.TOKEN_KEY}=`))
    return tokenCookie ? tokenCookie.split('=')[1] : null
  }

  // Store token
  static setToken(token: string): void {
    if (typeof window === "undefined") return
    document.cookie = `${this.TOKEN_KEY}=${token}; path=/; max-age=2592000; SameSite=Lax` // 30 days
  }

  // Remove token and user
  static removeToken(): void {
    if (typeof window === "undefined") return
    document.cookie = `${this.TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    document.cookie = `${this.USER_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
  }

  // Get stored user
  static getStoredUser(): User | null {
    if (typeof window === "undefined") return null
    const cookies = document.cookie.split(';')
    const userCookie = cookies.find(c => c.trim().startsWith(`${this.USER_KEY}=`))
    console.log("AuthService - Found user cookie:", userCookie)
    
    if (!userCookie) return null
    
    try {
      const cookieValue = userCookie.split('=').slice(1).join('=').trim() // Handle = in value
      const userStr = decodeURIComponent(cookieValue)
      console.log("AuthService - Retrieved user string:", userStr)
      const user = JSON.parse(userStr)
      console.log("AuthService - Parsed user:", user)
      return user
    } catch (error) {
      console.error("AuthService - Error parsing user:", error)
      return null
    }
  }

  // Store user
  static setStoredUser(user: User): void {
    if (typeof window === "undefined") return
    console.log("AuthService - Storing user:", user)
    const userStr = encodeURIComponent(JSON.stringify(user))
    document.cookie = `${this.USER_KEY}=${userStr}; path=/; max-age=2592000; SameSite=Lax` // 30 days
  }

  // Login with email/phone and password
  static async login(emailOrPhone: string, password: string): Promise<{ user: User; token: string }> {
    // Use static logins for authentication
    const { validateStaticLogin } = await import("./static-auth")
    const staticUser = validateStaticLogin(emailOrPhone, password)
    if (!staticUser) {
      throw new Error("Invalid credentials")
    }

    // Create a User object from static login
    const user: User = {
      id: `${staticUser.role}_${Date.now()}`,
      email: staticUser.email,
      name: staticUser.role.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
      role: staticUser.role,
      isVerified: true,
      createdAt: new Date().toISOString(),
    }

    // Generate mock token
    const token = `mock_token_${user.id}_${Date.now()}`

    // Store auth data
    this.setToken(token)
    this.setStoredUser(user)

    return { user, token }
  }

  // Register new user
  static async register(data: {
    name: string
    email: string
    phone: string
    password: string
    role: "landlord" | "tenant"
  }): Promise<{ user: User; token: string }> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Check if user already exists
    const existingUser = MOCK_USERS.find((u) => u.email === data.email || u.phone === data.phone)

    if (existingUser) {
      throw new Error("User already exists with this email or phone number")
    }

    // Create new user
    const newUser: User = {
      id: `${Date.now()}`,
      email: data.email,
      name: data.name,
      role: data.role,
      phone: data.phone,
      isVerified: false,
      createdAt: new Date().toISOString(),
    }

    // Add to mock users (in real app, this would be saved to database)
    MOCK_USERS.push(newUser)

    // Generate mock token
    const token = `mock_token_${newUser.id}_${Date.now()}`

    // Store auth data
    this.setToken(token)
    this.setStoredUser(newUser)

    return { user: newUser, token }
  }

  // Social media authentication
  static async socialAuth(
    provider: "google" | "facebook",
    role?: "landlord" | "tenant",
  ): Promise<{ user: User; token: string }> {
    // Simulate OAuth flow
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock social user data
    const socialUserData = {
      google: {
        email: "user@gmail.com",
        name: "Google User",
        avatar: "https://lh3.googleusercontent.com/a/default-user=s96-c",
      },
      facebook: {
        email: "user@facebook.com",
        name: "Facebook User",
        avatar: "https://graph.facebook.com/me/picture?type=large",
      },
    }

    const userData = socialUserData[provider]

    // Check if user exists
    let user = MOCK_USERS.find((u) => u.email === userData.email)

    if (!user) {
      // Create new user from social data
      user = {
        id: `social_${Date.now()}`,
        email: userData.email,
        name: userData.name,
        role: role || "tenant", // Default to tenant if no role specified
        avatar: userData.avatar,
        isVerified: true, // Social accounts are pre-verified
        createdAt: new Date().toISOString(),
      }
      MOCK_USERS.push(user)
    }

    // Generate mock token
    const token = `mock_token_${user.id}_${Date.now()}`

    // Store auth data
    this.setToken(token)
    this.setStoredUser(user)

    return { user, token }
  }

  // Logout
  static async logout(): Promise<void> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Remove stored auth data
    this.removeToken()
  }

  // Verify token and get user
  static async verifyToken(): Promise<User | null> {
    const token = this.getToken()
    if (!token) return null

    // In real app, verify token with backend
    // For now, just return stored user
    return this.getStoredUser()
  }

  // Forgot password
  static async forgotPassword(email: string): Promise<void> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const user = MOCK_USERS.find((u) => u.email === email)
    if (!user) {
      throw new Error("No account found with this email address")
    }

    // In real app, send password reset email
    console.log(`Password reset email sent to ${email}`)
  }
}
