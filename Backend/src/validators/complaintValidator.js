const { body } = require("express-validator");

const createComplaintValidator = [
  body("title")
    .trim()
    .notEmpty().withMessage("Title is required")
    .isLength({ min: 5, max: 200 }).withMessage("Title must be 5–200 characters"),

  body("description")
    .trim()
    .notEmpty().withMessage("Description is required")
    .isLength({ min: 20, max: 2000 }).withMessage("Description must be 20–2000 characters"),

  body("category")
    .notEmpty().withMessage("Category is required")
    .isIn([
      "road", "water", "electricity", "sanitation", "health",
      "education", "agriculture", "security", "noise", "environment", "other",
    ]).withMessage("Invalid complaint category"),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high", "urgent"]).withMessage("Invalid priority level"),

  body("location")
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage("Location cannot exceed 300 characters"),
];

const updateComplaintStatusValidator = [
  body("status")
    .notEmpty().withMessage("Status is required")
    .isIn(["pending", "in_progress", "resolved", "rejected", "closed"])
    .withMessage("Invalid complaint status"),

  body("note")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Note cannot exceed 500 characters"),

  body("adminNote")
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage("Admin note cannot exceed 1000 characters"),
];

module.exports = { createComplaintValidator, updateComplaintStatusValidator };
