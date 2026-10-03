const mongoose = require("mongoose");

/*
|--------------------------------------------------------------------------
| ActivityEvent
|--------------------------------------------------------------------------
| Har ek kaam ki ek entry: page dekha, login kiya, complaint file ki,
| galat password dala, logout kiya, error aaya ...
|
| Password / OTP / request body kabhi store nahi hota.
*/

const retentionSeconds =
  (Number(process.env.ACTIVITY_RETENTION_DAYS) || 60) * 24 * 60 * 60;

const EVENT_TYPES = [
  "page_view",
  "action",
  "login",
  "login_failed",
  "logout",
  "register",
  "password_reset",
  "error",
];

const activityEventSchema = new mongoose.Schema({
  sessionId: { type: String, default: "", index: true },
  visitorId: { type: String, default: "" },

  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  userName: { type: String, default: "" },
  userRole: { type: String, default: "" },

  type: { type: String, enum: EVENT_TYPES, required: true },
  label: { type: String, default: "" },

  method: { type: String, default: "" },
  path: { type: String, default: "" },
  route: { type: String, default: "" }, // ids ":id" se replace (grouping ke liye)
  statusCode: { type: Number, default: null },
  durationMs: { type: Number, default: null },

  ip: { type: String, default: "" },
  browser: { type: String, default: "" },
  os: { type: String, default: "" },
  device: { type: String, default: "" },
  isBot: { type: Boolean, default: false },

  meta: { type: mongoose.Schema.Types.Mixed, default: undefined },

  createdAt: { type: Date, default: Date.now },
});

activityEventSchema.index({ user: 1, createdAt: -1 });
activityEventSchema.index({ sessionId: 1, createdAt: 1 });
activityEventSchema.index({ type: 1, createdAt: -1 });
// TTL index: purana data auto-delete (sorting ke liye bhi kaam aata hai)
activityEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: retentionSeconds });

const ActivityEvent = mongoose.model("ActivityEvent", activityEventSchema);

ActivityEvent.EVENT_TYPES = EVENT_TYPES;

module.exports = ActivityEvent;