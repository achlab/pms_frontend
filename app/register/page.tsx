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
import { Eye, EyeOff, Building2, Check, X, Info } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

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
      
      console.log("Registration attempt with data:", { ...registrationData, password: "***" })
      
      await register(registrationData)
      
      toast({
        title: "Registration successful! 🎉",
        description: "Welcome to PropertyHub! Your landlord account has been created.",
      })
      router.push("/landlord/dashboard")
    } catch (error: any) {
      console.error("Registration error:", error)
      
      const errorMessage = error?.response?.data?.message 
        || error?.message 
        || "Unable to create account. Please try again."
      
      const validationErrors = error?.response?.data?.errors
      
      let errorDescription = errorMessage
      if (validationErrors) {
        const firstError = Object.values(validationErrors)[0]
        if (Array.isArray(firstError) && firstError.length > 0) {
          errorDescription = firstError[0] as string
        }
      }
      
      toast({
        title: "Registration failed",
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
                  onChange={handleInputChange}
                  required
                  className="h-11"
                />
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
                  onChange={handlePhoneChange}
                  required
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">Ghana format: 0XX XXX XXXX</p>
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
