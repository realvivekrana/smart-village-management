import api from "./api";

export const getEvents = (params) => api.get("/events", { params });
export const getEventById = (id) => api.get(`/events/${id}`);
export const createEvent = (data) =>
  api.post("/events", data, { headers: { "Content-Type": "multipart/form-data" } });
export const updateEvent = (id, data) => api.put(`/events/${id}`, data);
export const deleteEvent = (id) => api.delete(`/events/${id}`);
export const toggleInterested = (id) => api.post(`/events/${id}/interested`);
