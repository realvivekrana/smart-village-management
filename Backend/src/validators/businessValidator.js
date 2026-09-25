const { body } = require("express-validator");

const createBusinessValidator = [
  body("name")
    .trim()
    .notEmpty().withMessage("Business name is required")
    .isLength({ min: 2, max: 150 }).withMessage("Business name must be 2–150 characters"),

  body("description")
    .trim()
    .notEmpty().withMessage("Description is required")
    .isLength({ min: 20, max: 3000 }).withMessage("Description must be 20–3000 characters"),

  body("category")
    .notEmpty().withMessage("Category is required")
    .isIn([
      "grocery", "restaurant", "medical", "hardware", "clothing",
      "electronics", "agriculture", "dairy", "transport",
      "education", "beauty", "repair", "other",
    ]).withMessage("Invalid business category"),

  body("phone")
    .trim()
    .notEmpty().withMessage("Phone number is required"),

  body("address.village")
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage("Village cannot exceed 100 characters"),

  body("address.district")
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage("District cannot exceed 100 characters"),
];

const updateBusinessValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 }).withMessage("Business name must be 2–150 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 20, max: 3000 }).withMessage("Description must be 20–3000 characters"),

  body("category")
    .optional()
    .isIn([
      "grocery", "restaurant", "medical", "hardware", "clothing",
      "electronics", "agriculture", "dairy", "transport",
      "education", "beauty", "repair", "other",
    ]).withMessage("Invalid business category"),
];

const reviewBusinessValidator = [
  body("status")
    .notEmpty().withMessage("Status is required")
    .isIn(["approved", "rejected", "suspended"]).withMessage("Status must be approved, rejected, or suspended"),

  body("rejectionReason")
    .if(body("status").equals("rejected"))
    .notEmpty().withMessage("Rejection reason is required when rejecting a business")
    .isLength({ max: 500 }).withMessage("Rejection reason cannot exceed 500 characters"),
];

module.exports = {
  createBusinessValidator,
  updateBusinessValidator,
  reviewBusinessValidator,
};
