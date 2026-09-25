import api from "./api";

export const getComplaints = (params) => api.get("/complaints", { params });
export const getComplaintById = (id) => api.get(`/complaints/${id}`);
export const createComplaint = (data) =>
  api.post("/complaints", data, { headers: { "Content-Type": "multipart/form-data" } });
export const updateComplaintStatus = (id, data) => api.patch(`/complaints/${id}/status`, data);
export const assignComplaint = (id, data) => api.patch(`/complaints/${id}/assign`, data);
export const deleteComplaint = (id) => api.delete(`/complaints/${id}`);
