const ActivitySession = require("../models/ActivitySession");
const ActivityEvent = require("../models/ActivityEvent");
const { parseUserAgent } = require("../utils/userAgent");
const { normalizeRoute } = require("../utils/activityLabels");
const logger = require("../utils/logger");

/*
|--------------------------------------------------------------------------
| Activity Service
|--------------------------------------------------------------------------
| Tracking kabhi bhi user ka asli kaam rok nahi sakti: har function apne
| errors khud pakad leta hai.
*/

const ID_REGEX = /^[A-Za-z0-9_-]{8,64}$/;

const cut = (value, max) => String(value ?? "").slice(0, max);
const validId = (id) => (typeof id === "string" && ID_REGEX.test(id) ? id : "");

// Sirf pathname rakhte hain (query me token / search text ho sakta hai)
const cleanPath = (path) => {
  const p = String(path || "/").split("?")[0].split("#")[0];
  return cut(p.startsWith("/") ? p : `/${p}`, 200);
};

const getClientInfo = (req) => {
  const userAgent = cut(req.headers["user-agent"], 300);
  return { ip: cut(req.ip, 64), userAgent, ...parseUserAgent(userAgent) };
};

const userFields = (user) =>
  user
    ? {
        user: user._id || user.id,
        userName: cut(user.name, 60),
        userRole: cut(user.role, 20),
      }
    : {};

/*
| Session create/update (upsert). user diya ho to session us user se link.
*/
const touchSession = async (req, opts = {}) => {
  const sessionId = validId(opts.sessionId);
  const visitorId = validId(opts.visitorId);
  if (!sessionId || !visitorId) return null;

  const now = new Date();
  const info = getClientInfo(req);
  const path = cleanPath(opts.path);

  const set = {
    lastSeenAt: now,
    endedAt: opts.ended ? now : null,
    ip: info.ip,
  };
  if (opts.path) set.currentPath = path;
  if (opts.lastAction) {
    set.lastAction = cut(opts.lastAction, 120);
    set.lastActionAt = now;
  }
  if (opts.user) {
    Object.assign(set, userFields(opts.user), {
      userEmail: cut(opts.user.email, 100),
      loggedOutAt: null,
    });
  }
  if (opts.loggedOut) set.loggedOutAt = now;

  const update = {
    $set: set,
    $setOnInsert: {
      visitorId,
      startedAt: now,
      userAgent: info.userAgent,
      browser: info.browser,
      os: info.os,
      device: info.device,
      isBot: info.isBot,
      language: cut(opts.language, 20),
      screen: cut(opts.screen, 20),
      referrer: cut(opts.referrer, 200),
      entryPath: path,
    },
    $inc: {
      pageViews: opts.pageView ? 1 : 0,
      actions: opts.action ? 1 : 0,
      activeSeconds: Math.min(Math.max(Number(opts.activeSeconds) || 0, 0), 90),
    },
  };

  try {
    const doc = await ActivitySession.findOneAndUpdate({ sessionId }, update, {
      upsert: true,
      new: true,
    });

    // Pehli baar login link hua to loggedInAt set karo
    if (opts.user && doc && !doc.loggedInAt) {
      await ActivitySession.updateOne(
        { sessionId, loggedInAt: null },
        { $set: { loggedInAt: now } }
      );
      doc.loggedInAt = now;
    }

    return doc;
  } catch (error) {
    // 2 requests ek saath upsert karein to duplicate key aa sakta hai - ek retry
    if (error.code === 11000) {
      try {
        return await ActivitySession.findOneAndUpdate({ sessionId }, update, { new: true });
      } catch (e) {
        logger.warn("activity touchSession retry failed:", e.message);
      }
      return null;
    }
    logger.warn("activity touchSession failed:", error.message);
    return null;
  }
};

/*
| Ek event save
*/
const logEvent = async (req, data = {}) => {
  try {
    const info = getClientInfo(req);
    const path = cleanPath(data.path);

    await ActivityEvent.create({
      sessionId: validId(data.sessionId),
      visitorId: validId(data.visitorId),
      ...userFields(data.user),
      type: data.type || "action",
      label: cut(data.label, 160),
      method: cut(data.method, 10),
      path,
      route: normalizeRoute(path),
      statusCode: data.statusCode ?? null,
      durationMs: data.durationMs ?? null,
      ip: info.ip,
      browser: info.browser,
      os: info.os,
      device: info.device,
      isBot: info.isBot,
      meta: data.meta,
    });
  } catch (error) {
    logger.warn("activity logEvent failed:", error.message);
  }
};

module.exports = { touchSession, logEvent, validId, cleanPath, cut };