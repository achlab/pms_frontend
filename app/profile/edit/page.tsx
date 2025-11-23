"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { MainLayout } from "@/components/main-layout"
import { useProfile, useProfilePicture } from "@/lib/hooks/use-profile"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Camera,
  Loader2,
  Save,
  X,
  Upload,
  AlertCircle,
  ArrowLeft,
} from "lucide-react"

export default function EditProfilePage() {
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const { updateProfile, loading: updating } = useProfile()
  const { uploadPicture, deletePicture, uploading, deleting } = useProfilePicture()
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [hasChanges, setHasChanges] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    bio: "",
  })

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Initialize form with current user data
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || "",
        phone: currentUser.phone || "",
        address: currentUser.address || "",
        bio: currentUser.bio || "",
      })
      if (currentUser.profile_picture_url) {
        setPreviewUrl(currentUser.profile_picture_url)
      }
    }
  }, [currentUser])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setHasChanges(true)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, GIF)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 2MB",
        variant: "destructive",
      })
      return
    }

    setSelectedFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
    setHasChanges(true)
  }

  const handleRemovePhoto = async () => {
    try {
      await deletePicture()
      setPreviewUrl(null)
      setSelectedFile(null)
      toast({
        title: "Photo removed",
        description: "Your profile photo has been removed successfully",
      })
    } catch (error: any) {
      toast({
        title: "Failed to remove photo",
        description: error?.message || "An error occurred",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Upload new profile picture if selected
      if (selectedFile) {
        await uploadPicture(selectedFile)
        toast({
          title: "Photo uploaded",
          description: "Profile picture updated successfully",
        })
      }

      // Update profile information
      const updates: any = {}
      if (formData.name !== currentUser?.name) updates.name = formData.name
      if (formData.phone !== currentUser?.phone) updates.phone = formData.phone
      if (formData.address !== currentUser?.address) updates.address = formData.address
      if (formData.bio !== currentUser?.bio) updates.bio = formData.bio

      if (Object.keys(updates).length > 0) {
        await updateProfile(updates)
      }

      toast({
        title: "Profile updated! ✅",
        description: "Your changes have been saved successfully",
      })

      setHasChanges(false)
      
      // Redirect back to profile after short delay
      setTimeout(() => {
        router.push("/profile")
      }, 1000)
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error?.message || "Failed to update profile",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    if (hasChanges) {
      if (confirm("You have unsaved changes. Are you sure you want to leave?")) {
        router.back()
      }
    } else {
      router.back()
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const isSubmitting = updating || uploading || deleting

  return (
    <MainLayout>
      <div className="container mx-auto py-6 max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <p className="text-muted-foreground mt-1">
            Update your personal information and profile picture
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>
                Upload a profile picture. Max size 2MB. Supported formats: JPG, PNG, GIF
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={previewUrl || undefined} alt={formData.name} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(formData.name || "U")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-3">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSubmitting}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          {previewUrl ? "Change Photo" : "Upload Photo"}
                        </>
                      )}
                    </Button>

                    {(previewUrl || currentUser?.profile_picture) && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRemovePhoto}
                        disabled={isSubmitting}
                      >
                        {deleting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Removing...
                          </>
                        ) : (
                          <>
                            <X className="h-4 w-4 mr-2" />
                            Remove
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  <p className="text-xs text-muted-foreground">
                    Recommended: Square image, at least 400x400px
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    value={currentUser?.email || ""}
                    disabled
                    className="pl-10 bg-muted"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your full name"
                    className="pl-10"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="0XX XXX XXXX or +233 XX XXX XXXX"
                    className="pl-10"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your address"
                    className="pl-10"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <Separator />

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    maxLength={1000}
                    className="pl-10 resize-none"
                    disabled={isSubmitting}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right">
                  {formData.bio.length} / 1000 characters
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={!hasChanges || isSubmitting}
              className="min-w-32"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>

          {/* Warning for unsaved changes */}
          {hasChanges && !isSubmitting && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You have unsaved changes. Don't forget to save before leaving!
              </AlertDescription>
            </Alert>
          )}
        </form>
      </div>
    </MainLayout>
  )
}
