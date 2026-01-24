import { useState } from 'react';
import { Flag, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCreateReport, ReportReason } from '@/hooks/useModeration';
import { useToast } from '@/hooks/use-toast';

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportType: 'tip' | 'user' | 'message';
  targetId: string;
  targetName?: string;
}

const REPORT_REASONS: { value: ReportReason; label: string; description: string }[] = [
  { value: 'spam', label: 'Spam', description: 'Promotional content or repetitive posts' },
  { value: 'inappropriate', label: 'Inappropriate Content', description: 'Offensive, violent, or adult content' },
  { value: 'harassment', label: 'Harassment', description: 'Bullying, threats, or personal attacks' },
  { value: 'misinformation', label: 'Misinformation', description: 'False or misleading information' },
  { value: 'other', label: 'Other', description: 'Other policy violation' },
];

export function ReportDialog({ open, onOpenChange, reportType, targetId, targetName }: ReportDialogProps) {
  const [reason, setReason] = useState<ReportReason | ''>('');
  const [description, setDescription] = useState('');
  const createReport = useCreateReport();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!reason) {
      toast({
        title: 'Please select a reason',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createReport.mutateAsync({
        reported_tip_id: reportType === 'tip' ? targetId : undefined,
        reported_user_id: reportType === 'user' ? targetId : undefined,
        reported_message_id: reportType === 'message' ? targetId : undefined,
        reason,
        description: description.trim() || undefined,
      });

      toast({
        title: 'Report submitted',
        description: 'Thank you for helping keep our community safe. We will review this report.',
      });

      onOpenChange(false);
      setReason('');
      setDescription('');
    } catch (error: any) {
      toast({
        title: 'Failed to submit report',
        description: error?.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getTitle = () => {
    switch (reportType) {
      case 'tip':
        return 'Report Tip';
      case 'user':
        return 'Report User';
      case 'message':
        return 'Report Message';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-destructive" />
            {getTitle()}
          </DialogTitle>
          <DialogDescription>
            {targetName && <span className="font-medium">"{targetName}"</span>}
            <br />
            Help us understand what's wrong with this content.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label>Reason for reporting</Label>
            <RadioGroup value={reason} onValueChange={(v) => setReason(v as ReportReason)}>
              {REPORT_REASONS.map((r) => (
                <div key={r.value} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value={r.value} id={r.value} className="mt-0.5" />
                  <div className="flex-1">
                    <Label htmlFor={r.value} className="font-medium cursor-pointer">
                      {r.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">{r.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional details (optional)</Label>
            <Textarea
              id="description"
              placeholder="Provide any additional context..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
            <AlertTriangle className="w-4 h-4 text-muted-foreground mt-0.5" />
            <p className="text-xs text-muted-foreground">
              False reports may result in action against your account. Only report genuine violations.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!reason || createReport.isPending}
            variant="destructive"
          >
            {createReport.isPending ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
