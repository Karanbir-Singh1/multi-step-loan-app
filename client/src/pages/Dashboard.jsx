import { CheckCircle2, Clock, FolderKanban, ListChecks } from 'lucide-react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import Spinner from '../components/Spinner.jsx';
import { getTaskSummary } from '../api/tasks.js';
import { useAsync } from '../hooks/useAsync.js';
import { useTheme } from '../context/ThemeContext.jsx';

const colors = ['#2563eb', '#0f766e', '#ea580c'];

const Dashboard = () => {
  const { data, loading } = useAsync(getTaskSummary, []);
  const { theme } = useTheme();

  if (loading) return <Spinner />;

  const chartData = [
    { name: 'Todo', value: data?.todo || 0 },
    { name: 'In progress', value: data?.inProgress || 0 },
    { name: 'Completed', value: data?.completed || 0 }
  ];

  const stats = [
    { label: 'Projects', value: data?.projectCount || 0, icon: FolderKanban, color: 'text-brand' },
    { label: 'Total tasks', value: data?.total || 0, icon: ListChecks, color: 'text-ink' },
    { label: 'Completed', value: data?.completed || 0, icon: CheckCircle2, color: 'text-mint' },
    { label: 'Overdue', value: data?.overdue || 0, icon: Clock, color: 'text-coral' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-fade-up">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">A live summary of your team workload and delivery risk.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }, index) => (
          <div key={label} className={`panel p-5 hover:border-brand/50 transition-colors animate-fade-up animation-delay-${(index + 1) * 100}`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
              <Icon className={color === 'text-ink' ? 'text-slate-900 dark:text-slate-300' : color} size={22} />
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <section className="panel p-5 animate-fade-up animation-delay-400">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2">Task status</h3>
          <div className="mt-4 h-80">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={3} stroke="none">
                  {chartData.map((entry, index) => (
                    <Cell key={entry.name} fill={colors[index]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', 
                    borderColor: theme === 'dark' ? '#334155' : '#e2e8f0', 
                    color: theme === 'dark' ? '#f8fafc' : '#0f172a', 
                    borderRadius: '0.5rem' 
                  }}
                  itemStyle={{ color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}
                />
                <Legend wrapperStyle={{ color: theme === 'dark' ? '#cbd5e1' : '#475569' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="panel p-5 animate-fade-up animation-delay-500">
          <h3 className="font-bold text-slate-100 mb-2">Progress</h3>
          <div className="mt-6 space-y-6">
            {chartData.map((item, index) => {
              const percent = data?.total ? Math.round((item.value / data.total) * 100) : 0;
              return (
                <div key={item.name}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-semibold text-slate-300">{item.name}</span>
                    <span className="text-slate-400">{percent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${percent}%`, background: colors[index] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
