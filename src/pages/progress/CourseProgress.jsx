import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { progressService } from '../../services/progressService';
import './Progress.css';

const CourseProgress = () => {
  const { courseId } = useParams();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProgress();
  }, [courseId]);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const data = await progressService.getCourseProgress(courseId);
      setProgress(data);
    } catch (err) {
      setError('Failed to load progress data.');
    } finally {
      setLoading(false);
    }
  };

  const getAssignmentBadge = (status) => {
    const map = {
      not_submitted: { label: 'Not Submitted', cls: 'badge-danger' },
      submitted: { label: 'Submitted', cls: 'badge-warning' },
      graded: { label: 'Graded', cls: 'badge-success' },
    };
    return map[status] || { label: status, cls: 'badge-default' };
  };

  if (loading) return <div className="loading">Loading progress...</div>;
  if (error) return <div className="container"><div className="error">{error}</div></div>;
  if (!progress) return null;

  const pct = parseFloat(progress.overallProgress);

  return (
    <div className="container progress-page">
      <div className="progress-header">
        <Link to="/my-courses" className="back-link">← Back to My Courses</Link>
        <h1>Course Progress</h1>
      </div>

      {/* Overall progress card */}
      <div className="progress-overview-card card">
        <div className="progress-stats">
          <div className="stat-item">
            <span className="stat-value" style={{ color: '#1e3a5f' }}>{pct}%</span>
            <span className="stat-label">Overall Completion</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: '#2ecc71' }}>{progress.lessonsCompleted}</span>
            <span className="stat-label">Lessons Completed</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: '#f39c12' }}>{progress.totalLessons - progress.lessonsCompleted}</span>
            <span className="stat-label">Lessons Remaining</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: '#3498db' }}>{progress.totalLessons}</span>
            <span className="stat-label">Total Lessons</span>
          </div>
        </div>
        <div className="overall-progress-bar-wrap">
          <div className="overall-progress-bar">
            <div
              className="overall-progress-fill"
              style={{ width: `${pct}%`, backgroundColor: pct >= 100 ? '#2ecc71' : '#1e3a5f' }}
            />
          </div>
          <span className="overall-progress-label">{pct}% Complete</span>
        </div>
      </div>

      <div className="progress-sections">
        {/* Lessons */}
        <div className="progress-section card">
          <h2>Lessons</h2>
          <div className="lessons-list">
            {progress.lessons.length === 0 && (
              <p className="empty-msg">No lessons in this course yet.</p>
            )}
            {progress.lessons.map((lesson, idx) => (
              <div key={lesson.id} className={`lesson-row ${lesson.completed ? 'completed' : ''}`}>
                <div className="lesson-index">{idx + 1}</div>
                <div className="lesson-info">
                  <span className="lesson-title">{lesson.title}</span>
                </div>
                <div className={`lesson-status-badge ${lesson.completed ? 'badge-success' : 'badge-pending'}`}>
                  {lesson.completed ? '✓ Completed' : 'Remaining'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assignments */}
        <div className="progress-section card">
          <h2>Assignments</h2>
          {progress.assignments.length === 0 && (
            <p className="empty-msg">No assignments in this course.</p>
          )}
          {progress.assignments.map((a) => {
            const badge = getAssignmentBadge(a.status);
            return (
              <div key={a.id} className="assignment-progress-row">
                <div className="assignment-progress-info">
                  <span className="assignment-title">{a.title}</span>
                  <span className="assignment-due">
                    Due: {new Date(a.due_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="assignment-right">
                  <span className={`badge ${badge.cls}`}>{badge.label}</span>
                  {a.status === 'graded' && (
                    <span className="grade-info">
                      {a.mark}/{a.max_score}
                      {a.feedback && <span className="feedback-tip" title={a.feedback}> 💬</span>}
                    </span>
                  )}
                  {a.is_late === 1 && <span className="late-tag">Late</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quiz Scores */}
        {progress.quizScores.length > 0 && (
          <div className="progress-section card">
            <h2>Quiz Scores</h2>
            {progress.quizScores.map((q) => (
              <div key={q.quiz_id} className="quiz-score-row">
                <div className="quiz-score-info">
                  <span className="quiz-title">{q.quiz_title}</span>
                  <span className="quiz-lesson">Lesson: {q.lesson_title}</span>
                </div>
                <div className="quiz-score-right">
                  {q.score !== null ? (
                    <>
                      <span className="quiz-score">{q.score}/{q.total_marks}</span>
                      <span className="quiz-pct">
                        ({q.total_marks > 0 ? Math.round((q.score / q.total_marks) * 100) : 0}%)
                      </span>
                    </>
                  ) : (
                    <span className="badge badge-pending">Not Attempted</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseProgress;
