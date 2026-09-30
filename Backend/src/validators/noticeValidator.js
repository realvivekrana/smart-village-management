const { body } = require("express-validator");

const CATEGORIES = [
  "general", "government", "education", "health", "agriculture", "employment",
  "social", "emergency", "infrastructure", "water", "electricity", "sanitation",
  "disaster", "government_scheme", "other",
];
const PRIORITIES = ["low", "normal", "high", "urgent"];

// empty string / null means "no expiry"
const emptyToNull = (v) => (v === "" || v === undefined ? null : v);

const expiresAtRule = body("expiresAt")
  .customSanitizer(emptyToNull)
  .optional({ nullable: true })
  .isISO8601().withMessage("Expiry must be a valid date")
  .custom((date) => {
    if (new Date(date) <= new Date()) throw new Error("Expiry date must be in the future");
    return true;
  });

const createNoticeValidator = [
  body("title")
    .trim()
    .notEmpty().withMessage("Title is required")
    .isLength({ min: 5, max: 200 }).withMessage("Title must be 5–200 characters"),
  body("content")
    .trim()
    .notEmpty().withMessage("Content is required")
    .isLength({ min: 10, max: 5000 }).withMessage("Content must be 10–5000 characters"),
  body("category").optional().isIn(CATEGORIES).withMessage("Invalid notice category"),
  body("priority").optional().isIn(PRIORITIES).withMessage("Invalid priority"),
  expiresAtRule,
];

// On update the admin may keep an old (past) expiry while editing other fields,
// so only the format is checked here; the model checks expiry > publish date.
const updateNoticeValidator = [
  body("title").optional().trim()
    .isLength({ min: 5, max: 200 }).withMessage("Title must be 5–200 characters"),
  body("content").optional().trim()
    .isLength({ min: 10, max: 5000 }).withMessage("Content must be 10–5000 characters"),
  body("category").optional().isIn(CATEGORIES).withMessage("Invalid notice category"),
  body("priority").optional().isIn(PRIORITIES).withMessage("Invalid priority"),
  body("expiresAt")
    .customSanitizer(emptyToNull)
    .optional({ nullable: true })
    .isISO8601().withMessage("Expiry must be a valid date"),
  body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),
];

const reviewValidator = [
  body("status").isIn(["approved", "rejected"]).withMessage("Status must be approved or rejected"),
  body("rejectionReason")
    .if(body("status").equals("rejected"))
    .trim()
    .notEmpty().withMessage("Please give a reason for rejecting")
    .isLength({ max: 500 }).withMessage("Reason cannot exceed 500 characters"),
];

module.exports = { createNoticeValidator, updateNoticeValidator, reviewValidator };