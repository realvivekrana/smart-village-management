const mongoose = require("mongoose");

/*
|--------------------------------------------------------------------------
| ActivitySession
|--------------------------------------------------------------------------
| Ek visitor ka ek "visit". Bina login (guest) aur login dono ke liye.
|
| - visitorId : browser ki permanent id (localStorage) -> wahi banda dobara aaye
|               to pehchaan sakte hain (login ke bina bhi).
| - sessionId : ek visit. 30 min inactivity ke baad naya session.
| - user      : login ke baad is session se link ho jata hai.
|
| Purana data apne aap delete hota hai (ACTIVITY_RETENTION_DAYS, default 60).
*/

const retentionSeconds =
  (Number(process.env.ACTIVITY_RETENTION_DAYS) || 60) * 24 * 60 * 60;

const activitySessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  visitorId: { type: String, required: true, index: true },

  // Login info (guest = user null)
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
  userName: { type: String, default: "" },
  userEmail: { type: String, default: "" },
  userRole: { type: String, default: "" },
  loggedInAt: { type: Date, default: null },
  loggedOutAt: { type: Date, default: null },

  // Device / network
  ip: { type: String, default: "" },
  userAgent: { type: String, default: "", maxlength: 300 },
  browser: { type: String, default: "Unknown" },
  os: { type: String, default: "Unknown" },
  device: { type: String, default: "desktop" }, // desktop | mobile | tablet | bot
  isBot: { type: Boolean, default: false },
  language: { type: String, default: "" },
  screen: { type: String, default: "" },
  referrer: { type: String, default: "" },

  // Activity summary
  entryPath: { type: String, default: "/" },
  currentPath: { type: String, default: "/" },
  lastAction: { type: String, default: "" },
  lastActionAt: { type: Date, default: null },
  pageViews: { type: Number, default: 0 },
  actions: { type: Number, default: 0 },
  activeSeconds: { type: Number, default: 0 },

  startedAt: { type: Date, default: Date.now, index: true },
  lastSeenAt: { type: Date, default: Date.now }, // TTL index neeche
  endedAt: { type: Date, default: null },
});

activitySessionSchema.index({ lastSeenAt: 1 }, { expireAfterSeconds: retentionSeconds });

module.exports = mongoose.model("ActivitySession", activitySessionSchema);