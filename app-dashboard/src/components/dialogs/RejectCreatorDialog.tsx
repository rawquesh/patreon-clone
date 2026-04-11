import React, { useState } from 'react';
import { DetailDialog } from './DetailDialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export interface RejectCreatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => Promise<void>;
  loading?: boolean;
}

export function RejectCreatorDialog({ open, onOpenChange, onConfirm, loading }: RejectCreatorDialogProps) {
  const [reason, setReason] = useState('');

  const handleConfirm = async () => {
    try {
      await onConfirm(reason);
      setReason('');
      onOpenChange(false);
    } catch {
      // Don't auto-close on error
    }
  };

  const handleClose = (o: boolean) => {
    if (!o && !loading) {
      setReason('');
    }
    onOpenChange(o);
  };

  return (
    <DetailDialog
      open={open}
      onOpenChange={handleClose}
      title="Reject Creator"
      description="Provide a reason for rejecting this creator application. This reason may be recorded or sent to the user."
    >
      <div className="space-y-4">
        <Textarea
          placeholder="Type reason here..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={loading}
          className="min-h-[100px] resize-none"
        />
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading || !reason.trim()}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reject Application
          </Button>
        </div>
      </div>
    </DetailDialog>
  );
}
