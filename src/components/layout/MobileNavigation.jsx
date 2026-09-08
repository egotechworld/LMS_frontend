import { NavLink } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { NAV_ITEMS } from './Sidebar';
import { cn } from '@/lib/utils';

const MobileNavigation = () => {
  const user = useAuthStore((state) => state.user);
  const items = NAV_ITEMS
    .filter((item) => item.roles.includes(user?.role))
    .filter((item) => ['Dashboard', 'Browse Courses', 'My Courses', 'Assignments', 'Manage Courses'].includes(item.label))
    .slice(0, 4);

  return (
    <nav
      aria-label="Primary mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-flow-col auto-cols-fr border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] dark:border-white/10 dark:bg-[hsl(224,44%,12%)] md:hidden"
    >
      {items.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => cn(
            'flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium',
            isActive ? 'text-primary' : 'text-slate-500 dark:text-white/60'
          )}
        >
          <Icon aria-hidden="true" className="h-5 w-5" />
          <span className="max-w-full truncate">{label.replace('Browse ', '')}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default MobileNavigation;
