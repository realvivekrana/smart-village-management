import api from "./api";

export const getEvents = (params) => api.get("/events", { params });
export const getEventById = (id) => api.get(`/events/${id}`);
export const createEvent = (data) =>
  api.post("/events", data, { headers: { "Content-Type": "multipart/form-data" } });
export const updateEvent = (id, data) => api.put(`/events/${id}`, data);
export const deleteEvent = (id) => api.delete(`/events/${id}`);
export const toggleInterested = (id) => api.post(`/events/${id}/interested`);

export const getManageEvents = (params) => api.get("/events/manage", { params });
export const getMyEvents = (params) => api.get("/events/mine", { params });
export const reviewEvent = (id, data) => api.patch(`/events/${id}/review`, data);