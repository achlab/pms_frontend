/**
 * Notification Bell Component
 * Displays maintenance notifications for landlords
 */

"use client";

import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bell, 
  Wrench, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  X,
  Settings
} from "lucide-react";
import { formatDate } from "@/lib/api-utils";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { 
  useMaintenanceNotifications, 
  useUnreadNotificationCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead 
} from "@/lib/hooks/use-maintenance-notifications";
import type { Notification } from "@/lib/api-types";

// Notification interface is now imported from api-types

export function NotificationBell() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  // API hooks
  const { data: notificationsData, isLoading, error } = useMaintenanceNotifications({
    per_page: 10,
    enabled: user?.role === "landlord"
  });
  const { data: unreadCountData } = useUnreadNotificationCount(user?.role === "landlord");
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  
  // Use real API data
  const notifications = notificationsData?.data || [];
  const unreadCount = unreadCountData?.data?.UnreadCount || 0;

  const markAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const markAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleNotificationClick = (notification: MaintenanceNotification) => {
    if (!notification.IsRead) {
      markAsRead(notification.ID);
    }
    // Navigate to the action URL or maintenance request details
    const actionUrl = notification.ActionUrl || notification.Data.action_url;
    if (actionUrl) {
      window.location.href = actionUrl;
    } else {
      // Fallback to maintenance request page
      window.location.href = `/maintenance-requests/${notification.Data.data.request_id}`;
    }
  };

  const getNotificationIcon = (notification: Notification) => {
    const notificationType = notification.Data.type;
    const priority = notification.Data.priority;
    
    switch (notificationType) {
      case "maintenance_request_submitted":
        return priority === "emergency" 
          ? <AlertTriangle className="h-4 w-4 text-red-600" />
          : <Wrench className="h-4 w-4 text-blue-600" />;
      case "maintenance_request_status_updated":
        const status = notification.Data.data.new_status;
        switch (status) {
          case "resolved":
          case "closed":
            return <CheckCircle className="h-4 w-4 text-green-600" />;
          case "pending_approval":
            return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
          case "in_progress":
            return <Clock className="h-4 w-4 text-blue-600" />;
          default:
            return <Wrench className="h-4 w-4 text-gray-600" />;
        }
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: "low" | "normal" | "urgent" | "emergency") => {
    switch (priority) {
      case "emergency":
        return "bg-red-100 text-red-800 border-red-200";
      case "urgent":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "normal":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Don't show for non-landlords
  if (user?.role !== "landlord") {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Maintenance Notifications</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="h-6 px-2 text-xs"
            >
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-80">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.ID}
                className={`flex flex-col items-start p-3 cursor-pointer ${
                  !notification.IsRead ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm truncate">
                        {notification.Title || notification.Data.title}
                      </p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getPriorityColor(notification.Data.priority)}`}
                      >
                        {notification.Data.priority}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-1">
                      {notification.Message || notification.Data.message}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {notification.Data.data.property_name} - Unit {notification.Data.data.unit_number}
                      </span>
                      <span>{notification.TimeAgo}</span>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-1">
                      Request: {notification.Data.data.request_number}
                    </p>
                  </div>
                  
                  {!notification.IsRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="text-center justify-center text-sm text-muted-foreground cursor-pointer"
          onClick={() => window.location.href = "/maintenance-requests"}
        >
          <Settings className="h-4 w-4 mr-2" />
          View All Maintenance Requests
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
