import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../../store/authStore';
import { assignmentService } from '../../services/assignmentService';
import { enrollmentService } from '../../services/enrollmentService';
import StatCard from '../../components/common/StatCard';
import AssignmentCard from '../../components/assignments/AssignmentCard';
import SubmitAssignmentModal from '../../components/assignments/SubmitAssignmentModal';
import SubmissionsListModal from '../../components/assignments/SubmissionsListModal';
import CreateAssignmentModal from '../../components/assignments/CreateAssignmentModal';
import './Assignments.css';

const Assignments = () => {
  const { user } = useAuthStore();
  const isStudent    = user?.role === 'student';
  const isInstructor = user?.role === 'instructor' || user?.role === 'admin';

  // ── State ──────────────────────────────────────────────────
  const [assignments, setAssignments]   = useState([]);
  const [enrollments, setEnrollments]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  // Modal states
  const [submitTarget, setSubmitTarget]   = useState(null); // assignment to submit
  const [viewTarget, setViewTarget]       = useState(null); // assignment to view subs
  const [createTarget, setCreateTarget]   = useState(null); // null=create, obj=edit
  const [showCreate, setShowCreate]       = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');

  // ── Data fetching ───────────────────────────────────────────
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (isStudent) {
        // Students: fetch enrollments, then all assignments for each course
        const enrRes  = await enrollmentService.getMyEnrollments();
        const enrList = enrRes.data || [];
        setEnrollments(enrList);

        const allAssignments = [];
        await Promise.all(
          enrList.map(async (enr) => {
            try {
              const res = await assignmentService.getAssignmentsByCourse(enr.course_id);
              const withCourse = (res.data || []).map((a) => ({
                ...a,
                course_title: enr.title || a.course_title,
              }));
              allAssignments.push(...withCourse);
            } catch { /* skip failed courses */ }
          })
        );

        // Fetch each student's own submission status
        const mySubsRes = await assignmentService.getMySubmissions();
        const mySubs    = mySubsRes.data || [];
        const subMap    = new Map(mySubs.map((s) => [s.assignment_id, s]));

        const enriched = allAssignments.map((a) => {
          const sub = subMap.get(a.id);
          return {
            ...a,
            submission_status: sub
              ? (sub.graded_at ? 'graded' : 'submitted')
              : 'not_submitted',
            submitted_at: sub?.submitted_at || null,
            is_late:      sub?.is_late      || 0,
            mark:         sub?.mark         ?? null,
            feedback:     sub?.feedback     || null,
          };
        });

        // Sort: not submitted first → due date asc, then submitted/graded
        enriched.sort((a, b) => {
          if (a.submission_status === 'not_submitted' && b.submission_status !== 'not_submitted') return -1;
          if (a.submission_status !== 'not_submitted' && b.submission_status === 'not_submitted') return 1;
          return new Date(a.due_date) - new Date(b.due_date);
        });

        setAssignments(enriched);
      } else {
        // Instructor: fetch enrollments to get course list
        const enrRes  = await enrollmentService.getMyEnrollments();
        setEnrollments(enrRes.data || []);
      }
    } catch (err) {
      console.error('Failed to load assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Instructor: fetch assignments for a selected course
  const fetchCourseAssignments = async (courseId) => {
    setLoading(true);
    try {
      const res = await assignmentService.getAssignmentsByCourse(courseId);
      setAssignments(res.data || []);
    } catch {
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Stats ───────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (isStudent) {
      return {
        total:        assignments.length,
        graded:       assignments.filter((a) => a.submission_status === 'graded').length,
        submitted:    assignments.filter((a) => a.submission_status === 'submitted').length,
        pending:      assignments.filter((a) => a.submission_status === 'not_submitted').length,
      };
    }
    return {
      total:      assignments.length,
      graded:     assignments.filter((a) => (a.submission_count || 0) > 0).length,
      submitted:  0,
      pending:    0,
    };
  }, [assignments, isStudent]);

  // ── Filtered list ───────────────────────────────────────────
  const filtered = useMemo(() => {
    if (activeFilter === 'all') return assignments;
    return assignments.filter((a) => a.submission_status === activeFilter);
  }, [assignments, activeFilter]);

  // ── Handlers ────────────────────────────────────────────────
  const handleSubmitSuccess = () => {
    setSubmitTarget(null);
    fetchData();
  };

  const handleCreateSuccess = () => {
    setShowCreate(false);
    setCreateTarget(null);
    if (selectedCourse) fetchCourseAssignments(selectedCourse);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assignment? This cannot be undone.')) return;
    try {
      await assignmentService.deleteAssignment(id);
      setAssignments((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Delete failed.');
    }
  };

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className="asgn-page">
      {/* Header */}
      <div className="asgn-page-header">
        <div>
          <h1 className="asgn-page-title">Assignments</h1>
          {isStudent && (
            <p className="asgn-page-sub">
              {assignments.length} assignment{assignments.length !== 1 ? 's' : ''} across your enrolled courses
            </p>
          )}
        </div>

        {isInstructor && (
          <div className="asgn-instructor-controls">
            <select
              className="asgn-course-select"
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                if (e.target.value) fetchCourseAssignments(e.target.value);
                else setAssignments([]);
              }}
            >
              <option value="">— Select a course —</option>
              {enrollments.map((e) => (
                <option key={e.course_id || e.id} value={e.course_id || e.id}>
                  {e.title || e.course_title}
                </option>
              ))}
            </select>
            {selectedCourse && (
              <button
                className="btn-create-asgn"
                onClick={() => { setCreateTarget(null); setShowCreate(true); }}
              >
                + New Assignment
              </button>
            )}
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="asgn-stats-row">
        <StatCard count={stats.total}    label="Total"     accent="#1a1a2e" active={activeFilter === 'all'}          />
        {isStudent ? (
          <>
            <StatCard count={stats.graded}    label="Graded"        accent="#1a7f4b" active={activeFilter === 'graded'}        />
            <StatCard count={stats.submitted} label="Submitted"     accent="#1565c0" active={activeFilter === 'submitted'}     />
            <StatCard count={stats.pending}   label="Pending"       accent="#b26a00" active={activeFilter === 'not_submitted'} />
          </>
        ) : (
          <StatCard count={stats.graded} label="With Submissions" accent="#1a7f4b" />
        )}
      </div>

      {/* Filter tabs (student only) */}
      {isStudent && (
        <div className="asgn-filter-tabs">
          {[
            { key: 'all',           label: 'All'           },
            { key: 'not_submitted', label: 'Pending'       },
            { key: 'submitted',     label: 'Submitted'     },
            { key: 'graded',        label: 'Graded'        },
          ].map((f) => (
            <button
              key={f.key}
              className={`asgn-filter-tab${activeFilter === f.key ? ' active' : ''}`}
              onClick={() => setActiveFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="asgn-loading">Loading assignments…</div>
      ) : filtered.length === 0 ? (
        <div className="asgn-empty">
          {isInstructor && !selectedCourse
            ? 'Select a course above to view its assignments.'
            : 'No assignments found.'}
        </div>
      ) : (
        <div className="asgn-list">
          {filtered.map((asgn) => (
            <div key={asgn.id} className="asgn-list-item">
              <AssignmentCard
                assignment={asgn}
                onSubmit={isStudent ? setSubmitTarget : null}
                onViewSubmissions={isInstructor ? setViewTarget : null}
              />
              {isInstructor && (
                <div className="asgn-instructor-row">
                  <button
                    className="btn-outline-xs"
                    onClick={() => { setCreateTarget(asgn); setShowCreate(true); }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-danger-xs"
                    onClick={() => handleDelete(asgn.id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Modals ── */}
      {submitTarget && (
        <SubmitAssignmentModal
          assignment={submitTarget}
          onClose={() => setSubmitTarget(null)}
          onSuccess={handleSubmitSuccess}
        />
      )}

      {viewTarget && (
        <SubmissionsListModal
          assignment={viewTarget}
          onClose={() => setViewTarget(null)}
        />
      )}

      {showCreate && (
        <CreateAssignmentModal
          assignment={createTarget}
          courseId={selectedCourse}
          onClose={() => { setShowCreate(false); setCreateTarget(null); }}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
};

export default Assignments;
