import { useState } from 'react';
import Modal from '../common/Modal';
import { assignmentService } from '../../services/assignmentService';
import './Assignments.css';

/**
 * Modal for instructors to grade a student submission.
 */
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
      await assignmentService.gradeSubmission({
        submissionId: submission.id,
        mark: parsed,
        feedback: feedback.trim(),
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to save grade.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={`Grade Submission — ${submission.first_name} ${submission.last_name}`}
      onClose={onClose}
      size="md"
    >
      <form onSubmit={handleSubmit} className="submit-form">
        {/* Submission info */}
        <div className="grade-meta-row">
          <span className="grade-meta-item">
            <strong>Student:</strong> {submission.first_name} {submission.last_name}
          </span>
          <span className="grade-meta-item">
            <strong>Submitted:</strong>{' '}
            {new Date(submission.submitted_at).toLocaleDateString()}
          </span>
          {submission.is_late === 1 && (
            <span className="late-chip">Late</span>
          )}
        </div>

        {/* Submitted file */}
        {submission.file_url && (
          <div className="form-group">
            <label className="form-label">Submitted File</label>
            <a
              href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${submission.file_url}`}
              target="_blank"
              rel="noreferrer"
              className="file-link"
            >
              📄 {submission.file_name || 'Download File'}
            </a>
          </div>
        )}

        {/* Text response */}
        {submission.text_response && (
          <div className="form-group">
            <label className="form-label">Text Response</label>
            <div className="text-response-box">{submission.text_response}</div>
          </div>
        )}

        {/* Mark */}
        <div className="form-group">
          <label className="form-label" htmlFor="mark">
            Mark <span className="form-optional">(out of {maxScore})</span>
          </label>
          <input
            id="mark"
            type="number"
            className="form-input"
            min={0}
            max={maxScore}
            value={mark}
            onChange={(e) => setMark(e.target.value)}
            placeholder={`0 – ${maxScore}`}
            required
          />
        </div>

        {/* Feedback */}
        <div className="form-group">
          <label className="form-label" htmlFor="feedback">
            Written Feedback <span className="form-optional">(optional)</span>
          </label>
          <textarea
            id="feedback"
            className="form-textarea"
            rows={4}
            placeholder="Provide constructive feedback for the student…"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-submit-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save Grade'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default GradeSubmissionModal;
