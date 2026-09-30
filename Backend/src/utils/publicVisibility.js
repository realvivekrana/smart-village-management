/*
| Shared filters so unapproved citizen submissions never leak into public
| listings, the home page or dashboards.
| Old documents that have no `status` field count as approved.
*/
const APPROVED_ONLY = { status: { $nin: ["pending", "rejected"] } };

/*
| Citizen ki post / event / notice / photo / business ab seedhe sabko dikhti hai.
| Admin baad me kisi ko bhi reject ya delete kar sakta hai (moderation).
|
| Purana "admin approve kare tabhi dikhe" behaviour wapas chahiye ho to
| Render/.env me  REQUIRE_ADMIN_APPROVAL=true  set karo.
*/
const REQUIRE_APPROVAL = String(process.env.REQUIRE_ADMIN_APPROVAL || "").toLowerCase() === "true";

// Naye submission ka starting status (admin ho ya citizen)
const submissionStatus = (user) =>
  user?.role === "admin" || !REQUIRE_APPROVAL ? "approved" : "pending";

const notExpired = (now = new Date()) => ({
  $or: [{ expiresAt: null }, { expiresAt: { $exists: false } }, { expiresAt: { $gte: now } }],
});

const pick = (source = {}, allowed = []) =>
  allowed.reduce((out, key) => {
    if (source[key] !== undefined) out[key] = source[key];
    return out;
  }, {});

module.exports = { APPROVED_ONLY, REQUIRE_APPROVAL, submissionStatus, notExpired, pick };