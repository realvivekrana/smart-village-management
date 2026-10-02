import api from "./api";

// Public (active contacts only)
export const getSpecialContacts = (params) =>
  api.get("/special-contacts", { params });

// Admin
export const getAllSpecialContacts = (params) =>
  api.get("/special-contacts/admin/all", { params });

export const getSpecialContactMeta = () =>
  api.get("/special-contacts/admin/meta");

export const createSpecialContact = (data) =>
  api.post("/special-contacts", data);

export const updateSpecialContact = (id, data) =>
  api.put(`/special-contacts/${id}`, data);

export const updateSpecialContactStatus = (id, isActive) =>
  api.patch(`/special-contacts/${id}/status`, { isActive });

export const deleteSpecialContact = (id) =>
  api.delete(`/special-contacts/${id}`);