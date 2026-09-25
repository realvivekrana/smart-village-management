import api from "./api";

export const getBusinesses = (params) => api.get("/businesses", { params });
export const getBusinessById = (id) => api.get(`/businesses/${id}`);
export const getMyBusiness = () => api.get("/businesses/my");
export const getAllBusinessesAdmin = (params) => api.get("/businesses/admin/all", { params });
export const createBusiness = (data) =>
  api.post("/businesses", data, { headers: { "Content-Type": "multipart/form-data" } });
export const updateBusiness = (id, data) => api.put(`/businesses/${id}`, data);
export const reviewBusiness = (id, data) => api.patch(`/businesses/${id}/review`, data);
export const deleteBusiness = (id) => api.delete(`/businesses/${id}`);

export const getBusinessReviews = (businessId, params) =>
  api.get(`/businesses/${businessId}/reviews`, { params });
export const createReview = (businessId, data) =>
  api.post(`/businesses/${businessId}/reviews`, data);
export const updateReview = (id, data) => api.put(`/reviews/${id}`, data);
export const deleteReview = (id) => api.delete(`/reviews/${id}`);
export const respondToReview = (id, data) => api.post(`/reviews/${id}/respond`, data);
