/**
 * Settings Page
 * User settings including profile picture, password, and preferences
 */

"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/main-layout";
import { useProfile, useUploadProfilePicture, useDeleteProfilePicture } from "@/lib/hooks/use-profile";
import { useChangePassword } from "@/lib/hooks/use-auth";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  ArrowLeft,
  User,
  Upload,
  Trash2,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  Camera,
  UserCircle,
  ChevronRight,
} from "lucide-react";
import { getErrorMessage } from "@/lib/api-utils";

export default function SettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { refreshUser } = useAuth();

  const { data: profile, isLoading: loadingProfile, error: profileError, refetch } = useProfile();
  const uploadPictureMutation = useUploadProfilePicture();
  const deletePictureMutation = useDeleteProfilePicture();
  const { mutate: changePassword, isLoading: changingPassword } = useChangePassword();

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    try {
      await uploadPictureMutation.mutateAsync(file);
      toast.success("Profile picture updated successfully!");
      // Refresh auth context to update sidebar
      await refreshUser();
      await refetch();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeletePicture = async () => {
    if (!confirm("Are you sure you want to delete your profile picture?")) {
      return;
    }

      // Refresh auth context to update sidebar
      await refreshUser();
      await refetch();
    try {
      await deletePictureMutation.mutateAsync();
      toast.success("Profile picture deleted successfully!");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!currentPassword) {
      toast.error("Current password is required");
      return;
    }

    if (!newPassword) {
      toast.error("New password is required");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword === currentPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    try {
      await changePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });

      toast.success("Password changed successfully!");

      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (loadingProfile) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6 space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (profileError || !profile) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {profileError ? getErrorMessage(profileError) : "Failed to load profile information."}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => refetch()} 
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      {/* Profile Information Link Card */}
      <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => {
        const profilePath = profile.role === 'landlord' ? '/landlord/profile' : 
                           profile.role === 'caretaker' ? '/caretaker/profile' : 
                           '/tenant/profile';
        router.push(profilePath);
      }}>
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <UserCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Profile Information</h3>
                <p className="text-sm text-muted-foreground">
                  Update your bio, contact details, and personal information
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Picture Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>
              Upload or update your profile picture
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center">
              {/* Current Picture */}
              <div className="relative group">
                {(profile.profile_picture_url || profile.profile_picture || profile.photo_url) ? (
                  <img
                    src={profile.profile_picture_url || profile.profile_picture || profile.photo_url}
                    alt={profile.name}
                    className="h-32 w-32 rounded-full object-cover border-4 border-background shadow-lg"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center border-4 border-background shadow-lg">
                    <User className="h-16 w-16 text-primary" />
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="h-8 w-8 text-white" />
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Action Buttons */}
              <div className="flex gap-2 mt-6 w-full">
                <Button
                  onClick={handleFileSelect}
                  disabled={uploadPictureMutation.isLoading || deletePictureMutation.isLoading}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadPictureMutation.isLoading ? "Uploading..." : "Upload New"}
                </Button>
                {(profile.profile_picture_url || profile.profile_picture || profile.photo_url) && (
                  <Button
                    variant="destructive"
                    onClick={handleDeletePicture}
                    disabled={uploadPictureMutation.isLoading || deletePictureMutation.isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Info */}
              <div className="mt-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Recommended: Square image, at least 200x200px
                </p>
                <p className="text-xs text-muted-foreground">
                  Max file size: 5MB (JPG, PNG, GIF)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password *</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password *</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Minimum 8 characters
                </p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password *</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={changingPassword}
                className="w-full"
              >
                {changingPassword ? (
                  "Changing Password..."
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Change Password
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Security Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Security Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Use a strong, unique password that you don't use elsewhere</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Change your password regularly (every 3-6 months)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Never share your password with anyone</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Enable two-factor authentication if available</span>
            </li>
          </ul>
        </CardContent>
      </Card>
      </div>
    </MainLayout>
  );
}

