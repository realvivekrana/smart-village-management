import api from "./api";

export const getCitizenDashboard = () => api.get("/dashboard/citizen");
export const getBusinessOwnerDashboard = () => api.get("/dashboard/business-owner");
export const getAdminDashboard = () => api.get("/dashboard/admin");