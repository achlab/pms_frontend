"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/main-layout";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Camera, Upload, Loader2, Save, Clock, ArrowLeft } from "lucide-react";
import profileService, { type CaretakerProfile } from "@/lib/services/profile.service";

export default function CaretakerProfilePage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [profile, setProfile] = useState<CaretakerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    bio: "",
    address: "",
    city: "",
    country: "Ghana",
    emergency_contact: "",
    working_hours: "",
    photo_url: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await profileService.getCaretakerProfile();
      const profileData = response.data;
      
      if (profileData) {
        setProfile(profileData);
        setFormData({
          full_name: profileData.full_name || "",
          phone: profileData.phone || "",
          bio: profileData.bio || "",
          address: profileData.address || "",
          city: profileData.city || "",
          country: profileData.country || "Ghana",
          emergency_contact: profileData.emergency_contact || "",
          working_hours: profileData.working_hours || "",
          photo_url: profileData.photo_url || "",
        });
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
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
      setIsUploadingPhoto(true);
      const response = await profileService.uploadProfilePicture(file);
      
      if (response) {
        // Update form data with the returned profile picture URL
        setFormData(prev => ({ 
          ...prev, 
          photo_url: response.profile_picture_url || response.profile_picture 
        }));
        toast.success("Photo uploaded successfully");
        // The service already updated the auth context, but let's refresh to be sure
        await refreshUser();
        await fetchProfile();
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to upload photo");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.full_name || !formData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSaving(true);
      
      // Filter out empty strings and undefined values
      const cleanedData = Object.entries(formData).reduce((acc, [key, value]) => {
        if (value !== "" && value !== undefined && value !== null) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);
      
      await profileService.updateCaretakerProfile(cleanedData);
      toast.success("Profile updated successfully");
      fetchProfile(); // Refresh profile data
    } catch (error: any) {
      toast.error(error?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/50 dark:from-slate-900 dark:via-green-900/20 dark:to-emerald-900/30">
          <div className="container mx-auto p-6">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/50 dark:from-slate-900 dark:via-green-900/20 dark:to-emerald-900/30">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-white/50 dark:hover:bg-slate-800/50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-green-600 to-emerald-600 dark:from-white dark:via-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                Caretaker Profile
              </h1>
              <p className="text-lg text-muted-foreground">
                Manage your personal information and work details
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Profile Photo
                </CardTitle>
                <CardDescription>Upload a professional photo of yourself</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="h-32 w-32 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center overflow-hidden">
                      {formData.photo_url ? (
                        <img
                          src={formData.photo_url}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-16 w-16 text-white" />
                      )}
                    </div>
                    {isUploadingPhoto && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingPhoto}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploadingPhoto ? "Uploading..." : "Upload Photo"}
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      JPG, PNG or GIF. Max size 5MB.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Your personal contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+233 XX XXX XXXX"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      value={profile?.email || ""}
                      disabled
                      className="bg-slate-100 dark:bg-slate-800"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      placeholder="Ghana"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your physical address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g., Accra, Kumasi"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio / About Me</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us a bit about yourself..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Work Information */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Work Information
                </CardTitle>
                <CardDescription>Your working hours and emergency contact</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="working_hours">Working Hours</Label>
                    <Input
                      id="working_hours"
                      name="working_hours"
                      value={formData.working_hours}
                      onChange={handleChange}
                      placeholder="e.g., Mon-Fri 8AM-5PM"
                    />
                    <p className="text-xs text-muted-foreground">
                      Your typical availability schedule
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact">Emergency Contact</Label>
                    <Input
                      id="emergency_contact"
                      name="emergency_contact"
                      value={formData.emergency_contact}
                      onChange={handleChange}
                      placeholder="+233 XX XXX XXXX"
                    />
                    <p className="text-xs text-muted-foreground">
                      Alternative contact for urgent matters
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => fetchProfile()}
                disabled={isSaving}
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Profile
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
