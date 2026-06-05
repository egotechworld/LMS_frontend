import { Clock, CheckCircle2, Upload } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import StatusBadge from '@/components/common/StatusBadge';

const fmt = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
    : '—';

const AssignmentCard = ({ assignment, onSubmit, onViewSubmissions }) => {
  const {
    title, course_title, due_date, max_score,
    submission_status, submitted_at, is_late,
    mark, feedback,
  } = assignment;

  const isGraded       = submission_status === 'graded';
  const isSubmitted    = submission_status === 'submitted' || isGraded;
  const isNotSubmitted = submission_status === 'not_submitted';
  const badgeStatus    = is_late && !isGraded ? 'late' : submission_status;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-[15px] text-foreground leading-snug">{title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{course_title}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge
              status={badgeStatus}
              label={is_late && !isGraded ? 'Late' : isGraded ? 'Graded' : isSubmitted ? 'Submitted' : 'Not Submitted'}
            />
            {isGraded && mark != null && (
              <span className="text-xs font-semibold text-amber-500">⭐ {mark}/{max_score}</span>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-4 my-2">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            Due: <strong className="text-foreground">{fmt(due_date)}</strong>
          </span>
          {submitted_at && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Submitted: <strong className="text-foreground">{fmt(submitted_at)}</strong>
            </span>
          )}
        </div>

        {/* Submit button */}
        {isNotSubmitted && onSubmit && (
          <div className="mt-3">
            <Button size="sm" variant="dark" onClick={() => onSubmit(assignment)}>
              <Upload className="w-3.5 h-3.5" />
              Submit Assignment
            </Button>
          </div>
        )}

        {/* Instructor: view submissions */}
        {onViewSubmissions && (
          <div className="mt-3">
            <Button size="sm" variant="outline" onClick={() => onViewSubmissions(assignment)}>
              View Submissions
            </Button>
          </div>
        )}

        {/* Instructor feedback */}
        {isGraded && feedback && (
          <>
            <Separator className="my-3" />
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-md px-4 py-3">
              <p className="text-[10px] font-bold tracking-widest text-blue-600 uppercase mb-1">
                Instructor Feedback
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">{feedback}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AssignmentCard;
