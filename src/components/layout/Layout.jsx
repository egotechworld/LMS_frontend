import { Outlet, useLocation, NavLink } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import Sidebar from './Sidebar';
import { Sun, Moon } from 'lucide-react';

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
    <nav className="flex items-center gap-1 text-sm text-slate-500 dark:text-white/50">
      <NavLink to="/dashboard" className="hover:text-slate-900 dark:hover:text-white transition-colors">
        {LABELS['dashboard']}
      </NavLink>
      {segments.map((seg, i) => {
        if (i === 0 && seg === 'dashboard') return null;
        const label = LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1);
        const to    = '/' + segments.slice(0, i + 1).join('/');
        return (
          <span key={to} className="flex items-center gap-1">
            <span className="text-slate-300 dark:text-white/20 mx-1">›</span>
            <NavLink
              to={to}
              className={({ isActive }) =>
                isActive ? 'text-slate-900 dark:text-white font-medium' : 'hover:text-slate-900 dark:hover:text-white transition-colors'
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
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0b1120] text-slate-900 dark:text-white transition-colors duration-300">
      {isAuthenticated && <Sidebar />}

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {isAuthenticated && (
          <header className="h-14 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-[hsl(224,44%,12%)] flex items-center justify-between px-7 shrink-0 text-slate-900 dark:text-white transition-colors duration-300">
            <Breadcrumbs />
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? <Moon size={18} className="text-slate-600" /> : <Sun size={18} className="text-yellow-400" />}
            </button>
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
