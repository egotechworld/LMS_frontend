import { useAuthStore } from '../../store/authStore';
import './Dashboards.css';

const InstructorDashboard = () => {
  const { user } = useAuthStore();

  return (
    <div className="container">
      <div className="dashboard">
        <h1>Instructor Panel</h1>
        <p className="dashboard-subtitle">Welcome back, {user?.first_name} {user?.last_name}</p>

        <div className="dashboard-grid">
          <div className="card dashboard-card">
            <h3>My Courses</h3>
            <p className="card-number">0</p>
            <p className="card-label">Courses Created</p>
          </div>

          <div className="card dashboard-card">
            <h3>Students</h3>
            <p className="card-number">0</p>
            <p className="card-label">Total Enrolled</p>
          </div>

          <div className="card dashboard-card">
            <h3>Assignments</h3>
            <p className="card-number">0</p>
            <p className="card-label">Pending Reviews</p>
          </div>

          <div className="card dashboard-card">
            <h3>Revenue</h3>
            <p className="card-number">$0</p>
            <p className="card-label">Total Earnings</p>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <a href="/instructor/courses" className="btn btn-primary">Manage Courses</a>
            <a href="/instructor/assignments" className="btn btn-secondary">View Submissions</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
