/**
 * Artisan Performance Dashboard Component
 * Displays performance metrics for artisans/caretakers
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/api-utils";

export interface ArtisanPerformance {
  id: string;
  name: string;
  type: "caretaker" | "artisan";
  phone?: string;
  email?: string;
  // Performance metrics
  total_requests: number;
  completed_requests: number;
  in_progress_requests: number;
  average_rating: number;
  total_ratings: number;
  completion_rate: number; // percentage
  average_completion_time: number; // hours
  on_time_completion_rate: number; // percentage
  rework_rate: number; // percentage
  average_cost_per_request: number;
  // Specializations
  specializations?: string[];
  // Status
  is_active: boolean;
  is_blacklisted?: boolean;
}

interface ArtisanPerformanceDashboardProps {
  artisans: ArtisanPerformance[];
  isLoading?: boolean;
  onViewDetails?: (artisanId: string) => void;
}

export function ArtisanPerformanceDashboard({
  artisans,
  isLoading = false,
  onViewDetails,
}: ArtisanPerformanceDashboardProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </CardHeader>
              <CardContent>
                <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-40"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (artisans.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No artisan performance data available</p>
        </CardContent>
      </Card>
    );
  }

  // Sort by performance (completion rate + rating)
  const sortedArtisans = [...artisans].sort((a, b) => {
    const scoreA = a.completion_rate + (a.average_rating * 10);
    const scoreB = b.completion_rate + (b.average_rating * 10);
    return scoreB - scoreA;
  });

  const getPerformanceBadge = (artisan: ArtisanPerformance) => {
    const score = artisan.completion_rate + (artisan.average_rating * 10);
    if (score >= 90) return { label: "Top Performer", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" };
    if (score >= 75) return { label: "Good", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" };
    if (score >= 60) return { label: "Average", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" };
    return { label: "Needs Improvement", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" };
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 4.0) return "text-blue-600";
    if (rating >= 3.5) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Artisan Performance</h2>
        <p className="text-muted-foreground">Performance metrics for all artisans and caretakers</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedArtisans.map((artisan) => {
          const performance = getPerformanceBadge(artisan);
          const isTopPerformer = performance.label === "Top Performer";

          return (
            <Card
              key={artisan.id}
              className={`hover:shadow-lg transition-shadow cursor-pointer ${
                isTopPerformer ? "border-green-300 bg-green-50/50 dark:bg-green-900/10" : ""
              } ${artisan.is_blacklisted ? "opacity-60 border-red-300" : ""}`}
              onClick={() => onViewDetails?.(artisan.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {artisan.name}
                      {isTopPerformer && (
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      )}
                      {artisan.is_blacklisted && (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {artisan.type}
                      </Badge>
                      <Badge className={`text-xs ${performance.color}`}>
                        {performance.label}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Rating */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">Rating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${getRatingColor(artisan.average_rating)}`}>
                      {artisan.average_rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({artisan.total_ratings} reviews)
                    </span>
                  </div>
                </div>

                {/* Completion Rate */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Completion Rate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">
                      {artisan.completion_rate.toFixed(1)}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {artisan.completed_requests}/{artisan.total_requests}
                    </span>
                  </div>
                </div>

                {/* On-Time Rate */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">On-Time Rate</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {artisan.on_time_completion_rate.toFixed(1)}%
                  </span>
                </div>

                {/* Rework Rate */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Rework Rate</span>
                  </div>
                  <span className={`text-sm font-semibold ${
                    artisan.rework_rate > 20 ? "text-red-600" : 
                    artisan.rework_rate > 10 ? "text-yellow-600" : 
                    "text-green-600"
                  }`}>
                    {artisan.rework_rate.toFixed(1)}%
                  </span>
                </div>

                {/* Average Completion Time */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">Avg Time</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {artisan.average_completion_time.toFixed(1)}h
                  </span>
                </div>

                {/* Average Cost */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium">Avg Cost</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatCurrency(artisan.average_cost_per_request)}
                  </span>
                </div>

                {/* Specializations */}
                {artisan.specializations && artisan.specializations.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Specializations</p>
                    <div className="flex flex-wrap gap-1">
                      {artisan.specializations.slice(0, 3).map((spec, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                      {artisan.specializations.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{artisan.specializations.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Status Indicators */}
                <div className="pt-2 border-t flex items-center justify-between text-xs">
                  <span className={`${artisan.is_active ? "text-green-600" : "text-gray-400"}`}>
                    {artisan.is_active ? "Active" : "Inactive"}
                  </span>
                  {artisan.is_blacklisted && (
                    <span className="text-red-600 font-medium">Blacklisted</span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

