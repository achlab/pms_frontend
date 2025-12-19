'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, AlertTriangle, Building2, User, Calendar, Tag } from 'lucide-react';
import { MaintenanceRequest } from '@/lib/api-types';
import { useApproveRejectMaintenanceRequest } from '@/lib/hooks/use-maintenance-approval';
import { formatDate } from '@/lib/utils';

interface ApproveRejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  maintenanceRequest: MaintenanceRequest;
  onSuccess?: () => void;
}

export function ApproveRejectModal({ 
  isOpen, 
  onClose, 
  maintenanceRequest, 
  onSuccess 
}: ApproveRejectModalProps) {
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');


  const approveRejectMutation = useApproveRejectMaintenanceRequest();

  const handleClose = () => {
    console.log('🔒 Modal closing');
    setAction(null);
    setRejectionReason('');
    onClose();
  };

  const handleActionSelect = (selectedAction: 'approve' | 'reject') => {
    console.log('✅ Action selected:', selectedAction);
    setAction(selectedAction);
  };

  const handleSubmit = async () => {
    console.log('🚀 Submit button clicked', { action, rejectionReason });
    
    if (!action) {
      console.warn('⚠️ No action selected, aborting submit');
      return;
    }

    try {
      console.log('📤 Sending approval/rejection request...', {
        requestId: maintenanceRequest.id,
        action,
        rejection_reason: action === 'reject' ? rejectionReason : undefined,
      });

      const result = await approveRejectMutation.mutateAsync({
        requestId: maintenanceRequest.id,
        action,
        rejection_reason: action === 'reject' ? rejectionReason : undefined,
      });

      console.log('✅ Approval/Rejection successful:', result);
      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error('❌ Approval/Rejection failed:', error);
      // Error is handled by the mutation hook
    }
  };

  const canSubmit = action && (action === 'approve' || (action === 'reject' && rejectionReason.trim().length >= 10));


  // Temporary: Use a simple modal instead of Radix Dialog
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
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                {['approved', 'rejected'].includes(maintenanceRequest.status) 
                  ? 'Change Decision' 
                  : 'Review Maintenance Request'}
              </h2>
              <button
                onClick={handleClose}
                className="ml-auto p-1 hover:bg-gray-100 rounded"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            
            {['approved', 'rejected'].includes(maintenanceRequest.status) && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> This request is currently <span className="font-semibold">{maintenanceRequest.status}</span>. 
                  You can change this decision if needed.
                </p>
              </div>
            )}

        <div className="space-y-6">
          {/* Request Summary */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{maintenanceRequest.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{maintenanceRequest.description}</p>
              </div>
              <Badge variant={
                maintenanceRequest.priority === 'emergency' ? 'destructive' :
                maintenanceRequest.priority === 'urgent' ? 'destructive' :
                maintenanceRequest.priority === 'high' ? 'default' : 'secondary'
              }>
                {maintenanceRequest.priority}
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
                <User className="h-4 w-4 text-gray-500" />
                <span>{maintenanceRequest.tenant.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>Submitted: {formatDate(maintenanceRequest.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-500" />
                <span>{maintenanceRequest.category.name}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Decision</Label>
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant={action === 'approve' ? 'default' : 'outline'}
                className={`h-20 flex-col gap-2 ${action === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                onClick={() => handleActionSelect('approve')}
              >
                <CheckCircle className="h-6 w-6" />
                Approve Request
              </Button>
              <Button
                type="button"
                variant={action === 'reject' ? 'destructive' : 'outline'}
                className="h-20 flex-col gap-2"
                onClick={() => handleActionSelect('reject')}
              >
                <XCircle className="h-6 w-6" />
                Reject Request
              </Button>
            </div>
          </div>

          {/* Status Indicator */}
          {action && (
            <div className={`p-3 rounded-lg ${action === 'approve' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className={`text-sm font-medium ${action === 'approve' ? 'text-green-800' : 'text-red-800'}`}>
                ✓ {action === 'approve' ? 'Approval' : 'Rejection'} selected - {canSubmit ? 'Click "Confirm" below to proceed' : 'Complete required fields to proceed'}
              </p>
            </div>
          )}

          {/* Rejection Reason */}
          {action === 'reject' && (
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">
                Rejection Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="rejection-reason"
                placeholder="Please provide a clear reason for rejecting this maintenance request..."
                value={rejectionReason}
                onChange={(e) => {
                  console.log('📝 Rejection reason changed:', e.target.value.length, 'characters');
                  setRejectionReason(e.target.value);
                }}
                rows={4}
                className="resize-none"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>Minimum 10 characters required</span>
                <span className={rejectionReason.length >= 10 ? 'text-green-600 font-medium' : ''}>{rejectionReason.length}/500</span>
              </div>
            </div>
          )}

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
              onClick={(e) => {
                console.log('🖱️ Final submit button clicked', {
                  canSubmit,
                  action,
                  isPending: approveRejectMutation.isPending,
                  disabled: !canSubmit || approveRejectMutation.isPending
                });
                e.preventDefault();
                e.stopPropagation();
                handleSubmit();
              }}
              disabled={!canSubmit || approveRejectMutation.isPending}
              className={action === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
              variant={action === 'reject' ? 'destructive' : 'default'}
            >
              {approveRejectMutation.isPending ? 'Processing...' : 
               action === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
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
