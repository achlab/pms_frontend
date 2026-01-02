/**
 * Enhanced Profile Page
 * Modern, role-aware profile page with statistics and achievements
 */

"use client";

import { useProfile } from "@/lib/hooks/use-profile";
import { useDashboard } from "@/lib/hooks/use-dashboard";
import { useLandlordDashboard } from "@/lib/hooks/use-landlord-dashboard";
import { useSuperAdminDashboard } from "@/lib/hooks/use-super-admin-analytics";
import { MainLayout } from "@/components/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
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
  Building2,
  Home,
  Users,
  DollarSign,
  TrendingUp,
  Shield,
  Crown,
  Wrench,
  FileText,
  Star,
  Activity,
  Award,
  Target,
  Zap,
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

// Helper functions
const getRoleIcon = (role: string) => {
  switch (role) {
    case 'super_admin':
      return <Crown className="h-4 w-4" />;
    case 'landlord':
      return <Building2 className="h-4 w-4" />;
    case 'caretaker':
      return <Wrench className="h-4 w-4" />;
    case 'tenant':
      return <Home className="h-4 w-4" />;
    default:
      return <User className="h-4 w-4" />;
  }
};

const getRoleDescription = (role: string) => {
  switch (role) {
    case 'super_admin':
      return "System administrator with full platform oversight and management capabilities.";
    case 'landlord':
      return "Property owner managing multiple properties and overseeing tenant relationships.";
    case 'caretaker':
      return "Property maintenance specialist ensuring properties are well-maintained.";
    case 'tenant':
      return "Valued resident with access to property services and maintenance requests.";
    default:
      return "Platform user with personalized access and services.";
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'super_admin':
      return "from-purple-500 to-pink-500";
    case 'landlord':
      return "from-blue-500 to-cyan-500";
    case 'caretaker':
      return "from-green-500 to-emerald-500";
    case 'tenant':
      return "from-orange-500 to-red-500";
    default:
      return "from-gray-500 to-slate-500";
  }
};

