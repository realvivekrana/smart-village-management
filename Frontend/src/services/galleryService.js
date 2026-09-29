import api from "./api";

const multipart = { headers: { "Content-Type": "multipart/form-data" } };

// Public — sirf approved
export const getGalleryPhotos = (params) => api.get("/gallery", { params });

// Logged-in
export const getMyPhotos = (params) => api.get("/gallery/my", { params });
export const uploadPhotos = (formData) => api.post("/gallery", formData, multipart);
export const deletePhoto = (id) => api.delete(`/gallery/${id}`);

// Admin
export const getAllPhotosAdmin = (params) => api.get("/gallery/admin/all", { params });
export const reviewPhoto = (id, data) => api.patch(`/gallery/${id}/review`, data);