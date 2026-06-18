import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { progressService } from '../../services/progressService';
import './InstructorProgressOverview.css';

const getProgressColor = (pct) => {
  if (pct >= 80) return '#2ecc71';
  if (pct >= 40) return '#f59e0b';
  return '#ef4444';
};

/* SVG Donut chart */
const DonutChart = ({ pct, color, size = 80 }) => {
  const r = 30;
  const circ = 2 * Math.PI * r;
  const fill = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <circle cx="40" cy="40" r={r} fill="none" stroke="#e9ecef" strokeWidth="10" />
      <circle
        cx="40" cy="40" r={r} fill="none"
        stroke={color} strokeWidth="10"
        strokeDasharray={`${fill} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 40 40)"
        style={{ transition: 'stroke-dasharray 0.5s ease' }}
      />
      <text x="40" y="44" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1e3a5f">
        {pct}%
      </text>
    </svg>
  );
};

/* Horizontal stacked bar showing completed / in-progress / not-started */
const DistributionBar = ({ completed, inProgress, total }) => {
  if (total === 0) return <p className="no-data-txt">No students enrolled</p>;
  const notStarted = total - completed - inProgress;
  const pctComp = ((completed / total) * 100).toFixed(1);
  const pctProg = ((inProgress / total) * 100).toFixed(1);
  const pctNone = ((notStarted / total) * 100).toFixed(1);
  return (
    <div className="dist-bar-wrap">
      <div className="dist-bar">
        {completed > 0 && <div className="dist-seg seg-green" style={{ width: `${pctComp}%` }} title={`Completed: ${completed}`} />}
        {inProgress > 0 && <div className="dist-seg seg-blue"  style={{ width: `${pctProg}%` }} title={`In Progress: ${inProgress}`} />}
        {notStarted > 0 && <div className="dist-seg seg-grey"  style={{ width: `${pctNone}%` }} title={`Not Started: ${notStarted}`} />}
      </div>
      <div className="dist-legend">
        <span className="legend-dot dot-green" /> <span>{completed} Completed</span>
        <span className="legend-dot dot-blue"  /> <span>{inProgress} In Progress</span>
        <span className="legend-dot dot-grey"  /> <span>{notStarted} Not Started</span>
      </div>
    </div>
  );
};

/* Overall platform donut — all courses combined */
const OverallDonut = ({ avgAll, totalEnrollments, totalCompleted }) => {
  const pct = parseFloat(avgAll);
  const color = getProgressColor(pct);
  return (
    <div className="overall-donut-card card">
      <h3 className="chart-title">Overall Platform Progress</h3>
      <div className="overall-donut-body">
        <DonutChart pct={pct} color={color} size={130} />
        <div className="overall-donut-info">
          <div className="donut-info-row">
            <span className="donut-info-dot" style={{ background: '#2ecc71' }} />
            <span className="donut-info-label">Completed</span>
            <span className="donut-info-val">{totalCompleted}</span>
          </div>
          <div className="donut-info-row">
            <span className="donut-info-dot" style={{ background: '#3b82f6' }} />
            <span className="donut-info-label">Enrolled</span>
            <span className="donut-info-val">{totalEnrollments}</span>
          </div>
          <div className="donut-info-row">
            <span className="donut-info-dot" style={{ background: color }} />
            <span className="donut-info-label">Avg Progress</span>
            <span className="donut-info-val">{avgAll}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Per-course progress bar chart */
const CourseBarChart = ({ courses, analytics }) => {
  if (courses.length === 0) return null;
  const max = Math.max(...courses.map(c => parseFloat(analytics[c.id]?.avg || 0)), 1);
  return (
    <div className="bar-chart-card card">
      <h3 className="chart-title">Avg Progress per Course</h3>
      <div className="bar-chart-body">
        {courses.map((c) => {
          const avg = parseFloat(analytics[c.id]?.avg || 0);
          const color = getProgressColor(avg);
          const barH = Math.max((avg / max) * 140, 4);
          return (
            <div key={c.id} className="bar-col">
              <span className="bar-val" style={{ color }}>{avg}%</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ height: barH, backgroundColor: color }} />
              </div>
              <span className="bar-label">{c.title.length > 12 ? c.title.slice(0, 12) + '…' : c.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const InstructorProgressOverview = () => {
  const [courses, setCourses] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/instructor');
      const { courses: courseList } = res.data.data;
      setCourses(courseList);

      const map = {};
      await Promise.all(
        courseList.map(async (c) => {
          try {
            const students = await progressService.getStudentProgressByCourse(c.id);
            const avg = students.length
              ? (students.reduce((s, st) => s + parseFloat(st.progress_pct || 0), 0) / students.length).toFixed(1)
              : '0.0';
            const completed  = students.filter(s => parseFloat(s.progress_pct) >= 100).length;
            const inProgress = students.filter(s => { const p = parseFloat(s.progress_pct); return p > 0 && p < 100; }).length;
            map[c.id] = { students, avg, completed, inProgress };
          } catch {
            map[c.id] = { students: [], avg: '0.0', completed: 0, inProgress: 0 };
          }
        })
      );
      setAnalytics(map);
    } catch {
      setError('Failed to load progress overview.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading progress overview...</div>;
  if (error)   return <div className="container"><div className="error">{error}</div></div>;

  const totalEnrollments = courses.reduce((s, c) => s + (c.total_enrollments || 0), 0);
  const totalCompleted   = Object.values(analytics).reduce((s, a) => s + a.completed, 0);
  const avgAll = Object.values(analytics).length
    ? (Object.values(analytics).reduce((s, a) => s + parseFloat(a.avg), 0) / Object.values(analytics).length).toFixed(1)
    : '0.0';

  return (
    <div className="overview-page">
      <div className="overview-header">
        <h1>Track Student Progress</h1>
        <p>Analytics and progress overview for all your courses</p>
      </div>

      {/* Top stats */}
      <div className="overview-stats-row">
        <div className="overview-stat-card">
          <div className="overview-stat-icon icon-blue">📚</div>
          <div className="overview-stat-info">
            <span className="overview-stat-value">{courses.length}</span>
            <span className="overview-stat-label">Total Courses</span>
          </div>
        </div>
        <div className="overview-stat-card">
          <div className="overview-stat-icon icon-purple">👥</div>
          <div className="overview-stat-info">
            <span className="overview-stat-value">{totalEnrollments}</span>
            <span className="overview-stat-label">Total Enrollments</span>
          </div>
        </div>
        <div className="overview-stat-card">
          <div className="overview-stat-icon icon-green">📈</div>
          <div className="overview-stat-info">
            <span className="overview-stat-value">{avgAll}%</span>
            <span className="overview-stat-label">Avg Progress</span>
          </div>
        </div>
        <div className="overview-stat-card">
          <div className="overview-stat-icon icon-orange">🏆</div>
          <div className="overview-stat-info">
            <span className="overview-stat-value">{totalCompleted}</span>
            <span className="overview-stat-label">Students Completed</span>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="charts-row">
        <OverallDonut avgAll={avgAll} totalEnrollments={totalEnrollments} totalCompleted={totalCompleted} />
        <CourseBarChart courses={courses} analytics={analytics} />
      </div>

      {/* Course cards */}
      {courses.length === 0 && (
        <div className="course-analytics-card">
          <p className="empty-courses">No courses yet. Create a course to start tracking progress.</p>
        </div>
      )}

      {courses.map((course) => {
        const a = analytics[course.id] || { students: [], avg: '0.0', completed: 0, inProgress: 0 };
        const avgPct  = parseFloat(a.avg);
        const avgColor = getProgressColor(avgPct);

        return (
          <div key={course.id} className="course-analytics-card">
            <div className="course-card-header">
              <div className="course-card-title-row">
                <h2>{course.title}</h2>
                <span className={course.status === 'published' ? 'badge-published' : 'badge-draft'}>
                  {course.status}
                </span>
              </div>
              <button className="btn-students-progress" onClick={() => navigate(`/instructor/progress/${course.id}`)}>
                👥 Student Progress
              </button>
            </div>

            {/* Mini stats + donut side by side */}
            <div className="course-card-body">
              <div className="course-mini-analytics">
                <div className="mini-analytics-item">
                  <span className="mini-analytics-value" style={{ color: '#3b82f6' }}>{course.total_enrollments}</span>
                  <span className="mini-analytics-label">Enrolled</span>
                </div>
                <div className="mini-analytics-item">
                  <span className="mini-analytics-value" style={{ color: avgColor }}>{a.avg}%</span>
                  <span className="mini-analytics-label">Avg Progress</span>
                </div>
                <div className="mini-analytics-item">
                  <span className="mini-analytics-value" style={{ color: '#2ecc71' }}>{a.completed}</span>
                  <span className="mini-analytics-label">Completed</span>
                </div>
                <div className="mini-analytics-item">
                  <span className="mini-analytics-value" style={{ color: '#ef4444' }}>{course.total_enrollments - a.completed}</span>
                  <span className="mini-analytics-label">In Progress</span>
                </div>
              </div>
              <DonutChart pct={avgPct} color={avgColor} size={80} />
            </div>

            {/* Distribution bar */}
            <DistributionBar
              completed={a.completed}
              inProgress={a.inProgress}
              total={course.total_enrollments}
            />

            {/* Student preview */}
            {a.students.length > 0 && (
              <div className="students-preview-section">
                <p className="preview-section-title">Students</p>
                {a.students.slice(0, 3).map((s) => {
                  const pct   = parseFloat(s.progress_pct || 0);
                  const color = getProgressColor(pct);
                  const ini   = `${s.first_name?.[0] || ''}${s.last_name?.[0] || ''}`.toUpperCase();
                  return (
                    <div key={s.student_id} className="preview-student-item">
                      <div className="preview-avatar" style={{ backgroundColor: color, width: 32, height: 32, fontSize: 11 }}>{ini}</div>
                      <span className="preview-student-name">{s.first_name} {s.last_name}</span>
                      <div className="preview-bar-wrap">
                        <div className="preview-bar">
                          <div className="preview-bar-fill" style={{ width: `${pct}%`, backgroundColor: color }} />
                        </div>
                        <span className="preview-pct">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
                {a.students.length > 3 && (
                  <button className="view-all-students-btn" onClick={() => navigate(`/instructor/progress/${course.id}`)}>
                    View all {a.students.length} students →
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default InstructorProgressOverview;
