import { Link } from "react-router-dom";
import { formatRelative } from "../../utils/formatDate";
import { PRIORITY_COLORS } from "../../utils/constants";

export default function NoticeCard({ notice }) {
  return (
    <Link to={`/notices/${notice._id}`} className="card p-5 block hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 text-sm leading-snug">
          {notice.title}
        </h3>
        <span className={`${PRIORITY_COLORS[notice.priority]} shrink-0 capitalize`}>
          {notice.priority}
        </span>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 mb-3">{notice.content}</p>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span className="badge badge-blue capitalize">{notice.category?.replace("_", " ")}</span>
        <span>{formatRelative(notice.publishedAt)}</span>
      </div>
    </Link>
  );
}
