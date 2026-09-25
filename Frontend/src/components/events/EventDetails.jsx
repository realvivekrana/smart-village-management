import { formatDateTime, formatDateRange } from "../../utils/formatDate";
import Button from "../common/Button";
import useAuth from "../../hooks/useAuth";

export default function EventDetails({ event, onToggleInterested, toggling }) {
  const { user } = useAuth();
  const interested = event.interestedUsers?.some((id) => id === user?._id || id?._id === user?._id);

  return (
    <article className="card p-6 lg:p-8">
      {event.images?.[0]?.url && (
        <img src={event.images[0].url} alt={event.title} className="w-full h-64 object-cover rounded-xl mb-6" />
      )}
      <span className="badge badge-blue capitalize mb-3 inline-block">{event.category}</span>
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">{event.title}</h1>

      <div className="grid sm:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl text-sm">
        <div><span className="text-gray-500">📅 Date:</span> <span className="font-medium ml-1">{formatDateRange(event.startDate, event.endDate)}</span></div>
        <div><span className="text-gray-500">📍 Location:</span> <span className="font-medium ml-1">{event.location}</span></div>
        {event.organizer && <div><span className="text-gray-500">🧑‍💼 Organizer:</span> <span className="font-medium ml-1">{event.organizer}</span></div>}
        <div><span className="text-gray-500">👥 Interested:</span> <span className="font-medium ml-1">{event.attendeeCount}</span></div>
      </div>

      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed mb-6">{event.description}</p>

      {user && (
        <Button
          variant={interested ? "secondary" : "primary"}
          onClick={onToggleInterested}
          loading={toggling}
        >
          {interested ? "✓ Interested" : "Mark as Interested"}
        </Button>
      )}
    </article>
  );
}
