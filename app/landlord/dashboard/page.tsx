'use client';

import { useState } from 'react';
import { 
  Building2, 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Home,
  AlertCircle,
  Clock,
  CheckCircle2,
  Wrench,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useLandlordDashboard } from '@/lib/hooks/use-landlord-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MainLayout } from '@/components/main-layout';
import { cn } from '@/lib/utils';

export default function LandlordDashboardPage() {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const { data, isLoading, error } = useLandlordDashboard(timeframe);

  // Debug logging
  console.group('📊 Landlord Dashboard State');
  console.log('Loading:', isLoading);
  console.log('Error:', error);
  console.log('Has Data:', !!data);
  console.log('Data Structure:', data ? {
    hasData: !!data.data,
    dataKeys: data.data ? Object.keys(data.data) : [],
    success: data.success,
    timeframe: data.timeframe,
  } : null);
  console.groupEnd();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <p>Failed to load dashboard data. Please try again.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your properties.
          </p>
        </div>
        
        <div className="flex gap-2">
          {(['week', 'month', 'quarter', 'year'] as const).map((tf) => (
            <Button
              key={tf}
              variant={timeframe === tf ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeframe(tf)}
              className="capitalize"
            >
              {tf}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : !data || !data.data ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
              <div className="text-center">
                <p className="text-lg font-medium">No Dashboard Data Available</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {!data ? 'Unable to load dashboard data.' : 'No data found for the selected timeframe.'}
                </p>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline" 
                  className="mt-4"
                >
                  Refresh Page
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Overview Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Properties"
              value={data.data.overview.total_properties.toString()}
              icon={<Building2 className="h-4 w-4" />}
              iconColor="text-blue-600"
              iconBg="bg-blue-100"
            />
            <StatsCard
              title="Total Tenants"
              value={data.data.overview.total_tenants.toString()}
              icon={<Users className="h-4 w-4" />}
              iconColor="text-green-600"
              iconBg="bg-green-100"
            />
            <StatsCard
              title="Occupancy Rate"
              value={`${data.data.overview.occupancy_rate}%`}
              description={`${data.data.overview.occupied_units}/${data.data.overview.total_units} units`}
              icon={<Home className="h-4 w-4" />}
              iconColor="text-purple-600"
              iconBg="bg-purple-100"
            />
            <StatsCard
              title="Expiring Leases"
              value={data.data.overview.expiring_leases.toString()}
              description="Next 30 days"
              icon={<Calendar className="h-4 w-4" />}
              iconColor="text-orange-600"
              iconBg="bg-orange-100"
            />
          </div>

          {/* Revenue Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Revenue This Period
                </CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(data.data.revenue.this_period)}
                </div>
                <div className={cn(
                  "flex items-center text-xs",
                  data.data.revenue.change_percentage >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {data.data.revenue.change_percentage >= 0 ? (
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="mr-1 h-4 w-4" />
                  )}
                  {formatPercentage(data.data.revenue.change_percentage)} from last period
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(data.data.revenue.total)}
                </div>
                <p className="text-xs text-muted-foreground">
                  All-time earnings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Payments
                </CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(data.data.revenue.pending)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.data.revenue.pending_count} payment{data.data.revenue.pending_count !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Overdue Payments
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(data.data.revenue.overdue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.data.revenue.overdue_count} payment{data.data.revenue.overdue_count !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Maintenance and Revenue Chart */}
          <div className="grid gap-4 md:grid-cols-7">
            {/* Maintenance Stats */}
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Maintenance Requests</CardTitle>
                <CardDescription>Overview of all maintenance requests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <MaintenanceStatItem
                  label="Urgent"
                  value={data.data.maintenance.urgent}
                  color="red"
                  icon={<AlertCircle className="h-4 w-4" />}
                />
                <MaintenanceStatItem
                  label="Pending Approval"
                  value={data.data.maintenance.pending}
                  color="yellow"
                  icon={<Clock className="h-4 w-4" />}
                />
                <MaintenanceStatItem
                  label="In Progress"
                  value={data.data.maintenance.in_progress}
                  color="blue"
                  icon={<Wrench className="h-4 w-4" />}
                />
                <MaintenanceStatItem
                  label="Completed This Period"
                  value={data.data.maintenance.completed}
                  color="green"
                  icon={<CheckCircle2 className="h-4 w-4" />}
                />
              </CardContent>
            </Card>

            {/* Revenue Chart */}
            <Card className="md:col-span-4">
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] flex items-end justify-between gap-2">
                  {data.data.charts.monthly_revenue.map((item, index) => {
                    const maxRevenue = Math.max(...data.data.charts.monthly_revenue.map(r => r.revenue));
                    const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                    
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div className="relative w-full">
                          <div
                            className="w-full bg-blue-500 rounded-t-md hover:bg-blue-600 transition-colors cursor-pointer"
                            style={{ height: `${height}%`, minHeight: height > 0 ? '20px' : '0px' }}
                            title={formatCurrency(item.revenue)}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{item.month}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Property Performance & Recent Activity */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Property Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Property Performance</CardTitle>
                <CardDescription>Revenue and occupancy by property</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.data.property_performance.slice(0, 5).map((property) => (
                    <div key={property.id} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{property.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {property.occupied_units}/{property.units} units • {property.occupancy_rate}% occupied
                        </p>
                      </div>
                      <div className="text-sm font-medium">
                        {formatCurrency(property.revenue)}
                      </div>
                    </div>
                  ))}
                  {data.data.property_performance.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No properties found
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest payments and maintenance requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.data.recent_activity.slice(0, 5).map((activity) => (
                    <div key={`${activity.type}-${activity.id}`} className="flex items-start gap-3">
                      <div className={cn(
                        "rounded-full p-2",
                        activity.type === 'payment' ? "bg-green-100" : "bg-blue-100"
                      )}>
                        {activity.type === 'payment' ? (
                          <DollarSign className={cn(
                            "h-4 w-4",
                            activity.type === 'payment' ? "text-green-600" : "text-blue-600"
                          )} />
                        ) : (
                          <Wrench className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            {activity.type === 'payment' 
                              ? `Payment ${activity.status}`
                              : activity.title
                            }
                          </p>
                          {activity.amount && (
                            <span className="text-sm font-medium">
                              {formatCurrency(activity.amount)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{activity.tenant}</span>
                          <span>•</span>
                          <span>{activity.property}</span>
                        </div>
                        {activity.type === 'maintenance' && (
                          <div className="flex gap-2">
                            <Badge variant={
                              activity.status === 'resolved' ? 'default' :
                              activity.status === 'in_progress' ? 'secondary' :
                              'outline'
                            } className="text-xs">
                              {activity.status}
                            </Badge>
                            {activity.priority && (
                              <Badge variant={
                                activity.priority === 'emergency' || activity.priority === 'high' ? 'destructive' : 'outline'
                              } className="text-xs">
                                {activity.priority}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {data.data.recent_activity.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No recent activity
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
      </div>
    </MainLayout>
  );
}

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: string;
  description?: string;
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
}

function StatsCard({ title, value, description, icon, iconColor, iconBg }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={cn("rounded-full p-2", iconBg)}>
          <div className={iconColor}>{icon}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

// Maintenance Stat Item Component
interface MaintenanceStatItemProps {
  label: string;
  value: number;
  color: 'red' | 'yellow' | 'blue' | 'green';
  icon: React.ReactNode;
}

function MaintenanceStatItem({ label, value, color, icon }: MaintenanceStatItemProps) {
  const colorClasses = {
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={cn("rounded-full p-2", colorClasses[color])}>
          {icon}
        </div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-sm font-bold">{value}</span>
    </div>
  );
}

// Loading Skeleton
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
