import { useState, useEffect } from 'react';
import { courseService } from '../../services/courseService';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'Programming',
    is_free: true, price: 0, currency: 'usd'
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = { ...formData };
      if (dataToSubmit.is_free) dataToSubmit.price = 0;
      else dataToSubmit.price = Math.round(parseFloat(dataToSubmit.price) * 100); // convert dollars to cents

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
            <select className="px-3 py-2 border rounded bg-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              <option value="Programming">Programming</option>
              <option value="Design">Design</option>
              <option value="Business">Business</option>
            </select>
            
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
            <div key={course.id} className="bg-card p-4 rounded-xl border border-border flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{course.title}</h3>
                <p className="text-sm text-muted-foreground">{course.is_free ? 'Free' : `$${(course.price / 100).toFixed(2)}`}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageCourses;
