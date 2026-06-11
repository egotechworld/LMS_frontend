import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuthStore();

  return (
    <div className="container">
      <div className="dashboard">
        <h1>Welcome back, {user?.first_name}!</h1>
        <p className="dashboard-subtitle">Your learning journey continues here</p>

        <div className="dashboard-grid">
          <div className="card dashboard-card">
            <h3>My Courses</h3>
            <p className="card-number">0</p>
            <p className="card-label">Enrolled Courses</p>
          </div>

          <div className="card dashboard-card">
            <h3>In Progress</h3>
            <p className="card-number">0</p>
            <p className="card-label">Active Learning</p>
          </div>

          <div className="card dashboard-card">
            <h3>Completed</h3>
            <p className="card-number">0</p>
            <p className="card-label">Finished Courses</p>
          </div>

          <div className="card dashboard-card">
            <h3>Certificates</h3>
            <p className="card-number">0</p>
            <p className="card-label">Earned Certificates</p>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <a href="/courses" className="btn btn-primary">Browse Courses</a>
            <a href="/my-courses" className="btn btn-secondary">View My Courses</a>
            {user?.role === 'instructor' && (
              <Link to="/instructor/progress" className="btn btn-track">
                📊 Track Student Progress
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
