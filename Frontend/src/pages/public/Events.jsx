import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getEvents } from "../../services/eventService";
import { formatDateRange } from "../../utils/formatDate";

const categoryConfig = {
  cultural: {
    icon: "🎭",
    label: "Cultural",
    color:
      "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
  },
  religious: {
    icon: "🛕",
    label: "Religious",
    color:
      "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
  },
  community: {
    icon: "🤝",
    label: "Community",
    color:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  },
  sports: {
    icon: "⚽",
    label: "Sports",
    color:
      "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
  },
  education: {
    icon: "📚",
    label: "Education",
    color:
      "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800",
  },
  other: {
    icon: "📅",
    label: "Other",
    color:
      "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
  },
};

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [upcomingOnly, setUpcomingOnly] = useState(true);
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    currentPage: 1,
  });

  const limit = 9;

  useEffect(() => {
    let mounted = true;

    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError("");

        const params = {
          page,
          limit,
        };

        if (category !== "all") {
          params.category = category;
        }

        if (upcomingOnly) {
          params.upcoming = "true";
        }

        const response = await getEvents(params);

        if (!mounted) return;

        const data = response?.data?.data;

        setEvents(Array.isArray(data?.events) ? data.events : []);

        setPagination({
          total: data?.pagination?.total || 0,
          pages: data?.pagination?.pages || 1,
          currentPage: data?.pagination?.page || page,
        });
      } catch (err) {
        if (!mounted) return;

        setError(
          err?.response?.data?.message ||
            "Unable to load events right now."
        );

        setEvents([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchEvents();

    return () => {
      mounted = false;
    };
  }, [page, category, upcomingOnly]);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return events;

    return events.filter((event) => {
      const title = event?.title?.toLowerCase() || "";
      const description = event?.description?.toLowerCase() || "";
      const location = event?.location?.toLowerCase() || "";

      return (
        title.includes(query) ||
        description.includes(query) ||
        location.includes(query)
      );
    });
  }, [events, search]);

  const handleCategoryChange = (value) => {
    setCategory(value);
    setPage(1);
  };

  const handleUpcomingChange = (value) => {
    setUpcomingOnly(value);
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-gray-950">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-purple-100 bg-gradient-to-br from-indigo-700 via-purple-700 to-fuchsia-700 text-white dark:border-gray-800">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-fuchsia-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Kakarcholi Community
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Village Events
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-purple-100 sm:text-lg">
              Discover upcoming cultural, religious, educational, sports and
              community events happening in Kakarcholi.
            </p>
          </div>
        </div>
      </section>

      {/* Main */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="mb-8 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-400">
                🔎
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events, places or activities..."
                className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-11 pr-10 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:bg-gray-800"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  ×
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                {[
                  "all",
                  "cultural",
                  "religious",
                  "community",
                  "sports",
                  "education",
                  "other",
                ].map((item) => {
                  const config = categoryConfig[item];

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleCategoryChange(item)}
                      className={`rounded-xl px-4 py-2.5 text-sm font-semibold capitalize transition-all ${
                        category === item
                          ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      }`}
                    >
                      {item === "all"
                        ? "All Events"
                        : `${config?.icon || "📅"} ${config?.label || item}`}
                    </button>
                  );
                })}
              </div>

              {/* Upcoming toggle */}
              <button
                type="button"
                onClick={() => handleUpcomingChange(!upcomingOnly)}
                className={`inline-flex w-fit items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                  upcomingOnly
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                <span>{upcomingOnly ? "✓" : "○"}</span>
                Upcoming only
              </button>
            </div>
          </div>
        </div>

        {/* Heading */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {upcomingOnly ? "Upcoming Events" : "All Events"}
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {search
                ? `${filteredEvents.length} matching event${
                    filteredEvents.length !== 1 ? "s" : ""
                  }`
                : `${pagination.total} event${
                    pagination.total !== 1 ? "s" : ""
                  } available`}
            </p>
          </div>

          {category !== "all" && (
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
              {categoryConfig[category]?.label || category}
            </span>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-3xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="h-40 bg-gray-200 dark:bg-gray-800" />

                <div className="p-6">
                  <div className="h-6 w-24 rounded-full bg-gray-200 dark:bg-gray-800" />

                  <div className="mt-4 h-5 w-4/5 rounded bg-gray-200 dark:bg-gray-800" />

                  <div className="mt-3 h-4 w-full rounded bg-gray-200 dark:bg-gray-800" />

                  <div className="mt-2 h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />

                  <div className="mt-6 h-4 w-32 rounded bg-gray-200 dark:bg-gray-800" />
                </div>
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
              Unable to load events
            </h3>

            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredEvents.length === 0 && (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-gray-700 dark:bg-gray-900">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-purple-50 text-4xl dark:bg-purple-900/20">
              📅
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              No events found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
              {search
                ? "No events match your search. Try another keyword."
                : upcomingOnly
                ? "There are currently no upcoming events."
                : "There are currently no events available."}
            </p>

            {(search || upcomingOnly || category !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategory("all");
                  setUpcomingOnly(false);
                  setPage(1);
                }}
                className="mt-5 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Event Cards */}
        {!loading && !error && filteredEvents.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => {
              const config =
                categoryConfig[event?.category] || categoryConfig.other;

              return (
                <Link
                  key={event._id}
                  to={`/events/${event._id}`}
                  className="group overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-900/5 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-purple-800"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-100 dark:from-purple-950/40 dark:via-indigo-950/40 dark:to-blue-950/40">
                    {event?.image?.url ? (
                      <img
                        src={event.image.url}
                        alt={event.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <div className="text-6xl opacity-80">
                          {config.icon}
                        </div>
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                    {/* Category */}
                    <div className="absolute left-4 top-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold backdrop-blur-sm ${config.color}`}
                      >
                        {config.icon}
                        {config.label}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="line-clamp-2 text-lg font-bold leading-7 text-gray-900 transition-colors group-hover:text-purple-600 dark:text-white dark:group-hover:text-purple-400">
                      {event.title}
                    </h3>

                    {event?.description && (
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                        {event.description}
                      </p>
                    )}

                    {/* Date */}
                    <div className="mt-5 flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-lg dark:bg-purple-900/20">
                        📅
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Date
                        </p>

                        <p className="mt-0.5 text-sm font-semibold text-purple-600 dark:text-purple-400">
                          {formatDateRange(
                            event.startDate,
                            event.endDate
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Location */}
                    {event?.location && (
                      <div className="mt-4 flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-lg dark:bg-orange-900/20">
                          📍
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Location
                          </p>

                          <p className="mt-0.5 truncate text-sm font-medium text-gray-700 dark:text-gray-300">
                            {event.location}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
                      <span className="text-xs text-gray-400">
                        Kakarcholi Event
                      </span>

                      <span className="text-sm font-semibold text-purple-600 transition-transform group-hover:translate-x-1 dark:text-purple-400">
                        View Details →
                      </span>
                    </div>
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
                onClick={() =>
                  setPage((current) => Math.max(1, current - 1))
                }
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                ← Previous
              </button>

              <div className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-purple-600 px-3 text-sm font-bold text-white shadow-md">
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