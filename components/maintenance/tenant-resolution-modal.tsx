'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Building2, User, Calendar, Tag } from 'lucide-react';
import { MaintenanceRequest } from '@/lib/api-types';
import { useTenantResolveRequest } from '@/lib/hooks/use-tenant-resolution';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface TenantResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  maintenanceRequest: MaintenanceRequest;
  onSuccess?: () => void;
}

export function TenantResolutionModal({ 
  isOpen, 
  onClose, 
  maintenanceRequest, 
  onSuccess 
}: TenantResolutionModalProps) {
  const [action, setAction] = useState<'resolved' | 'unresolved' | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const { toast } = useToast();

  const resolveMutation = useTenantResolveRequest();

  const canSubmit = action !== null && (action === 'resolved' || resolutionNotes.length >= 10);

  const handleClose = () => {
    setAction(null);
    setResolutionNotes('');
    onClose();
  };

  const handleActionSelect = (selectedAction: 'resolved' | 'unresolved') => {
    setAction(selectedAction);
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      toast({
        title: "Cannot submit",
        description: "Please select an action and provide notes if marking as unresolved",
        variant: "destructive",
      });
      return;
    }

    try {
      await resolveMutation.mutateAsync({
        requestId: maintenanceRequest.id,
        data: {
          is_resolved: action === 'resolved',
          resolution_notes: resolutionNotes || undefined,
        },
      });

      toast({
        title: action === 'resolved' ? "Marked as Resolved" : "Marked as Unresolved",
        description: action === 'resolved' 
          ? "Thank you for confirming the work is completed!"
          : "The landlord has been notified about the issue.",
      });

      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error('Resolution error:', error);
      toast({
        title: "Submission failed",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  if (isOpen) {
    return createPortal(
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={handleClose}
      >
        <div 
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-blue-500" />
                Confirm Work Completion
              </h2>
              <button
                onClick={handleClose}
                className="ml-auto p-1 hover:bg-gray-100 rounded"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Request Summary */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{maintenanceRequest.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{maintenanceRequest.description}</p>
                  </div>
                  <Badge variant="default" className="bg-green-600">
                    Approved
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <span>
                      {maintenanceRequest.property.name}
                      {maintenanceRequest.unit ? ` - Unit ${maintenanceRequest.unit.unit_number}` : ' (Property-wide)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>Approved: {formatDate(maintenanceRequest.updated_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-gray-500" />
                    <span>{maintenanceRequest.category.name}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Please confirm if the maintenance work has been completed to your satisfaction.
                </p>
              </div>

              {/* Action Selection */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Is the work completed?</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant={action === 'resolved' ? 'default' : 'outline'}
                    className={`h-20 flex-col gap-2 ${action === 'resolved' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                    onClick={() => handleActionSelect('resolved')}
                  >
                    <CheckCircle className="h-6 w-6" />
                    Yes, Resolved
                  </Button>
                  <Button
                    type="button"
                    variant={action === 'unresolved' ? 'destructive' : 'outline'}
                    className="h-20 flex-col gap-2"
                    onClick={() => handleActionSelect('unresolved')}
                  >
                    <XCircle className="h-6 w-6" />
                    No, Not Fixed
                  </Button>
                </div>
              </div>

              {/* Status Indicator */}
              {action && (
                <div className={`p-3 rounded-lg ${action === 'resolved' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <p className={`text-sm font-medium ${action === 'resolved' ? 'text-green-800' : 'text-red-800'}`}>
                    ✓ {action === 'resolved' ? 'Confirming work is completed' : 'Reporting work is not completed'} - {canSubmit ? 'Click "Confirm" below' : 'Please provide details'}
                  </p>
                </div>
              )}

              {/* Notes Field */}
              <div className="space-y-2">
                <Label htmlFor="resolution-notes">
                  Additional Notes {action === 'unresolved' && <span className="text-red-500">*</span>}
                </Label>
                <Textarea
                  id="resolution-notes"
                  placeholder={
                    action === 'resolved' 
                      ? "Optional: Any feedback about the work quality..."
                      : "Required: Please describe what issues remain..."
                  }
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  {action === 'unresolved' && <span>Minimum 10 characters required</span>}
                  <span className={`ml-auto ${resolutionNotes.length >= 10 || action === 'resolved' ? 'text-green-600 font-medium' : ''}`}>
                    {resolutionNotes.length}/500
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit || resolveMutation.isPending}
                  className={action === 'resolved' ? 'bg-green-600 hover:bg-green-700' : ''}
                  variant={action === 'unresolved' ? 'destructive' : 'default'}
                >
                  {resolveMutation.isPending ? 'Processing...' : 
                   action === 'resolved' ? 'Confirm Completed' : 'Report Issue'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  return null;
}
