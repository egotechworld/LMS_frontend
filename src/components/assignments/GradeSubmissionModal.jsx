import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody,
} from '@/components/ui/dialog';
import { Button }   from '@/components/ui/button';
import { Label }    from '@/components/ui/label';
import { Input }    from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge }    from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { assignmentService } from '@/services/assignmentService';
import { getApiOrigin } from '@/lib/utils';

const GradeSubmissionModal = ({ submission, maxScore, onClose, onSuccess }) => {
  const [mark, setMark]         = useState(submission.mark ?? '');
  const [feedback, setFeedback] = useState(submission.feedback ?? '');
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsed = parseInt(mark, 10);
    if (isNaN(parsed) || parsed < 0 || parsed > maxScore) {
      setError(`Mark must be between 0 and ${maxScore}.`);
      return;
    }
    setError('');
    setSaving(true);
    try {
      await assignmentService.gradeSubmission({ submissionId: submission.id, mark: parsed, feedback: feedback.trim() });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to save grade.');
    } finally {
      setSaving(false);
    }
  };

  const apiBase = getApiOrigin();

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Grade — {submission.first_name} {submission.last_name}</DialogTitle>
        </DialogHeader>

        <DialogBody>
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 mb-4 pb-4 border-b text-sm">
            <span className="text-muted-foreground">
              Submitted: <strong className="text-foreground">
                {new Date(submission.submitted_at).toLocaleDateString()}
              </strong>
            </span>
            {submission.is_late === 1 && <Badge variant="late">Late</Badge>}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Submitted file */}
            {submission.file_url && (
              <div className="space-y-1.5">
                <Label>Submitted File</Label>
                <a
                  href={`${apiBase}${submission.file_url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {submission.file_name || 'Download File'}
                </a>
              </div>
            )}

            {/* Text response */}
            {submission.text_response && (
              <div className="space-y-1.5">
                <Label>Text Response</Label>
                <div className="rounded-md border bg-muted/30 px-3 py-2.5 text-sm leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {submission.text_response}
                </div>
              </div>
            )}

            <Separator />

            {/* Mark */}
            <div className="space-y-1.5">
              <Label htmlFor="mark">
                Mark{' '}
                <span className="text-xs font-normal text-muted-foreground">out of {maxScore}</span>
              </Label>
              <Input
                id="mark"
                type="number"
                min={0}
                max={maxScore}
                value={mark}
                onChange={(e) => setMark(e.target.value)}
                placeholder={`0 – ${maxScore}`}
                className="max-w-[140px]"
                required
              />
            </div>

            {/* Feedback */}
            <div className="space-y-1.5">
              <Label htmlFor="feedback">
                Written Feedback{' '}
                <span className="text-xs font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="feedback"
                rows={4}
                placeholder="Provide constructive feedback for the student…"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>

            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="dark" disabled={saving}>
                {saving ? 'Saving…' : 'Save Grade'}
              </Button>
            </div>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default GradeSubmissionModal;
