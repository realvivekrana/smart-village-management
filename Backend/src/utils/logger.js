const isProduction = process.env.NODE_ENV === "production";

const format = (level) => `[${new Date().toISOString()}] [${level}]`;

const logger = {
  info: (...args) => console.info(format("INFO"), ...args),
  warn: (...args) => console.warn(format("WARN"), ...args),
  error: (...args) => console.error(format("ERROR"), ...args),
  debug: (...args) => {
    if (!isProduction) console.log(format("DEBUG"), ...args);
  },
};

module.exports = logger;