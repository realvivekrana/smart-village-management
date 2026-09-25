import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";

const parse = (date) => {
  if (!date) return null;
  const d = typeof date === "string" ? parseISO(date) : new Date(date);
  return isValid(d) ? d : null;
};

export const formatDate = (date, fmt = "dd MMM yyyy") => {
  const d = parse(date);
  return d ? format(d, fmt) : "—";
};

export const formatDateTime = (date) => {
  const d = parse(date);
  return d ? format(d, "dd MMM yyyy, hh:mm a") : "—";
};

export const formatRelative = (date) => {
  const d = parse(date);
  return d ? formatDistanceToNow(d, { addSuffix: true }) : "—";
};

export const formatDateRange = (start, end) => {
  const s = parse(start);
  const e = parse(end);
  if (!s || !e) return "—";
  if (format(s, "dd MMM yyyy") === format(e, "dd MMM yyyy")) {
    return format(s, "dd MMM yyyy");
  }
  return `${format(s, "dd MMM")} – ${format(e, "dd MMM yyyy")}`;
};

export const isExpired = (date) => {
  const d = parse(date);
  return d ? d < new Date() : false;
};
