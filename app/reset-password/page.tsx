"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Building2, Eye, EyeOff, Check, X, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { authService } from "@/lib/services"
import { toast } from "@/hooks/use-toast"

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    email: "",
    token: "",
    password: "",
    confirmPassword: "",
  })
  const [passwordStrength, setPasswordStrength] = useState(0)

  // Get email and token from URL params
  useEffect(() => {
    const email = searchParams.get("email")
    const token = searchParams.get("token")
    
    if (email && token) {
      setFormData((prev) => ({ ...prev, email, token }))
    } else {
      setError("Invalid reset link. Please request a new password reset.")
    }
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    if (name === "password") {
      calculatePasswordStrength(value)
    }
    
    if (error) setError(null)
  }

  const calculatePasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (/[A-Z]/.test(password)) strength += 25
    if (/[a-z]/.test(password)) strength += 25
    if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) strength += 25
    setPasswordStrength(strength)
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return "bg-destructive"
    if (passwordStrength < 50) return "bg-orange-500"
    if (passwordStrength < 75) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return "Weak"
    if (passwordStrength < 50) return "Fair"
    if (passwordStrength < 75) return "Good"
    return "Strong"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!formData.email || !formData.token) {
      setError("Invalid reset link. Please request a new password reset.")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match")
      return
    }

    if (passwordStrength < 50) {
      setError("Please use a stronger password (at least Fair)")
      return
    }

    setIsLoading(true)

    try {
      await authService.resetPassword({
        email: formData.email,
        token: formData.token,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
      })

      setIsSuccess(true)
      toast({
        title: "Password reset successful! ✅",
        description: "You can now sign in with your new password",
      })

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to reset password. Please try again."
      setError(errorMessage)
      toast({
        title: "Reset failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== ""

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Building2 className="h-10 w-10 text-primary" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                PropertyHub
              </h1>
            </div>
          </div>

          <Card className="border-border shadow-xl">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Password Reset Successful!</h2>
                  <p className="text-muted-foreground">
                    Your password has been changed successfully.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Redirecting to login page...
                  </p>
                </div>
                <Button onClick={() => router.push("/login")} className="w-full">
                  Go to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
          <h2 className="text-2xl font-semibold text-foreground">Reset Your Password</h2>
          <p className="text-muted-foreground">Enter your new password below</p>
        </div>

        {/* Reset Password Card */}
        <Card className="border-border shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Create New Password</CardTitle>
            <CardDescription>
              Choose a strong password for your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  value={formData.email}
                  disabled
                  className="bg-muted"
                />
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="password">New Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="pr-10"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>

                {/* Password Strength */}
                {formData.password && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Password Strength:</span>
                      <span className={`font-medium ${
                        passwordStrength >= 75 ? "text-green-600" : 
                        passwordStrength >= 50 ? "text-yellow-600" : 
                        "text-red-600"
                      }`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <Progress value={passwordStrength} className={`h-2 ${getPasswordStrengthColor()}`} />
                  </div>
                )}

                {/* Password Requirements */}
                <div className="space-y-1 text-xs">
                  <div className="flex items-center space-x-2">
                    {formData.password.length >= 8 ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <X className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span className={formData.password.length >= 8 ? "text-green-600" : "text-muted-foreground"}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/[A-Z]/.test(formData.password) ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <X className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span className={/[A-Z]/.test(formData.password) ? "text-green-600" : "text-muted-foreground"}>
                      One uppercase letter
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/[0-9]/.test(formData.password) ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <X className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span className={/[0-9]/.test(formData.password) ? "text-green-600" : "text-muted-foreground"}>
                      One number
                    </span>
                  </div>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="pr-10"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {formData.confirmPassword && (
                  <div className="flex items-center space-x-2 text-xs">
                    {passwordsMatch ? (
                      <>
                        <Check className="h-3 w-3 text-green-600" />
                        <span className="text-green-600">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <X className="h-3 w-3 text-red-600" />
                        <span className="text-red-600">Passwords don't match</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !passwordsMatch || passwordStrength < 50}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link href="/login" className="text-sm text-primary hover:underline">
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}

