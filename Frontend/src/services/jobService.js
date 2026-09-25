import api from "./api";

export const getJobs = (params) => api.get("/jobs", { params });
export const getJobById = (id) => api.get(`/jobs/${id}`);
export const getMyJobs = (params) => api.get("/jobs/my", { params });
export const createJob = (data) => api.post("/jobs", data);
export const updateJob = (id, data) => api.put(`/jobs/${id}`, data);
export const deleteJob = (id) => api.delete(`/jobs/${id}`);

export const applyForJob = (jobId, data) =>
  api.post(`/jobs/${jobId}/apply`, data, { headers: { "Content-Type": "multipart/form-data" } });
export const getJobApplications = (jobId, params) =>
  api.get(`/jobs/${jobId}/applications`, { params });
export const getMyApplications = (params) => api.get("/applications/my", { params });
export const updateApplicationStatus = (id, data) => api.patch(`/applications/${id}/status`, data);
export const withdrawApplication = (id) => api.delete(`/applications/${id}`);
