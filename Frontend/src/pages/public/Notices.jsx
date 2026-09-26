import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getNotices } from "../../services/noticeService";
import { formatRelative } from "../../utils/formatDate";

const priorityConfig = {
  urgent: {
    label: "Urgent",
    badge:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
    dot: "bg-red-500",
  },
  high: {
    label: "High Priority",
    badge:
      "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
    dot: "bg-orange-500",
  },
  normal: {
    label: "Normal",
    badge:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
    dot: "bg-blue-500",
  },
  low: {
    label: "Low",
    badge:
      "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
    dot: "bg-gray-400",
  },
};

export default function Notices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("all");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    currentPage: 1,
  });

  const limit = 9;

  useEffect(() => {
    let mounted = true;

    const fetchNotices = async () => {
      try {
        setLoading(true);
        setError("");

        const params = {
          page,
          limit,
        };

        if (priority !== "all") {
          params.priority = priority;
        }

        const response = await getNotices(params);

        if (!mounted) return;

        const data = response?.data?.data;

        setNotices(Array.isArray(data?.notices) ? data.notices : []);

        setPagination({
          total: data?.pagination?.total || 0,
          pages: data?.pagination?.pages || 1,
          currentPage: data?.pagination?.page || page,
        });
      } catch (err) {
        if (!mounted) return;

        setError(
          err?.response?.data?.message ||
            "Unable to load notices right now."
        );

        setNotices([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchNotices();

    return () => {
      mounted = false;
    };
  }, [page, priority]);

  const filteredNotices = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return notices;

    return notices.filter((notice) => {
      const title = notice?.title?.toLowerCase() || "";
      const content = notice?.content?.toLowerCase() || "";

      return title.includes(query) || content.includes(query);
    });
  }, [notices, search]);

  const handlePriorityChange = (value) => {
    setPriority(value);
    setPage(1);
  };

  const clearSearch = () => {
    setSearch("");
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-gray-950">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-blue-100 bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 text-white dark:border-gray-800">
        {/* Decorative shapes */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-purple-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Kakarcholi Community Updates
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Village Notices
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-blue-100 sm:text-lg">
              Stay informed about official announcements, important updates,
              community information and notices from Kakarcholi.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Search + Filters */}
        <div className="mb-8 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-400">
                🔎
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notices..."
                className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-11 pr-10 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:bg-gray-800"
              />

              {search && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  ×
                </button>
              )}
            </div>

            {/* Priority */}
            <div className="flex flex-wrap gap-2">
              {["all", "urgent", "high", "normal", "low"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handlePriorityChange(item)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold capitalize transition-all ${
                    priority === item
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  {item === "all" ? "All Notices" : item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Result Header */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Latest Notices
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {search
                ? `${filteredNotices.length} matching notice${
                    filteredNotices.length !== 1 ? "s" : ""
                  }`
                : `${pagination.total} notice${
                    pagination.total !== 1 ? "s" : ""
                  } available`}
            </p>
          </div>

          {priority !== "all" && (
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              Showing: {priority}
            </span>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="mb-5 flex justify-between">
                  <div className="h-9 w-9 rounded-xl bg-gray-200 dark:bg-gray-800" />
                  <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-800" />
                </div>

                <div className="h-5 w-4/5 rounded bg-gray-200 dark:bg-gray-800" />
                <div className="mt-3 h-4 w-full rounded bg-gray-200 dark:bg-gray-800" />
                <div className="mt-2 h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />

                <div className="mt-6 h-4 w-28 rounded bg-gray-200 dark:bg-gray-800" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/40 dark:bg-red-950/20">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-2xl dark:bg-red-900/30">
              ⚠️
            </div>

            <h3 className="text-lg font-bold text-red-800 dark:text-red-300">
              Unable to load notices
            </h3>

            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredNotices.length === 0 && (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-gray-700 dark:bg-gray-900">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-4xl dark:bg-blue-900/20">
              📢
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              No notices found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
              {search
                ? "No notices match your search. Try a different keyword."
                : "There are currently no notices available for this category."}
            </p>

            {search && (
              <button
                type="button"
                onClick={clearSearch}
                className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* Notices */}
        {!loading && !error && filteredNotices.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredNotices.map((notice) => {
              const config =
                priorityConfig[notice?.priority] || priorityConfig.normal;

              return (
                <Link
                  key={notice._id}
                  to={`/notices/${notice._id}`}
                  className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-800"
                >
                  {/* Top accent */}
                  <div
                    className={`absolute left-0 top-0 h-1 w-full ${config.dot}`}
                  />

                  {/* Card Header */}
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-xl dark:bg-blue-900/20">
                      📢
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${config.badge}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
                      />
                      {config.label}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="line-clamp-2 text-lg font-bold leading-7 text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                    {notice.title}
                  </h3>

                  {/* Content */}
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
                    {notice.content}
                  </p>

                  {/* Footer */}
                  <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>🕒</span>
                      <span>{formatRelative(notice.publishedAt)}</span>
                    </div>

                    <span className="text-sm font-semibold text-blue-600 transition-transform group-hover:translate-x-1 dark:text-blue-400">
                      Read →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading &&
          !error &&
          !search &&
          pagination.pages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                ← Previous
              </button>

              <div className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-blue-600 px-3 text-sm font-bold text-white shadow-md">
                {page}
              </div>

              <button
                type="button"
                disabled={page >= pagination.pages}
                onClick={() =>
                  setPage((current) =>
                    Math.min(pagination.pages, current + 1)
                  )
                }
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Next →
              </button>
            </div>
          )}
      </section>
    </main>
  );
}