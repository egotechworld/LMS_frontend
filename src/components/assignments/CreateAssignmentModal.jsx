import { useState } from 'react';
import { Paperclip, X } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody,
} from '@/components/ui/dialog';
import { Button }   from '@/components/ui/button';
import { Input }    from '@/components/ui/input';
import { Label }    from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { assignmentService } from '@/services/assignmentService';

const CreateAssignmentModal = ({ assignment, courseId, onClose, onSuccess }) => {
  const isEdit = !!assignment;

  const [title, setTitle]       = useState(assignment?.title ?? '');
  const [description, setDesc]  = useState(assignment?.description ?? '');
  const [dueDate, setDueDate]   = useState(
    assignment?.due_date ? assignment.due_date.slice(0, 16) : ''
  );
  const [maxScore, setMaxScore] = useState(assignment?.max_score ?? 100);
  const [file, setFile]         = useState(null);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required.'); return; }
    if (!dueDate)      { setError('Due date is required.'); return; }
    setError('');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title',       title.trim());
      fd.append('description', description.trim());
      fd.append('dueDate',     new Date(dueDate).toISOString());
      fd.append('maxScore',    maxScore);
      if (!isEdit) fd.append('courseId', courseId);
      if (file)    fd.append('referenceFile', file);

      isEdit
        ? await assignmentService.updateAssignment(assignment.id, fd)
        : await assignmentService.createAssignment(fd);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to save assignment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Assignment' : 'Create Assignment'}</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="asgn-title">Title *</Label>
              <Input
                id="asgn-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Integration Problem Set – Chapter 6"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="asgn-desc">Description / Instructions</Label>
              <Textarea
                id="asgn-desc"
                rows={4}
                value={description}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Describe the assignment requirements…"
              />
            </div>

            {/* Due date + max score */}
            <div className="flex gap-3">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="asgn-due">Due Date *</Label>
                <Input
                  id="asgn-due"
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
              <div className="w-28 space-y-1.5">
                <Label htmlFor="asgn-score">Max Score</Label>
                <Input
                  id="asgn-score"
                  type="number"
                  min={1}
                  value={maxScore}
                  onChange={(e) => setMaxScore(e.target.value)}
                />
              </div>
            </div>

            {/* Reference file */}
            <div className="space-y-1.5">
              <Label>
                Reference File{' '}
                <span className="text-xs font-normal text-muted-foreground">(optional)</span>
              </Label>
              <label
                htmlFor="refFile"
                className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-input bg-muted/30 px-4 py-3 text-sm text-muted-foreground hover:border-primary hover:bg-muted/50 transition-colors"
              >
                <Paperclip className="h-4 w-4 shrink-0" />
                {file ? (
                  <span className="font-medium text-foreground truncate">{file.name}</span>
                ) : assignment?.file_name ? (
                  <span className="text-foreground truncate">
                    📄 {assignment.file_name} <span className="text-muted-foreground">(click to replace)</span>
                  </span>
                ) : (
                  <span>Click to attach a reference file</span>
                )}
              </label>
              <input
                id="refFile"
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                className="sr-only"
                onChange={(e) => setFile(e.target.files[0] || null)}
              />
              {file && (
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="flex items-center gap-1 text-xs text-destructive hover:underline"
                >
                  <X className="h-3 w-3" /> Remove
                </button>
              )}
            </div>

            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="dark" disabled={saving}>
                {saving ? 'Saving…' : isEdit ? 'Update Assignment' : 'Create Assignment'}
              </Button>
            </div>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAssignmentModal;
