export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, total, limit } = pagination;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const pages = [];
  const delta = 2;
  for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Showing <span className="font-medium">{from}</span>–<span className="font-medium">{to}</span> of{" "}
        <span className="font-medium">{total}</span> results
      </p>
      <nav className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-1 rounded-lg text-sm border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          ‹
        </button>
        {pages[0] > 1 && (
          <>
            <button onClick={() => onPageChange(1)} className="px-3 py-1 rounded-lg text-sm border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">1</button>
            {pages[0] > 2 && <span className="px-2 text-gray-400">…</span>}
          </>
        )}
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-3 py-1 rounded-lg text-sm border ${
              p === page
                ? "bg-primary-600 text-white border-primary-600"
                : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            {p}
          </button>
        ))}
        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && <span className="px-2 text-gray-400">…</span>}
            <button onClick={() => onPageChange(totalPages)} className="px-3 py-1 rounded-lg text-sm border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">{totalPages}</button>
          </>
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="px-3 py-1 rounded-lg text-sm border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          ›
        </button>
      </nav>
    </div>
  );
}
