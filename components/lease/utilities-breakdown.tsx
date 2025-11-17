/**
 * Utilities Breakdown Component
 * Displays who is responsible for which utilities
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Droplet, Flame, Wifi } from "lucide-react";
import type { UtilitiesResponsibility } from "@/lib/api-types";

interface UtilitiesBreakdownProps {
  utilities: UtilitiesResponsibility;
}

export function UtilitiesBreakdown({ utilities }: UtilitiesBreakdownProps) {
  const utilityItems = [
    {
      name: "Electricity",
      icon: Zap,
      responsibility: utilities.electricity,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      name: "Water",
      icon: Droplet,
      responsibility: utilities.water,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      name: "Gas",
      icon: Flame,
      responsibility: utilities.gas,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      name: "Internet",
      icon: Wifi,
      responsibility: utilities.internet,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  const getResponsibilityBadge = (responsibility: string) => {
    const configs: Record<string, { className: string; label: string }> = {
      tenant: {
        className: "bg-blue-100 text-blue-800",
        label: "Tenant Pays",
      },
      landlord: {
        className: "bg-green-100 text-green-800",
        label: "Landlord Pays",
      },
      shared: {
        className: "bg-purple-100 text-purple-800",
        label: "Shared Cost",
      },
    };

    const config = configs[responsibility] || configs.tenant;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Utilities Responsibility</CardTitle>
        <p className="text-sm text-muted-foreground">
          Who is responsible for paying each utility
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {utilityItems.map((utility) => {
            const Icon = utility.icon;
            return (
              <div
                key={utility.name}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${utility.bgColor}`}>
                    <Icon className={`h-5 w-5 ${utility.color}`} />
                  </div>
                  <div>
                    <p className="font-semibold">{utility.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Monthly utility
                    </p>
                  </div>
                </div>
                {getResponsibilityBadge(utility.responsibility)}
              </div>
            );
          })}
        </div>

        {/* Summary Note */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold">Note:</span> Utilities marked as "Tenant Pays"
            should be paid directly by you to the service provider. Those marked as
            "Landlord Pays" are included in your rent or paid by the landlord.
            "Shared Cost" means the expense is split between tenant and landlord.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

