/*
|--------------------------------------------------------------------------
| Activity labels
|--------------------------------------------------------------------------
| API request ko admin ke liye padhne layak line me badalta hai.
| Naya feature jodo to bas yahan ek line add karo (optional - na bhi karo
| to generic label ban jata hai: "Created complaints").
*/

const OBJECT_ID = /\b[a-f0-9]{24}\b/gi;

// ids ko :id se replace (top pages / grouping ke liye)
const normalizeRoute = (path = "") =>
  String(path).replace(OBJECT_ID, ":id").replace(/\/\d+(?=\/|$)/g, "/:n");

// [method, regex, type, label]
const SPECIAL = [
  ["POST", /\/auth\/login$/, "login", "Login"],
  ["POST", /\/auth\/register$/, "register", "New account registered"],
  ["POST", /\/auth\/logout$/, "logout", "Logout"],
  ["POST", /\/auth\/forgot-password\/send-otp$/, "password_reset", "Password reset OTP requested"],
  ["POST", /\/auth\/forgot-password\/verify-otp$/, "password_reset", "Password reset OTP verified"],
  ["POST", /\/auth\/reset-password$/, "password_reset", "Password changed (reset)"],
  ["POST", /\/assistant\/chat$/, "action", "Asked the AI assistant"],
  ["POST", /\/sos(\/|$)/, "action", "🚨 SOS alert"],
  ["POST", /\/contact$/, "action", "Sent a contact message"],
  ["POST", /\/complaints$/, "action", "Filed a complaint"],
  ["POST", /\/community$/, "action", "Created a community post"],
  ["POST", /\/comments$/, "action", "Posted a comment"],
  ["POST", /\/reviews$/, "action", "Posted a review"],
  ["POST", /\/applications/, "action", "Applied for a job"],
  ["POST", /\/village-features\/.*apply/, "action", "Applied for a scheme"],
  ["POST", /\/gallery$/, "action", "Uploaded a gallery photo"],
  ["POST", /\/listings$/, "action", "Posted in Gaon Bazaar"],
  ["POST", /\/businesses$/, "action", "Added a business"],
  ["POST", /\/jobs$/, "action", "Posted a job"],
  ["POST", /\/events$/, "action", "Added an event"],
  ["POST", /\/notices$/, "action", "Added a notice"],
  ["PUT", /\/users\/profile$/, "action", "Updated own profile"],
];

const VERB = { POST: "Created", PUT: "Updated", PATCH: "Updated", DELETE: "Deleted" };

const resourceName = (path = "") => {
  const parts = String(path).replace(/^\/api\/v\d+\//, "").split("/").filter(Boolean);
  return parts[0] ? parts[0].replace(/-/g, " ") : "resource";
};

/**
 * @returns {{ type: string, label: string }}
 */
const describeRequest = (method, path, statusCode) => {
  const clean = String(path || "").split("?")[0];

  for (const [m, rx, type, label] of SPECIAL) {
    if (m === method && rx.test(clean)) {
      if (type === "login" && statusCode >= 400) {
        return { type: "login_failed", label: "Failed login attempt" };
      }
      return { type, label };
    }
  }

  if (statusCode >= 500) {
    return { type: "error", label: `Server error on ${method} ${normalizeRoute(clean)}` };
  }
  if (statusCode === 403) {
    return { type: "error", label: `Blocked (403) ${method} ${normalizeRoute(clean)}` };
  }

  const verb = VERB[method] || method;
  const name = resourceName(clean);
  const suffix = statusCode >= 400 ? ` (failed ${statusCode})` : "";
  return { type: "action", label: `${verb} ${name}${suffix}` };
};

module.exports = { normalizeRoute, describeRequest };