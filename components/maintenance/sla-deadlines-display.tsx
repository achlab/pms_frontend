/**
 * SLA Deadlines Display Component
 * Shows all SLA deadlines for a maintenance request
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle, AlertTriangle } from "lucide-react";
import type { MaintenanceRequest } from "@/lib/api-types";
import { calculateSLADeadlines, getSLAStatusColor, getSLAStatusLabel, SLA_CONFIG } from "@/lib/utils/sla-tracking";
import { SLAIndicator } from "./sla-indicator";
import { formatDate } from "@/lib/api-utils";

interface SLADeadlinesDisplayProps {
  request: MaintenanceRequest;
}

export function SLADeadlinesDisplay({ request }: SLADeadlinesDisplayProps) {
  const slas = calculateSLADeadlines(request);

  const getDeadlineLabel = (type: string) => {
    switch (type) {
      case "response":
        return "Response Deadline";
      case "assignment":
        return "Assignment Deadline";
      case "acceptance":
        return "Acceptance Deadline";
      case "completion":
        return "Completion Deadline";
      default:
        return "Deadline";
    }
  };

  const getDeadlineDescription = (type: string) => {
    switch (type) {
      case "response":
        return `Landlord must respond within ${SLA_CONFIG.RESPONSE_HOURS < 1 ? `${Math.round(SLA_CONFIG.RESPONSE_HOURS * 60)} minutes` : `${SLA_CONFIG.RESPONSE_HOURS} hours`}`;
      case "assignment":
        return `Request must be assigned within ${SLA_CONFIG.ASSIGNMENT_HOURS < 1 ? `${Math.round(SLA_CONFIG.ASSIGNMENT_HOURS * 60)} minutes` : `${SLA_CONFIG.ASSIGNMENT_HOURS} hours`} of approval`;
      case "acceptance":
        return `Assignee must accept within ${SLA_CONFIG.ACCEPTANCE_HOURS < 1 ? `${Math.round(SLA_CONFIG.ACCEPTANCE_HOURS * 60)} minutes` : `${SLA_CONFIG.ACCEPTANCE_HOURS} hours`}`;
      case "completion":
        const completionHours = SLA_CONFIG.COMPLETION[request.priority] || SLA_CONFIG.COMPLETION.normal;
        const completionText = completionHours < 1 
          ? `${Math.round(completionHours * 60)} minutes`
          : completionHours < 24
          ? `${completionHours} hours`
          : `${Math.round(completionHours / 24)} days`;
        return `Complete within ${completionText}`;
      default:
        return "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          SLA Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Response SLA */}
        {slas.response.status !== "not_applicable" && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{getDeadlineLabel("response")}</p>
                <p className="text-xs text-gray-500">{getDeadlineDescription("response")}</p>
              </div>
              <SLAIndicator deadline={slas.response} compact />
            </div>
            {slas.response.deadline && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Deadline: {formatDate(slas.response.deadline.toISOString())}
              </p>
            )}
          </div>
        )}

        {/* Assignment SLA */}
        {slas.assignment.status !== "not_applicable" && (
          <div className="space-y-1 border-t pt-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{getDeadlineLabel("assignment")}</p>
                <p className="text-xs text-gray-500">{getDeadlineDescription("assignment")}</p>
              </div>
              <SLAIndicator deadline={slas.assignment} compact />
            </div>
            {slas.assignment.deadline && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Deadline: {formatDate(slas.assignment.deadline.toISOString())}
              </p>
            )}
          </div>
        )}

        {/* Acceptance SLA */}
        {slas.acceptance.status !== "not_applicable" && (
          <div className="space-y-1 border-t pt-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{getDeadlineLabel("acceptance")}</p>
                <p className="text-xs text-gray-500">{getDeadlineDescription("acceptance")}</p>
              </div>
              <SLAIndicator deadline={slas.acceptance} compact />
            </div>
            {slas.acceptance.deadline && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Deadline: {formatDate(slas.acceptance.deadline.toISOString())}
              </p>
            )}
          </div>
        )}

        {/* Completion SLA */}
        {slas.completion.status !== "not_applicable" && (
          <div className="space-y-1 border-t pt-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{getDeadlineLabel("completion")}</p>
                <p className="text-xs text-gray-500">{getDeadlineDescription("completion")}</p>
              </div>
              <SLAIndicator deadline={slas.completion} compact />
            </div>
            {slas.completion.deadline && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Deadline: {formatDate(slas.completion.deadline.toISOString())}
              </p>
            )}
          </div>
        )}

        {/* Summary */}
        <div className="border-t pt-3 mt-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">SLA Compliance:</span>
            <span className={
              request.sla_response_met && request.sla_assignment_met && request.sla_completion_met
                ? "text-green-600 font-semibold"
                : "text-yellow-600 font-semibold"
            }>
              {request.sla_response_met && request.sla_assignment_met && request.sla_completion_met
                ? "All SLAs Met"
                : "In Progress"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

