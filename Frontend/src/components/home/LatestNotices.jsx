import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNotices } from "../../services/noticeService";
import { formatRelative } from "../../utils/formatDate";

const priorityBadge = {
  urgent: "badge-red",
  high: "badge-yellow",
  normal: "badge-blue",
  low: "badge-gray",
};

export default function LatestNotices() {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    getNotices({ page: 1, limit: 4 }).then((r) => setNotices(r.data.data.notices)).catch(() => {});
  }, []);

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">📢 Latest Notices</h2>
          <Link to="/notices" className="text-sm text-primary-600 hover:underline font-medium">View all →</Link>
        </div>
        {notices.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No notices yet</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {notices.map((n) => (
              <Link key={n._id} to={`/notices/${n._id}`} className="card p-4 hover:shadow-md transition-shadow block">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 text-sm">{n.title}</h3>
                  <span className={`${priorityBadge[n.priority]} shrink-0`}>{n.priority}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">{n.content}</p>
                <p className="text-xs text-gray-400">{formatRelative(n.publishedAt)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
