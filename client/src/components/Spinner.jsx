const Spinner = ({ fullScreen = false }) => (
  <div className={fullScreen ? 'grid min-h-screen place-items-center' : 'grid min-h-40 place-items-center'}>
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-brand" />
  </div>
);

export default Spinner;
