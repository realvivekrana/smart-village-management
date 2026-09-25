import api from "./api";

export const getMyNotifications = (params) => api.get("/notifications", { params });
export const markAsRead = (id) => api.patch(`/notifications/${id}/read`);
export const markAllAsRead = () => api.patch("/notifications/read-all");
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);
export const clearAllNotifications = () => api.delete("/notifications");
