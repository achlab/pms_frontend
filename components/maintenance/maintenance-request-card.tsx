"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Calendar, MessageSquare, CheckCircle, XCircle } from "lucide-react";
import type { MaintenanceRequest } from "@/lib/api-types";
import { formatDate, formatStatus, getRelativeTime } from "@/lib/api-utils";
import { ApproveRejectModal } from "./approve-reject-modal";
import { useAuth } from "@/contexts/auth-context";

interface MaintenanceRequestCardProps {
  request: MaintenanceRequest;
  onViewDetails?: (requestId: string) => void;
  onAddNote?: (requestId: string) => void;
  onRefresh?: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-100 text-gray-800",
  under_review: "bg-blue-100 text-blue-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  closed: "bg-gray-200 text-gray-800",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-800",
  normal: "bg-blue-100 text-blue-800",
  urgent: "bg-orange-100 text-orange-800",
  emergency: "bg-red-100 text-red-800",
};

export function MaintenanceRequestCard({
  request,
  onViewDetails,
  onAddNote,
  onRefresh,
}: MaintenanceRequestCardProps) {
  const [showApproveRejectModal, setShowApproveRejectModal] = useState(false);
  const { user } = useAuth();

  const normalizedStatus = request.status?.toLowerCase();
  const role = user?.role;
  const isLandlord = role === "landlord";
  const isSuperAdmin = role === "super_admin";
  const isCaretaker = role === "caretaker";
  const isOwner =
    request.landlord_id === user?.id ||
    request.property?.landlord_id === user?.id ||
    request.landlord?.id === user?.id;
  const isAssignedCaretaker =
    isCaretaker &&
    (request.caretaker?.id === user?.id || request.assigned_to?.id === user?.id);

  const allowDecision = ["pending", "under_review"].includes(normalizedStatus) &&
    (isSuperAdmin || (isLandlord && isOwner) || isAssignedCaretaker);

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{request.request_number}</p>
            <h3 className="text-lg font-semibold leading-tight">{request.title}</h3>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge className={STATUS_COLORS[request.status] || "bg-gray-100 text-gray-800"}>
              {formatStatus(request.status)}
            </Badge>
            <Badge className={PRIORITY_COLORS[request.priority] || "bg-gray-100 text-gray-800"}>
              {formatStatus(request.priority)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">{request.description}</p>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span>
              {request.property.name}
              {request.unit ? `  Unit ${request.unit.unit_number}` : ""}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Submitted {formatDate(request.created_at)} ({getRelativeTime(request.created_at)})</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
            <span>{request.tenant?.name}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {onViewDetails && (
            <Button
              size="sm"
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => onViewDetails(request.id)}
            >
              View Details
            </Button>
          )}

          {allowDecision && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setShowApproveRejectModal(true);
              }}
            >
              <XCircle className="mr-1 h-4 w-4" />
              Review
            </Button>
          )}

          {onAddNote && (
            <Button variant="outline" size="icon" onClick={() => onAddNote(request.id)}>
              <MessageSquare className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>

      <ApproveRejectModal
        isOpen={showApproveRejectModal}
        onClose={() => setShowApproveRejectModal(false)}
        maintenanceRequest={request}
        onSuccess={() => {
          onRefresh?.();
          setShowApproveRejectModal(false);
        }}
      />
    </Card>
  );
}
