import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { courseService } from '../../services/courseService';
import { enrollmentService } from '../../services/enrollmentService';
import { useAuthStore } from '../../store/authStore';
import './Courses.css';

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const response = await courseService.getCourseById(id);
      setCourse(response.data);
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      await enrollmentService.enrollInCourse(id);
      alert('Enrolled successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <div className="loading">Loading course details...</div>;
  if (!course) return <div>Course not found</div>;

  return (
    <div className="container">
      <div className="course-detail">
        <div className="course-header">
          <h1>{course.title}</h1>
          <p className="course-instructor">
            Instructor: {course.first_name} {course.last_name}
          </p>
        </div>

        <div className="course-content">
          <div className="course-main">
            <img src={course.thumbnail || '/placeholder.jpg'} alt={course.title} />
            <h3>About This Course</h3>
            <p>{course.description}</p>
            
            <div className="course-meta">
              <div><strong>Category:</strong> {course.category}</div>
              <div><strong>Level:</strong> {course.level}</div>
              <div><strong>Duration:</strong> {course.duration} hours</div>
            </div>
          </div>

          <div className="course-sidebar">
            <div className="card">
              <h3>Enroll Now</h3>
              {isAuthenticated ? (
                <button 
                  onClick={handleEnroll} 
                  className="btn btn-primary"
                  disabled={enrolling}
                >
                  {enrolling ? 'Enrolling...' : 'Enroll in Course'}
                </button>
              ) : (
                <p>Please login to enroll</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
