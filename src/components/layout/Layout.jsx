import { Outlet, useLocation, NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Sidebar from './Sidebar';
import './Layout.css';

/* Map path segments to readable breadcrumb labels */
const LABELS = {
  dashboard:     'Dashboard',
  courses:       'Courses',
  'my-courses':  'My Courses',
  assignments:   'Assignments',
  notifications: 'Notifications',
  quizzes:       'Quizzes',
};

const Breadcrumbs = () => {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);

  return (
    <nav className="breadcrumb">
      <NavLink to="/dashboard" className="breadcrumb-link">
        {LABELS['dashboard'] ?? 'Dashboard'}
      </NavLink>
      {segments.map((seg, i) => {
        if (i === 0 && seg === 'dashboard') return null;
        const label = LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1);
        const to    = '/' + segments.slice(0, i + 1).join('/');
        return (
          <span key={to} className="breadcrumb-item">
            <span className="breadcrumb-sep">›</span>
            <NavLink to={to} className="breadcrumb-link">{label}</NavLink>
          </span>
        );
      })}
    </nav>
  );
};

const Layout = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="layout">
      {isAuthenticated && <Sidebar />}

      <div className="layout-main">
        {isAuthenticated && (
          <header className="layout-topbar">
            <Breadcrumbs />
          </header>
        )}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
