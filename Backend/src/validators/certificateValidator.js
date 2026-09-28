const { body } = require("express-validator");

const TYPES = ["residence", "income", "caste", "birth", "death", "character", "domicile", "no_dues", "other"];
const STATUSES = ["pending", "in_progress", "approved", "rejected", "cancelled"];

const createCertificateValidator = [
  body("type").notEmpty().withMessage("Certificate type is required").isIn(TYPES).withMessage("Invalid certificate type"),
  body("applicantName").trim().notEmpty().withMessage("Applicant name is required").isLength({ min: 2, max: 100 }).withMessage("Name must be 2–100 characters"),
  body("fatherName").optional({ checkFalsy: true }).trim().isLength({ max: 100 }).withMessage("Father name cannot exceed 100 characters"),
  body("address").trim().notEmpty().withMessage("Address is required").isLength({ max: 300 }).withMessage("Address cannot exceed 300 characters"),
  body("purpose").trim().notEmpty().withMessage("Purpose is required").isLength({ min: 10, max: 500 }).withMessage("Purpose must be 10–500 characters"),
];

const updateCertificateStatusValidator = [
  body("status").notEmpty().withMessage("Status is required").isIn(STATUSES.filter((s) => s !== "cancelled")).withMessage("Invalid status"),
  body("note").optional().trim().isLength({ max: 500 }).withMessage("Note cannot exceed 500 characters"),
  body("adminNote").optional().trim().isLength({ max: 1000 }).withMessage("Admin note cannot exceed 1000 characters"),
];

module.exports = { createCertificateValidator, updateCertificateStatusValidator };