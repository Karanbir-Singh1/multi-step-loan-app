import { Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { getProjects } from '../api/projects.js';
import { createTask, deleteTask, getTasks, updateTaskStatus } from '../api/tasks.js';
import { getUsers } from '../api/users.js';
import EmptyState from '../components/EmptyState.jsx';
import Pagination from '../components/Pagination.jsx';
import Spinner from '../components/Spinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../hooks/useAsync.js';

const blankTask = {
  title: '',
  description: '',
  projectId: '',
  assignedTo: '',
  priority: 'medium',
  status: 'todo',
  dueDate: ''
};

const priorityClass = {
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  high: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
};

const Tasks = () => {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState(null);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ page: 1, search: '', status: '', priority: '', projectId: '' });
  const [form, setForm] = useState(blankTask);
  const [loading, setLoading] = useState(true);

  const projectMembers = useMemo(() => {
    const project = projects.find((item) => item._id === form.projectId);
    return project?.members?.length ? project.members : users;
  }, [projects, form.projectId, users]);

  const load = async () => {
    setLoading(true);
    try {
      const [{ data: taskData }, { data: projectData }, usersResponse] = await Promise.all([
        getTasks({ ...filters, limit: 8 }),
        getProjects({ limit: 50 }),
        isAdmin ? getUsers() : Promise.resolve({ data: [] })
      ]);
      setTasks(taskData);
      setProjects(projectData.items || []);
      setUsers(usersResponse.data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filters, isAdmin]);

  const setFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value, page: key === 'page' ? value : 1 }));

  const submit = async (event) => {
    event.preventDefault();
    try {
      await createTask(form);
      setForm(blankTask);
      toast.success('Task created');
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const changeStatus = async (taskId, status) => {
    try {
      await updateTaskStatus(taskId, status);
      toast.success('Task status updated');
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    try {
      await deleteTask(id);
      toast.success('Task deleted');
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-fade-up">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Tasks</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Track assignments, priority, progress, and overdue work.</p>
      </div>

      <section className="panel grid gap-3 p-4 lg:grid-cols-5 animate-fade-up animation-delay-100">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input className="pl-10 transition-colors focus:border-brand focus:ring-brand/50" placeholder="Search tasks" value={filters.search} onChange={(e) => setFilter('search', e.target.value)} />
        </div>
        <select value={filters.projectId} onChange={(e) => setFilter('projectId', e.target.value)} className="transition-colors focus:border-brand">
          <option value="">All projects</option>
          {projects.map((project) => (
            <option key={project._id} value={project._id}>{project.name}</option>
          ))}
        </select>
        <select value={filters.status} onChange={(e) => setFilter('status', e.target.value)} className="transition-colors focus:border-brand">
          <option value="">All status</option>
          <option value="todo">Todo</option>
          <option value="in-progress">In progress</option>
          <option value="completed">Completed</option>
        </select>
        <select value={filters.priority} onChange={(e) => setFilter('priority', e.target.value)} className="transition-colors focus:border-brand">
          <option value="">All priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </section>

      {isAdmin && (
        <form className="panel grid gap-4 p-5 xl:grid-cols-6 animate-fade-up animation-delay-200" onSubmit={submit}>
          <div className="xl:col-span-2">
            <label>Title</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="xl:col-span-2">
            <label>Project</label>
            <select required value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value, assignedTo: '' })}>
              <option value="">Choose project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>{project.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Assignee</label>
            <select required value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
              <option value="">Choose user</option>
              {projectMembers.map((user) => (
                <option key={user._id} value={user._id}>{user.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Due date</label>
            <input type="date" required value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </div>
          <div>
            <label>Priority</label>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="xl:col-span-4">
            <label>Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <button className="btn-primary self-end">
            <Plus size={16} />
            Create task
          </button>
        </form>
      )}

      {loading ? (
        <Spinner />
      ) : tasks?.items?.length ? (
        <>
          <div className="grid gap-4">
            {tasks.items.map((task, index) => (
              <article key={task._id} className={`panel p-5 hover:border-brand/50 transition-all animate-fade-up animation-delay-${(index % 5 + 1) * 100}`}>
                <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-900 dark:text-slate-100">{task.title}</h3>
                      <span className={`rounded-md px-2 py-0.5 text-xs font-bold border ${priorityClass[task.priority]}`}>
                        {task.priority}
                      </span>
                      {task.isOverdue && <span className="rounded-md bg-rose-100 dark:bg-rose-500/20 border border-rose-200 dark:border-rose-500/30 px-2 py-0.5 text-xs font-bold text-rose-700 dark:text-rose-400">Overdue</span>}
                    </div>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{task.description || 'No description'}</p>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300">
                      <span>Project: <span className="text-slate-900 dark:text-slate-100 font-medium">{task.projectId?.name}</span></span>
                      <span>Assigned: <span className="text-slate-900 dark:text-slate-100 font-medium">{task.assignedTo?.name}</span></span>
                      <span>Due: <span className="text-slate-900 dark:text-slate-100 font-medium">{new Date(task.dueDate).toLocaleDateString()}</span></span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select value={task.status} onChange={(e) => changeStatus(task._id, e.target.value)} className="w-auto text-sm transition-colors focus:border-brand">
                      <option value="todo">Todo</option>
                      <option value="in-progress">In progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    {isAdmin && (
                      <button className="btn-danger px-3" onClick={() => handleDelete(task._id)} aria-label="Delete task">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
          <Pagination page={tasks.page} pages={tasks.pages} onPage={(next) => setFilter('page', next)} />
        </>
      ) : (
        <EmptyState title="No tasks found" message="Create a task or adjust filters to find work." />
      )}
    </div>
  );
};

export default Tasks;
