import { Plus, Search, Trash2, UserPlus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { addMember, createProject, deleteProject, getProjects, removeMember } from '../api/projects.js';
import { getUsers } from '../api/users.js';
import EmptyState from '../components/EmptyState.jsx';
import Pagination from '../components/Pagination.jsx';
import Spinner from '../components/Spinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../hooks/useAsync.js';

const blankProject = { name: '', description: '', deadline: '', members: [] };

const Projects = () => {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState(null);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(blankProject);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [{ data: projectData }, usersResponse] = await Promise.all([
        getProjects({ page, search, limit: 8 }),
        isAdmin ? getUsers() : Promise.resolve({ data: [] })
      ]);
      setProjects(projectData);
      setUsers(usersResponse.data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, search, isAdmin]);

  const submit = async (event) => {
    event.preventDefault();
    try {
      await createProject({ ...form, members: form.members });
      setForm(blankProject);
      toast.success('Project created');
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const toggleMember = (userId) => {
    setForm((current) => ({
      ...current,
      members: current.members.includes(userId) ? current.members.filter((id) => id !== userId) : [...current.members, userId]
    }));
  };

  const handleAddMember = async (projectId, userId) => {
    if (!userId) return;
    try {
      await addMember(projectId, userId);
      toast.success('Member added');
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleRemoveMember = async (projectId, userId) => {
    try {
      await removeMember(projectId, userId);
      toast.success('Member removed');
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project and all related tasks?')) return;
    try {
      await deleteProject(id);
      toast.success('Project deleted');
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end animate-fade-up">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Projects</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create delivery spaces, manage members, and keep deadlines visible.</p>
        </div>
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input className="pl-10 focus:border-brand focus:ring-brand/50 transition-colors" placeholder="Search projects" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {isAdmin && (
        <form className="panel grid gap-4 p-5 lg:grid-cols-4 animate-fade-up animation-delay-100" onSubmit={submit}>
          <div>
            <label>Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label>Deadline</label>
            <input type="date" required value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </div>
          <div className="lg:col-span-2">
            <label>Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="lg:col-span-3">
            <label>Members</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {users.map((user) => (
                <button
                  type="button"
                  key={user._id}
                  className={`rounded-md border px-3 py-1 text-sm transition-colors ${
                    form.members.includes(user._id) ? 'border-brand/50 bg-brand/10 dark:bg-brand/20 text-brand' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => toggleMember(user._id)}
                >
                  {user.name}
                </button>
              ))}
            </div>
          </div>
          <button className="btn-primary self-end">
            <Plus size={16} />
            Create project
          </button>
        </form>
      )}

      {loading ? (
        <Spinner />
      ) : projects?.items?.length ? (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            {projects.items.map((project, index) => (
              <article key={project._id} className={`panel p-5 hover:border-brand/50 transition-all animate-fade-up animation-delay-${(index % 5 + 1) * 100}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">{project.name}</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{project.description || 'No description'}</p>
                    <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                      Deadline: {new Date(project.deadline).toLocaleDateString()}
                    </p>
                  </div>
                  {isAdmin && (
                    <button className="btn-danger px-3" onClick={() => handleDelete(project._id)} aria-label="Delete project">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.members.map((member) => (
                    <span key={member._id} className="inline-flex items-center gap-2 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 text-sm text-slate-700 dark:text-slate-200">
                      {member.name}
                      {isAdmin && (
                        <button onClick={() => handleRemoveMember(project._id, member._id)} aria-label="Remove member" className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                          <X size={14} />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                {isAdmin && (
                  <div className="mt-4 flex gap-2">
                    <select defaultValue="" onChange={(e) => handleAddMember(project._id, e.target.value)} className="max-w-[200px]">
                      <option value="" disabled>Add member</option>
                      {users.map((user) => (
                        <option key={user._id} value={user._id}>{user.name}</option>
                      ))}
                    </select>
                    <button className="btn-secondary px-3" aria-label="Add member">
                      <UserPlus size={16} />
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
          <Pagination page={projects.page} pages={projects.pages} onPage={setPage} />
        </>
      ) : (
        <EmptyState title="No projects found" message="Create a project or adjust your search filters." />
      )}
    </div>
  );
};

export default Projects;
