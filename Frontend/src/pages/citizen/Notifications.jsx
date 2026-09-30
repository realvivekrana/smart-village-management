import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { NotificationContext } from "../../context/NotificationContext";
import useAuth from "../../hooks/useAuth";
import { getNotificationTarget } from "../../utils/notificationRoutes";
import { formatRelative } from "../../utils/formatDate";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";
import BackButton from "../../components/common/BackButton";

const typeIcons = {
  complaint_update: "📋", job_application: "💼", new_notice: "📢",
  new_event: "📅", new_job: "💼", business_status: "🏪",
  community_like: "❤️", community_comment: "💬", review: "⭐",
  system: "⚙️", general: "🔔",
};

export default function Notifications() {
  const { notifications, unreadCount, loading, markRead, markAllRead, remove } = useContext(NotificationContext);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Click: read mark karo (wait kiye bina) aur us action ke page par le jao
  const handleOpen = (n) => {
    if (!n.isRead) markRead(n._id).catch(() => {});
    const target = getNotificationTarget(n, user);
    if (target) navigate(target);
  };

  return (
    <div className="page-container max-w-2xl">
      <div className="mb-4"><BackButton to="/citizen/dashboard" label="Back to Dashboard" /></div>
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
          {notifications.map((n) => {
            const target = getNotificationTarget(n, user);
            return (
              <div
                key={n._id}
                role={target ? "link" : undefined}
                tabIndex={target ? 0 : undefined}
                className={`card p-4 flex gap-3 ${!n.isRead ? "border-l-4 border-primary-500" : ""} ${
                  target ? "cursor-pointer transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500" : ""
                }`}
                onClick={() => (target ? handleOpen(n) : !n.isRead && markRead(n._id).catch(() => {}))}
                onKeyDown={(e) => {
                  if (e.target !== e.currentTarget) return; // ✕ button ka key event ignore
                  if (target && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    handleOpen(n);
                  }
                }}
              >
                <span className="text-2xl">{typeIcons[n.type] || "🔔"}</span>
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-900 dark:text-white">{n.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{n.message}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-gray-400">{formatRelative(n.createdAt)}</p>
                    {target && <span className="text-xs font-medium text-primary-600 dark:text-primary-400">Dekhein →</span>}
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Delete notification"
                  onClick={(e) => { e.stopPropagation(); remove(n._id); }}
                  className="text-gray-300 hover:text-red-500 shrink-0"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}