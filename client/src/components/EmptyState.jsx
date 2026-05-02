const EmptyState = ({ title, message }) => (
  <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-8 text-center transition-colors">
    <p className="font-semibold text-slate-900 dark:text-slate-100">{title}</p>
    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{message}</p>
  </div>
);

export default EmptyState;
