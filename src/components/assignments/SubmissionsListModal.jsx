import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import GradeSubmissionModal from './GradeSubmissionModal';
import { assignmentService } from '../../services/assignmentService';
import './Assignments.css';

/**
 * Instructor modal — lists all student submissions for one assignment.
 * Allows grading inline by opening GradeSubmissionModal.
 */
const SubmissionsListModal = ({ assignment, onClose }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [grading, setGrading]         = useState(null); // submission to grade

  useEffect(() => {
    fetchSubmissions();
  }, [assignment.id]);

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

  const handleGraded = () => {
    setGrading(null);
    fetchSubmissions();
  };

  if (grading) {
    return (
      <GradeSubmissionModal
        submission={grading}
        maxScore={assignment.max_score}
        onClose={() => setGrading(null)}
        onSuccess={handleGraded}
      />
    );
  }

  return (
    <Modal
      title={`Submissions — ${assignment.title}`}
      onClose={onClose}
      size="lg"
    >
      {loading ? (
        <p className="modal-loading">Loading submissions…</p>
      ) : submissions.length === 0 ? (
        <p className="modal-empty">No submissions yet.</p>
      ) : (
        <div className="submissions-table-wrap">
          <table className="submissions-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Mark</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => {
                const status = s.graded_at ? 'graded' : s.is_late ? 'late' : 'submitted';
                return (
                  <tr key={s.id}>
                    <td>
                      <div className="sub-student-name">
                        {s.first_name} {s.last_name}
                      </div>
                      <div className="sub-student-email">{s.email}</div>
                    </td>
                    <td className="sub-date">
                      {new Date(s.submitted_at).toLocaleDateString()}
                    </td>
                    <td>
                      <StatusBadge
                        status={status}
                        label={
                          s.graded_at ? 'Graded'
                          : s.is_late ? 'Late'
                          : 'Submitted'
                        }
                      />
                    </td>
                    <td className="sub-mark">
                      {s.mark !== null && s.mark !== undefined
                        ? `${s.mark} / ${assignment.max_score}`
                        : '—'}
                    </td>
                    <td>
                      <button
                        className="btn-grade-inline"
                        onClick={() => setGrading(s)}
                      >
                        {s.graded_at ? 'Re-grade' : 'Grade'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
};

export default SubmissionsListModal;
