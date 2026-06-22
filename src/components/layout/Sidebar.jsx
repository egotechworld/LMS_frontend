import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, BookMarked,
  ClipboardList, Bell, LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const NAV_ITEMS = [
  { to: '/dashboard',     label: 'Dashboard',      Icon: LayoutDashboard, roles: ['student', 'instructor', 'admin'] },
  { to: '/courses',       label: 'Browse Courses', Icon: BookOpen,        roles: ['student', 'instructor', 'admin'] },
  { to: '/my-courses',    label: 'My Courses',     Icon: BookMarked,      roles: ['student'] },
  { to: '/assignments',   label: 'Assignments',    Icon: ClipboardList,   roles: ['student'] },
  { to: '/notifications', label: 'Notifications',  Icon: Bell,            roles: ['student', 'instructor', 'admin'] },
  { to: '/instructor/courses', label: 'Manage Courses', Icon: BookOpen,   roles: ['instructor'] },
  { to: '/admin/finance', label: 'Finance Dashboard', Icon: ClipboardList,roles: ['admin'] },
  { to: '/admin/courses', label: 'Add Course',     Icon: BookOpen,        roles: ['admin'] },
];

const ROLES = ['student', 'instructor', 'admin'];

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const initials = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase()
    : '?';

  return (
    <aside className="flex h-screen w-[220px] min-w-[220px] flex-col bg-[hsl(224,44%,14%)] sticky top-0 overflow-y-auto">

      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-white/10">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-bold text-sm shrink-0">
          P
        </div>
        <div>
          <p className="text-white text-sm font-bold leading-none">PathWay</p>
          <p className="text-white/40 text-[9px] uppercase tracking-widest mt-0.5">Learning Platform</p>
        </div>
      </div>

      {/* Role tabs */}
      <div className="flex gap-1 px-3 py-3 border-b border-white/10">
        {ROLES.map((role) => (
          <div
            key={role}
            className={cn(
              'flex-1 rounded px-0 py-1 text-center text-[11px] font-medium capitalize border',
              user?.role === role
                ? 'bg-primary border-primary text-white'
                : 'border-white/15 text-white/50'
            )}
          >
            {role}
          </div>
        ))}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-3 flex flex-col gap-0.5">
        {NAV_ITEMS.filter(item => !item.roles || item.roles.includes(user?.role)).map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors',
                isActive
                  ? 'bg-primary/20 text-white'
                  : 'text-white/55 hover:bg-white/8 hover:text-white/90'
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <Separator className="bg-white/10" />

      {/* User footer */}
      <div className="flex items-center gap-2.5 px-3 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-xs font-bold shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-semibold truncate">
            {user?.first_name} {user?.last_name}
          </p>
          <p className="text-white/45 text-[11px] capitalize">{user?.role}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-white/40 hover:text-white hover:bg-white/10 shrink-0"
          onClick={() => { logout(); navigate('/login'); }}
          title="Logout"
        >
          <LogOut className="h-3.5 w-3.5" />
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
