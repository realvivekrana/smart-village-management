/*
| Shared filters so unapproved citizen submissions never leak into public
| listings, the home page or dashboards.
| Old documents that have no `status` field count as approved.
*/
const APPROVED_ONLY = { status: { $nin: ["pending", "rejected"] } };

const notExpired = (now = new Date()) => ({
  $or: [{ expiresAt: null }, { expiresAt: { $exists: false } }, { expiresAt: { $gte: now } }],
});

const pick = (source = {}, allowed = []) =>
  allowed.reduce((out, key) => {
    if (source[key] !== undefined) out[key] = source[key];
    return out;
  }, {});

module.exports = { APPROVED_ONLY, notExpired, pick };