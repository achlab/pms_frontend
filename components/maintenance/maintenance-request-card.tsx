/**
 * Maintenance Request Card Component
 * Displays individual maintenance request in a card format
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Calendar, DollarSign, User, MessageSquare, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import type { MaintenanceRequest } from "@/lib/api-types";
import { formatCurrency, formatDate, formatStatus, getRelativeTime } from "@/lib/api-utils";
import { ApproveRejectModal } from "./approve-reject-modal";
import { useAuth } from "@/contexts/auth-context";

interface MaintenanceRequestCardProps {
  request: MaintenanceRequest;
  onViewDetails?: (requestId: string) => void;
  onAddNote?: (requestId: string) => void;
  onRefresh?: () => void;
}

export function MaintenanceRequestCard({
  request,
  onViewDetails,
  onAddNote,
  onRefresh,
}: MaintenanceRequestCardProps) {
  const [showApproveRejectModal, setShowApproveRejectModal] = useState(false);
  const { user } = useAuth();
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      received: "bg-blue-100 text-blue-800",
      assigned: "bg-purple-100 text-purple-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      pending_approval: "bg-orange-100 text-orange-800",
      approved: "bg-green-100 text-green-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-gray-100 text-gray-800",
      normal: "bg-blue-100 text-blue-800",
      urgent: "bg-orange-100 text-orange-800",
      emergency: "bg-red-100 text-red-800",
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  const isUrgent = request.priority === "urgent" || request.priority === "emergency";

  return (
    <Card className={`hover:shadow-md transition-shadow ${isUrgent ? "border-orange-200" : ""}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: request.category.color }}
              />
              <h3 className="font-semibold text-lg">{request.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{request.request_number}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={getStatusColor(request.status)}>
              {formatStatus(request.status)}
            </Badge>
            <Badge className={getPriorityColor(request.priority)}>
              {formatStatus(request.priority)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {request.description}
        </p>

        {/* Property & Unit */}
        <div className="flex items-center gap-2 text-sm">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span>
            {request.property.name}
            {request.unit ? ` - Unit ${request.unit.unit_number}` : ' (Property-wide)'}
          </span>
        </div>

        {/* Category */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">{request.category.icon}</span>
          <div>
            <p className="text-sm font-medium">{request.category.name}</p>
            <p className="text-xs text-muted-foreground">
              Expected: {request.category.expected_resolution_hours}h
            </p>
          </div>
        </div>

        {/* Caretaker (if assigned) */}
        {request.caretaker && (
          <div className="flex items-center gap-2 text-sm bg-muted/50 rounded-lg p-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{request.caretaker.name}</p>
              <p className="text-xs text-muted-foreground">{request.caretaker.phone}</p>
            </div>
          </div>
        )}

        {/* Estimated Cost */}
        {request.estimated_cost && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>Estimated Cost</span>
            </div>
            <span className="font-semibold">{formatCurrency(request.estimated_cost)}</span>
          </div>
        )}

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Created</p>
            <p className="font-medium">{getRelativeTime(request.created_at)}</p>
          </div>
          {request.scheduled_date && (
            <div>
              <p className="text-muted-foreground">Scheduled</p>
              <p className="font-medium">{formatDate(request.scheduled_date)}</p>
            </div>
          )}
        </div>

        {/* Urgent Warning */}
        {isUrgent && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
            <p className="text-xs text-orange-700">
              This is a {request.priority} priority request requiring immediate attention.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          {/* Action buttons */}
          <div className="flex gap-2">
            {/* View Details button - always visible */}
            {onViewDetails && (
              <Button
                size="sm"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => onViewDetails(request.id)}
              >
                View Details
              </Button>
            )}

            {/* Approval/Rejection button for landlords */}
            {(() => {
              const isLandlord = user?.role === 'landlord';
              const isOwner = request.landlord_id === user?.id || 
                             request.property?.landlord_id === user?.id;
              // Allow review for: received, acknowledged, approved, rejected
              // Exclude final states: closed, cancelled
              const canReview = !['closed', 'cancelled'].includes(request.status);
              
              return isLandlord && isOwner && canReview;
            })() && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-green-200 text-green-700 hover:bg-green-50"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowApproveRejectModal(true);
                }}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Review
              </Button>
            )}

            {/* Add Note button */}
            {onAddNote && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => onAddNote(request.id)}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Approval/Rejection Modal */}
        <ApproveRejectModal
          isOpen={showApproveRejectModal}
          onClose={() => setShowApproveRejectModal(false)}
          maintenanceRequest={request}
          onSuccess={() => {
            onRefresh?.();
          }}
        />
      </CardContent>
    </Card>
  );
}

