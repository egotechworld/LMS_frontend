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
        api.get(`/progress/course/${courseId}`).catch(() => ({ data: [] })) // Fallback if progress API isn't there yet
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

  if (loading) return <div className="text-white p-8">Loading course content...</div>;
  if (!course) return <div className="text-white p-8">Course not found</div>;

  const totalLessons = lessons.length;
  const completedLessons = progress.filter(p => p.completed).length;
  const progressPercent = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

  return (
    <div className="flex h-screen bg-[#0b1120] text-white overflow-hidden">
      {/* Sidebar: Lesson List */}
      <div className="w-80 bg-[hsl(224,44%,12%)] border-r border-white/5 flex flex-col h-full flex-shrink-0">
        <div className="p-5 border-b border-white/5">
          <Link to="/my-courses" className="text-blue-400 hover:text-blue-300 flex items-center gap-2 mb-4 text-sm">
            <ArrowLeft size={16} /> Back to My Courses
          </Link>
          <h2 className="font-bold text-lg leading-tight mb-2">{course.title}</h2>
          
          <div className="mt-4">
            <div className="flex justify-between text-xs text-white/50 mb-1">
              <span>{progressPercent}% Complete</span>
              <span>{completedLessons}/{totalLessons} Lessons</span>
            </div>
            <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {lessons.length === 0 ? (
            <div className="p-5 text-white/40 text-sm">No lessons available yet.</div>
          ) : (
            <div className="flex flex-col">
              {lessons.map((lesson, index) => {
                const active = activeLesson?.id === lesson.id;
                const completed = isCompleted(lesson.id);
                return (
                  <button 
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    className={`flex items-start gap-3 p-4 text-left border-b border-white/5 transition-colors ${
                      active ? 'bg-blue-600/10 border-l-4 border-l-blue-500' : 'hover:bg-white/5 border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {completed ? (
                        <CheckCircle size={18} className="text-green-500" />
                      ) : (
                        <Circle size={18} className="text-white/20" />
                      )}
                    </div>
                    <div>
                      <div className={`font-medium text-sm ${active ? 'text-blue-400' : 'text-white/80'}`}>
                        {index + 1}. {lesson.title}
                      </div>
                      <div className="flex gap-2 mt-1.5 text-white/40">
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
      <div className="flex-1 h-full overflow-y-auto bg-[hsl(224,44%,10%)]">
        {activeLesson ? (
          <div className="max-w-5xl mx-auto p-8">
            {activeLesson.video_url ? (
              <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/5 mb-8">
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
              <div className="w-full aspect-video bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-xl flex flex-col items-center justify-center border border-white/5 mb-8">
                <FileText size={48} className="text-white/20 mb-4" />
                <h3 className="text-xl font-medium text-white/50">Audio/Text Lesson</h3>
              </div>
            )}

            <div className="flex items-start justify-between gap-8 mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-4">{activeLesson.title}</h1>
                <div className="prose prose-invert max-w-none text-white/70">
                  {activeLesson.content ? activeLesson.content.split('\\n').map((p, i) => <p key={i} className="mb-2">{p}</p>) : 'No text content provided.'}
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

                {activeLesson.document_url && (
                  <a 
                    href={getImageUrl(activeLesson.document_url)} 
                    target="_blank" 
                    rel="noreferrer"
                    download
                    className="w-full bg-white/5 hover:bg-white/10 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download size={18} /> Download Notes
                  </a>
                )}
                {activeLesson.audio_url && (
                  <div className="w-full bg-white/5 p-4 rounded-lg flex flex-col gap-2">
                    <span className="text-sm font-medium text-white/60">Audio Track</span>
                    <audio controls className="w-full h-10" src={getImageUrl(activeLesson.audio_url)}></audio>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-white/40">
            <PlayCircle size={64} className="mb-4 opacity-50" />
            <h2 className="text-xl">Select a lesson from the sidebar to begin</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursePlayer;
