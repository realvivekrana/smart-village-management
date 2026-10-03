import { API_URL } from "./constants";

/*
|--------------------------------------------------------------------------
| Activity Tracker (guest + logged-in dono)
|--------------------------------------------------------------------------
| visitorId : browser ki permanent id (localStorage)
| sessionId : ek visit; 30 min inactivity ke baad naya
|
| Ye kabhi error nahi throw karta - tracking fail ho to site chalti rahe.
*/

const VISITOR_KEY = "sv_visitor_id";
const SESSION_KEY = "sv_session_id";
const SEEN_KEY = "sv_session_seen";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

// localStorage block ho (private mode) to memory me chalega
const memory = {};

const read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return memory[key] ?? null;
  }
};

const write = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    memory[key] = value;
  }
};

const uid = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "");
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}${Math.random()
    .toString(36)
    .slice(2, 12)}`;
};

export const getVisitorId = () => {
  let id = read(VISITOR_KEY);
  if (!id) {
    id = uid();
    write(VISITOR_KEY, id);
  }
  return id;
};

export const getSessionId = () => {
  const now = Date.now();
  let id = read(SESSION_KEY);
  const seen = Number(read(SEEN_KEY) || 0);

  if (!id || now - seen > SESSION_TIMEOUT_MS) {
    id = uid();
    write(SESSION_KEY, id);
  }

  write(SEEN_KEY, String(now));
  return id;
};

export const sendTrack = (payload) => {
  try {
    const token = read("token");

    fetch(`${API_URL}/activity/track`, {
      method: "POST",
      keepalive: true, // tab band hote waqt bhi request jati hai
      credentials: "omit",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        visitorId: getVisitorId(),
        sessionId: getSessionId(),
        ...payload,
      }),
    }).catch(() => {});
  } catch {
    // ignore
  }
};

export const trackPageView = (path) =>
  sendTrack({
    type: "page_view",
    path,
    referrer: document.referrer ? new URL(document.referrer, window.location.href).origin : "",
    language: navigator.language || "",
    screen: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
  });