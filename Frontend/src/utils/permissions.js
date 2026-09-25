import { ROLES } from "./constants";

export const isAdmin = (user) =>
  user && [ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(user.role);

export const isSuperAdmin = (user) =>
  user && user.role === ROLES.SUPER_ADMIN;

export const isBusinessOwner = (user) =>
  user && [ROLES.BUSINESS_OWNER, ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(user.role);

export const isCitizen = (user) =>
  user && user.role === ROLES.CITIZEN;

export const canManageContent = (user) => isAdmin(user);

export const canPostJob = (user) =>
  user && [ROLES.BUSINESS_OWNER, ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(user.role);

export const getDashboardPath = (user) => {
  if (!user) return "/login";
  if (isAdmin(user)) return "/admin/dashboard";
  if (user.role === ROLES.BUSINESS_OWNER) return "/business-owner/dashboard";
  return "/citizen/dashboard";
};
