import { useState, useEffect, useMemo } from 'react';
import { Plus, BookOpen } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { assignmentService } from '@/services/assignmentService';
import { enrollmentService } from '@/services/enrollmentService';
import { courseService } from '@/services/courseService';
import { Button } from '@/components/ui/button';
import {
  Select, SelectTrigger, SelectValue,
  SelectContent, SelectItem,
} from '@/components/ui/select';
import StatCard              from '@/components/common/StatCard';
import AssignmentCard        from '@/components/assignments/AssignmentCard';
import SubmitAssignmentModal from '@/components/assignments/SubmitAssignmentModal';
import SubmissionsListModal  from '@/components/assignments/SubmissionsListModal';
import CreateAssignmentModal from '@/components/assignments/CreateAssignmentModal';

const FILTERS = [
  { key: 'all',           label: 'All'       },
  { key: 'not_submitted', label: 'Pending'   },
  { key: 'submitted',     label: 'Submitted' },
  { key: 'graded',        label: 'Graded'    },
];

const Assignments = () => {
  const { user } = useAuthStore();
  const isStudent    = user?.role === 'student';
  const isInstructor = user?.role === 'instructor' || user?.role === 'admin';

  const [assignments,    setAssignments]   = useState([]);
  const [enrollments,    setEnrollments]   = useState([]);
  const [loading,        setLoading]       = useState(true);
  const [activeFilter,   setActiveFilter]  = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('');

  const [submitTarget, setSubmitTarget] = useState(null);
  const [viewTarget,   setViewTarget]   = useState(null);
  const [editTarget,   setEditTarget]   = useState(null);  // null=create, obj=edit
  const [showCreate,   setShowCreate]   = useState(false);

  // ── Fetch ────────────────────────────────────────────────
  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (isStudent) {
        const enrRes  = await enrollmentService.getMyEnrollments();
        const enrList = enrRes.data || [];
        setEnrollments(enrList);

        const all = [];
        await Promise.all(
          enrList.map(async (enr) => {
            try {
              const res = await assignmentService.getAssignmentsByCourse(enr.course_id);
              (res.data || []).forEach((a) =>
                all.push({ ...a, course_title: enr.title || a.course_title })
              );
            } catch { /* skip */ }
          })
        );

        const mySubsRes = await assignmentService.getMySubmissions();
        const subMap    = new Map((mySubsRes.data || []).map((s) => [s.assignment_id, s]));

        const enriched = all.map((a) => {
          const sub = subMap.get(a.id);
          return {
            ...a,
            submission_status: sub ? (sub.graded_at ? 'graded' : 'submitted') : 'not_submitted',
            submitted_at: sub?.submitted_at || null,
            is_late:      sub?.is_late      || 0,
            mark:         sub?.mark         ?? null,
            feedback:     sub?.feedback     || null,
          };
        });

        enriched.sort((a, b) => {
          if (a.submission_status === 'not_submitted' && b.submission_status !== 'not_submitted') return -1;
          if (a.submission_status !== 'not_submitted' && b.submission_status === 'not_submitted') return 1;
          return new Date(a.due_date) - new Date(b.due_date);
        });

        setAssignments(enriched);
      } else if (isInstructor) {
        const cRes = await courseService.getAllCourses();
        setEnrollments(cRes.data || []);
      }
    } catch (err) {
      console.error('Failed to load assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseAssignments = async (courseId) => {
    if (!courseId) { setAssignments([]); return; }
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

  // ── Stats ────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:     assignments.length,
    graded:    assignments.filter((a) => a.submission_status === 'graded').length,
    submitted: assignments.filter((a) => a.submission_status === 'submitted').length,
    pending:   assignments.filter((a) => a.submission_status === 'not_submitted').length,
  }), [assignments]);

  const filtered = useMemo(() =>
    activeFilter === 'all'
      ? assignments
      : assignments.filter((a) => a.submission_status === activeFilter),
    [assignments, activeFilter]
  );

  // ── Handlers ─────────────────────────────────────────────
  const handleSubmitSuccess = () => { setSubmitTarget(null); fetchData(); };

  const handleCreateSuccess = () => {
    setShowCreate(false);
    setEditTarget(null);
    fetchCourseAssignments(selectedCourse);
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

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="p-8 max-w-4xl">
      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assignments</h1>
          {isStudent && (
            <p className="text-sm text-muted-foreground mt-1">
              {assignments.length} assignment{assignments.length !== 1 ? 's' : ''} across your enrolled courses
            </p>
          )}
        </div>

        {/* Instructor controls */}
        {isInstructor && (
          <div className="flex items-center gap-3 flex-wrap">
            <Select
              value={selectedCourse}
              onValueChange={(v) => {
                setSelectedCourse(v);
                fetchCourseAssignments(v);
              }}
            >
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {enrollments.map((e) => (
                  <SelectItem key={e.course_id || e.id} value={String(e.course_id || e.id)}>
                    {e.title || e.course_title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedCourse && (
              <Button
                variant="dark"
                onClick={() => { setEditTarget(null); setShowCreate(true); }}
              >
                <Plus className="w-4 h-4" /> New Assignment
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <StatCard count={stats.total}    label="Total"    accent="#1a1a2e" />
        {isStudent ? (
          <>
            <StatCard count={stats.graded}    label="Graded"        accent="#059669" active={activeFilter === 'graded'} />
            <StatCard count={stats.submitted} label="Submitted"     accent="#2563eb" active={activeFilter === 'submitted'} />
            <StatCard count={stats.pending}   label="Pending"       accent="#d97706" active={activeFilter === 'not_submitted'} />
          </>
        ) : (
          <StatCard count={assignments.filter((a) => (a.submission_count || 0) > 0).length} label="With Submissions" accent="#059669" />
        )}
      </div>

      {/* Filter tabs (student) */}
      {isStudent && (
        <div className="flex gap-1 border-b mb-5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={[
                'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeFilter === f.key
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              ].join(' ')}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Assignment list */}
      {loading ? (
        <div className="py-20 text-center text-sm text-muted-foreground">Loading assignments…</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">
            {isInstructor && !selectedCourse
              ? 'Select a course above to view its assignments.'
              : 'No assignments found.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((asgn) => (
            <div key={asgn.id}>
              <AssignmentCard
                assignment={asgn}
                onSubmit={isStudent ? setSubmitTarget : null}
                onViewSubmissions={isInstructor ? setViewTarget : null}
              />
              {/* Instructor edit/delete row */}
              {isInstructor && (
                <div className="flex gap-2 px-5 py-2 bg-muted/30 border border-t-0 rounded-b-xl border-border">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setEditTarget(asgn); setShowCreate(true); }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(asgn.id)}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
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
          assignment={editTarget}
          courseId={selectedCourse}
          onClose={() => { setShowCreate(false); setEditTarget(null); }}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
};

export default Assignments;