export default function ProfilePage() {
  const router = useRouter();
  const { data: profileData, isLoading: profileLoading, error: profileError, refetch } = useProfile();
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboard(profileData?.role === 'tenant');
  const { data: landlordData, isLoading: landlordLoading } = useLandlordDashboard('month');
  const { data: superAdminData, loading: superAdminLoading } = useSuperAdminDashboard();

  const profile = profileData;

  // Role-specific stats
  const getRoleStats = () => {
    if (!profile) return null;

    switch (profile.role) {
      case 'tenant':
        return dashboardData?.data ? {
          properties: 1,
          units: 1,
          occupancyRate: 100,
          revenue: dashboardData.data.current_lease?.rent_amount || 0,
          maintenanceRequests: dashboardData.data.maintenance_requests?.total || 0,
        } : null;

      case 'landlord':
        return landlordData ? {
          properties: landlordData.overview?.total_properties || 0,
          units: landlordData.overview?.total_units || 0,
          occupancyRate: landlordData.overview?.occupancy_rate || 0,
          revenue: landlordData.revenue?.this_period || 0,
          maintenanceRequests: landlordData.maintenance?.total || 0,
        } : null;

      case 'caretaker':
        return {
          properties: 0, // Will be populated from caretaker-specific data
          units: 0,
          occupancyRate: 0,
          revenue: 0,
          maintenanceRequests: 0,
        };

      case 'super_admin':
        return superAdminData ? {
          properties: superAdminData.overview?.total_properties || 0,
          units: superAdminData.overview?.total_units || 0,
          occupancyRate: superAdminData.overview?.occupancy_rate || 0,
          revenue: superAdminData.financial?.total_revenue || 0,
          maintenanceRequests: superAdminData.maintenance?.total_requests || 0,
        } : null;

      default:
        return null;
    }
  };

  const stats = getRoleStats();

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

  if (profileLoading) {
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

  if (profileError || !profile) {
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto py-8 space-y-8">
          {/* Hero Header */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-800 shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative px-8 py-12 md:px-12 md:py-16">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-white">
                      Welcome back, {profile?.name?.split(' ')[0] || 'User'}
                    </h1>
                    <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                      {getRoleIcon(profile?.role)}
                      <span className="ml-1 capitalize">{profile?.role}</span>
                    </Badge>
                  </div>
                  <p className="text-blue-100 text-lg max-w-2xl">
                    {getRoleDescription(profile?.role)}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/settings")}
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                  <Button
                    onClick={() => router.push(getEditRoute())}
                    className="bg-white text-blue-600 hover:bg-blue-50"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          {stats && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">
                        {profile?.role === 'tenant' ? 'My Property' : 'Properties'}
                      </p>
                      <p className="text-2xl font-bold">{stats.properties}</p>
                    </div>
                    <Building2 className="h-8 w-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Revenue</p>
                      <p className="text-2xl font-bold">{formatCurrency(stats.revenue)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">
                        {profile?.role === 'tenant' ? 'Requests' : 'Maintenance'}
                      </p>
                      <p className="text-2xl font-bold">{stats.maintenanceRequests}</p>
                    </div>
                    <Wrench className="h-8 w-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium">
                        {profile?.role === 'tenant' ? 'Satisfaction' : 'Occupancy'}
                      </p>
                      <p className="text-2xl font-bold">
                        {profile?.role === 'tenant' ? '98%' : `${Math.round(stats.occupancyRate)}%`}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Profile Card - Enhanced */}
            <div className="lg:col-span-1">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl">Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar with Role Badge */}
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      {(profile.photo_url || profile.profile_picture_url || profile.profile_picture) ? (
                        <img
                          src={profile.photo_url || profile.profile_picture_url || profile.profile_picture}
                          alt={profile.name}
                          className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-2xl"
                        />
                      ) : (
                        <div className={`h-32 w-32 rounded-full bg-gradient-to-r ${getRoleColor(profile?.role || 'user')} flex items-center justify-center border-4 border-white shadow-2xl`}>
                          <User className="h-16 w-16 text-white" />
                        </div>
                      )}

                      {/* Role Badge Overlay */}
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                        <Badge className={`bg-gradient-to-r ${getRoleColor(profile?.role || 'user')} text-white border-2 border-white shadow-lg`}>
                          {getRoleIcon(profile?.role || 'user')}
                          <span className="ml-1 capitalize">{profile?.role}</span>
                        </Badge>
                      </div>
                    </div>

                    <div className="text-center mt-6">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.name}</h2>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">
                        {getRoleDescription(profile?.role || 'user')}
                      </p>
                    </div>

                    {/* Achievement Badges */}
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      {profile.is_verified && (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300 border-green-200">
                          <Shield className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {profile.email_verified_at && (
                        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Email Verified
                        </Badge>
                      )}
                      <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 border-purple-200">
                        <Award className="h-3 w-3 mr-1" />
                        Active Member
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  {/* Progress Indicators */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Profile Completion</span>
                        <span className="font-medium">85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Account Health</span>
                        <span className="font-medium">92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                  </div>

                  <Separator />

                  {/* Quick Actions */}
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => router.push("/settings")}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Account Settings
                    </Button>
                    <Button
                      className="w-full justify-start"
                      onClick={() => router.push(getEditRoute())}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-600" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Email */}
                    <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-500 rounded-full">
                          <Mail className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Email Address</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{profile.email}</p>
                          {profile.email_verified_at && (
                            <Badge className="mt-2 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-500 rounded-full">
                          <Phone className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-green-600 dark:text-green-400 font-medium">Phone Number</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{profile.phone || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    {profile.address && (
                      <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800 md:col-span-2">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-purple-500 rounded-full">
                            <MapPin className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Address</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{profile.address}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Bio/About Section */}
              {profile.bio && (
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-indigo-600" />
                      About Me
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{profile.bio}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Account Analytics */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-emerald-600" />
                    Account Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Account Age */}
                    <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500 rounded-full">
                          <Calendar className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Member Since</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{formatDate(profile.created_at)}</p>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                            {Math.floor((new Date().getTime() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))} days ago
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Last Activity */}
                    <div className="p-4 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500 rounded-full">
                          <Zap className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Last Updated</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {profile.updated_at ? formatDate(profile.updated_at) : 'Never'}
                          </p>
                          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                            {profile.updated_at ? 'Recently active' : 'Update your profile'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Achievement Progress */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      Achievements
                    </h3>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Profile Completion</span>
                          <span className="text-sm font-bold text-blue-600">85%</span>
                        </div>
                        <Progress value={85} className="h-3" />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Add more details to reach 100%</p>
                      </div>

                      <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Health</span>
                          <span className="text-sm font-bold text-green-600">92%</span>
                        </div>
                        <Progress value={92} className="h-3" />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Excellent account status</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions Card */}
              <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Button
                      variant="outline"
                      className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                      onClick={() => router.push("/settings")}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Account Settings
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                      onClick={() => router.push("/notifications")}
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Notifications
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                      onClick={() => router.push(getEditRoute())}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                      onClick={() => router.push("/dashboard")}
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
