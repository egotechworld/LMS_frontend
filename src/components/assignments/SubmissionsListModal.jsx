import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Table, TableHeader, TableBody,
  TableRow, TableHead, TableCell,
} from '@/components/ui/table';
import StatusBadge        from '@/components/common/StatusBadge';
import GradeSubmissionModal from './GradeSubmissionModal';
import { assignmentService } from '@/services/assignmentService';

const SubmissionsListModal = ({ assignment, onClose }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [grading, setGrading]         = useState(null);

  useEffect(() => { fetchSubmissions(); }, [assignment.id]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await assignmentService.getSubmissionsByAssignment(assignment.id);
      setSubmissions(res.data || []);
    } catch {
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  if (grading) {
    return (
      <GradeSubmissionModal
        submission={grading}
        maxScore={assignment.max_score}
        onClose={() => setGrading(null)}
        onSuccess={() => { setGrading(null); fetchSubmissions(); }}
      />
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Submissions — {assignment.title}</DialogTitle>
        </DialogHeader>

        <DialogBody className="px-0 py-0">
          {loading ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Loading submissions…</p>
          ) : submissions.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">No submissions yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Mark</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((s) => {
                  const status = s.graded_at ? 'graded' : s.is_late ? 'late' : 'submitted';
                  return (
                    <TableRow key={s.id}>
                      <TableCell>
                        <p className="font-medium text-sm">{s.first_name} {s.last_name}</p>
                        <p className="text-xs text-muted-foreground">{s.email}</p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(s.submitted_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={status}
                          label={s.graded_at ? 'Graded' : s.is_late ? 'Late' : 'Submitted'}
                        />
                      </TableCell>
                      <TableCell className="font-semibold text-sm">
                        {s.mark != null ? `${s.mark} / ${assignment.max_score}` : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="default" onClick={() => setGrading(s)}>
                          {s.graded_at ? 'Re-grade' : 'Grade'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default SubmissionsListModal;
