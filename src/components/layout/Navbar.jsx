import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { notificationService } from '../../services/notificationService';
import { authService } from '../../services/authService';
import '../../pages/notifications/Notifications.css';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, clearSession } = useAuthStore();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchUnread();
    // Poll every 30s for new notifications
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const fetchUnread = async () => {
    try {
      const data = await notificationService.getMyNotifications(1, 1);
      setUnreadCount(data.unreadCount);
    } catch {}
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      clearSession();
      navigate('/login');
    }
  };

  const getDashboardPath = () => {
    switch (user?.role) {
      case 'admin': return '/admin/dashboard';
      case 'instructor': return '/instructor/dashboard';
      default: return '/student/dashboard';
    }
  };

  const renderNavLinks = () => {
    if (!isAuthenticated) return null;

    switch (user?.role) {
      case 'admin':
        return (
          <>
            <li><Link to="/admin/dashboard">Dashboard</Link></li>
            <li><Link to="/courses">Courses</Link></li>
          </>
        );
      case 'instructor':
        return (
          <>
            <li><Link to="/instructor/dashboard">Dashboard</Link></li>
            <li><Link to="/courses">Courses</Link></li>
          </>
        );
      default:
        return (
          <>
            <li><Link to="/student/dashboard">Dashboard</Link></li>
            <li><Link to="/courses">Courses</Link></li>
            <li><Link to="/my-courses">My Courses</Link></li>
          </>
        );
    }
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-brand">LMS Platform</Link>

        <ul className="navbar-menu">
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/courses">Courses</Link></li>
          {isAuthenticated && <li><Link to="/my-courses">My Courses</Link></li>}
        </ul>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              {/* Bell icon */}
              <div className="notif-bell-wrap">
                <Link to="/notifications" className="notif-bell" title="Notifications">
                  🔔
                  {unreadCount > 0 && (
                    <span className="notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                  )}
                </Link>
              </div>
              <span className="user-info">Hello, {user?.first_name}</span>
              <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary">Login</Link>
              <Link to="/register" className="btn btn-secondary">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
