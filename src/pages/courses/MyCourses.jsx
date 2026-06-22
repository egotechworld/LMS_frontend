import { useState, useEffect } from 'react';
import { enrollmentService } from '../../services/enrollmentService';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../lib/utils';
import './Courses.css';

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

  if (loading) return <div className="loading">Loading your courses...</div>;

  return (
    <div className="container">
      <h1>My Enrolled Courses</h1>
      
      {enrollments.length === 0 ? (
        <div className="card">
          <p>You haven't enrolled in any courses yet.</p>
          <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
        </div>
      ) : (
        <div className="courses-grid">
          {enrollments.map((enrollment) => (
            <div key={enrollment.id} className="course-card">
              <img src={getImageUrl(enrollment.thumbnail)} alt={enrollment.title} />
              <div className="course-card-content">
                <h3>{enrollment.title}</h3>
                <p className="course-instructor">
                  By {enrollment.instructor_first_name} {enrollment.instructor_last_name}
                </p>
                <p className="course-description">{enrollment.description}</p>
                <div className="course-progress">
                  <span>Progress: {enrollment.progress}%</span>
                </div>
                <div className="course-card-actions">
                  <Link to={`/student/courses/${enrollment.course_id}/play`} className="btn btn-primary">
                    Continue Learning
                  </Link>
                  <Link to={`/progress/${enrollment.course_id}`} className="btn btn-track-progress">
                    📊 Track Progress
                  </Link>
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
