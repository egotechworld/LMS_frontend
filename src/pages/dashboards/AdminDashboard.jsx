import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import './Dashboards.css';

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegisterInstructor = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      await authService.registerInstructor(formData);
      setMessage({ type: 'success', text: 'Instructor registered successfully!' });
      setFormData({ firstName: '', lastName: '', email: '', password: '' });
      setShowRegisterForm(false);
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.error?.message || 'Failed to register instructor' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="dashboard">
        <h1>Super Admin Dashboard</h1>
        <p className="dashboard-subtitle">Welcome, {user?.first_name} {user?.last_name}</p>

        {message.text && (
          <div className={`alert alert-${message.type}`}>{message.text}</div>
        )}

        <div className="dashboard-grid">
          <div className="card dashboard-card">
            <h3>Total Users</h3>
            <p className="card-number">0</p>
            <p className="card-label">Registered Users</p>
          </div>

          <div className="card dashboard-card">
            <h3>Instructors</h3>
            <p className="card-number">0</p>
            <p className="card-label">Active Instructors</p>
          </div>

          <div className="card dashboard-card">
            <h3>Students</h3>
            <p className="card-number">0</p>
            <p className="card-label">Active Students</p>
          </div>

          <div className="card dashboard-card">
            <h3>Courses</h3>
            <p className="card-number">0</p>
            <p className="card-label">Total Courses</p>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Manage Instructors</h2>
          <button 
            className="btn btn-primary"
            onClick={() => setShowRegisterForm(!showRegisterForm)}
          >
            {showRegisterForm ? 'Cancel' : '+ Register New Instructor'}
          </button>

          {showRegisterForm && (
            <div className="admin-form-container">
              <form onSubmit={handleRegisterInstructor} className="admin-form">
                <h3>Register New Instructor</h3>
                
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter instructor email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    required
                    minLength={6}
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Registering...' : 'Register Instructor'}
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <a href="/admin/users" className="btn btn-primary">Manage Users</a>
            <a href="/admin/courses" className="btn btn-secondary">Review Courses</a>
            <a href="/admin/finance" className="btn btn-primary" style={{backgroundColor: '#10b981', borderColor: '#10b981'}}>Finance Dashboard</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
