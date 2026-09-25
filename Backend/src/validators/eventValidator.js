const { body } = require("express-validator");

const createEventValidator = [
  body("title")
    .trim()
    .notEmpty().withMessage("Title is required")
    .isLength({ min: 5, max: 200 }).withMessage("Title must be 5–200 characters"),

  body("description")
    .trim()
    .notEmpty().withMessage("Description is required")
    .isLength({ min: 10, max: 3000 }).withMessage("Description must be 10–3000 characters"),

  body("category")
    .optional()
    .isIn([
      "cultural", "religious", "sports", "health", "education",
      "agriculture", "government", "environment", "social", "other",
    ]).withMessage("Invalid event category"),

  body("startDate")
    .notEmpty().withMessage("Start date is required")
    .isISO8601().withMessage("Start date must be a valid date"),

  body("endDate")
    .notEmpty().withMessage("End date is required")
    .isISO8601().withMessage("End date must be a valid date")
    .custom((endDate, { req }) => {
      if (new Date(endDate) <= new Date(req.body.startDate)) {
        throw new Error("End date must be after start date");
      }
      return true;
    }),

  body("location")
    .trim()
    .notEmpty().withMessage("Location is required")
    .isLength({ max: 300 }).withMessage("Location cannot exceed 300 characters"),

  body("organizer")
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage("Organizer name cannot exceed 100 characters"),
];

const updateEventValidator = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 }).withMessage("Title must be 5–200 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 3000 }).withMessage("Description must be 10–3000 characters"),

  body("startDate")
    .optional()
    .isISO8601().withMessage("Start date must be a valid date"),

  body("endDate")
    .optional()
    .isISO8601().withMessage("End date must be a valid date"),

  body("location")
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage("Location cannot exceed 300 characters"),
];

module.exports = { createEventValidator, updateEventValidator };
