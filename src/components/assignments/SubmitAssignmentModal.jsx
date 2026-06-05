import { useState } from 'react';
import { AlertTriangle, Paperclip, X } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody,
} from '@/components/ui/dialog';
import { Button }   from '@/components/ui/button';
import { Label }    from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { assignmentService } from '@/services/assignmentService';

const SubmitAssignmentModal = ({ assignment, onClose, onSuccess }) => {
  const [textResponse, setTextResponse] = useState('');
  const [file, setFile]                 = useState(null);
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState('');

  const isOverdue = new Date() > new Date(assignment.due_date);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!textResponse.trim() && !file) {
      setError('Please provide a text response or upload a file.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('assignmentId', assignment.id);
      if (textResponse.trim()) fd.append('textResponse', textResponse.trim());
      if (file)                fd.append('submissionFile', file);
      await assignmentService.submitAssignment(fd);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Submit: {assignment.title}</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Late warning */}
            {isOverdue && (
              <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>The due date has passed. This will be marked as <strong>Late</strong>.</span>
              </div>
            )}

            {/* Course / Due date info */}
            <div className="grid grid-cols-2 gap-3 rounded-md bg-muted/40 px-4 py-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Course</p>
                <p className="font-medium">{assignment.course_title}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Due Date</p>
                <p className="font-medium">
                  {new Date(assignment.due_date).toLocaleDateString('en-US', {
                    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Instructions */}
            {assignment.description && (
              <div className="rounded-md bg-muted/40 px-4 py-3 text-sm text-muted-foreground leading-relaxed">
                {assignment.description}
              </div>
            )}

            {/* Text response */}
            <div className="space-y-1.5">
              <Label htmlFor="textResponse">
                Text Response{' '}
                <span className="text-xs font-normal text-muted-foreground">(optional if uploading a file)</span>
              </Label>
              <Textarea
                id="textResponse"
                rows={5}
                placeholder="Type your answer here…"
                value={textResponse}
                onChange={(e) => setTextResponse(e.target.value)}
              />
            </div>

            {/* File upload */}
            <div className="space-y-1.5">
              <Label>
                Upload File{' '}
                <span className="text-xs font-normal text-muted-foreground">PDF, DOCX, PPTX — max 20 MB</span>
              </Label>
              <label
                htmlFor="submissionFile"
                className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-input bg-muted/30 px-4 py-3 text-sm text-muted-foreground hover:border-primary hover:bg-muted/50 transition-colors"
              >
                <Paperclip className="h-4 w-4 shrink-0" />
                {file ? (
                  <span className="font-medium text-foreground truncate">{file.name}</span>
                ) : (
                  <span>Click to choose file</span>
                )}
              </label>
              <input
                id="submissionFile"
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                className="sr-only"
                onChange={(e) => setFile(e.target.files[0] || null)}
              />
              {file && (
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="flex items-center gap-1 text-xs text-destructive hover:underline"
                >
                  <X className="h-3 w-3" /> Remove file
                </button>
              )}
            </div>

            {/* Error */}
            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="dark" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit Assignment'}
              </Button>
            </div>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitAssignmentModal;
