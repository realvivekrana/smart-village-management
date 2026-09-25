import { Link } from "react-router-dom";
import { formatDateRange } from "../../utils/formatDate";

export default function EventCard({ event }) {
  const isUpcoming = new Date() < new Date(event.startDate);
  const isOngoing = new Date() >= new Date(event.startDate) && new Date() <= new Date(event.endDate);

  return (
    <Link to={`/events/${event._id}`} className="card p-5 block hover:shadow-md transition-shadow">
      {event.images?.[0]?.url && (
        <img src={event.images[0].url} alt={event.title} className="w-full h-40 object-cover rounded-lg mb-4" />
      )}
      <div className="flex items-center gap-2 mb-2">
        <span className="badge badge-blue capitalize">{event.category}</span>
        {isOngoing && <span className="badge bg-green-100 text-green-700 dark:bg-green-900/30">🟢 Live</span>}
        {isUpcoming && <span className="badge badge-yellow">Upcoming</span>}
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">{event.title}</h3>
      <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">
        📅 {formatDateRange(event.startDate, event.endDate)}
      </p>
      <p className="text-sm text-gray-500 mt-1 line-clamp-1">📍 {event.location}</p>
      {event.attendeeCount > 0 && (
        <p className="text-xs text-gray-400 mt-2">👥 {event.attendeeCount} interested</p>
      )}
    </Link>
  );
}
