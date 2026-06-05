import { Outlet, useLocation, NavLink } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import Sidebar from './Sidebar';

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
    <nav className="flex items-center gap-1 text-sm text-muted-foreground">
      <NavLink to="/dashboard" className="hover:text-foreground transition-colors">
        {LABELS['dashboard']}
      </NavLink>
      {segments.map((seg, i) => {
        if (i === 0 && seg === 'dashboard') return null;
        const label = LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1);
        const to    = '/' + segments.slice(0, i + 1).join('/');
        return (
          <span key={to} className="flex items-center gap-1">
            <span className="text-border mx-1">›</span>
            <NavLink
              to={to}
              className={({ isActive }) =>
                isActive ? 'text-foreground font-medium' : 'hover:text-foreground transition-colors'
              }
            >
              {label}
            </NavLink>
          </span>
        );
      })}
    </nav>
  );
};

const Layout = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="flex min-h-screen bg-background">
      {isAuthenticated && <Sidebar />}

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {isAuthenticated && (
          <header className="h-12 border-b bg-white flex items-center px-7 shrink-0">
            <Breadcrumbs />
          </header>
        )}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
