/**
 * Profile Page
 * Displays user profile information with edit capabilities
 */

"use client";

import { useProfile } from "@/lib/hooks/use-profile";
import { MainLayout } from "@/components/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  Settings,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useProfile();

  const profile = data;

  // Get role-specific profile edit route
  const getEditRoute = () => {
    if (!profile?.role) return "/settings";
    
    switch (profile.role) {
      case "landlord":
        return "/landlord/profile";
      case "caretaker":
        return "/caretaker/profile";
      case "tenant":
        return "/tenant/profile";
      default:
        return "/settings";
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6 space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Skeleton className="h-96" />
            <div className="md:col-span-2 space-y-6">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !profile) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load profile information. Please try again.
              <Button
                variant="outline"
                size="sm"
                className="ml-4"
                onClick={() => refetch()}
              >
                <RefreshCw className="h-3 w-3 mr-2" />
                Retry
              </Button>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground mt-1">
              Manage your account information and settings
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/settings")}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button onClick={() => router.push(getEditRoute())}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card - Sidebar */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center">
              <div className="relative">
                {(profile.photo_url || profile.profile_picture_url || profile.profile_picture) ? (
                  <img
                    src={profile.photo_url || profile.profile_picture_url || profile.profile_picture}
                    alt={profile.name}
                    className="h-32 w-32 rounded-full object-cover border-4 border-background shadow-lg"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center border-4 border-background shadow-lg">
                    <User className="h-16 w-16 text-primary" />
                  </div>
                )}
              </div>
              <div className="text-center mt-4">
                <h2 className="text-xl font-semibold">{profile.name}</h2>
                <p className="text-sm text-muted-foreground capitalize">
                  {profile.role}
                </p>
              </div>

              {/* Verification Badge */}
              {profile.is_verified && (
                <Badge className="mt-3 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>

            <Separator />

            {/* Quick Stats */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="text-sm font-medium">
                    {formatDate(profile.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details Cards - Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Email */}
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{profile.email}</p>
                    {profile.email_verified_at && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{profile.phone}</p>
                  </div>
                </div>

                {/* Address */}
                {profile.address && (
                  <div className="flex items-start gap-3 md:col-span-2">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">{profile.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bio/About */}
          {profile.bio && (
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{profile.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Verification Status */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Account Verification
                  </p>
                  <div className="flex items-center gap-2">
                    {profile.is_verified ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-medium text-green-700 dark:text-green-300">
                          Verified
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                        <span className="font-medium text-amber-700 dark:text-amber-300">
                          Not Verified
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Email Verification */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Email Verification
                  </p>
                  <div className="flex items-center gap-2">
                    {profile.email_verified_at ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-medium text-green-700 dark:text-green-300">
                          Verified
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                        <span className="font-medium text-amber-700 dark:text-amber-300">
                          Not Verified
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Created */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Account Created
                </p>
                <p className="font-medium">{formatDate(profile.created_at)}</p>
              </div>

              {profile.updated_at && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Last Updated
                  </p>
                  <p className="font-medium">{formatDate(profile.updated_at)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </MainLayout>
  );
}
