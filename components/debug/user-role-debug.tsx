"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";

export function UserRoleDebug() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-4">
          <p>Loading user data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">🔍 User Role Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-medium">User Data:</p>
          <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-sm text-muted-foreground">Name:</p>
            <p className="font-medium">{user?.name || "Not set"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email:</p>
            <p className="font-medium">{user?.email || "Not set"}</p>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Role:</p>
          <Badge variant={user?.role === "landlord" ? "default" : "secondary"}>
            {user?.role || "Not set"}
          </Badge>
        </div>

        <div className="border-t pt-3">
          <p className="text-sm font-medium mb-2">Record Payment Permissions:</p>
          <div className="space-y-1 text-sm">
            <p>✅ User exists: {user ? "Yes" : "No"}</p>
            <p>✅ Role is landlord: {user?.role === "landlord" ? "Yes" : "No"}</p>
            <p>✅ Can record payments: {user?.role === "landlord" ? "Yes" : "No"}</p>
          </div>
        </div>

        {user?.role !== "landlord" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Only landlords can record payments. Your current role is "{user?.role}".
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
