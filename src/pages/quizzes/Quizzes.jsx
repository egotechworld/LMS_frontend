import { useState, useEffect, useMemo } from 'react';
import { Plus, BrainCircuit } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { quizService } from '@/services/quizService';
import { enrollmentService } from '@/services/enrollmentService';
import { courseService } from '@/services/courseService';
import CreateQuizModal from './CreateQuizModal';

const Quizzes = () => {
  const { user } = useAuthStore();
  const isStudent = user?.role === 'student';
  const isInstructor = user?.role === 'instructor' || user?.role === 'admin';

  const [quizzes, setQuizzes] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (isStudent) {
        const enrRes = await enrollmentService.getMyEnrollments();
        const enrList = enrRes.data || [];
        setEnrollments(enrList);

        const all = [];
        await Promise.all(
          enrList.map(async (enr) => {
            try {
              const res = await quizService.getQuizzesByCourse(enr.course_id);
              (res.data || []).forEach((q) =>
                all.push({ ...q, course_title: enr.title || q.course_title })
              );
            } catch { /* skip */ }
          })
        );
        setQuizzes(all);
      } else if (isInstructor) {
        const cRes = await courseService.getAllCourses();
        setEnrollments(cRes.data || []);
      }
    } catch (err) {
      console.error('Failed to load quizzes:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseQuizzes = async (courseId) => {
    if (!courseId) { setQuizzes([]); return; }
    setLoading(true);
    try {
      const res = await quizService.getQuizzesByCourse(courseId);
      setQuizzes(res.data || []);
    } catch {
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl text-slate-900 dark:text-white transition-colors duration-300">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Quizzes</h1>
          {isStudent && (
            <p className="text-sm text-slate-500 dark:text-white/50 mt-1">
              {quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''} across your enrolled courses
            </p>
          )}
        </div>

        {isInstructor && (
          <div className="flex items-center gap-3 flex-wrap">
            <select
              className="px-4 py-2 border border-slate-300 dark:border-white/10 rounded-lg bg-white dark:bg-[hsl(224,44%,12%)] outline-none focus:border-blue-500 w-56"
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                fetchCourseQuizzes(e.target.value);
              }}
            >
              <option value="">Select a course</option>
              {enrollments.map((e) => (
                <option key={e.course_id || e.id} value={String(e.course_id || e.id)}>
                  {e.title || e.course_title}
                </option>
              ))}
            </select>

            {selectedCourse && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-sm font-medium"
              >
                <Plus size={16} /> New Quiz
              </button>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-slate-500 dark:text-white/50">Loading quizzes...</div>
      ) : quizzes.length === 0 ? (
        <div className="py-20 text-center border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-[hsl(224,44%,14%)]">
          <BrainCircuit className="mx-auto h-12 w-12 text-slate-300 dark:text-white/20 mb-3" />
          <p className="text-sm text-slate-500 dark:text-white/50">
            {isInstructor && !selectedCourse
              ? 'Select a course above to view its quizzes.'
              : 'No quizzes found.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white dark:bg-[hsl(224,44%,14%)] border border-slate-200 dark:border-white/10 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{quiz.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-white/50">{quiz.course_title}</p>
                </div>
                <span className="bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 text-xs px-3 py-1 rounded-full font-medium">
                  {quiz.passing_score}% to pass
                </span>
              </div>
              <p className="mt-3 text-slate-700 dark:text-white/80 text-sm line-clamp-2">{quiz.description}</p>
              
              <div className="mt-5 flex gap-3">
                {isStudent ? (
                  <button className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-600/10 dark:hover:bg-blue-600/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 px-4 py-2 rounded-lg font-medium text-sm transition-colors">
                    Start Quiz
                  </button>
                ) : (
                  <>
                    <button className="bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors">
                      Edit
                    </button>
                    <button className="bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg font-medium text-sm transition-colors">
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateQuizModal 
          courseId={selectedCourse}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchCourseQuizzes(selectedCourse);
          }}
        />
      )}
    </div>
  );
};

export default Quizzes;
