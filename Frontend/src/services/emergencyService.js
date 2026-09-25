import api from "./api";

export const getEmergencyContacts = (params) => api.get("/emergency", { params });