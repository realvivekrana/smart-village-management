import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getEvents } from "../../services/eventService";
import { formatDateRange } from "../../utils/formatDate";

export default function UpcomingEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getEvents({
      page: 1,
      limit: 3,
      upcoming: "true",
    })
      .then((res) => {
        if (!mounted) return;

        const data = res?.data?.data;

        setEvents(
          Array.isArray(data?.events)
            ? data.events
            : Array.isArray(data)
              ? data
              : []
        );
      })
      .catch(() => {
        if (mounted) setEvents([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-slate-50 py-16 dark:bg-slate-950">
      {/* Decorative background */}
      <div className="pointer-events-none absolute -left-24 top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Community Updates
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Upcoming Events
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
              Stay connected with cultural, social and community events
              happening in Kakarcholi.
            </p>
          </div>

          <Link
            to="/events"
            className="group inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-600 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-500 dark:hover:text-blue-400"
          >
            View all events
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="h-48 bg-slate-200 dark:bg-slate-800" />

                <div className="space-y-4 p-6">
                  <div className="h-5 w-24 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-6 w-4/5 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && events.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl dark:bg-blue-900/30">
              📅
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No upcoming events
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
              There are currently no upcoming community events available.
              Please check again later.
            </p>
          </div>
        )}

        {/* Events */}
        {!loading && events.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const image =
                event?.image?.url ||
                event?.image ||
                event?.coverImage?.url ||
                event?.coverImage ||
                event?.images?.[0]?.url ||
                event?.images?.[0];

              return (
                <Link
                  key={event._id}
                  to={`/events/${event._id}`}
                  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-800"
                >
                  {/* Image */}
                  <div className="relative h-52 overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600">
                    {image ? (
                      <img
                        src={image}
                        alt={event.title || "Village event"}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-6xl drop-shadow-lg">📅</span>
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                    {/* Category */}
                    {event.category && (
                      <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold capitalize text-blue-700 shadow-sm backdrop-blur-sm dark:bg-slate-900/90 dark:text-blue-300">
                        {event.category}
                      </span>
                    )}

                    {/* Event icon */}
                    <div className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/95 text-xl shadow-lg backdrop-blur-sm dark:bg-slate-900/90">
                      📅
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="line-clamp-2 text-xl font-bold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                      {event.title || "Community Event"}
                    </h3>

                    {/* Date */}
                    {(event.startDate || event.endDate) && (
                      <div className="mt-4 flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm dark:bg-blue-900/30">
                          🗓️
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {formatDateRange(
                              event.startDate,
                              event.endDate
                            )}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            Event date
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Location */}
                    {event.location && (
                      <div className="mt-3 flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-sm dark:bg-red-900/30">
                          📍
                        </div>

                        <p className="pt-2 text-sm text-slate-600 dark:text-slate-400">
                          {event.location}
                        </p>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        View details
                      </span>

                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all group-hover:bg-blue-600 group-hover:text-white dark:bg-slate-800 dark:text-slate-300">
                        →
                      </span>
                    </div>
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