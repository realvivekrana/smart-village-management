import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNotices } from "../../services/noticeService";
import { formatRelative } from "../../utils/formatDate";

const priorityConfig = {
  urgent: {
    label: "Urgent",
    badge:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    icon: "🚨",
    border: "border-red-200 dark:border-red-900/40",
  },
  high: {
    label: "High Priority",
    badge:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    icon: "⚠️",
    border: "border-orange-200 dark:border-orange-900/40",
  },
  normal: {
    label: "Notice",
    badge:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    icon: "📢",
    border: "border-blue-200 dark:border-blue-900/40",
  },
  low: {
    label: "Information",
    badge:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    icon: "ℹ️",
    border: "border-slate-200 dark:border-slate-700",
  },
};

export default function LatestNotices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getNotices({
      page: 1,
      limit: 4,
    })
      .then((res) => {
        if (!mounted) return;

        const data = res?.data?.data;

        setNotices(
          Array.isArray(data?.notices)
            ? data.notices
            : Array.isArray(data)
              ? data
              : []
        );
      })
      .catch(() => {
        if (mounted) setNotices([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-white py-16 dark:bg-slate-900">
      {/* Background decoration */}
      <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 rounded-full bg-blue-500/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Village Updates
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Latest Notices
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
              Stay informed about important announcements, government
              updates and community information from Kakarcholi.
            </p>
          </div>

          <Link
            to="/notices"
            className="group inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-600 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-blue-500 dark:hover:text-blue-400"
          >
            View all notices
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid gap-5 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-800"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="h-7 w-24 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-700" />
                </div>

                <div className="mb-3 h-6 w-4/5 rounded bg-slate-200 dark:bg-slate-700" />

                <div className="space-y-2">
                  <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && notices.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-800/50">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-3xl dark:bg-blue-900/30">
              📢
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No notices available
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
              There are currently no announcements to display. New village
              notices will appear here automatically.
            </p>
          </div>
        )}

        {/* Notices */}
        {!loading && notices.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2">
            {notices.map((notice) => {
              const priority =
                priorityConfig[notice.priority] || priorityConfig.normal;

              return (
                <Link
                  key={notice._id}
                  to={`/notices/${notice._id}`}
                  className={`group relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-slate-800 ${priority.border}`}
                >
                  {/* Left accent */}
                  <div className="absolute bottom-0 left-0 top-0 w-1 bg-blue-500 opacity-80 transition-all group-hover:w-1.5" />

                  {/* Top row */}
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${priority.badge}`}
                    >
                      <span>{priority.icon}</span>
                      {priority.label}
                    </span>

                    {notice.publishedAt && (
                      <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                        {formatRelative(notice.publishedAt)}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="line-clamp-2 text-lg font-bold leading-7 text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                    {notice.title || "Village Notice"}
                  </h3>

                  {/* Content */}
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {notice.content || "No additional information available."}
                  </p>

                  {/* Footer */}
                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-700">
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                      Official Village Notice
                    </span>

                    <span className="flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400">
                      Read more
                      <span className="transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}