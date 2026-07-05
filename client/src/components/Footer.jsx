const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 mt-20 relative z-10">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <span className="text-xl font-bold text-slate-100 tracking-tight">Multi-Step Loan App</span>
            <p className="text-slate-500 mt-2 text-sm">
              Apply for loans and manage your applications efficiently.
            </p>
          </div>
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} Multi-Step Loan App. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
