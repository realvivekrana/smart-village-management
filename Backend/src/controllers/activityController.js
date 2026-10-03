const mongoose = require("mongoose");

const ActivitySession = require("../models/ActivitySession");
const ActivityEvent = require("../models/ActivityEvent");
const escapeRegex = require("../utils/escapeRegex");
const ApiError = require("../utils/ApiError");
const { getPagination, getPaginationMeta } = require("../utils/pagination");
const { touchSession, logEvent, validId, cleanPath, cut } = require("../services/activityService");

/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

// Heartbeat 60s ka hai; 3 min tak signal na aaye to "live" nahi maante
const LIVE_WINDOW_MS = 3 * 60 * 1000;

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const TZ = "Asia/Kolkata";

const startOfTodayIST = () =>
  new Date(Math.floor((Date.now() + IST_OFFSET_MS) / 86400000) * 86400000 - IST_OFFSET_MS);

const daysAgoIST = (days) => new Date(startOfTodayIST().getTime() - (days - 1) * 86400000);

const parseDate = (value, endOfDay = false) => {
  if (!value) return null;
  const d = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}+05:30`);
  return Number.isNaN(d.getTime()) ? null : d;
};

const toObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null;

/*
|--------------------------------------------------------------------------
| POST /api/v1/activity/track   (PUBLIC - guest bhi, login bhi)
|--------------------------------------------------------------------------
| body: { visitorId, sessionId, type: page_view|heartbeat|end, path,
|         referrer, language, screen, activeSeconds }
| Hamesha 204 deta hai - tracker ko kabhi error nahi dikhna chahiye.
*/
const track = async (req, res) => {
  res.status(204).end();

  try {
    const body = req.body || {};
    const sessionId = validId(body.sessionId);
    const visitorId = validId(body.visitorId);
    if (!sessionId || !visitorId) return;

    const common = {
      sessionId,
      visitorId,
      user: req.user, // optionalAuth se (token ho to)
      path: body.path,
      language: body.language,
      screen: body.screen,
      referrer: body.referrer,
    };

    if (body.type === "page_view") {
      await touchSession(req, { ...common, pageView: true });
      await logEvent(req, {
        sessionId,
        visitorId,
        user: req.user,
        type: "page_view",
        label: "Viewed page",
        method: "GET",
        path: cleanPath(body.path),
      });
    } else if (body.type === "end") {
      await touchSession(req, { ...common, ended: true });
    } else {
      await touchSession(req, { ...common, activeSeconds: body.activeSeconds });
    }
  } catch (error) {
    // ignore
  }
};

/*
|--------------------------------------------------------------------------
| Common filters
|--------------------------------------------------------------------------
*/
const sessionFilterFromQuery = (query) => {
  const filter = {};

  if (query.includeBots !== "true") filter.isBot = { $ne: true };

  if (query.type === "guest") filter.user = null;
  if (query.type === "user") filter.user = { $ne: null };
  if (query.role) filter.userRole = cut(query.role, 20);
  if (query.device) filter.device = cut(query.device, 20);
  if (query.status === "live") {
    filter.lastSeenAt = { $gte: new Date(Date.now() - LIVE_WINDOW_MS) };
    filter.endedAt = null;
  }

  const userId = toObjectId(query.userId);
  if (userId) filter.user = userId;

  const from = parseDate(query.from);
  const to = parseDate(query.to, true);
  if (from || to) {
    filter.startedAt = {};
    if (from) filter.startedAt.$gte = from;
    if (to) filter.startedAt.$lte = to;
  }

  if (query.search) {
    const rx = new RegExp(escapeRegex(query.search), "i");
    filter.$or = [
      { userName: rx },
      { userEmail: rx },
      { ip: rx },
      { visitorId: rx },
      { currentPath: rx },
      { lastAction: rx },
    ];
  }

  return filter;
};

const withLiveFlag = (session) => ({
  ...session,
  isLive:
    !session.endedAt && Date.now() - new Date(session.lastSeenAt).getTime() <= LIVE_WINDOW_MS,
});

/*
|--------------------------------------------------------------------------
| GET /api/v1/activity/overview?days=7
|--------------------------------------------------------------------------
*/
const getOverview = async (req, res) => {
  const days = Math.min(Math.max(parseInt(req.query.days, 10) || 7, 1), 90);
  const today = startOfTodayIST();
  const since = daysAgoIST(days);
  const liveSince = new Date(Date.now() - LIVE_WINDOW_MS);
  const notBot = { isBot: { $ne: true } };
  const hideAdmins = req.query.hideAdmins === "true" ? { userRole: { $ne: "admin" } } : {};

  const sessionBase = { ...notBot, ...hideAdmins };
  const eventBase = { ...notBot, ...hideAdmins };

  const [
    liveTotal,
    liveLoggedIn,
    todaySessions,
    todayVisitors,
    todayUsers,
    todayPageViews,
    todayLogins,
    todayFailed,
    todayRegistrations,
    dailySessions,
    dailyViews,
    topPages,
    devices,
    browsers,
    topUsers,
  ] = await Promise.all([
    ActivitySession.countDocuments({ ...sessionBase, lastSeenAt: { $gte: liveSince }, endedAt: null }),
    ActivitySession.countDocuments({
      ...sessionBase,
      lastSeenAt: { $gte: liveSince },
      endedAt: null,
      user: { $ne: null },
      loggedOutAt: null,
    }),
    ActivitySession.countDocuments({ ...sessionBase, startedAt: { $gte: today } }),
    ActivitySession.distinct("visitorId", { ...sessionBase, lastSeenAt: { $gte: today } }).then((a) => a.length),
    ActivitySession.distinct("user", { ...sessionBase, lastSeenAt: { $gte: today }, user: { $ne: null } }).then(
      (a) => a.length
    ),
    ActivityEvent.countDocuments({ ...eventBase, type: "page_view", createdAt: { $gte: today } }),
    ActivityEvent.countDocuments({ ...eventBase, type: "login", createdAt: { $gte: today } }),
    ActivityEvent.countDocuments({ ...eventBase, type: "login_failed", createdAt: { $gte: today } }),
    ActivityEvent.countDocuments({ ...eventBase, type: "register", createdAt: { $gte: today } }),

    ActivitySession.aggregate([
      { $match: { ...sessionBase, startedAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$startedAt", timezone: TZ } },
          sessions: { $sum: 1 },
          loggedIn: { $sum: { $cond: [{ $ne: ["$user", null] }, 1, 0] } },
        },
      },
    ]),
    ActivityEvent.aggregate([
      { $match: { ...eventBase, type: "page_view", createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: TZ } },
          pageViews: { $sum: 1 },
        },
      },
    ]),
    ActivityEvent.aggregate([
      { $match: { ...eventBase, type: "page_view", createdAt: { $gte: since } } },
      { $group: { _id: "$route", views: { $sum: 1 }, visitors: { $addToSet: "$visitorId" } } },
      { $project: { _id: 0, path: "$_id", views: 1, visitors: { $size: "$visitors" } } },
      { $sort: { views: -1 } },
      { $limit: 10 },
    ]),
    ActivitySession.aggregate([
      { $match: { ...sessionBase, startedAt: { $gte: since } } },
      { $group: { _id: "$device", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    ActivitySession.aggregate([
      { $match: { ...sessionBase, startedAt: { $gte: since } } },
      { $group: { _id: "$browser", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]),
    ActivityEvent.aggregate([
      { $match: { ...eventBase, user: { $ne: null }, createdAt: { $gte: since } } },
      {
        $group: {
          _id: "$user",
          name: { $last: "$userName" },
          role: { $last: "$userRole" },
          events: { $sum: 1 },
          lastActive: { $max: "$createdAt" },
        },
      },
      { $sort: { events: -1 } },
      { $limit: 8 },
    ]),
  ]);

  // Khaali din bhi dikhane ke liye series fill
  const sessionMap = new Map(dailySessions.map((d) => [d._id, d]));
  const viewMap = new Map(dailyViews.map((d) => [d._id, d.pageViews]));
  const series = [];

  for (let i = 0; i < days; i += 1) {
    const dayStart = new Date(since.getTime() + i * 86400000);
    const key = new Date(dayStart.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
    const s = sessionMap.get(key);

    series.push({
      date: key,
      sessions: s?.sessions || 0,
      loggedIn: s?.loggedIn || 0,
      guests: (s?.sessions || 0) - (s?.loggedIn || 0),
      pageViews: viewMap.get(key) || 0,
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      days,
      live: { total: liveTotal, loggedIn: liveLoggedIn, guests: liveTotal - liveLoggedIn },
      today: {
        sessions: todaySessions,
        visitors: todayVisitors,
        loggedInUsers: todayUsers,
        pageViews: todayPageViews,
        logins: todayLogins,
        failedLogins: todayFailed,
        registrations: todayRegistrations,
      },
      series,
      topPages,
      devices: devices.map((d) => ({ name: d._id || "unknown", count: d.count })),
      browsers: browsers.map((d) => ({ name: d._id || "Unknown", count: d.count })),
      topUsers: topUsers.map((u) => ({
        userId: u._id,
        name: u.name,
        role: u.role,
        events: u.events,
        lastActive: u.lastActive,
      })),
    },
  });
};

/*
|--------------------------------------------------------------------------
| GET /api/v1/activity/live
|--------------------------------------------------------------------------
*/
const getLive = async (req, res) => {
  const filter = {
    isBot: { $ne: true },
    lastSeenAt: { $gte: new Date(Date.now() - LIVE_WINDOW_MS) },
    endedAt: null,
  };
  if (req.query.hideAdmins === "true") filter.userRole = { $ne: "admin" };

  const sessions = await ActivitySession.find(filter)
    .sort({ lastSeenAt: -1 })
    .limit(100)
    .select("-userAgent")
    .lean();

  return res.status(200).json({
    success: true,
    data: { sessions: sessions.map(withLiveFlag), count: sessions.length },
  });
};

/*
|--------------------------------------------------------------------------
| GET /api/v1/activity/sessions
|--------------------------------------------------------------------------
| ?page&limit&type=guest|user&role&device&status=live&userId&search&from&to
*/
const getSessions = async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 15, maxLimit: 50 });
  const filter = sessionFilterFromQuery(req.query);

  if (req.query.hideAdmins === "true" && !filter.userRole) filter.userRole = { $ne: "admin" };

  const [total, sessions] = await Promise.all([
    ActivitySession.countDocuments(filter),
    ActivitySession.find(filter).sort({ lastSeenAt: -1 }).skip(skip).limit(limit).select("-userAgent").lean(),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      sessions: sessions.map(withLiveFlag),
      pagination: getPaginationMeta(total, page, limit),
    },
  });
};

/*
|--------------------------------------------------------------------------
| GET /api/v1/activity/sessions/:sessionId  (poori timeline)
|--------------------------------------------------------------------------
*/
const getSessionDetail = async (req, res) => {
  const session = await ActivitySession.findOne({ sessionId: cut(req.params.sessionId, 64) }).lean();
  if (!session) throw ApiError.notFound("Session not found");

  const events = await ActivityEvent.find({ sessionId: session.sessionId })
    .sort({ createdAt: 1 })
    .limit(500)
    .select("-__v")
    .lean();

  return res.status(200).json({
    success: true,
    data: { session: withLiveFlag(session), events },
  });
};

/*
|--------------------------------------------------------------------------
| GET /api/v1/activity/events
|--------------------------------------------------------------------------
| ?page&limit&type&userId&sessionId&search&from&to&hideAdmins
*/
const getEvents = async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 25, maxLimit: 100 });
  const filter = {};

  if (req.query.includeBots !== "true") filter.isBot = { $ne: true };
  if (req.query.type && ActivityEvent.EVENT_TYPES.includes(req.query.type)) filter.type = req.query.type;
  if (req.query.hideAdmins === "true") filter.userRole = { $ne: "admin" };
  if (req.query.who === "guest") filter.user = null;
  if (req.query.who === "user") filter.user = { $ne: null };

  const userId = toObjectId(req.query.userId);
  if (userId) filter.user = userId;
  if (req.query.sessionId) filter.sessionId = cut(req.query.sessionId, 64);

  const from = parseDate(req.query.from);
  const to = parseDate(req.query.to, true);
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = from;
    if (to) filter.createdAt.$lte = to;
  }

  if (req.query.search) {
    const rx = new RegExp(escapeRegex(req.query.search), "i");
    filter.$or = [{ userName: rx }, { path: rx }, { label: rx }, { ip: rx }, { "meta.attemptedEmail": rx }];
  }

  const [total, events] = await Promise.all([
    ActivityEvent.countDocuments(filter),
    ActivityEvent.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).select("-__v").lean(),
  ]);

  return res.status(200).json({
    success: true,
    data: { events, pagination: getPaginationMeta(total, page, limit) },
  });
};

/*
|--------------------------------------------------------------------------
| DELETE /api/v1/activity/cleanup?days=30
|--------------------------------------------------------------------------
| N din se purane logs turant delete (waise bhi auto-delete hota hai).
*/
const cleanup = async (req, res) => {
  const days = Math.min(Math.max(parseInt(req.query.days, 10) || 0, 1), 365);
  if (!req.query.days) throw ApiError.badRequest("days query is required");

  const before = new Date(Date.now() - days * 86400000);

  const [events, sessions] = await Promise.all([
    ActivityEvent.deleteMany({ createdAt: { $lt: before } }),
    ActivitySession.deleteMany({ lastSeenAt: { $lt: before } }),
  ]);

  return res.status(200).json({
    success: true,
    message: `Deleted activity older than ${days} day(s)`,
    data: { events: events.deletedCount, sessions: sessions.deletedCount },
  });
};

module.exports = { track, getOverview, getLive, getSessions, getSessionDetail, getEvents, cleanup };