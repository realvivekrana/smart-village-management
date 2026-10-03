import api from "./api";

// Sirf admin ke liye (tracking khud utils/activityTracker.js se hoti hai)
export const getActivityOverview = (params) => api.get("/activity/overview", { params });
export const getLiveVisitors = (params) => api.get("/activity/live", { params });
export const getActivitySessions = (params) => api.get("/activity/sessions", { params });
export const getActivitySession = (sessionId) => api.get(`/activity/sessions/${sessionId}`);
export const getActivityEvents = (params) => api.get("/activity/events", { params });
export const cleanupActivity = (days) => api.delete("/activity/cleanup", { params: { days } });