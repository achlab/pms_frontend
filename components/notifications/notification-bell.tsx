/**
 * Notification Bell Component
 * Displays all notifications (invoices, payments, maintenance, leases)
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
  Settings,
  DollarSign,
  FileText,
  Calendar,
  Home
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
  
  // API hooks - fetch notifications for all authenticated users
  const { data: notificationsData, isLoading, error } = useMaintenanceNotifications({
    per_page: 10,
    enabled: !!user // Enable for all logged-in users
  });
  const { data: unreadCountData } = useUnreadNotificationCount(!!user); // Enable for all logged-in users
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

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.IsRead) {
      markAsRead(notification.ID);
    }
    
    // Determine the correct route based on notification type
    const notificationType = notification.Data.type;
    const notificationData = notification.Data.data || notification.Data;
    
    // Debug log to help identify notification types
    console.log('🔔 Notification clicked:', {
      type: notificationType,
      data: notificationData,
      fullNotification: notification
    });
    
    let targetUrl = '';
    
    // Route based on notification type
    if (notificationType?.includes('maintenance')) {
      // Maintenance notifications → go to maintenance page with request ID
      const requestId = notificationData.request_id || notificationData.maintenance_request_id;
      if (requestId) {
        targetUrl = `/maintenance?requestId=${requestId}`;
      } else {
        targetUrl = '/maintenance';
      }
    } else if (notificationType?.includes('payment')) {
      // Payment notifications → go to payments page
      const paymentId = notificationData.payment_id;
      if (paymentId) {
        targetUrl = `/payments?paymentId=${paymentId}`;
      } else {
        targetUrl = '/payments';
      }
    } else if (notificationType?.includes('invoice')) {
      // Invoice notifications → go to invoices page
      const invoiceId = notificationData.invoice_id || notificationData.invoiceId;
      if (invoiceId) {
        // Route based on user role
        if (user?.role === 'tenant') {
          targetUrl = `/tenant/invoices?invoiceId=${invoiceId}`;
        } else if (user?.role === 'landlord') {
          targetUrl = `/landlord/invoices/${invoiceId}`;
        } else {
          targetUrl = `/invoices?invoiceId=${invoiceId}`;
        }
      } else {
        // Fallback to invoices list based on role
        if (user?.role === 'tenant') {
          targetUrl = '/tenant/invoices';
        } else if (user?.role === 'landlord') {
          targetUrl = '/landlord/invoices';
        } else {
          targetUrl = '/invoices';
        }
      }
    } else if (notificationType?.includes('lease')) {
      // Lease notifications → go to leases page
      const leaseId = notificationData.lease_id;
      if (leaseId) {
        targetUrl = `/leases?leaseId=${leaseId}`;
      } else {
        targetUrl = '/leases';
      }
    } else {
      // Fallback: use ActionUrl if available
      targetUrl = notification.ActionUrl || notification.Data.action_url || '/dashboard';
    }
    
    // Navigate to the target URL
    window.location.href = targetUrl;
  };

  const getNotificationIcon = (notification: Notification) => {
    const notificationType = notification.Data.type;
    const priority = notification.Data.priority;
    
    // Payment notifications
    if (notificationType?.includes('payment')) {
      if (notificationType.includes('verified')) {
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      }
      return <DollarSign className="h-4 w-4 text-green-600" />;
    }
    
    // Invoice notifications
    if (notificationType?.includes('invoice')) {
      return <FileText className="h-4 w-4 text-blue-600" />;
    }
    
    // Lease notifications
    if (notificationType?.includes('lease')) {
      return <Calendar className="h-4 w-4 text-orange-600" />;
    }
    
    // Maintenance notifications
    switch (notificationType) {
      case "maintenance_request_submitted":
      case "maintenance_submitted":
        return priority === "emergency" 
          ? <AlertTriangle className="h-4 w-4 text-red-600" />
          : <Wrench className="h-4 w-4 text-blue-600" />;
      
      case "maintenance_approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      
      case "maintenance_rejected":
        return <X className="h-4 w-4 text-red-600" />;
      
      case "maintenance_resolved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      
      case "maintenance_request_status_updated":
      case "maintenance_status_changed":
        const status = notification.Data.data?.new_status;
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
        // Check if it's maintenance by other means
        if (notificationType?.includes('maintenance')) {
          return <Wrench className="h-4 w-4 text-blue-600" />;
        }
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

  // Don't show for unauthenticated users
  if (!user) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" data-testid="notification-bell">
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold text-white bg-red-600 border-0"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
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
                      {notification.Data.priority && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getPriorityColor(notification.Data.priority)}`}
                        >
                          {notification.Data.priority}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-1">
                      {notification.Message || notification.Data.message}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {notification.Data.data.property_name && (
                          <>
                            {notification.Data.data.property_name}
                            {notification.Data.data.unit_number && ` - Unit ${notification.Data.data.unit_number}`}
                          </>
                        )}
                      </span>
                      <span>{notification.TimeAgo}</span>
                    </div>
                    
                    {/* Show reference number based on type */}
                    {notification.Data.data.request_number && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Request: {notification.Data.data.request_number}
                      </p>
                    )}
                    {notification.Data.data.invoice_number && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Invoice: {notification.Data.data.invoice_number}
                      </p>
                    )}
                    {notification.Data.data.payment_id && !notification.Data.data.request_number && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Amount: ₵{notification.Data.data.amount?.toFixed(2) || '0.00'}
                      </p>
                    )}
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
          onClick={() => window.location.href = "/notifications"}
        >
          <Settings className="h-4 w-4 mr-2" />
          View All Notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
