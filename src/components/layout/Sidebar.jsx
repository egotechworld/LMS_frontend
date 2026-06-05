import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/dashboard',    label: 'Dashboard',       icon: '⊞' },
  { to: '/courses',      label: 'Browse Courses',  icon: '🎓' },
  { to: '/my-courses',   label: 'My Courses',      icon: '📚' },
  { to: '/assignments',  label: 'Assignments',      icon: '📝' },
  { to: '/notifications',label: 'Notifications',   icon: '🔔' },
];

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const initials = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase()
    : '?';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">P</div>
        <div>
          <p className="sidebar-brand-name">PathWay</p>
          <p className="sidebar-brand-sub">LEARNING PLATFORM</p>
        </div>
      </div>

      {/* Role tabs */}
      <div className="sidebar-role-tabs">
        <button className={`role-tab${user?.role === 'student'    ? ' active' : ''}`}>Student</button>
        <button className={`role-tab${user?.role === 'instructor' ? ' active' : ''}`}>Instructor</button>
        <button className={`role-tab${user?.role === 'admin'      ? ' active' : ''}`}>Admin</button>
      </div>

      {/* Nav links */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-nav-item${isActive ? ' sidebar-nav-item--active' : ''}`
            }
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="sidebar-footer">
        <div className="sidebar-avatar">{initials}</div>
        <div className="sidebar-user-info">
          <p className="sidebar-user-name">
            {user?.first_name} {user?.last_name}
          </p>
          <p className="sidebar-user-role">{user?.role}</p>
        </div>
        <button className="sidebar-logout-btn" onClick={handleLogout} title="Logout">
          →
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
