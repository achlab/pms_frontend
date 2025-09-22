"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Eye, EyeOff, Building2, Home, Check, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

console.log("[v0] Registration page component loaded")

type UserRole = "landlord" | "tenant" | null

export default function RegisterPage() {
  console.log("[v0] RegisterPage component initializing")

  const [selectedRole, setSelectedRole] = useState<UserRole>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })
  const [passwordStrength, setPasswordStrength] = useState(0)

  const { register, socialAuth, isLoading: authLoading } = useAuth()
  const router = useRouter()

  console.log("[v0] Auth context loaded, isLoading:", authLoading)

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
    if (!selectedRole) return

    console.log("[v0] Registration attempt with role:", selectedRole)

    try {
      await register({
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: selectedRole,
      })
      toast({
        title: "Registration successful",
        description: "Welcome to PropertyHub!",
      })
      router.push("/dashboard")
    } catch (error) {
      console.log("[v0] Registration error:", error)
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Registration failed",
        variant: "destructive",
      })
    }
  }

  const handleSocialRegister = async (provider: "google" | "facebook") => {
    if (!selectedRole) {
      toast({
        title: "Role required",
        description: "Please select your role first",
        variant: "destructive",
      })
      return
    }

    console.log("[v0] Social registration attempt with provider:", provider, "role:", selectedRole)

    try {
      await socialAuth(provider, selectedRole)
      toast({
        title: "Registration successful",
        description: `Welcome to PropertyHub via ${provider}!`,
      })
      router.push("/dashboard")
    } catch (error) {
      console.log("[v0] Social registration error:", error)
      toast({
        title: "Social registration failed",
        description: error instanceof Error ? error.message : "Authentication failed",
        variant: "destructive",
      })
    }
  }

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "")

    if (digits.startsWith("233")) {
      const formatted = digits.replace(/^233(\d{2})(\d{3})(\d{4}).*/, "+233 $1 $2 $3")
      return formatted
    } else if (digits.startsWith("0")) {
      const formatted = digits.replace(/^0(\d{2})(\d{3})(\d{4}).*/, "0$1 $2 $3")
      return formatted
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
    selectedRole &&
    formData.fullName &&
    formData.email &&
    formData.phone &&
    formData.password &&
    passwordsMatch &&
    formData.agreeToTerms &&
    passwordStrength >= 50

  console.log("[v0] RegisterPage rendering, selectedRole:", selectedRole)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">PropertyHub</h1>
          </div>
          <h2 className="text-xl font-semibold text-foreground">Create your account</h2>
          <p className="text-muted-foreground">Join Ghana's leading property management platform</p>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-4">
            <div className="space-y-2">
              <CardTitle className="text-center text-lg">Sign Up</CardTitle>
              <CardDescription className="text-center">Get started in just a few steps</CardDescription>
            </div>

            {!selectedRole && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-sm font-medium text-foreground mb-3">I am a...</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-20 flex-col space-y-2 border-2 hover:border-accent hover:bg-accent/10 bg-transparent"
                    onClick={() => setSelectedRole("landlord")}
                  >
                    <Building2 className="h-6 w-6 text-accent" />
                    <span className="font-medium">Landlord</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-20 flex-col space-y-2 border-2 hover:border-accent hover:bg-accent/10 bg-transparent"
                    onClick={() => setSelectedRole("tenant")}
                  >
                    <Home className="h-6 w-6 text-accent" />
                    <span className="font-medium">Tenant</span>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Caretaker and Manager accounts are created by Landlords
                </p>
              </div>
            )}

            {selectedRole && (
              <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg border">
                <div className="flex items-center space-x-2">
                  {selectedRole === "landlord" ? (
                    <Building2 className="h-5 w-5 text-accent" />
                  ) : (
                    <Home className="h-5 w-5 text-accent" />
                  )}
                  <span className="font-medium capitalize">{selectedRole}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRole(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Change
                </Button>
              </div>
            )}

            {selectedRole && (
              <>
                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 border-2 hover:bg-accent/10 bg-transparent"
                    onClick={() => handleSocialRegister("google")}
                    disabled={authLoading}
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign up with Google
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 border-2 hover:bg-accent/10 bg-transparent"
                    onClick={() => handleSocialRegister("facebook")}
                    disabled={authLoading}
                  >
                    <svg className="w-5 h-5 mr-3" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Sign up with Facebook
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or sign up with email</span>
                  </div>
                </div>
              </>
            )}
          </CardHeader>

          {selectedRole && (
            <CardContent className="space-y-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
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
                  <p className="text-xs text-muted-foreground">Ghana format: 0XX XXX XXXX or +233 XX XXX XXXX</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
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
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {formData.password && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Password strength:</span>
                        <span
                          className={`font-medium ${passwordStrength >= 75 ? "text-green-600" : passwordStrength >= 50 ? "text-yellow-600" : "text-red-600"}`}
                        >
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      <Progress value={passwordStrength} className="h-2">
                        <div
                          className={`h-full rounded-full transition-all ${getPasswordStrengthColor()}`}
                          style={{ width: `${passwordStrength}%` }}
                        />
                      </Progress>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className="h-11 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                    {formData.confirmPassword && (
                      <div className="absolute right-10 top-1/2 -translate-y-1/2">
                        {passwordsMatch ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    )}
                  </div>
                  {formData.confirmPassword && !passwordsMatch && (
                    <p className="text-xs text-destructive">Passwords do not match</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, agreeToTerms: checked as boolean }))
                    }
                  />
                  <Label
                    htmlFor="agreeToTerms"
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the{" "}
                    <Link href="/terms" className="text-accent hover:text-accent/80 font-medium">
                      Terms & Conditions
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-accent hover:text-accent/80 font-medium">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-primary hover:bg-primary/90"
                  disabled={authLoading || !isFormValid}
                >
                  {authLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>

              <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-accent hover:text-accent/80 font-medium">
                    Log In
                  </Link>
                </p>
              </div>
            </CardContent>
          )}
        </Card>

        <div className="text-center text-xs text-muted-foreground">
          <p>© 2024 PropertyHub. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
