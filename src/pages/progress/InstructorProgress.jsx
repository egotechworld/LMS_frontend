import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { progressService } from '../../services/progressService';
import './Progress.css';

const InstructorProgress = () => {
  const { courseId } = useParams();
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudents();
  }, [courseId]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      students.filter(
        (s) =>
          s.first_name.toLowerCase().includes(q) ||
          s.last_name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
      )
    );
  }, [search, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await progressService.getStudentProgressByCourse(courseId);
      setStudents(data);
      setFiltered(data);
    } catch (err) {
      setError('Failed to load student progress.');
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (pct) => {
    if (pct >= 80) return '#2ecc71';
    if (pct >= 40) return '#f39c12';
    return '#e74c3c';
  };

  const initials = (s) =>
    `${s.first_name[0] || ''}${s.last_name[0] || ''}`.toUpperCase();

  if (loading) return <div className="loading">Loading student progress...</div>;
  if (error) return <div className="container"><div className="error">{error}</div></div>;

  const avgProgress =
    students.length > 0
      ? (students.reduce((sum, s) => sum + parseFloat(s.progress_pct || 0), 0) / students.length).toFixed(1)
      : 0;

  const completed = students.filter((s) => parseFloat(s.progress_pct) >= 100).length;

  return (
    <div className="container progress-page">
      <div className="progress-header">
        <Link to="/instructor/progress" className="back-link">← Back to Track Student Progress</Link>
        <h1>Student Progress</h1>
        <p className="progress-subtitle">{students.length} students enrolled in this course</p>
      </div>

      {/* Summary stats */}
      <div className="progress-overview-card card">
        <div className="progress-stats">
          <div className="stat-item">
            <span className="stat-value" style={{ color: '#1e3a5f' }}>{students.length}</span>
            <span className="stat-label">Total Students</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: '#2ecc71' }}>{completed}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: '#f39c12' }}>{avgProgress}%</span>
            <span className="stat-label">Avg Progress</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: '#e74c3c' }}>{students.length - completed}</span>
            <span className="stat-label">In Progress</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="search-bar-wrap">
        <input
          type="text"
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Students table */}
      <div className="card">
        <table className="students-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Email</th>
              <th>Lessons Completed</th>
              <th>Progress</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="empty-msg">No students found.</td>
              </tr>
            )}
            {filtered.map((s) => {
              const pct = parseFloat(s.progress_pct || 0);
              const color = getProgressColor(pct);
              return (
                <tr key={s.student_id}>
                  <td>
                    <div className="student-name-cell">
                      <div className="student-avatar" style={{ backgroundColor: color }}>
                        {initials(s)}
                      </div>
                      <span>{s.first_name} {s.last_name}</span>
                    </div>
                  </td>
                  <td className="email-cell">{s.email}</td>
                  <td className="center-cell">{s.lessons_completed}/{s.total_lessons}</td>
                  <td className="progress-cell">
                    <div className="table-progress-bar">
                      <div
                        className="table-progress-fill"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                    <span className="table-progress-pct">{pct}%</span>
                  </td>
                  <td>
                    <span className={`badge ${s.status === 'completed' ? 'badge-success' : s.status === 'dropped' ? 'badge-danger' : 'badge-warning'}`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InstructorProgress;
