import { formatDateTime } from "../../utils/formatDate";
import { STATUS_COLORS } from "../../utils/constants";

export default function ComplaintTimeline({ timeline = [] }) {
  if (timeline.length === 0) return null;

  return (
    <div className="card p-6">
      <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Timeline</h2>
      <ol className="relative border-l-2 border-gray-200 dark:border-gray-700 space-y-6">
        {timeline.map((entry, i) => (
          <li key={entry._id || i} className="ml-6">
            <div className="absolute -left-2.5 w-5 h-5 rounded-full bg-primary-600 border-2 border-white dark:border-gray-800 flex items-center justify-center" />
            <div className="mb-1 flex items-center gap-2">
              <span className={`${STATUS_COLORS[entry.status]} capitalize text-xs`}>
                {entry.status.replace("_", " ")}
              </span>
              <span className="text-xs text-gray-400">{formatDateTime(entry.createdAt)}</span>
            </div>
            {entry.note && <p className="text-sm text-gray-600 dark:text-gray-300">{entry.note}</p>}
            {entry.updatedBy?.name && (
              <p className="text-xs text-gray-400 mt-0.5">by {entry.updatedBy.name}</p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
