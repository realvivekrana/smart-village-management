import api from "./api";

export const getNotices = (params) => api.get("/notices", { params });
export const getNoticeById = (id) => api.get(`/notices/${id}`);
export const createNotice = (data) => api.post("/notices", data);
export const updateNotice = (id, data) => api.put(`/notices/${id}`, data);
export const deleteNotice = (id) => api.delete(`/notices/${id}`);

// admin: every status (?status=pending|approved|rejected)
export const getManageNotices = (params) => api.get("/notices/manage", { params });
// logged-in user's own submissions
export const getMyNotices = (params) => api.get("/notices/mine", { params });
// admin approves / rejects a citizen submission
export const reviewNotice = (id, data) => api.patch(`/notices/${id}/review`, data);