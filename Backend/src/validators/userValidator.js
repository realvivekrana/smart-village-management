const { body } = require("express-validator");

const updateProfileValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage("Name must be 2–50 characters"),

  body("phone")
    .optional()
    .trim()
    .matches(/^[6-9]\d{9}$/).withMessage("Please enter a valid 10-digit Indian phone number"),

  body("address.houseNumber")
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage("House number cannot exceed 50 characters"),

  body("address.street")
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage("Street cannot exceed 100 characters"),

  body("address.village")
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage("Village cannot exceed 100 characters"),

  body("address.district")
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage("District cannot exceed 100 characters"),

  body("address.state")
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage("State cannot exceed 100 characters"),

  body("address.pincode")
    .optional()
    .trim()
    .matches(/^\d{6}$/).withMessage("Please enter a valid 6-digit pincode"),
];

const changePasswordValidator = [
  body("currentPassword")
    .notEmpty().withMessage("Current password is required"),

  body("newPassword")
    .notEmpty().withMessage("New password is required")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/).withMessage("Password must contain at least one number"),
];

module.exports = { updateProfileValidator, changePasswordValidator };
