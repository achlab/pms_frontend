"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, Building2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"

export default function VerifyEmailPage() {
  const [verificationStatus, setVerificationStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { verifyEmail } = useAuth()

  const token = searchParams.get("token")
  const email = searchParams.get("email")

  useEffect(() => {
    const handleVerification = async () => {
      if (!token || !email) {
        setVerificationStatus("error")
        setErrorMessage("Invalid verification link. Missing token or email.")
        return
      }

      try {
        await verifyEmail(token, email)
        setVerificationStatus("success")
        toast({
          title: "Email verified! 🎉",
          description: "Your account has been activated. You can now access your dashboard.",
        })

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push("/landlord/dashboard")
        }, 2000)
      } catch (error: any) {
        console.error("Email verification error:", error)
        setVerificationStatus("error")
        const message = error?.response?.data?.message || error?.message || "Failed to verify email. Please try again."
        setErrorMessage(message)
      }
    }

    handleVerification()
  }, [token, email, verifyEmail, router])

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
          <h2 className="text-2xl font-semibold text-foreground">Email Verification</h2>
        </div>

        {/* Verification Status */}
        <Card className="border-border shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              {verificationStatus === "loading" && (
                <>
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span>Verifying your email...</span>
                </>
              )}
              {verificationStatus === "success" && (
                <>
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span>Email Verified!</span>
                </>
              )}
              {verificationStatus === "error" && (
                <>
                  <XCircle className="h-6 w-6 text-red-600" />
                  <span>Verification Failed</span>
                </>
              )}
            </CardTitle>
            <CardDescription>
              {verificationStatus === "loading" && "Please wait while we verify your email address."}
              {verificationStatus === "success" && "Your email has been successfully verified. Redirecting to dashboard..."}
              {verificationStatus === "error" && "There was a problem verifying your email."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {verificationStatus === "error" && (
              <Alert className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}

            {verificationStatus === "success" && (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  Welcome to PropertyHub! Your landlord account is now active and you can start managing your properties.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col space-y-2">
              {verificationStatus === "error" && (
                <>
                  <Button onClick={() => router.push("/login")} className="w-full">
                    Go to Login
                  </Button>
                  <Button variant="outline" onClick={() => router.push("/register")} className="w-full">
                    Register Again
                  </Button>
                </>
              )}

              {verificationStatus === "loading" && (
                <Button disabled className="w-full">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Verifying...
                </Button>
              )}

              {verificationStatus === "success" && (
                <Button onClick={() => router.push("/landlord/dashboard")} className="w-full">
                  Go to Dashboard
                </Button>
              )}
            </div>

            <div className="text-center">
              <Link href="/login" className="text-sm text-muted-foreground hover:text-primary">
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
