import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { courseService } from '../../services/courseService';
import { lessonService } from '../../services/lessonService';
import { getImageUrl } from '../../lib/utils';
import { CheckCircle, Circle, PlayCircle, FileText, ArrowLeft, Download } from 'lucide-react';
import api from '../../services/api';

const CoursePlayer = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const [courseRes, lessonsRes, progressRes] = await Promise.all([
        courseService.getCourseById(courseId),
        lessonService.getCourseLessons(courseId),
        api.get(`/progress/${courseId}`).catch(() => ({ data: { lessons: [] } }))
      ]);
      setCourse(courseRes.data);
      setLessons(lessonsRes.data);
      setProgress(progressRes.data?.lessons || []);
      
      if (lessonsRes.data.length > 0) {
        setActiveLesson(lessonsRes.data[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const isCompleted = (lessonId) => {
    const p = progress.find(p => p.id === lessonId);
    return p ? p.completed : false;
  };

  const handleMarkComplete = async (lessonId) => {
    try {
      await api.post('/progress/complete', { lessonId: lessonId });
      // Update local state
      setProgress(prev => {
        const existing = prev.find(p => p.id === lessonId);
        if (existing) {
          return prev.map(p => p.id === lessonId ? { ...p, completed: true } : p);
        }
        return [...prev, { id: lessonId, completed: true }];
      });
    } catch (error) {
      console.error('Failed to mark complete', error);
      alert('Failed to mark lesson complete');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#0b1120] text-slate-900 dark:text-white transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 dark:border-blue-500"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50 dark:bg-[#0b1120] text-slate-900 dark:text-white transition-colors duration-300">
        <h2 className="text-2xl font-bold mb-4">Course not found</h2>
        <Link to="/my-courses" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-2 font-medium">
          <ArrowLeft size={16} /> Back to My Courses
        </Link>
      </div>
    );
  }

  const totalLessons = lessons.length;
  const completedLessons = progress.filter(p => p.completed).length;
  const progressPercent = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0b1120] text-slate-900 dark:text-white overflow-hidden transition-colors duration-300">
      {/* Sidebar: Lesson List */}
      <div className="w-80 bg-white dark:bg-[hsl(224,44%,12%)] border-r border-slate-200 dark:border-white/5 flex flex-col h-full flex-shrink-0 transition-colors duration-300">
        <div className="p-5 border-b border-slate-200 dark:border-white/5">
          <Link to="/my-courses" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-2 mb-4 text-sm font-medium">
            <ArrowLeft size={16} /> Back to My Courses
          </Link>
          <h2 className="font-bold text-lg leading-tight mb-2 text-slate-900 dark:text-white">{course.title}</h2>
          
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-600 dark:text-white/50 mb-1 font-medium">
              <span>{progressPercent}% Complete</span>
              <span>{completedLessons}/{totalLessons} Lessons</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-black/40 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {lessons.length === 0 ? (
            <div className="p-5 text-slate-500 dark:text-white/40 text-sm">No lessons available yet.</div>
          ) : (
            <div className="flex flex-col">
              {lessons.map((lesson, index) => {
                const active = activeLesson?.id === lesson.id;
                const completed = isCompleted(lesson.id);
                return (
                  <button 
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    className={`flex items-start gap-3 p-4 text-left border-b border-slate-100 dark:border-white/5 transition-colors ${
                      active ? 'bg-blue-50 dark:bg-blue-600/10 border-l-4 border-l-blue-600 dark:border-l-blue-500' : 'hover:bg-slate-50 dark:hover:bg-white/5 border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {completed ? (
                        <CheckCircle size={18} className="text-green-600 dark:text-green-500" />
                      ) : (
                        <Circle size={18} className="text-slate-300 dark:text-white/20" />
                      )}
                    </div>
                    <div>
                      <div className={`font-medium text-sm ${active ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-white/80'}`}>
                        {index + 1}. {lesson.title}
                      </div>
                      <div className="flex gap-2 mt-1.5 text-slate-400 dark:text-white/40">
                        {lesson.video_url && <PlayCircle size={14} />}
                        {lesson.document_url && <FileText size={14} />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-full overflow-y-auto bg-slate-50 dark:bg-[hsl(224,44%,10%)] transition-colors duration-300">
        {activeLesson ? (
          <div className="max-w-5xl mx-auto p-8">
            {activeLesson.video_url ? (
              <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-xl dark:shadow-2xl border border-slate-200 dark:border-white/5 mb-8">
                <video 
                  controls 
                  controlsList="nodownload"
                  className="w-full h-full object-contain"
                  src={getImageUrl(activeLesson.video_url)}
                  onEnded={() => handleMarkComplete(activeLesson.id)}
                >
                  Your browser does not support HTML5 video.
                </video>
              </div>
            ) : (
              <div className="w-full aspect-video bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl flex flex-col items-center justify-center border border-slate-200 dark:border-white/5 mb-8 shadow-sm">
                <FileText size={48} className="text-blue-300 dark:text-white/20 mb-4" />
                <h3 className="text-xl font-medium text-slate-500 dark:text-white/50">Audio/Text Lesson</h3>
              </div>
            )}

            <div className="flex items-start justify-between gap-8 mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">{activeLesson.title}</h1>
                <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-white/70">
                  {activeLesson.content ? activeLesson.content.split('\n').map((p, i) => <p key={i} className="mb-2">{p}</p>) : 'No text content provided.'}
                </div>
              </div>
              
              <div className="flex-shrink-0 flex flex-col gap-3 min-w-[200px]">
                {!isCompleted(activeLesson.id) ? (
                  <button 
                    onClick={() => handleMarkComplete(activeLesson.id)}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <CheckCircle size={18} /> Mark as Complete
                  </button>
                ) : (
                  <button 
                    disabled
                    className="w-full bg-green-500/20 border border-green-500/30 text-green-400 font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} /> Completed
                  </button>
                )}

                <Link 
                  to={`/student/courses/${courseId}/lessons/${activeLesson.id}/quiz`}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  Take Lesson Quiz
                </Link>

                {activeLesson.document_url && (
                  <a 
                    href={getImageUrl(activeLesson.document_url)} 
                    target="_blank" 
                    rel="noreferrer"
                    download
                    className="w-full bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors border border-slate-200 dark:border-transparent shadow-sm"
                  >
                    <Download size={18} /> Download Notes
                  </a>
                )}
                {activeLesson.audio_url && (
                  <div className="w-full bg-white dark:bg-white/5 p-4 rounded-lg flex flex-col gap-2 border border-slate-200 dark:border-transparent shadow-sm">
                    <span className="text-sm font-medium text-slate-600 dark:text-white/60">Audio Track</span>
                    <audio controls className="w-full h-10" src={getImageUrl(activeLesson.audio_url)}></audio>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-white/40">
            <PlayCircle size={64} className="mb-4 opacity-50 text-slate-300 dark:text-white/40" />
            <h2 className="text-xl text-slate-500 dark:text-white/50">Select a lesson from the sidebar to begin</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursePlayer;
