import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { assignmentService } from '../../services/assignmentService';
import { enrollmentService } from '../../services/enrollmentService';
import './Assignments.css';

/**
 * Instructor modal to create or edit an assignment.
 * Props:
 *   assignment  – existing assignment for edit mode (null = create)
 *   courseId    – pre-selected course (optional)
 *   onClose / onSuccess
 */
const CreateAssignmentModal = ({ assignment, courseId, onClose, onSuccess }) => {
  const isEdit = !!assignment;

  const [title, setTitle]         = useState(assignment?.title ?? '');
  const [description, setDesc]    = useState(assignment?.description ?? '');
  const [dueDate, setDueDate]     = useState(
    assignment?.due_date ? assignment.due_date.slice(0, 16) : ''
  );
  const [maxScore, setMaxScore]   = useState(assignment?.max_score ?? 100);
  const [file, setFile]           = useState(null);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required.'); return; }
    if (!dueDate)      { setError('Due date is required.'); return; }
    setError('');
    setSaving(true);

    try {
      const fd = new FormData();
      fd.append('title', title.trim());
      fd.append('description', description.trim());
      fd.append('dueDate', new Date(dueDate).toISOString());
      fd.append('maxScore', maxScore);
      if (!isEdit) fd.append('courseId', courseId);
      if (file)    fd.append('referenceFile', file);

      if (isEdit) {
        await assignmentService.updateAssignment(assignment.id, fd);
      } else {
        await assignmentService.createAssignment(fd);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to save assignment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={isEdit ? 'Edit Assignment' : 'Create Assignment'}
      onClose={onClose}
      size="md"
    >
      <form onSubmit={handleSubmit} className="submit-form">

        <div className="form-group">
          <label className="form-label" htmlFor="asgn-title">Title *</label>
          <input
            id="asgn-title"
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Integration Problem Set – Chapter 6"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="asgn-desc">Description / Instructions</label>
          <textarea
            id="asgn-desc"
            className="form-textarea"
            rows={4}
            value={description}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Describe the assignment requirements…"
          />
        </div>

        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label" htmlFor="asgn-due">Due Date *</label>
            <input
              id="asgn-due"
              type="datetime-local"
              className="form-input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ flex: '0 0 120px' }}>
            <label className="form-label" htmlFor="asgn-score">Max Score</label>
            <input
              id="asgn-score"
              type="number"
              className="form-input"
              min={1}
              value={maxScore}
              onChange={(e) => setMaxScore(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            Reference File <span className="form-optional">(optional — PDF, DOCX, etc.)</span>
          </label>
          <div className="file-drop-zone">
            <input
              id="refFile"
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx"
              style={{ display: 'none' }}
              onChange={(e) => setFile(e.target.files[0] || null)}
            />
            <label htmlFor="refFile" className="file-drop-label">
              {file ? (
                <span className="file-chosen">📄 {file.name}</span>
              ) : assignment?.file_name ? (
                <span className="file-chosen">📄 {assignment.file_name} (replace)</span>
              ) : (
                <span>Click to attach a reference file</span>
              )}
            </label>
            {file && (
              <button type="button" className="file-clear-btn" onClick={() => setFile(null)}>
                Remove
              </button>
            )}
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-submit-primary" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Update Assignment' : 'Create Assignment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateAssignmentModal;
