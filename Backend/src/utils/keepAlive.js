const logger = require("./logger");

/*
|--------------------------------------------------------------------------
| Keep-alive (Render free plan)
|--------------------------------------------------------------------------
| Render free service ~15 min kisi request ke bina so jati hai; uske baad
| pehli requests (jaise forgot-password) fail ya bahut slow hoti hain.
| Ye har 10 min apne hi /api/health ko ping karke use jagaye rakhta hai.
|
| - Render par RENDER_EXTERNAL_URL apne aap milta hai, kuch set nahi karna.
| - Dusre host par: KEEP_ALIVE_URL=https://your-backend/api/health
| - Band karne ke liye: KEEP_ALIVE=false
*/

const INTERVAL_MS = 10 * 60 * 1000;

const startKeepAlive = () => {
  if (process.env.KEEP_ALIVE === "false") return null;
  if (process.env.NODE_ENV !== "production") return null;
  if (typeof fetch !== "function") return null;

  const url =
    process.env.KEEP_ALIVE_URL ||
    (process.env.RENDER_EXTERNAL_URL
      ? `${process.env.RENDER_EXTERNAL_URL.replace(/\/$/, "")}/api/health`
      : "");

  if (!url) return null;

  const timer = setInterval(async () => {
    try {
      await fetch(url, { signal: AbortSignal.timeout(15000) });
    } catch (error) {
      logger.warn(`Keep-alive ping failed: ${error.message}`);
    }
  }, INTERVAL_MS);

  timer.unref(); // process ko band hone se na roke
  logger.info(`Keep-alive enabled -> ${url} (every 10 min)`);

  return timer;
};

module.exports = startKeepAlive;