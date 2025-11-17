/**
 * Maintenance Request Details Component
 * Displays detailed information about a maintenance request including timeline
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import {
  Calendar,
  User,
  AlertCircle,
  Clock,
  MessageSquare,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import type { MaintenanceRequest } from "@/lib/api-types";

interface MaintenanceRequestDetailsProps {
  request: MaintenanceRequest;
  onAddNote?: () => void;
}

export function MaintenanceRequestDetails({
  request,
  onAddNote,
}: MaintenanceRequestDetailsProps) {
  const statusColors: Record<string, string> = {
    received: "bg-blue-500",
    assigned: "bg-purple-500",
    in_progress: "bg-yellow-500",
    pending_approval: "bg-orange-500",
    approved: "bg-green-500",
    resolved: "bg-green-600",
    closed: "bg-gray-500",
  };

  const priorityColors: Record<string, string> = {
    low: "bg-gray-500",
    normal: "bg-blue-500",
    urgent: "bg-orange-500",
    emergency: "bg-red-500",
  };

  const getStatusColor = (status: string) => statusColors[status] || "bg-gray-500";
  const getPriorityColor = (priority: string) => priorityColors[priority] || "bg-gray-500";

  return (
    <div className="space-y-4">
      {/* Main Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle>{request.title}</CardTitle>
                <Badge variant="outline">{request.request_number}</Badge>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getPriorityColor(request.priority)}>
                  {request.priority}
                </Badge>
                <Badge className={getStatusColor(request.status)}>
                  {request.status.replace("_", " ")}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{request.description}</p>
          </div>

          <Separator />

          {/* Details Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Category */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <span className="text-xl">{request.category.icon}</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium">{request.category.name}</p>
              </div>
            </div>

            {/* Reported Date */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reported</p>
                <p className="font-medium">{formatDate(request.created_at)}</p>
              </div>
            </div>

            {/* Preferred Start Date */}
            {request.preferred_start_date && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Preferred Start</p>
                  <p className="font-medium">{formatDate(request.preferred_start_date)}</p>
                </div>
              </div>
            )}

            {/* Assigned Caretaker */}
            {request.assigned_to && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Assigned To</p>
                  <p className="font-medium">{request.assigned_to.name}</p>
                </div>
              </div>
            )}

            {/* Resolution Date */}
            {request.resolved_at && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                  <p className="font-medium">{formatDate(request.resolved_at)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Resolution Note */}
          {request.resolution_note && (
            <>
              <Separator />
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  Resolution Note
                </h3>
                <p className="text-sm text-green-800 dark:text-green-200">
                  {request.resolution_note}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Media Attachments */}
      {request.media && request.media.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Attachments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {request.media.map((media, index) => (
                <div key={index} className="relative group">
                  {media.type === "image" ? (
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <img
                        src={media.url}
                        alt={`Attachment ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                      <Video className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <a
                    href={media.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes/Timeline */}
      {request.notes && request.notes.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Activity Timeline</CardTitle>
              {onAddNote && (
                <Button onClick={onAddNote} size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {request.notes.map((note, index) => (
                <div key={index} className="flex gap-3 pb-4 border-b last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{note.user.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {note.user.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(note.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{note.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

