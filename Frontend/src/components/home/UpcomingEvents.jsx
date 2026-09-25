import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getEvents } from "../../services/eventService";
import { formatDateRange } from "../../utils/formatDate";

export default function UpcomingEvents() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    getEvents({ page: 1, limit: 3, upcoming: "true" }).then((r) => setEvents(r.data.data.events)).catch(() => {});
  }, []);

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">📅 Upcoming Events</h2>
          <Link to="/events" className="text-sm text-primary-600 hover:underline font-medium">View all →</Link>
        </div>
        {events.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No upcoming events</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((ev) => (
              <Link key={ev._id} to={`/events/${ev._id}`} className="card p-5 hover:shadow-md transition-shadow block">
                <span className="badge badge-green text-xs mb-3 inline-block capitalize">{ev.category}</span>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">{ev.title}</h3>
                <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                  📅 {formatDateRange(ev.startDate, ev.endDate)}
                </p>
                <p className="text-sm text-gray-500 mt-1">📍 {ev.location}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
