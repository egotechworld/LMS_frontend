import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseService } from '../../services/courseService';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'Programming',
    level: 'beginner', duration: '',
    is_free: true, price: 0, currency: 'usd', thumbnail: null
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await courseService.getAllCourses();
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
      
      if (!formData.is_free) {
        dataToSubmit.append('price', Math.round(parseFloat(formData.price) * 100));
        dataToSubmit.append('currency', formData.currency);
      } else {
        dataToSubmit.append('price', 0);
      }

      if (formData.thumbnail) {
        dataToSubmit.append('thumbnail', formData.thumbnail);
      }

      await courseService.createCourse(dataToSubmit);
      alert('Course created successfully');
      setIsCreating(false);
      fetchCourses();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create course');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Courses</h1>
        <button className="btn btn-primary" onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? 'Cancel' : 'Create New Course'}
        </button>
      </div>

      {isCreating && (
        <div className="bg-card p-6 rounded-xl border border-border mb-8 shadow-sm max-w-2xl">
          <h2 className="text-xl font-semibold mb-4">Create Course</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input className="px-3 py-2 border rounded bg-input" placeholder="Title" required
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            <textarea className="px-3 py-2 border rounded bg-input" placeholder="Description" required
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            <div className="grid grid-cols-2 gap-4">
              <select className="px-3 py-2 border rounded bg-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option value="Programming">Programming</option>
                <option value="Design">Design</option>
                <option value="Business">Business</option>
                <option value="Technology">Technology</option>
              </select>
              
              <select className="px-3 py-2 border rounded bg-input" value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <input type="number" className="px-3 py-2 border rounded bg-input" placeholder="Duration (in minutes)" required
              value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />

            <div className="flex flex-col">
              <label className="text-sm mb-1 text-muted-foreground">Course Thumbnail (Optional)</label>
              <input type="file" accept="image/*" onChange={handleFileChange} className="px-3 py-2 border rounded bg-input" />
            </div>
            
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_free" checked={formData.is_free}
                onChange={e => setFormData({...formData, is_free: e.target.checked})} />
              <label htmlFor="is_free">This course is free</label>
            </div>

            {!formData.is_free && (
              <div className="flex gap-4">
                <div className="flex flex-col flex-1">
                  <label className="text-sm mb-1 text-muted-foreground">Price (in USD)</label>
                  <input type="number" step="0.01" min="0.50" className="px-3 py-2 border rounded bg-input" required
                    value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary mt-2">Create Course</button>
          </form>
        </div>
      )}

      {loading ? <p>Loading...</p> : (
        <div className="grid grid-cols-1 gap-4">
          {courses.map(course => (
            <div key={course.id} className="bg-[hsl(224,44%,14%)] p-5 rounded-xl border border-white/10 flex justify-between items-center text-white">
              <div>
                <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
                <p className="text-sm text-white/50">{course.is_free ? 'Free' : `$${(course.price / 100).toFixed(2)}`}</p>
              </div>
              <div className="flex gap-3">
                <Link to={`/instructor/courses/${course.id}/lessons`} className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 px-4 py-2 rounded transition-colors text-sm font-medium">
                  Manage Lessons
                </Link>
                <button className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded transition-colors text-sm">
                  Edit Course
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
