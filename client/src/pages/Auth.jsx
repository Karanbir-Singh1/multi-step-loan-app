import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layers, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../hooks/useAsync.js';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLogin && form.password.length < 8) {
      return toast.error('Password must be at least 8 characters');
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login({ email: form.email, password: form.password });
      } else {
        await signup(form);
      }
      navigate('/dashboard');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden animate-fade-in transition-colors duration-300">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-96 bg-brand transform -skew-y-6 -translate-y-32 -z-10 opacity-[0.03] animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-[120px] -z-10 opacity-[0.05] dark:opacity-10 animate-blob animation-delay-200"></div>
      
      <div className="max-w-md w-full space-y-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-10 rounded-2xl shadow-xl dark:shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-up">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand/10 dark:bg-brand/20 text-brand shadow-inner mb-6 ring-1 ring-brand/50">
            <Layers size={28} />
          </Link>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {isLogin ? 'Log in to your account to continue.' : 'Start managing your projects efficiently.'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-lg mb-6 ring-1 ring-slate-200 dark:ring-slate-800">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              isLogin ? 'bg-white dark:bg-slate-800 text-brand shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            Log in
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              !isLogin ? 'bg-white dark:bg-slate-800 text-brand shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            Sign up
          </button>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                required
                className="mt-1"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          )}

          <div>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              required
              className="mt-1"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              className="mt-1"
              placeholder="••••••••"
              minLength={isLogin ? undefined : 8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          {!isLogin && (
            <div>
              <label htmlFor="role">Role</label>
              <select
                id="role"
                className="mt-1"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="member">Team Member</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                {isLogin ? 'Logging in...' : 'Creating account...'}
              </>
            ) : (
              isLogin ? 'Log in' : 'Create account'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
