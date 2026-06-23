import { useState, useEffect } from 'react';
import { courseService } from '../../services/courseService';
import { getImageUrl } from '../../lib/utils';
import { Link } from 'react-router-dom';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', search: '' });

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getAllCourses(filters);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setFilters({ ...filters, search: e.target.value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-slate-500 dark:text-white/50">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 text-slate-900 dark:text-white transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 drop-shadow-sm">Browse Courses</h1>
        <div className="w-full md:w-96 relative">
          <input
            type="text"
            placeholder="Search courses..."
            value={filters.search}
            onChange={handleSearch}
            className="w-full px-4 py-3 bg-white dark:bg-[hsl(224,44%,14%)] border border-slate-200 dark:border-white/10 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
          />
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[hsl(224,44%,14%)] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
          <p className="text-lg text-slate-500 dark:text-white/50">No courses available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => (
            <div 
              key={course.id} 
              className="flex flex-col bg-white dark:bg-[hsl(224,44%,14%)] rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-white/5">
                <img 
                  src={getImageUrl(course.thumbnail)} 
                  alt={course.title} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  onError={(e) => { e.target.src = 'https://placehold.co/600x400/222/555?text=Course'; }}
                />
                <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/60 backdrop-blur text-slate-900 dark:text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                  {course.is_free ? 'Free' : `$${(course.price / 100).toFixed(2)}`}
                </div>
              </div>
              
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-lg font-bold mb-2 line-clamp-2 leading-tight">{course.title}</h3>
                <p className="text-sm text-slate-500 dark:text-white/50 mb-3">
                  By {course.first_name} {course.last_name}
                </p>
                <p className="text-sm text-slate-600 dark:text-white/70 line-clamp-3 mb-6 flex-grow">
                  {course.description}
                </p>
                
                <Link 
                  to={`/courses/${course.id}`} 
                  className="block w-full text-center py-2.5 px-4 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white dark:bg-blue-600/10 dark:hover:bg-blue-600/30 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-500/20 rounded-xl font-medium transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;
