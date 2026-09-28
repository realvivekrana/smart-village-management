import api from "./api";

export const getCertificates = (params) => api.get("/certificates", { params });
export const getCertificateById = (id) => api.get(`/certificates/${id}`);
export const createCertificate = (data) =>
  api.post("/certificates", data, { headers: { "Content-Type": "multipart/form-data" } });
export const updateCertificateStatus = (id, data) => api.patch(`/certificates/${id}/status`, data);
export const cancelCertificate = (id) => api.patch(`/certificates/${id}/cancel`);
export const deleteCertificate = (id) => api.delete(`/certificates/${id}`);