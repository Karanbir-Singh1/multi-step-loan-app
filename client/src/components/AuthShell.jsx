const AuthShell = ({ title, subtitle, children }) => (
  <main className="grid min-h-screen grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]">
    <section className="hidden bg-ink p-10 text-white lg:flex lg:flex-col lg:justify-between">
      <div>
        <h1 className="text-3xl font-bold">Multi-Step Loan App</h1>
        <p className="mt-4 max-w-md text-slate-300">
          Apply for loans, upload required documents, and track your application status step-by-step.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3 text-sm">
        {['Apply', 'Verify', 'Approve'].map((item) => (
          <div key={item} className="rounded-lg bg-white/10 p-4">
            {item}
          </div>
        ))}
      </div>
    </section>
    <section className="grid place-items-center p-6">
      <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-ink">{title}</h2>
        <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
        <div className="panel mt-6 p-6">{children}</div>
      </div>
    </section>
  </main>
);

export default AuthShell;
