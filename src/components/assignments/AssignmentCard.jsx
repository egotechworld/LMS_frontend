import StatusBadge from '../common/StatusBadge';
import './Assignments.css';

/**
 * Single assignment row card.
 * Matches the screenshot layout:
 *   Title / course name   [status badge]
 *   due date · submitted date · score
 *   [Submit button if not submitted]
 *   [Instructor feedback block if graded]
 */
const AssignmentCard = ({ assignment, onSubmit, onViewSubmissions }) => {
  const {
    id,
    title,
    course_title,
    due_date,
    max_score,
    submission_status,  // 'not_submitted' | 'submitted' | 'graded'
    submitted_at,
    is_late,
    mark,
    feedback,
  } = assignment;

  const isGraded       = submission_status === 'graded';
  const isSubmitted    = submission_status === 'submitted' || isGraded;
  const isNotSubmitted = submission_status === 'not_submitted';
  const isLate         = !!is_late;

  const badgeStatus = isLate && !isGraded ? 'late' : submission_status;

  const fmt = (iso) =>
    iso
      ? new Date(iso).toLocaleDateString('en-US', {
          year: 'numeric', month: '2-digit', day: '2-digit',
        })
      : '—';

  return (
    <div className="asgn-card">
      {/* ── Header row ─────────────────────────────────────── */}
      <div className="asgn-card-header">
        <div className="asgn-card-left">
          <h3 className="asgn-card-title">{title}</h3>
          <span className="asgn-card-course">{course_title}</span>
        </div>
        <div className="asgn-card-badge">
          <StatusBadge
            status={badgeStatus}
            label={
              isLate && !isGraded
                ? 'Late'
                : isGraded
                ? 'Graded'
                : isSubmitted
                ? 'Submitted'
                : 'Not Submitted'
            }
          />
          {isGraded && mark !== null && mark !== undefined && (
            <span className="asgn-score">
              ⭐ {mark}/{max_score}
            </span>
          )}
        </div>
      </div>

      {/* ── Meta row ────────────────────────────────────────── */}
      <div className="asgn-card-meta">
        <span className="asgn-meta-item">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Due: <strong>{fmt(due_date)}</strong>
        </span>
        {submitted_at && (
          <span className="asgn-meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            Submitted: <strong>{fmt(submitted_at)}</strong>
          </span>
        )}
      </div>

      {/* ── Submit button ────────────────────────────────────── */}
      {isNotSubmitted && onSubmit && (
        <div className="asgn-card-actions">
          <button className="btn-submit-asgn" onClick={() => onSubmit(assignment)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
            Submit Assignment
          </button>
        </div>
      )}

      {/* ── View submissions button (instructor) ─────────────── */}
      {onViewSubmissions && (
        <div className="asgn-card-actions">
          <button
            className="btn-outline-small"
            onClick={() => onViewSubmissions(assignment)}
          >
            View Submissions
          </button>
        </div>
      )}

      {/* ── Instructor feedback ──────────────────────────────── */}
      {isGraded && feedback && (
        <div className="asgn-feedback-block">
          <p className="asgn-feedback-label">INSTRUCTOR FEEDBACK</p>
          <p className="asgn-feedback-text">{feedback}</p>
        </div>
      )}
    </div>
  );
};

export default AssignmentCard;
