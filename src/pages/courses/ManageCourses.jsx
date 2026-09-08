import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseService } from '../../services/courseService';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'Programming',
    level: 'beginner', duration: '',
    is_free: true, price: 0, currency: 'usd', status: 'draft', thumbnail: null
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await courseService.getAllCourses({ scope: 'mine' });
      setCourses(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, thumbnail: e.target.files[0] });
    }
  };

  const openCreateForm = () => {
    setEditingCourse(null);
    setFormData({
      title: '', description: '', category: 'Programming',
      level: 'beginner', duration: '',
      is_free: true, price: 0, currency: 'usd', status: 'draft', thumbnail: null
    });
    setIsCreating(true);
  };

  const openEditForm = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      category: course.category || 'Programming',
      level: course.level || 'beginner',
      duration: course.duration || '',
      is_free: course.is_free,
      price: course.price ? (course.price / 100).toFixed(2) : 0,
      currency: course.currency || 'usd',
      status: course.status || 'draft',
      thumbnail: null
    });
    setIsCreating(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await courseService.deleteCourse(id);
        alert('Course deleted successfully');
        fetchCourses();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete course');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = new FormData();
      dataToSubmit.append('title', formData.title);
      dataToSubmit.append('description', formData.description);
      dataToSubmit.append('category', formData.category);
      dataToSubmit.append('level', formData.level);
      dataToSubmit.append('duration', formData.duration || 0);
      dataToSubmit.append('is_free', formData.is_free);
      dataToSubmit.append('status', formData.status);
      
      if (!formData.is_free) {
        dataToSubmit.append('price', Math.round(parseFloat(formData.price) * 100));
        dataToSubmit.append('currency', formData.currency);
      } else {
        dataToSubmit.append('price', 0);
      }

      if (formData.thumbnail) {
        dataToSubmit.append('thumbnail', formData.thumbnail);
      }

      if (editingCourse) {
        const updateData = {};
        updateData.title = formData.title;
        updateData.description = formData.description;
        updateData.category = formData.category;
        updateData.level = formData.level;
        updateData.duration = formData.duration || 0;
        updateData.is_free = formData.is_free;
        updateData.status = formData.status;
        if (!formData.is_free) {
          updateData.price = Math.round(parseFloat(formData.price) * 100);
          updateData.currency = formData.currency;
        } else {
          updateData.price = 0;
        }
        await courseService.updateCourse(editingCourse.id, updateData);
        alert('Course updated successfully');
      } else {
        await courseService.createCourse(dataToSubmit);
        alert('Course created successfully');
      }
      setIsCreating(false);
      setEditingCourse(null);
      fetchCourses();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save course');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 text-slate-900 dark:text-white transition-colors duration-300">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Courses</h1>
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-medium shadow-md transition-all" onClick={() => isCreating ? setIsCreating(false) : openCreateForm()}>
          {isCreating ? 'Cancel' : 'Create New Course'}
        </button>
      </div>

      {isCreating && (
        <div className="bg-white dark:bg-[hsl(224,44%,14%)] p-6 rounded-xl border border-slate-200 dark:border-white/10 mb-8 shadow-sm max-w-2xl transition-colors duration-300">
          <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">{editingCourse ? 'Edit Course' : 'Create Course'}</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input className="px-3 py-2 border border-slate-300 dark:border-white/10 rounded bg-transparent text-slate-900 dark:text-white" placeholder="Title" required
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            <textarea className="px-3 py-2 border border-slate-300 dark:border-white/10 rounded bg-transparent text-slate-900 dark:text-white" placeholder="Description" required
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            <div className="grid grid-cols-2 gap-4">
              <select className="px-3 py-2 border border-slate-300 dark:border-white/10 rounded bg-white dark:bg-[hsl(224,44%,12%)] text-slate-900 dark:text-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option value="Programming">Programming</option>
                <option value="Design">Design</option>
                <option value="Business">Business</option>
                <option value="Technology">Technology</option>
              </select>
              
              <select className="px-3 py-2 border border-slate-300 dark:border-white/10 rounded bg-white dark:bg-[hsl(224,44%,12%)] text-slate-900 dark:text-white" value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <input type="number" className="px-3 py-2 border border-slate-300 dark:border-white/10 rounded bg-transparent text-slate-900 dark:text-white" placeholder="Duration (in minutes)" required
              value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />

            <div className="flex flex-col">
              <label htmlFor="course-status" className="text-sm mb-1 text-slate-600 dark:text-white/70">Publishing status</label>
              <select id="course-status" className="px-3 py-2 border border-slate-300 dark:border-white/10 rounded bg-white dark:bg-[hsl(224,44%,12%)]" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm mb-1 text-slate-600 dark:text-white/70">Course Thumbnail (Optional)</label>
              <input type="file" accept="image/*" onChange={handleFileChange} className="px-3 py-2 border border-slate-300 dark:border-white/10 rounded bg-transparent text-slate-600 dark:text-white/70" />
            </div>
            
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_free" checked={formData.is_free}
                onChange={e => setFormData({...formData, is_free: e.target.checked})} className="w-4 h-4 accent-blue-600" />
              <label htmlFor="is_free" className="text-slate-800 dark:text-white">This course is free</label>
            </div>

            {!formData.is_free && (
              <div className="flex gap-4">
                <div className="flex flex-col flex-1">
                  <label className="text-sm mb-1 text-slate-600 dark:text-white/70">Price (in USD)</label>
                  <input type="number" step="0.01" min="0.50" className="px-3 py-2 border border-slate-300 dark:border-white/10 rounded bg-transparent text-slate-900 dark:text-white" required
                    value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
              </div>
            )}

            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-medium shadow-md transition-all mt-2">{editingCourse ? 'Update Course' : 'Create Course'}</button>
          </form>
        </div>
      )}

      {loading ? <p className="text-slate-500 dark:text-white/50">Loading...</p> : (
        <div className="grid grid-cols-1 gap-4">
          {courses.map(course => (
            <div key={course.id} className="bg-white dark:bg-[hsl(224,44%,14%)] p-5 rounded-xl border border-slate-200 dark:border-white/10 flex justify-between items-center text-slate-900 dark:text-white shadow-sm transition-colors duration-300">
              <div>
                <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
                <p className="text-sm text-slate-500 dark:text-white/50">{course.is_free ? 'Free' : `$${(course.price / 100).toFixed(2)}`}</p>
              </div>
              <div className="flex gap-3">
                <Link to={`/instructor/courses/${course.id}/lessons`} className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-600/20 dark:hover:bg-blue-600/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 px-4 py-2 rounded transition-colors text-sm font-medium">
                  Manage Lessons
                </Link>
                <button onClick={() => openEditForm(course)} className="bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white px-4 py-2 rounded transition-colors text-sm font-medium border border-slate-200 dark:border-transparent">
                  Edit Course
                </button>
                <button onClick={() => handleDelete(course.id)} className="bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 px-4 py-2 rounded transition-colors text-sm font-medium border border-red-200 dark:border-transparent">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageCourses;
