const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { touchSession, logEvent, validId, cut } = require("../services/activityService");
const { describeRequest } = require("../utils/activityLabels");

/*
|--------------------------------------------------------------------------
| trackApiActivity
|--------------------------------------------------------------------------
| Har API request ke KHATAM hone ke baad (res "finish") chalta hai, isliye
| response me koi delay nahi aata.
|
| Kya log hota hai:
|  - POST / PUT / PATCH / DELETE  (login, complaint, post, apply, delete ...)
|  - GET me sirf 403 aur 5xx (security / error dekhne ke liye)
|  - Page views frontend tracker se aate hain (POST /activity/track)
|
| Kya KABHI log nahi hota: password, OTP, token, request body.
| Failed login me sirf try kiya gaya email (security ke liye) jata hai.
|--------------------------------------------------------------------------
*/

const SKIP = [/^\/api\/health/, /^\/api\/v1\/activity/];

const resolveUser = async (req) => {
  if (req.activityUser) return req.activityUser; // login/register me controller set karta hai
  if (req.user) return req.user;

  // Aise route jahan protect/optionalAuth nahi laga (token se pehchano)
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ") || !process.env.JWT_SECRET) return null;

    const decoded = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
    return await User.findById(decoded.userId).select("name email role").lean();
  } catch (error) {
    return null;
  }
};

const trackApiActivity = (req, res, next) => {
  const method = req.method;

  if (method === "OPTIONS" || method === "HEAD") return next();

  const url = req.originalUrl || req.url || "";
  if (SKIP.some((rx) => rx.test(url))) return next();

  const startedAt = Date.now();

  res.on("finish", () => {
    const statusCode = res.statusCode;

    if (method === "GET" && statusCode !== 403 && statusCode < 500) return;

    setImmediate(async () => {
      try {
        const path = url.split("?")[0];
        const { type, label } = describeRequest(method, path, statusCode);
        const user = await resolveUser(req);

        const sessionId = validId(req.headers["x-session-id"]);
        const visitorId = validId(req.headers["x-visitor-id"]);

        const meta = {};
        // Failed login: kis email se try hua (password kabhi nahi)
        if (type === "login_failed" && req.body && typeof req.body.email === "string") {
          meta.attemptedEmail = cut(req.body.email.trim().toLowerCase(), 100);
        }

        await logEvent(req, {
          sessionId,
          visitorId,
          user,
          type,
          label,
          method,
          path,
          statusCode,
          durationMs: Date.now() - startedAt,
          meta: Object.keys(meta).length ? meta : undefined,
        });

        // Session ko user se link karo (guest -> logged-in conversion yahin pakadta hai)
        if (sessionId && visitorId) {
          await touchSession(req, {
            sessionId,
            visitorId,
            user: type === "logout" || statusCode >= 400 ? undefined : user,
            loggedOut: type === "logout" && statusCode < 400,
            lastAction: label,
            action: true,
          });
        }
      } catch (error) {
        // tracking fail ho to bhi app chalta rahe
      }
    });
  });

  next();
};

module.exports = { trackApiActivity };