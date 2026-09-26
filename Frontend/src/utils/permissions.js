import { ROLES } from "./constants";

export const isAdmin = (user) =>
  user && user.role === ROLES.ADMIN;

export const isCitizen = (user) =>
  user && user.role === ROLES.CITIZEN;

export const canManageContent = (user) => isAdmin(user);

// Har citizen ko business/job posting ka access hai (admin bhi kar sakta hai).
export const canPostJob = (user) =>
  user && [ROLES.CITIZEN, ROLES.ADMIN].includes(user.role);

export const getDashboardPath = (user) => {
  if (!user) return "/login";
  if (isAdmin(user)) return "/admin/dashboard";
  return "/citizen/dashboard";
};