const { body } = require("express-validator");

const createJobValidator = [
  body("title")
    .trim()
    .notEmpty().withMessage("Job title is required")
    .isLength({ min: 3, max: 200 }).withMessage("Title must be 3–200 characters"),

  body("description")
    .trim()
    .notEmpty().withMessage("Description is required")
    .isLength({ min: 20, max: 5000 }).withMessage("Description must be 20–5000 characters"),

  body("company")
    .trim()
    .notEmpty().withMessage("Company name is required")
    .isLength({ max: 150 }).withMessage("Company name cannot exceed 150 characters"),

  body("category")
    .optional()
    .isIn([
      "agriculture", "construction", "manufacturing", "retail", "health",
      "education", "it", "government", "domestic", "transportation", "other",
    ]).withMessage("Invalid job category"),

  body("type")
    .optional()
    .isIn(["full_time", "part_time", "contract", "seasonal", "internship"])
    .withMessage("Invalid job type"),

  body("location")
    .trim()
    .notEmpty().withMessage("Location is required")
    .isLength({ max: 200 }).withMessage("Location cannot exceed 200 characters"),

  body("openings")
    .notEmpty().withMessage("Number of openings is required")
    .isInt({ min: 1 }).withMessage("Openings must be at least 1"),

  body("applyBy")
    .notEmpty().withMessage("Application deadline is required")
    .isISO8601().withMessage("Apply by must be a valid date")
    .custom((date) => {
      if (new Date(date) <= new Date()) {
        throw new Error("Application deadline must be in the future");
      }
      return true;
    }),

  body("salary.min")
    .optional()
    .isFloat({ min: 0 }).withMessage("Minimum salary must be a positive number"),

  body("salary.max")
    .optional()
    .isFloat({ min: 0 }).withMessage("Maximum salary must be a positive number"),
];

const updateJobValidator = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 }).withMessage("Title must be 3–200 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 20, max: 5000 }).withMessage("Description must be 20–5000 characters"),

  body("openings")
    .optional()
    .isInt({ min: 1 }).withMessage("Openings must be at least 1"),

  body("applyBy")
    .optional()
    .isISO8601().withMessage("Apply by must be a valid date"),
];

const applyJobValidator = [
  body("coverLetter")
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage("Cover letter cannot exceed 2000 characters"),
];

module.exports = { createJobValidator, updateJobValidator, applyJobValidator };
