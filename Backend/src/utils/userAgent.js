/*
|--------------------------------------------------------------------------
| Light User-Agent parser (koi extra package nahi)
|--------------------------------------------------------------------------
*/

const BOT_REGEX =
  /bot|crawl|spider|slurp|curl|wget|python-requests|axios|node-fetch|go-http|headless|lighthouse|uptime|monitor|preview|facebookexternalhit|postman/i;

const parseUserAgent = (ua = "") => {
  const s = String(ua || "");

  let browser = "Unknown";
  if (/Edg(e|A|iOS)?\//.test(s)) browser = "Edge";
  else if (/OPR\/|Opera/.test(s)) browser = "Opera";
  else if (/SamsungBrowser/.test(s)) browser = "Samsung Internet";
  else if (/Firefox\/|FxiOS/.test(s)) browser = "Firefox";
  else if (/Chrome\/|CriOS/.test(s)) browser = "Chrome";
  else if (/Safari\//.test(s)) browser = "Safari";

  let os = "Unknown";
  if (/Windows/.test(s)) os = "Windows";
  else if (/Android/.test(s)) os = "Android";
  else if (/iPhone|iPad|iPod/.test(s)) os = "iOS";
  else if (/Mac OS X|Macintosh/.test(s)) os = "macOS";
  else if (/CrOS/.test(s)) os = "ChromeOS";
  else if (/Linux/.test(s)) os = "Linux";

  const isBot = !s || BOT_REGEX.test(s);

  let device = "desktop";
  if (isBot) device = "bot";
  else if (/iPad|Tablet/.test(s) || (/Android/.test(s) && !/Mobile/.test(s))) device = "tablet";
  else if (/Mobi|iPhone|Android/.test(s)) device = "mobile";

  return { browser, os, device, isBot };
};

module.exports = { parseUserAgent };