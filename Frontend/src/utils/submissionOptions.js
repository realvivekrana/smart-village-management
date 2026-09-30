// Options shared by the citizen "Add Notice / Add Event" forms and the admin pages.
// Values must match Backend/src/models (Notice.js, Event.js).

export const NOTICE_CATEGORIES = [
  "general", "government", "education", "health", "agriculture", "employment",
  "social", "emergency", "infrastructure", "water", "electricity", "sanitation",
  "disaster", "government_scheme", "other",
];

export const EVENT_CATEGORIES = [
  "cultural", "religious", "sports", "health", "education",
  "agriculture", "government", "environment", "social", "other",
];

export const prettyCategory = (value = "") =>
  value.replaceAll("_", " ").replace(/^\w/, (c) => c.toUpperCase());

export const STATUS_BADGE = {
  pending: "badge-yellow",
  approved: "badge-green",
  rejected: "badge-red",
};

// <input type="datetime-local"> gives local time without a zone; send a real ISO instant.
export const localToIso = (value) => (value ? new Date(value).toISOString() : undefined);

// ISO instant -> value for <input type="datetime-local"> in the viewer's own time zone
export const isoToLocalInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};