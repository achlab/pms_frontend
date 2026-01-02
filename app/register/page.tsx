"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Building2, Check, X, Info, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { authService } from "@/lib/services/auth.service"
import { ApiClientError } from "@/lib/api-client"
import { formatValidationErrors, getFirstValidationError } from "@/lib/api-utils"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [isResendingEmail, setIsResendingEmail] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const { register, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (name === "password") {
      calculatePasswordStrength(value)
    }
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

  const handleResendVerificationEmail = async () => {
    if (!registeredEmail) {
      console.warn("⚠️ RegisterPage - No registered email to resend")
      return
    }

    console.log("📤 RegisterPage - Resending verification email to:", registeredEmail)
    setIsResendingEmail(true)
    try {
      const response = await authService.resendVerificationEmail(registeredEmail)
      console.log("📥 RegisterPage - Resend email response:", response)
      console.log("📥 RegisterPage - Resend response details:", {
        success: response?.success,
        message: response?.message,
        data: response?.data,
      })
      
      toast({
        title: "Email sent! 📧",
        description: response?.message || "Verification email has been resent. Please check your inbox.",
      })
    } catch (error: any) {
      console.error("❌ RegisterPage - Resend verification email error:", error)
      console.error("❌ RegisterPage - Error details:", {
        message: error?.message,
        status: error?.status,
        response: error?.response?.data,
        errors: error?.errors,
        isApiClientError: error instanceof ApiClientError,
      })
      
      const errorMessage = error?.response?.data?.message 
        || error?.message 
        || "Unable to resend verification email. Please try again."
      
      toast({
        title: "Failed to resend email",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsResendingEmail(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both passwords are identical",
        variant: "destructive",
      })
      return
    }

    if (passwordStrength < 50) {
      toast({
        title: "Weak password",
        description: "Please use a stronger password (at least Fair)",
        variant: "destructive",
      })
      return
    }

    try {
      const registrationData = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        password: formData.password,
        role: "landlord" as const, // Always landlord for public registration
      }

      console.log("📝 RegisterPage - Registration attempt with data:", { ...registrationData, password: "***" })

      // Clear any previous field errors
      setFieldErrors({})
      
      console.log("📤 RegisterPage - Calling register function...")
      const response = await register(registrationData)
      console.log("📥 RegisterPage - Register response received:", response)
      console.log("📥 RegisterPage - Response details:", {
        hasUser: !!response?.user,
        hasToken: !!response?.token,
        user: response?.user ? {
          id: response.user.id,
          email: response.user.email,
          isVerified: response.user.isVerified || response.user.is_verified,
        } : null,
        message: response?.message,
        success: response?.success,
      })
      
      setRegisteredEmail(formData.email) // Store email for resend functionality

      // The register function returns { user, token } from AuthService
      // Check if user needs email verification
      const user = response?.user
      console.log("👤 RegisterPage - User from response:", user)
      
      if (user && !user.isVerified) {
        setRegistrationSuccess(true)
        toast({
          title: "Registration successful! 🎉",
          description: "Please check your email and verify your account before logging in.",
        })
      } else if (user && user.isVerified) {
        // If user is immediately verified, redirect to dashboard
        router.push("/landlord/dashboard")
        toast({
          title: "Registration successful! 🎉",
          description: "Welcome to PropertyHub! Your landlord account has been created.",
        })
      } else {
        // Fallback: assume verification is needed (most common case)
        setRegistrationSuccess(true)
        toast({
          title: "Registration successful! 🎉",
          description: "Please check your email and verify your account before logging in.",
        })
      }
    } catch (error: any) {
      console.error("Registration error:", error)
      console.error("Error details:", {
        isApiClientError: error instanceof ApiClientError,
        status: error?.status,
        errors: error?.errors,
        response: error?.response?.data,
        message: error?.message,
      })
      
      // Check if it's an ApiClientError (from our API client)
      const isApiClientError = error instanceof ApiClientError || error?.name === 'ApiClientError'
      
      // Extract validation errors - prioritize ApiClientError.errors
      let validationErrors: Record<string, string[]> | Record<string, string> | undefined
      
      if (isApiClientError && error.errors) {
        // ApiClientError stores errors directly as Record<string, string[]>
        validationErrors = error.errors
      } else if (error?.response?.data?.errors) {
        // AxiosError with response data
        validationErrors = error.response.data.errors
      } else if (error?.errors) {
        // Fallback to error.errors
        validationErrors = error.errors
      }
      
      // Normalize validation errors to ensure they're arrays
      if (validationErrors) {
        const normalized: Record<string, string[]> = {}
        Object.keys(validationErrors).forEach((key) => {
          const value = validationErrors[key]
          if (Array.isArray(value)) {
            normalized[key] = value
          } else if (typeof value === 'string') {
            normalized[key] = [value]
          } else {
            normalized[key] = [String(value)]
          }
        })
        validationErrors = normalized
      }
      
      // Extract error message
      let errorMessage = "Unable to create account. Please try again."
      if (isApiClientError && error.getFirstError) {
        errorMessage = error.getFirstError()
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      let errorDescription = errorMessage
      let errorTitle = "Registration failed"
      
      // Handle validation errors with better user-friendly messages
      if (validationErrors && Object.keys(validationErrors).length > 0) {
        // Format validation errors for inline display
        let formattedErrors: Record<string, string> = {}
        
        // Try using helper function first
        try {
          formattedErrors = formatValidationErrors(error)
        } catch (e) {
          // Fallback: manually format errors
          Object.keys(validationErrors).forEach((field) => {
            const fieldError = validationErrors[field]
            if (Array.isArray(fieldError) && fieldError.length > 0) {
              formattedErrors[field] = fieldError[0]
            } else if (typeof fieldError === 'string') {
              formattedErrors[field] = fieldError
            }
          })
        }
        
        setFieldErrors(formattedErrors)
        
        // Check for email already exists error
        if (validationErrors.email) {
          const emailError = Array.isArray(validationErrors.email) 
            ? validationErrors.email[0] 
            : validationErrors.email
          
          errorTitle = "Email Already Registered"
          errorDescription = emailError || "This email address is already registered. Please use a different email or try logging in instead."
        } 
        // Check for phone already exists
        else if (validationErrors.phone) {
          const phoneError = Array.isArray(validationErrors.phone) 
            ? validationErrors.phone[0] 
            : validationErrors.phone
          
          errorTitle = "Phone Number Already Registered"
          errorDescription = phoneError || "This phone number is already registered. Please use a different phone number."
        }
        // Handle other validation errors
        else {
          // Try using helper function
          try {
            errorDescription = getFirstValidationError(error) || errorMessage
          } catch (e) {
            // Fallback: manually extract first error
            const firstErrorKey = Object.keys(validationErrors)[0]
            const firstError = validationErrors[firstErrorKey]
            
            if (Array.isArray(firstError) && firstError.length > 0) {
              errorDescription = firstError[0]
            } else if (typeof firstError === 'string') {
              errorDescription = firstError
            } else {
              errorDescription = errorMessage
            }
          }
          
          // Capitalize first letter and format field name
          const firstErrorKey = Object.keys(validationErrors)[0]
          if (firstErrorKey) {
            const formattedKey = firstErrorKey.charAt(0).toUpperCase() + firstErrorKey.slice(1).replace(/_/g, ' ')
            errorTitle = `${formattedKey} Error`
          }
        }
      } else {
        // Clear field errors if no validation errors
        setFieldErrors({})
        // Use the error message directly
        errorDescription = errorMessage
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      })
    }
  }

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "")

    if (digits.startsWith("233")) {
      return digits.replace(/^233(\d{2})(\d{3})(\d{4}).*/, "+233 $1 $2 $3")
    } else if (digits.startsWith("0")) {
      return digits.replace(/^0(\d{2})(\d{3})(\d{4}).*/, "0$1 $2 $3")
    }
    return value
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setFormData((prev) => ({
      ...prev,
      phone: formatted,
    }))
  }

  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== ""
  const isFormValid =
    formData.fullName &&
    formData.email &&
    formData.phone &&
    formData.password &&
    passwordsMatch &&
    formData.agreeToTerms &&
    passwordStrength >= 50

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
          <h2 className="text-2xl font-semibold text-foreground">Create Landlord Account</h2>
          <p className="text-muted-foreground">Join Ghana's leading property management platform</p>
        </div>

        {/* Info Alert */}
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Landlord Registration:</strong> Only landlords can self-register. You can create accounts for 
            your caretakers and tenants after logging in.
          </AlertDescription>
        </Alert>

        {/* Registration Form */}
        <Card className="border-border shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Sign Up as Landlord</CardTitle>
            <CardDescription>Enter your details to create your account</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="John Mensah"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="h-11"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => {
                    handleInputChange(e)
                    // Clear email error when user starts typing
                    if (fieldErrors.email) {
                      setFieldErrors(prev => {
                        const newErrors = { ...prev }
                        delete newErrors.email
                        return newErrors
                      })
                    }
                  }}
                  required
                  className={`h-11 ${fieldErrors.email ? 'border-destructive' : ''}`}
                  suppressHydrationWarning
                  autoComplete="email"
                />
                {fieldErrors.email && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>{fieldErrors.email}</span>
                    <Link href="/login" className="text-primary hover:underline ml-1">
                      Try logging in instead
                    </Link>
                  </div>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="0XX XXX XXXX or +233 XX XXX XXXX"
                  value={formData.phone}
                  onChange={(e) => {
                    handlePhoneChange(e)
                    // Clear phone error when user starts typing
                    if (fieldErrors.phone) {
                      setFieldErrors(prev => {
                        const newErrors = { ...prev }
                        delete newErrors.phone
                        return newErrors
                      })
                    }
                  }}
                  required
                  className={`h-11 ${fieldErrors.phone ? 'border-destructive' : ''}`}
                />
                {fieldErrors.phone ? (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>{fieldErrors.phone}</span>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Ghana format: 0XX XXX XXXX</p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Address (Optional)</Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="123 Main Street, Accra"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="h-11"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
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
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, agreeToTerms: checked as boolean }))
                  }
                  className="mt-0.5"
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 text-base font-medium"
                disabled={!isFormValid || authLoading}
              >
                {authLoading ? "Creating Account..." : "Create Landlord Account"}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Already have an account?</span>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <Link href="/login">
                <Button variant="outline" className="w-full h-11">
                  Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Registration Success Modal */}
        {registrationSuccess && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md mx-4 text-center">
              <div className="text-6xl mb-4">📧</div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">Registration Successful!</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Your landlord account has been created. Please check your email and click the verification link to activate your account.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full"
                >
                  Go to Login
                </Button>
                <Button
                  variant="outline"
                  onClick={handleResendVerificationEmail}
                  disabled={isResendingEmail}
                  className="w-full"
                >
                  {isResendingEmail ? "Sending..." : "Resend Verification Email"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setRegistrationSuccess(false)}
                  className="w-full"
                >
                  Register Another Account
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                Didn't receive the email? Check your spam folder or use the resend button above.
              </p>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="text-center text-xs text-muted-foreground space-y-2">
          <p>
            <strong>Note:</strong> Caretaker and Tenant accounts are created by landlords.
          </p>
          <p>
            After registration, you can create and manage accounts for your staff and tenants.
          </p>
        </div>
      </div>
    </div>
  )
}
