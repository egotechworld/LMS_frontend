import { useState, useEffect } from 'react';
import { enrollmentService } from '../../services/enrollmentService';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../lib/utils';
import { PlayCircle, BarChart3, BookOpen } from 'lucide-react';

const MyCourses = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const response = await enrollmentService.getMyEnrollments();
      setEnrollments(response.data);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-slate-900 dark:text-white transition-colors duration-300">
      <div className="flex items-center gap-3 mb-8">
        <BookOpen className="text-blue-500" size={28} />
        <h1 className="text-3xl font-bold tracking-tight">My Learning</h1>
      </div>
      
      {enrollments.length === 0 ? (
        <div className="bg-white dark:bg-[hsl(224,44%,14%)] border border-slate-200 dark:border-white/5 rounded-2xl p-12 text-center max-w-2xl mx-auto shadow-sm dark:shadow-2xl transition-colors duration-300">
          <BookOpen className="text-slate-300 dark:text-white/20 mx-auto mb-4" size={64} />
          <h2 className="text-2xl font-semibold mb-3 text-slate-900 dark:text-white">Your learning journey starts here</h2>
          <p className="text-slate-500 dark:text-white/50 mb-8 max-w-md mx-auto">
            You haven't enrolled in any courses yet. Browse our catalog to find the perfect course for you.
          </p>
          <Link 
            to="/courses" 
            className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] hover:-translate-y-0.5"
          >
            Browse Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {enrollments.map((enrollment) => (
            <div 
              key={enrollment.id} 
              className="bg-white dark:bg-[hsl(224,44%,14%)] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-2xl hover:shadow-blue-500/5 dark:hover:shadow-blue-500/10 hover:border-blue-300 dark:hover:border-blue-500/30 transition-all duration-300 flex flex-col"
            >
              <div className="relative aspect-video group">
                {enrollment.thumbnail ? (
                  <img 
                    src={getImageUrl(enrollment.thumbnail)} 
                    alt={enrollment.title} 
                    className="w-full h-full object-cover border-b border-slate-100 dark:border-white/10 group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-purple-900/40 border-b border-slate-100 dark:border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                    <BookOpen size={48} className="text-blue-300 dark:text-white/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Link 
                    to={`/student/courses/${enrollment.course_id}/play`}
                    className="bg-blue-600 text-white rounded-full p-4 transform translate-y-4 group-hover:translate-y-0 transition-all shadow-lg hover:scale-110"
                  >
                    <PlayCircle size={24} className="ml-1" />
                  </Link>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-semibold mb-2 line-clamp-2 min-h-[3.5rem] text-slate-900 dark:text-white">
                  {enrollment.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-white/50 mb-5">
                  By {enrollment.instructor_first_name} {enrollment.instructor_last_name}
                </p>

                <div className="mt-auto">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-600 dark:text-white/70">Overall Progress</span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{enrollment.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-black/50 h-2.5 rounded-full overflow-hidden mb-6 border border-slate-200 dark:border-white/5">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000"
                      style={{ width: `${enrollment.progress}%` }}
                    ></div>
                  </div>

                  <div className="flex gap-3">
                    <Link 
                      to={`/student/courses/${enrollment.course_id}/play`} 
                      className="flex-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-600/10 dark:hover:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400 font-semibold py-2.5 px-4 rounded-xl text-center text-sm transition-all flex items-center justify-center gap-2"
                    >
                      <PlayCircle size={16} /> Continue
                    </Link>
                    <Link 
                      to={`/progress/${enrollment.course_id}`} 
                      className="flex-1 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/80 dark:hover:text-white font-medium py-2.5 px-4 rounded-xl text-center text-sm transition-all flex items-center justify-center gap-2"
                    >
                      <BarChart3 size={16} /> Track
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
