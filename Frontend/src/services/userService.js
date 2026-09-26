import api from "./api";

export const getMyProfile = () => api.get("/users/profile");
export const updateMyProfile = (data) => api.put("/users/profile", data);
export const changePassword = (data) => api.put("/users/change-password", data);

// Admin
export const getAllUsers = () => api.get("/users");
export const getUserById = (id) => api.get(`/users/${id}`);
export const toggleUserActive = (id) => api.patch(`/users/${id}/toggle-active`);
export const updateUserRole = (id, role) => api.patch(`/users/${id}/role`, { role });
export const deleteUser = (id) => api.delete(`/users/${id}`);