"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Building2, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import { getDefaultRoute } from "@/lib/constants/routes"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  const { login, isLoading, isAuthenticated, user, refreshUser } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get redirect URL and verification tokens from query params
  const redirectUrl = searchParams.get("redirect")
  const verificationToken = searchParams.get("token")
  const verificationEmail = searchParams.get("email")
  const verificationMessage = searchParams.get("message")
  const verifiedStatus = searchParams.get("verified") // 'success' or 'already'

  // Handle email verification on mount
  useEffect(() => {
    const handleEmailVerification = async () => {
      if (verificationToken && verificationEmail && !isAuthenticated) {
        try {
          setIsVerifying(true)
          // Import the auth service here to avoid circular dependencies
          const { authService } = await import("@/lib/services/auth.service")
          await authService.verifyEmail({
            token: verificationToken,
            email: verificationEmail,
          })

          toast({
            title: "Email verified successfully! ✅",
            description: "Your account has been verified. You can now log in.",
          })

          // Clear verification params from URL
          const newUrl = new URL(window.location.href)
          newUrl.searchParams.delete("token")
          newUrl.searchParams.delete("email")
          window.history.replaceState({}, "", newUrl.toString())

        } catch (error: any) {
          console.error("Email verification failed:", error)
          toast({
            title: "Verification failed",
            description: error?.response?.data?.message || "Unable to verify your email. The link may be expired.",
            variant: "destructive",
          })
        } finally {
          setIsVerifying(false)
        }
      }
    }

    handleEmailVerification()
  }, [verificationToken, verificationEmail, isAuthenticated])

  // Handle verified=success query parameter (from Laravel redirect)
  useEffect(() => {
    const handleVerifiedStatus = async () => {
      if (verifiedStatus === "success") {
        // User was verified via email link, refresh their data if they're logged in
        try {
          console.log("✅ Email verification successful - refreshing user data")
          
          // Only refresh if user is already logged in (has token)
          if (isAuthenticated && user) {
            await refreshUser()
          }
          
          // Show toast notification
          toast({
            title: "Email verified successfully! ✅",
            description: "Your account has been verified. Please sign in to continue.",
          })
          
          // Clear the verified parameter from URL after a short delay to let user see the alert
          setTimeout(() => {
            const newUrl = new URL(window.location.href)
            newUrl.searchParams.delete("verified")
            window.history.replaceState({}, "", newUrl.toString())
          }, 5000) // Clear after 5 seconds
        } catch (error) {
          console.error("Failed to refresh user data after verification:", error)
          // Still show success message even if refresh fails
          toast({
            title: "Verification successful",
            description: "Your email has been verified. Please sign in to continue.",
          })
        }
      } else if (verifiedStatus === "already") {
        toast({
          title: "Already verified",
          description: "Your email is already verified. You can sign in now.",
        })
        
        // Clear the verified parameter from URL after a short delay
        setTimeout(() => {
          const newUrl = new URL(window.location.href)
          newUrl.searchParams.delete("verified")
          window.history.replaceState({}, "", newUrl.toString())
        }, 5000)
      }
    }
    
    if (verifiedStatus) {
      handleVerifiedStatus()
    }
  }, [verifiedStatus, refreshUser, isAuthenticated, user])

  // Refresh user data on mount if user has token but might have verified from backend
  // Use a ref to track if we've already checked to prevent infinite loops
  const hasCheckedRef = useRef(false)
  
  useEffect(() => {
    // Only check once on mount
    if (hasCheckedRef.current) return
    
    const checkAndRefreshUser = async () => {
      // If user is logged in but not verified, refresh user data
      // This handles the case where user verified from backend
      if (user && !user.isVerified && !verifiedStatus) {
        try {
          hasCheckedRef.current = true
          await refreshUser()
        } catch (error) {
          console.error("Failed to refresh user data:", error)
        }
      } else {
        hasCheckedRef.current = true
      }
    }
    
    checkAndRefreshUser()
  }, [user, verifiedStatus, refreshUser]) // Include dependencies but use ref to prevent loops

  // If already authenticated, redirect to appropriate dashboard
  useEffect(() => {
    if (isAuthenticated && user && user.isVerified) {
      const targetUrl = redirectUrl || getDefaultRoute(user.role)
      router.replace(targetUrl)
    }
  }, [isAuthenticated, user, router, redirectUrl])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields")
      return
    }

    try {
      const result = await login(formData.email, formData.password)
      
      // Check if user is verified - handle both camelCase and snake_case
      const isVerified = result.user.isVerified === true || 
                        result.user.is_verified === true || 
                        (result.user.email_verified_at !== null && result.user.email_verified_at !== undefined)
      
      if (!isVerified) {
        toast({
          title: "Email verification required",
          description: "Please verify your email before accessing the dashboard. Check your inbox for the verification link.",
          variant: "destructive",
        })
        return
      }
      
      // Store remember me preference
      if (rememberMe && typeof window !== "undefined") {
        localStorage.setItem("remember_me", "true")
      }

      // Get user role for redirect
      const userRole = result.user.role
      const targetUrl = redirectUrl || getDefaultRoute(userRole)

      // Success toast with role-specific message
      toast({
        title: "Welcome back! 👋",
        description: `Signed in as ${getRoleName(userRole)}`,
      })

      // Redirect to appropriate dashboard
      router.replace(targetUrl)
    } catch (error: any) {
      const errorMessage = error?.message || "Invalid email or password"
      setError(errorMessage)
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const getRoleName = (role: string) => {
    const roleNames: Record<string, string> = {
      super_admin: "Super Admin",
      landlord: "Landlord",
      caretaker: "Caretaker",
      tenant: "Tenant",
    }
    return roleNames[role] || role
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Building2 className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              PropertyHub
            </h1>
          </div>
          <h2 className="text-2xl font-semibold text-foreground">Welcome Back</h2>
          <p className="text-muted-foreground">Sign in to access your account</p>
        </div>

        {/* Redirect Alert */}
        {redirectUrl && (
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
              You need to sign in to access that page
            </AlertDescription>
          </Alert>
        )}

        {/* Email Verification Success Alert */}
        {verifiedStatus === "success" && (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-sm text-green-800 dark:text-green-200">
              <strong>Email verified successfully! ✅</strong> Your account has been verified. Please sign in below to access your dashboard.
            </AlertDescription>
          </Alert>
        )}

        {/* Already Verified Alert */}
        {verifiedStatus === "already" && (
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
            <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
              Your email is already verified. Please sign in to continue.
            </AlertDescription>
          </Alert>
        )}

        {/* Verification Message Alert */}
        {verificationMessage && (
          <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <AlertDescription className="text-sm text-yellow-800 dark:text-yellow-200">
              {verificationMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Unverified User Alert - Only show if explicitly unverified */}
        {user && (user.isVerified === false || (user.is_verified === false && !user.email_verified_at)) && (
          <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
            <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <AlertDescription className="text-sm text-orange-800 dark:text-orange-200">
              Your email is not verified. Please check your inbox for the verification link. 
              <Button
                variant="link"
                className="h-auto p-0 ml-1 text-orange-800 dark:text-orange-200 underline"
                onClick={async () => {
                  try {
                    await refreshUser()
                    toast({
                      title: "User data refreshed",
                      description: "If you've verified your email, please try logging in again.",
                    })
                  } catch (error) {
                    toast({
                      title: "Failed to refresh",
                      description: "Please try logging in again.",
                      variant: "destructive",
                    })
                  }
                }}
              >
                Refresh
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Login Card */}
        <Card className="border-border shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  autoComplete="email"
                  className="h-11"
                  disabled={isLoading}
                  suppressHydrationWarning
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                    tabIndex={-1}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    autoComplete="current-password"
                    className="h-11 pr-10"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  disabled={isLoading}
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-muted-foreground cursor-pointer select-none"
                >
                  Remember me for 30 days
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 text-base font-medium bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading || !formData.email || !formData.password}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Registration Link */}
            <div className="mt-6">
              <div className="text-center text-sm text-muted-foreground mb-3">
                Don't have an account?
              </div>
              <Link href="/register" className="block">
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full h-11 text-base font-medium border-2 hover:bg-indigo-50 hover:border-indigo-300 dark:hover:bg-indigo-950"
                >
                  Sign up as Landlord
                </Button>
              </Link>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-900 px-4 text-muted-foreground font-medium">Account Types</span>
              </div>
            </div>

            {/* Account Type Info */}
            <div className="space-y-3 text-xs text-muted-foreground bg-muted/30 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                <p className="leading-relaxed">
                  <strong className="text-foreground font-semibold">Landlords:</strong> Self-register to manage properties
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500 mt-1.5 flex-shrink-0" />
                <p className="leading-relaxed">
                  <strong className="text-foreground font-semibold">Caretakers & Tenants:</strong> Accounts created by landlords
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                <p className="leading-relaxed">
                  <strong className="text-foreground font-semibold">Super Admins:</strong> System administrators
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>© 2024 PropertyHub. All rights reserved.</p>
          <p>
            <Link href="/terms" className="hover:underline">
              Terms of Service
            </Link>
            {" · "}
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
