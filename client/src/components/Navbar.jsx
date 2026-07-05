import { Link } from 'react-router-dom';
import { Coins, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 text-slate-900 dark:text-slate-100 group">
            <div className="bg-brand p-1.5 rounded-lg text-white group-hover:bg-brand-dark transition-colors shadow-inner">
              <Coins size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight">Multi-Step Loan App</span>
          </Link>
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link 
              to="/auth" 
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors"
            >
              Log in
            </Link>
            <Link 
              to="/auth" 
              className="bg-brand hover:bg-brand-dark text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-md shadow-brand/20 ring-1 ring-white/10"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
