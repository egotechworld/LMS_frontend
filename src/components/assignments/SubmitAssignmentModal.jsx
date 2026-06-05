import { useState } from 'react';
import Modal from '../common/Modal';
import { assignmentService } from '../../services/assignmentService';
import './Assignments.css';

/**
 * Modal for students to submit an assignment.
 * Supports file upload OR text response (or both).
 */
const SubmitAssignmentModal = ({ assignment, onClose, onSuccess }) => {
  const [textResponse, setTextResponse]   = useState('');
  const [file, setFile]                   = useState(null);
  const [submitting, setSubmitting]       = useState(false);
  const [error, setError]                 = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!textResponse.trim() && !file) {
      setError('Please provide a text response or upload a file.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('assignmentId', assignment.id);
      if (textResponse.trim()) formData.append('textResponse', textResponse.trim());
      if (file)                formData.append('submissionFile', file);

      await assignmentService.submitAssignment(formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isOverdue = new Date() > new Date(assignment.due_date);

  return (
    <Modal title={`Submit: ${assignment.title}`} onClose={onClose} size="md">
      <form onSubmit={handleSubmit} className="submit-form">

        {isOverdue && (
          <div className="submit-late-warning">
            ⚠️ The due date has passed. This submission will be marked as <strong>Late</strong>.
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Course</label>
          <p className="form-static">{assignment.course_title}</p>
        </div>

        <div className="form-group">
          <label className="form-label">Due Date</label>
          <p className="form-static">
            {new Date(assignment.due_date).toLocaleDateString('en-US', {
              weekday: 'short', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        </div>

        {assignment.description && (
          <div className="form-group">
            <label className="form-label">Instructions</label>
            <p className="form-static form-static-muted">{assignment.description}</p>
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="textResponse">
            Text Response <span className="form-optional">(optional if uploading a file)</span>
          </label>
          <textarea
            id="textResponse"
            className="form-textarea"
            rows={5}
            placeholder="Type your answer here…"
            value={textResponse}
            onChange={(e) => setTextResponse(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Upload File <span className="form-optional">(PDF, DOCX, PPTX, JPG, PNG — max 20 MB)</span>
          </label>
          <div className="file-drop-zone">
            <input
              id="submissionFile"
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
              style={{ display: 'none' }}
              onChange={(e) => setFile(e.target.files[0] || null)}
            />
            <label htmlFor="submissionFile" className="file-drop-label">
              {file ? (
                <span className="file-chosen">📄 {file.name}</span>
              ) : (
                <span>Click to choose file or drag here</span>
              )}
            </label>
            {file && (
              <button
                type="button"
                className="file-clear-btn"
                onClick={() => setFile(null)}
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-submit-primary" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit Assignment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SubmitAssignmentModal;
