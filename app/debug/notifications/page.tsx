'use client';

import { NotificationDebugComponent } from '@/components/debug/notification-debug';

export default function NotificationDebugPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">🔍 Notification System Debug</h1>
        <NotificationDebugComponent />
      </div>
    </div>
  );
}
