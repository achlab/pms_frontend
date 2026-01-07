/**
 * SLA Indicator Component
 * Displays SLA status with visual indicators and countdown
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import type { SLADeadline } from "@/lib/utils/sla-tracking";
import {
  getSLAStatusColor,
  getSLAStatusLabel,
  formatTimeRemaining,
} from "@/lib/utils/sla-tracking";
import { useEffect, useState } from "react";

interface SLAIndicatorProps {
  deadline: SLADeadline;
  showLabel?: boolean;
  compact?: boolean;
}

export function SLAIndicator({
  deadline,
  showLabel = true,
  compact = false,
}: SLAIndicatorProps) {
  const [timeRemaining, setTimeRemaining] = useState(deadline.timeRemaining);

  // Update countdown every minute
  useEffect(() => {
    if (deadline.status === "overdue" || deadline.status === "met" || deadline.status === "not_applicable") {
      return;
    }

    const interval = setInterval(() => {
      if (deadline.deadline) {
        const now = new Date();
        const remaining = Math.max(0, deadline.deadline.getTime() - now.getTime());
        setTimeRemaining(remaining);
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [deadline]);

  if (deadline.status === "not_applicable") {
    return null;
  }

  const getIcon = () => {
    switch (deadline.status) {
      case "on_time":
        return <Clock className="h-3 w-3" />;
      case "approaching":
        return <AlertTriangle className="h-3 w-3" />;
      case "overdue":
        return <XCircle className="h-3 w-3" />;
      case "met":
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const colorClass = getSLAStatusColor(deadline.status);
  const label = getSLAStatusLabel(deadline.status);
  const timeText = formatTimeRemaining(timeRemaining ?? deadline.timeRemaining);

  if (compact) {
    return (
      <Badge className={`${colorClass} text-xs flex items-center gap-1`}>
        {getIcon()}
        {showLabel && <span>{label}</span>}
      </Badge>
    );
  }

  return (
    <div className={`${colorClass} rounded-lg p-2 border flex items-center justify-between gap-2`}>
      <div className="flex items-center gap-2">
        {getIcon()}
        <div>
          <p className="text-xs font-medium">{label}</p>
          {deadline.status !== "met" && deadline.status !== "overdue" && (
            <p className="text-xs opacity-75">{timeText}</p>
          )}
        </div>
      </div>
      {deadline.percentageElapsed > 0 && deadline.status !== "met" && (
        <div className="flex-1 max-w-[60px]">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${
                deadline.status === "overdue"
                  ? "bg-red-600"
                  : deadline.status === "approaching"
                  ? "bg-yellow-600"
                  : "bg-green-600"
              }`}
              style={{ width: `${Math.min(100, deadline.percentageElapsed)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

