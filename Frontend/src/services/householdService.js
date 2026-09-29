import api from "./api";

/*
 * Household (ghar / parivar) API — backend routes se match karta hai:
 *   GET/PUT/DELETE /households/mine
 *   POST           /households/mine/members
 *   PUT/DELETE     /households/mine/members/:memberId
 */

export const getMyHousehold = () => api.get("/households/mine");
export const saveMyHousehold = (data) => api.put("/households/mine", data);
export const deleteMyHousehold = () => api.delete("/households/mine");

export const addFamilyMember = (data) =>
  api.post("/households/mine/members", data);
export const updateFamilyMember = (memberId, data) =>
  api.put(`/households/mine/members/${memberId}`, data);
export const deleteFamilyMember = (memberId) =>
  api.delete(`/households/mine/members/${memberId}`);