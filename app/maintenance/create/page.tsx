/**
 * Create Maintenance Request Page
 * Page for creating new maintenance requests
 */

"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CreateRequestForm } from "@/components/maintenance/create-request-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Info, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/auth-context";
import { MainLayout } from "@/components/main-layout";

export default function CreateMaintenanceRequestPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Redirect non-tenants away from this page
  useEffect(() => {
    if (!isLoading && user && user.role !== "tenant") {
      router.push("/maintenance");
    }
  }, [user, isLoading, router]);

  const handleSuccess = (requestId: string) => {
    // Redirect to maintenance page after successful creation
    router.push("/maintenance");
  };

  const handleCancel = () => {
    router.back();
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Show access denied for non-tenants
  if (!user || user.role !== "tenant") {
    return (
      <MainLayout>
        <div className="container mx-auto py-6">
          <Alert variant="destructive" className="max-w-md mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Access Denied</strong>
              <br />
              Only tenants can create maintenance requests. Landlords and caretakers can view and manage existing requests.
            </AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Maintenance Request</h1>
          <p className="text-muted-foreground mt-1">
            Submit a new maintenance request for your property
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form (Left - 2 columns) */}
        <div className="lg:col-span-2">
          <CreateRequestForm onSuccess={handleSuccess} onCancel={handleCancel} />
        </div>

        {/* Help Section (Right - 1 column) */}
        <div className="space-y-4">
          {/* Tips Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tips for Better Requests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">✅</div>
                  <p>
                    <strong>Be specific:</strong> Include details like location, when it
                    started, and what you've tried
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">📸</div>
                  <p>
                    <strong>Add photos:</strong> Pictures help us understand the issue better
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">⚡</div>
                  <p>
                    <strong>Set priority:</strong> Mark as urgent if it's affecting your
                    safety or daily life
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">📅</div>
                  <p>
                    <strong>Preferred date:</strong> Let us know when you're available for
                    repairs
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Priority Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Priority Levels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3 text-sm">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <strong>Emergency</strong>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Safety hazards, no water/heat, major leaks
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                    <strong>Urgent</strong>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Minor leaks, broken appliances, heating issues
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <strong>Normal</strong>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Regular repairs, cosmetic issues
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-2 w-2 rounded-full bg-gray-500" />
                    <strong>Low</strong>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Minor inconveniences, non-urgent improvements
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Response Time:</strong> We aim to respond to all requests within 24
              hours. Emergency requests are prioritized and handled immediately.
            </AlertDescription>
          </Alert>

          {/* Common Categories Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Common Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1.5 text-muted-foreground">
                <li>🔧 Plumbing - Leaks, clogs, fixtures</li>
                <li>⚡ Electrical - Outlets, lights, switches</li>
                <li>🌡️ HVAC - Heating, cooling, ventilation</li>
                <li>🏠 Appliances - Fridge, stove, dishwasher</li>
                <li>🚪 Structural - Doors, windows, walls</li>
                <li>🐛 Pest Control - Infestations, prevention</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </MainLayout>
  );
}

