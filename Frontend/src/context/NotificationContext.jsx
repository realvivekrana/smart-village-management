import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { AuthContext } from "./AuthContext";
import * as notificationService from "../services/notificationService";

export const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useContext(AuthContext);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const pollRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);

      const response =
        await notificationService.getMyNotifications({
          page: 1,
          limit: 20,
        });

      const data = response?.data?.data;

      setNotifications(
        Array.isArray(data?.notifications)
          ? data.notifications
          : []
      );

      setUnreadCount(
        typeof data?.unreadCount === "number"
          ? data.unreadCount
          : 0
      );
    } catch (error) {
      console.error(
        "Failed to fetch notifications:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Poll notifications every 60 seconds
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);

      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }

      return undefined;
    }

    fetchNotifications();

    pollRef.current = setInterval(() => {
      fetchNotifications();
    }, 60000);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [user, fetchNotifications]);

  // Mark single notification as read
  const markRead = useCallback(async (id) => {
    if (!id) return;

    try {
      await notificationService.markAsRead(id);

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === id
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      );

      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error
      );

      throw error;
    }
  }, []);

  // Mark all notifications as read
  const markAllRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error
      );

      throw error;
    }
  }, []);

  // Delete notification
  const remove = useCallback(async (id) => {
    if (!id) return;

    try {
      await notificationService.deleteNotification(id);

      setNotifications((previous) => {
        const notificationToRemove = previous.find(
          (notification) => notification._id === id
        );

        if (
          notificationToRemove &&
          !notificationToRemove.isRead
        ) {
          setUnreadCount((count) =>
            Math.max(0, count - 1)
          );
        }

        return previous.filter(
          (notification) => notification._id !== id
        );
      });
    } catch (error) {
      console.error(
        "Failed to delete notification:",
        error
      );

      throw error;
    }
  }, []);

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markRead,
    markAllRead,
    remove,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}