import api from "./api";

const multipart = { headers: { "Content-Type": "multipart/form-data" } };

// Public — sirf approved
export const getListings = (params) => api.get("/listings", { params });

// Logged-in
export const getMyListings = (params) => api.get("/listings/my", { params });
export const createListing = (formData) => api.post("/listings", formData, multipart);
export const updateListing = (id, data) => api.put(`/listings/${id}`, data);
export const toggleListingClosed = (id) => api.patch(`/listings/${id}/close`);
export const deleteListing = (id) => api.delete(`/listings/${id}`);

// Admin
export const getAllListingsAdmin = (params) => api.get("/listings/admin/all", { params });
export const reviewListing = (id, data) => api.patch(`/listings/${id}/review`, data);