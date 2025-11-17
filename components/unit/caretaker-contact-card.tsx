/**
 * Caretaker Contact Card Component
 * Displays caretaker contact information with action buttons
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Phone, Mail, MessageSquare } from "lucide-react";
import type { Caretaker } from "@/lib/api-types";

interface CaretakerContactCardProps {
  caretaker: Caretaker;
}

export function CaretakerContactCard({ caretaker }: CaretakerContactCardProps) {
  const handleCall = () => {
    window.location.href = `tel:${caretaker.phone}`;
  };

  const handleEmail = () => {
    if (caretaker.email) {
      window.location.href = `mailto:${caretaker.email}`;
    }
  };

  const handleSMS = () => {
    window.location.href = `sms:${caretaker.phone}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Property Caretaker</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Caretaker Info */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold">{caretaker.name}</p>
            <p className="text-sm text-muted-foreground">Property Caretaker</p>
          </div>
        </div>

        {/* Contact Details */}
        <div className="space-y-3">
          {/* Phone */}
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <a 
              href={`tel:${caretaker.phone}`}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {caretaker.phone}
            </a>
          </div>

          {/* Email */}
          {caretaker.email && (
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a 
                href={`mailto:${caretaker.email}`}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                {caretaker.email}
              </a>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button onClick={handleCall} size="sm" className="flex-1">
            <Phone className="h-4 w-4 mr-2" />
            Call
          </Button>
          <Button onClick={handleSMS} size="sm" variant="outline" className="flex-1">
            <MessageSquare className="h-4 w-4 mr-2" />
            SMS
          </Button>
          {caretaker.email && (
            <Button onClick={handleEmail} size="sm" variant="outline" className="flex-1">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
          )}
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-xs text-blue-900 dark:text-blue-100">
            <strong>Need assistance?</strong> The caretaker is available to help with property maintenance, emergencies, and general inquiries.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

