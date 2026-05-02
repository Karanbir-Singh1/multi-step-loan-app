import { BarChart3, FolderKanban, LogOut, ListChecks, Moon, Sun } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/tasks', label: 'Tasks', icon: ListChecks }
];

const Layout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 animate-fade-in transition-colors duration-300">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 md:block">
        <div className="mb-8 animate-fade-up">
          <p className="text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Team Task Manager</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{user?.name}</p>
        </div>
        <nav className="space-y-2">
          {navItems.map(({ to, label, icon: Icon }, index) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all animate-fade-up animation-delay-${(index + 1) * 100} ${
                  isActive 
                    ? 'bg-brand/10 dark:bg-brand/20 text-brand shadow-inner ring-1 ring-brand/50' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="md:pl-64">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 px-4 py-4 backdrop-blur-md md:px-8 animate-fade-up">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{user?.role === 'admin' ? 'Admin workspace' : 'Member workspace'}</p>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">Dashboard Overview</h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="btn-secondary" onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>
        <div className="flex gap-2 overflow-x-auto border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 md:hidden">
          {navItems.map(({ to, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `btn ${isActive ? 'bg-brand/10 dark:bg-brand/20 text-brand ring-1 ring-brand/50' : 'text-slate-600 dark:text-slate-400'}`}>
              {label}
            </NavLink>
          ))}
        </div>
        <section className="p-4 md:p-8">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default Layout;
