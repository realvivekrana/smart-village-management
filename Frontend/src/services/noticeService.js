import api from "./api";

export const getNotices = (params) => api.get("/notices", { params });
export const getNoticeById = (id) => api.get(`/notices/${id}`);
export const createNotice = (data) => api.post("/notices", data);
export const updateNotice = (id, data) => api.put(`/notices/${id}`, data);
export const deleteNotice = (id) => api.delete(`/notices/${id}`);
