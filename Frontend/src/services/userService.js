import api from "./api";

export const getMyProfile = () => api.get("/users/profile");
export const updateMyProfile = (data) => api.put("/users/profile", data);
export const changePassword = (data) => api.put("/users/change-password", data);

// Profile photo (admin + citizen dono)
export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append("avatar", file);
  return api.post("/users/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const removeAvatar = () => api.delete("/users/avatar");

// Admin
export const getAllUsers = () => api.get("/users");
export const getUserById = (id) => api.get(`/users/${id}`);
export const toggleUserActive = (id) => api.patch(`/users/${id}/toggle-active`);
export const updateUserRole = (id, role) => api.patch(`/users/${id}/role`, { role });
export const deleteUser = (id) => api.delete(`/users/${id}`);