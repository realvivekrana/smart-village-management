import { useContext } from "react";
import { NotificationContext } from "../../context/NotificationContext";
import { formatRelative } from "../../utils/formatDate";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";

const typeIcons = {
  complaint_update: "📋", job_application: "💼", new_notice: "📢",
  new_event: "📅", new_job: "💼", business_status: "🏪",
  community_like: "❤️", community_comment: "💬", review: "⭐",
  system: "⚙️", general: "🔔",
};

export default function Notifications() {
  const { notifications, unreadCount, loading, markRead, markAllRead, remove } = useContext(NotificationContext);

  return (
    <div className="page-container max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title">🔔 Notifications {unreadCount > 0 && `(${unreadCount} unread)`}</h1>
        {notifications.length > 0 && (
          <Button variant="secondary" size="sm" onClick={markAllRead}>Mark all read</Button>
        )}
      </div>

      {loading ? (
        <Loader />
      ) : notifications.length === 0 ? (
        <EmptyState icon="🔔" title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`card p-4 flex gap-3 ${!n.isRead ? "border-l-4 border-primary-500" : ""}`}
              onClick={() => !n.isRead && markRead(n._id)}
            >
              <span className="text-2xl">{typeIcons[n.type] || "🔔"}</span>
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-900 dark:text-white">{n.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{formatRelative(n.createdAt)}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); remove(n._id); }}
                className="text-gray-300 hover:text-red-500 shrink-0"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}