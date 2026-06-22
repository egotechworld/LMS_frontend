import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { courseService } from '../../services/courseService';
import { enrollmentService } from '../../services/enrollmentService';
import { paymentService } from '../../services/paymentService';
import { useAuthStore } from '../../store/authStore';
import { getImageUrl } from '../../lib/utils';
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
      if (course.is_free) {
        await enrollmentService.enrollInCourse(id);
        alert('Enrolled successfully!');
      } else {
        // Route to demo checkout instead of Stripe
        navigate(`/checkout/${id}`);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Enrollment/Payment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const formatPrice = (priceInCents, currency = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(priceInCents / 100);
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
            <img src={getImageUrl(course.thumbnail)} alt={course.title} />
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
              <h3>Pricing</h3>
              <p className="text-2xl font-bold mb-4">
                {course.is_free ? 'Free' : formatPrice(course.price, course.currency)}
              </p>
              {isAuthenticated ? (
                <button 
                  onClick={handleEnroll} 
                  className="btn btn-primary w-full"
                  disabled={enrolling}
                >
                  {enrolling 
                    ? 'Processing...' 
                    : course.is_free 
                      ? 'Enroll Now' 
                      : `Buy Now - ${formatPrice(course.price, course.currency)}`}
                </button>
              ) : (
                <p>Please login to enroll or buy this course.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
