const Pagination = ({ page, pages, onPage }) => (
  <div className="mt-4 flex items-center justify-between text-sm">
    <button className="btn-secondary" disabled={page <= 1} onClick={() => onPage(page - 1)}>
      Previous
    </button>
    <span className="text-slate-400 font-medium">
      Page {page} of {pages}
    </span>
    <button className="btn-secondary" disabled={page >= pages} onClick={() => onPage(page + 1)}>
      Next
    </button>
  </div>
);

export default Pagination;
