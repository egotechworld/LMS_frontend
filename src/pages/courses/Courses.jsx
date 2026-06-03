import { useState, useEffect } from 'react';
import { courseService } from '../../services/courseService';
import { Link } from 'react-router-dom';
import './Courses.css';

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

  if (loading) return <div className="loading">Loading courses...</div>;

  return (
    <div className="container">
      <div className="courses-header">
        <h1>Browse Courses</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search courses..."
            value={filters.search}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="courses-grid">
        {courses.length === 0 ? (
          <p>No courses available yet.</p>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="course-card">
              <img src={course.thumbnail || '/placeholder.jpg'} alt={course.title} />
              <div className="course-card-content">
                <h3>{course.title}</h3>
                <p className="course-instructor">By {course.first_name} {course.last_name}</p>
                <p className="course-description">{course.description}</p>
                <Link to={`/courses/${course.id}`} className="btn btn-primary">
                  View Details
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Courses;
