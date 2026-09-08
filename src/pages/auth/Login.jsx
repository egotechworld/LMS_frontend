import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import './Auth.css';

const DEMO_ACCOUNTS = [
  { role: 'Admin', name: 'Priya Kapoor', email: 'admin@lms.com', password: 'Admin123!' },
  { role: 'Instructor', name: 'Maya Chen', email: 'maya.chen@lms.com', password: 'Teach123!' },
  { role: 'Instructor', name: 'James Okonkwo', email: 'james.okonkwo@lms.com', password: 'Teach123!' },
  { role: 'Student', name: 'Alex Rivera', email: 'alex.rivera@lms.com', password: 'Learn123!' },
  { role: 'Student', name: 'Sofia Berg', email: 'sofia.berg@lms.com', password: 'Learn123!' },
  { role: 'Student', name: 'Noah Patel', email: 'noah.patel@lms.com', password: 'Learn123!' },
];

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setSession } = useAuthStore();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(formData);
      const { user } = response;
      setSession(user);

      // Redirect based on user role
      switch (user.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'instructor':
          navigate('/instructor/dashboard');
          break;
        default:
          navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login to LMS</h2>
        <p className="auth-subtitle">Access your account</p>
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
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
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-link">
          Don't have an account? <Link to="/register">Register as Student</Link>
        </p>

        <div className="demo-accounts">
          <p className="demo-accounts-title">Demo accounts — click to fill</p>
          <ul>
            {DEMO_ACCOUNTS.map((account) => (
              <li key={account.email}>
                <button
                  type="button"
                  className="demo-account-btn"
                  onClick={() => setFormData({ email: account.email, password: account.password })}
                >
                  <span className="demo-role">{account.role}</span>
                  <span className="demo-name">{account.name}</span>
                  <span className="demo-email">{account.email}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;
