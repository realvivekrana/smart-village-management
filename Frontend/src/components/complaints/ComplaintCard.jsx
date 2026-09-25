import { Link } from "react-router-dom";
import { formatRelative } from "../../utils/formatDate";
import { STATUS_COLORS, PRIORITY_COLORS } from "../../utils/constants";

export default function ComplaintCard({ complaint }) {
  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">{complaint.title}</h3>
        <div className="flex gap-2 shrink-0">
          <span className={`${STATUS_COLORS[complaint.status]} capitalize`}>{complaint.status.replace("_"," ")}</span>
          <span className={`${PRIORITY_COLORS[complaint.priority]} capitalize`}>{complaint.priority}</span>
        </div>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{complaint.description}</p>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="badge badge-blue capitalize">{complaint.category}</span>
        <span className="text-gray-400">{formatRelative(complaint.createdAt)}</span>
      </div>
    </div>
  );
}
