const { body } = require("express-validator");

const createNoticeValidator = [
  body("title")
    .trim()
    .notEmpty().withMessage("Title is required")
    .isLength({ min: 5, max: 200 }).withMessage("Title must be 5–200 characters"),

  body("content")
    .trim()
    .notEmpty().withMessage("Content is required")
    .isLength({ min: 10, max: 5000 }).withMessage("Content must be 10–5000 characters"),

  body("category")
    .optional()
    .isIn([
      "general", "health", "education", "agriculture", "infrastructure",
      "water", "electricity", "sanitation", "disaster", "government_scheme", "other",
    ]).withMessage("Invalid notice category"),

  body("priority")
    .optional()
    .isIn(["low", "normal", "high", "urgent"]).withMessage("Invalid priority"),

  body("expiresAt")
    .optional()
    .isISO8601().withMessage("Expiry must be a valid date")
    .custom((date) => {
      if (new Date(date) <= new Date()) {
        throw new Error("Expiry date must be in the future");
      }
      return true;
    }),
];

const updateNoticeValidator = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 }).withMessage("Title must be 5–200 characters"),

  body("content")
    .optional()
    .trim()
    .isLength({ min: 10, max: 5000 }).withMessage("Content must be 10–5000 characters"),

  body("priority")
    .optional()
    .isIn(["low", "normal", "high", "urgent"]).withMessage("Invalid priority"),

  body("isActive")
    .optional()
    .isBoolean().withMessage("isActive must be a boolean"),
];

module.exports = { createNoticeValidator, updateNoticeValidator };
