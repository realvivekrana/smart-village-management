import api from "./api";

export const getPosts = (params) => api.get("/community", { params });
export const getPostById = (id) => api.get(`/community/${id}`);
export const getMyPosts = (params) => api.get("/community/my", { params });
export const createPost = (data) =>
  api.post("/community", data, { headers: { "Content-Type": "multipart/form-data" } });
export const updatePost = (id, data) => api.put(`/community/${id}`, data);
export const deletePost = (id) => api.delete(`/community/${id}`);
export const toggleLike = (id) => api.post(`/community/${id}/like`);

export const getComments = (postId, params) =>
  api.get(`/community/${postId}/comments`, { params });
export const createComment = (postId, data) =>
  api.post(`/community/${postId}/comments`, data);
export const updateComment = (id, data) => api.put(`/comments/${id}`, data);
export const deleteComment = (id) => api.delete(`/comments/${id}`);
export const toggleCommentLike = (id) => api.post(`/comments/${id}/like`);
