import api from "./api";

export const getGovernmentContacts = (params) =>
  api.get("/government-contacts", { params });

export const getGovernmentContactById = (id) =>
  api.get(`/government-contacts/${id}`);

export const createGovernmentContact = (data) =>
  api.post("/government-contacts", data);

export const updateGovernmentContact = (id, data) =>
  api.put(`/government-contacts/${id}`, data);

export const deleteGovernmentContact = (id) =>
  api.delete(`/government-contacts/${id}`);