import { Link } from "react-router-dom";
import { useVillage } from "../../context/VillageContext";

const priorityConfig = {
  urgent: {
    label: "Urgent",
    badge:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    icon: "🚨",
    border:
      "border-red-200 dark:border-red-900/40",
  },

  high: {
    label: "High Priority",
    badge:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    icon: "⚠️",
    border:
      "border-orange-200 dark:border-orange-900/40",
  },

  normal: {
    label: "Notice",
    badge:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    icon: "📢",
    border:
      "border-blue-200 dark:border-blue-900/40",
  },

  low: {
    label: "Information",
    badge:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    icon: "ℹ️",
    border:
      "border-slate-200 dark:border-slate-700",
  },
};

const formatDate = (date) => {
  if (!date) return "";

  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return "";
  }
};

const getPriorityConfig = (priority) => {
  return (
    priorityConfig[
      String(priority || "normal").toLowerCase()
    ] || priorityConfig.normal
  );
};

export default function LatestNotices({
  notices = [],
  loading = false,
}) {
  const { villageName } = useVillage();

  return (
    <section className="relative overflow-hidden bg-white py-16 dark:bg-slate-900">
      {/* Decorative background */}
      <div className="pointer-events-none absolute -right-24 top-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              Latest Information
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Latest Notices
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
              Important announcements and updates for the residents of{" "}
              {villageName}.
            </p>
          </div>

          <Link
            to="/notices"
            className="group inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
          >
            View all notices

            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-800" />

                  <div className="h-6 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
                </div>

                <div className="h-5 w-4/5 rounded bg-slate-200 dark:bg-slate-800" />

                <div className="mt-3 h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />

                <div className="mt-2 h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />

                <div className="mt-6 h-4 w-24 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && notices.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-950">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl dark:bg-indigo-900/30">
              📢
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No latest notices
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
              There are currently no new notices or announcements.
              Please check again later.
            </p>
          </div>
        )}

        {/* Notices */}
        {!loading && notices.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {notices.map((notice) => {
              const config = getPriorityConfig(
                notice.priority
              );

              return (
                <Link
                  key={notice._id}
                  to={`/notices/${notice._id}`}
                  className={`group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-slate-950 ${config.border}`}
                >
                  {/* Top */}
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg dark:bg-slate-800">
                      {config.icon}
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${config.badge}`}
                    >
                      {config.label}
                    </span>
                  </div>

                  {/* Category */}
                  {notice.category && (
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {notice.category}
                    </p>
                  )}

                  {/* Title */}
                  <h3 className="line-clamp-2 text-lg font-bold text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                    {notice.title || "Village Notice"}
                  </h3>

                  {/* Content */}
                  {notice.content && (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      {notice.content}
                    </p>
                  )}

                  {/* Date */}
                  {notice.publishedAt && (
                    <div className="mt-5 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-500">
                      <span>📅</span>

                      <span>
                        {formatDate(notice.publishedAt)}
                      </span>
                    </div>
                  )}

                  {/* Bottom */}
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                    <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                      Read notice
                    </span>

                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all group-hover:bg-indigo-600 group-hover:text-white dark:bg-slate-800 dark:text-slate-300">
                      →
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