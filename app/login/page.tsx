"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Building2, Loader2, AlertCircle } from "lucide-react"
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

  const { login, isLoading, isAuthenticated, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get redirect URL from query params
  const redirectUrl = searchParams.get("redirect")

  // If already authenticated, redirect to appropriate dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
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
