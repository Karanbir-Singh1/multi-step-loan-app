import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Layout, Users, Shield } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <div className={`bg-white dark:bg-slate-900/50 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-brand/10 dark:hover:border-slate-700 transition-all backdrop-blur-sm animate-fade-up ${delay}`}>
    <div className="bg-brand/10 dark:bg-brand/20 w-12 h-12 rounded-lg flex items-center justify-center mb-6 text-brand shadow-inner">
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">{title}</h3>
    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
  </div>
);

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 font-sans selection:bg-brand/30 selection:text-white animate-fade-in transition-colors duration-300">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand/5 via-white to-white dark:from-brand/10 dark:via-slate-950 dark:to-slate-950 -z-10 animate-fade-in" />
          <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 rounded-full bg-brand/10 dark:bg-brand/20 blur-[100px] -z-10 animate-blob" />
          <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-[100px] -z-10 animate-blob animation-delay-200" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 animate-fade-up">
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight mb-8">
              Work together,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-cyan-500 dark:to-cyan-400 drop-shadow-sm">
                deliver faster.
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-up animation-delay-100">
              Coordinate projects, assign tasks, and keep delivery progress visible across every team. Build a modern workflow that scales with you.
            </p>
            <div className="flex justify-center items-center gap-4 animate-fade-up animation-delay-200">
              <Link 
                to="/auth" 
                className="bg-brand hover:bg-brand-dark text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg shadow-brand/20 hover:shadow-brand/40 hover:-translate-y-0.5 flex items-center gap-2 group ring-1 ring-white/10"
              >
                Get Started Free
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
            </div>
            
            {/* Social Proof / Checkmarks */}
            <div className="mt-12 flex items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400 font-medium animate-fade-up animation-delay-300">
              <span className="flex items-center gap-2"><CheckCircle size={16} className="text-mint drop-shadow-md" /> No credit card required</span>
              <span className="flex items-center gap-2"><CheckCircle size={16} className="text-mint drop-shadow-md" /> 14-day free trial</span>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 relative">
          <div className="absolute inset-0 bg-slate-50 dark:bg-slate-900/30 border-y border-slate-100 dark:border-slate-800 -z-10" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16 animate-fade-up animation-delay-100">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">Everything you need to manage your team</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Powerful features designed to help your team stay organized, focused, and productive.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={Layout}
                title="Project Management"
                description="Organize your work into projects. Track statuses, deadlines, and priorities all in one centralized dashboard."
                delay="animation-delay-200"
              />
              <FeatureCard 
                icon={CheckCircle}
                title="Task Tracking"
                description="Break down complex projects into manageable tasks. Assign owners, set due dates, and monitor progress in real-time."
                delay="animation-delay-300"
              />
              <FeatureCard 
                icon={Users}
                title="Team Collaboration"
                description="Keep everyone on the same page with role-based access control. From admins to members, control who sees what."
                delay="animation-delay-400"
              />
            </div>
          </div>
        </section>
        
      </main>

      <Footer />
    </div>
  );
};

export default Landing;
