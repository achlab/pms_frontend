'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useMaintenanceNotifications } from '@/lib/hooks/use-maintenance-notifications';
import { useMaintenanceRequests } from '@/lib/hooks/use-maintenance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/**
 * Debug Component: Notification & Approval System
 * 
 * This component runs 10 tests to identify why notifications and approval buttons aren't showing
 */
export function NotificationDebugComponent() {
  const { user } = useAuth();
  const [debugResults, setDebugResults] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<any>({});

  // Hooks for testing
  const { 
    data: notificationsData, 
    isLoading: notificationsLoading, 
    error: notificationsError 
  } = useMaintenanceNotifications.useNotifications();

  const { 
    data: unreadCountData, 
    isLoading: unreadCountLoading, 
    error: unreadCountError 
  } = useMaintenanceNotifications.useUnreadCount();

  const { 
    data: maintenanceData, 
    isLoading: maintenanceLoading, 
    error: maintenanceError 
  } = useMaintenanceRequests({});

  useEffect(() => {
    runDebugTests();
  }, [user, notificationsData, unreadCountData, maintenanceData]);

  const runDebugTests = () => {
    const results: any = {};

    // TEST 1: User Authentication
    results.test1_auth = {
      name: "User Authentication",
      status: user ? "✅ PASS" : "❌ FAIL",
      details: {
        isAuthenticated: !!user,
        userId: user?.id || 'N/A',
        userRole: user?.role || 'N/A',
        userName: user?.name || 'N/A',
        userEmail: user?.email || 'N/A'
      }
    };

    // TEST 2: Notification API Response
    results.test2_notifications = {
      name: "Notification API Response",
      status: notificationsError ? "❌ FAIL" : notificationsData ? "✅ PASS" : "⏳ LOADING",
      details: {
        loading: notificationsLoading,
        error: notificationsError?.message || null,
        dataExists: !!notificationsData,
        notificationCount: notificationsData?.length || 0,
        firstNotification: notificationsData?.[0] || null
      }
    };

    // TEST 3: Unread Count API
    results.test3_unread_count = {
      name: "Unread Count API",
      status: unreadCountError ? "❌ FAIL" : unreadCountData ? "✅ PASS" : "⏳ LOADING",
      details: {
        loading: unreadCountLoading,
        error: unreadCountError?.message || null,
        unreadCount: unreadCountData?.UnreadCount || 0
      }
    };

    // TEST 4: Maintenance Requests API
    results.test4_maintenance = {
      name: "Maintenance Requests API",
      status: maintenanceError ? "❌ FAIL" : maintenanceData ? "✅ PASS" : "⏳ LOADING",
      details: {
        loading: maintenanceLoading,
        error: maintenanceError?.message || null,
        requestCount: maintenanceData?.length || 0,
        pendingRequests: maintenanceData?.filter(r => ['received', 'acknowledged'].includes(r.status))?.length || 0
      }
    };

    // TEST 5: Landlord Role Check
    results.test5_landlord_role = {
      name: "Landlord Role Check",
      status: user?.role === 'landlord' ? "✅ PASS" : "❌ FAIL",
      details: {
        currentRole: user?.role || 'N/A',
        isLandlord: user?.role === 'landlord',
        canApproveReject: user?.role === 'landlord'
      }
    };

    // TEST 6: Pending Requests for Approval
    const userRequests = maintenanceData?.filter(r => r.landlord_id === user?.id) || [];
    const pendingUserRequests = userRequests.filter(r => ['received', 'acknowledged'].includes(r.status));
    
    results.test6_pending_requests = {
      name: "Pending Requests for Approval",
      status: pendingUserRequests.length > 0 ? "✅ PASS" : "❌ FAIL",
      details: {
        totalUserRequests: userRequests.length,
        pendingRequests: pendingUserRequests.length,
        pendingRequestIds: pendingUserRequests.map(r => r.id),
        allStatuses: userRequests.map(r => ({ id: r.id, status: r.status }))
      }
    };

    // TEST 7: Notification Bell Component
    const notificationBell = document.querySelector('[data-testid="notification-bell"]');
    results.test7_notification_bell = {
      name: "Notification Bell Component",
      status: notificationBell ? "✅ PASS" : "❌ FAIL",
      details: {
        elementExists: !!notificationBell,
        elementVisible: notificationBell ? window.getComputedStyle(notificationBell).display !== 'none' : false
      }
    };

    // TEST 8: Approval Button Visibility Logic
    const shouldShowApprovalButtons = user?.role === 'landlord' && pendingUserRequests.length > 0;
    results.test8_approval_buttons = {
      name: "Approval Button Logic",
      status: shouldShowApprovalButtons ? "✅ PASS" : "❌ FAIL",
      details: {
        isLandlord: user?.role === 'landlord',
        hasPendingRequests: pendingUserRequests.length > 0,
        shouldShow: shouldShowApprovalButtons,
        debugInfo: {
          userId: user?.id,
          userRole: user?.role,
          pendingCount: pendingUserRequests.length
        }
      }
    };

    // TEST 9: API Base URL Configuration
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    results.test9_api_config = {
      name: "API Configuration",
      status: apiBaseUrl ? "✅ PASS" : "❌ FAIL",
      details: {
        apiBaseUrl: apiBaseUrl || 'NOT SET',
        expectedUrl: 'http://localhost:8000/api'
      }
    };

    // TEST 10: Console Errors Check
    const consoleErrors: string[] = [];
    const originalConsoleError = console.error;
    console.error = (...args) => {
      consoleErrors.push(args.join(' '));
      originalConsoleError.apply(console, args);
    };

    results.test10_console_errors = {
      name: "Console Errors",
      status: consoleErrors.length === 0 ? "✅ PASS" : "⚠️ WARN",
      details: {
        errorCount: consoleErrors.length,
        recentErrors: consoleErrors.slice(-5)
      }
    };

    setTestResults(results);
  };

  const testManualAPI = async () => {
    try {
      console.log('🧪 Testing API endpoints manually...');
      
      // Test notifications endpoint
      const notificationsResponse = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Accept': 'application/json'
        }
      });
      
      console.log('Notifications API:', {
        status: notificationsResponse.status,
        ok: notificationsResponse.ok,
        data: await notificationsResponse.json()
      });

      // Test maintenance requests endpoint
      const maintenanceResponse = await fetch('/api/maintenance/requests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Accept': 'application/json'
        }
      });
      
      console.log('Maintenance API:', {
        status: maintenanceResponse.status,
        ok: maintenanceResponse.ok,
        data: await maintenanceResponse.json()
      });

    } catch (error) {
      console.error('Manual API test failed:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔍 Notification & Approval System Debug
            <Button onClick={testManualAPI} size="sm" variant="outline">
              Test APIs Manually
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {Object.entries(testResults).map(([key, test]: [string, any]) => (
              <div key={key} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{test.name}</h3>
                  <Badge variant={
                    test.status.includes('✅') ? 'default' : 
                    test.status.includes('❌') ? 'destructive' : 
                    'secondary'
                  }>
                    {test.status}
                  </Badge>
                </div>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(test.details, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => window.location.reload()} variant="outline">
              Refresh Page
            </Button>
            <Button onClick={() => localStorage.clear()} variant="outline">
              Clear Local Storage
            </Button>
            <Button onClick={() => console.clear()} variant="outline">
              Clear Console
            </Button>
            <Button onClick={runDebugTests} variant="outline">
              Re-run Tests
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
