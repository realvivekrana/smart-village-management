import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import * as notificationService from "../services/notificationService";

export const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const pollRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await notificationService.getMyNotifications({ page: 1, limit: 20 });
      setNotifications(res.data.data.notifications);
      setUnreadCount(res.data.data.unreadCount);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Poll every 60s when user is logged in
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    fetchNotifications();
    pollRef.current = setInterval(fetchNotifications, 60000);
    return () => clearInterval(pollRef.current);
  }, [user, fetchNotifications]);

  const markRead = useCallback(async (id) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  const remove = useCallback(async (id) => {
    await notificationService.deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    setUnreadCount((c) =>
      notifications.find((n) => n._id === id && !n.isRead) ? Math.max(0, c - 1) : c
    );
  }, [notifications]);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, loading, fetchNotifications, markRead, markAllRead, remove }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
