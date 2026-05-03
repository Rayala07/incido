import { body } from "express-validator"
import { validationResult } from "express-validator"
// ✅ Register Validation

const validate = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    })
  }

  next()
}

export const registerValidator = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .normalizeEmail()
    .matches(/^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .withMessage("Enter a valid email address"),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/\d/)
    .withMessage("Password must contain at least one number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage(
      'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)',
    ),
  validate,
]

// ✅ Login Validation
export const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .normalizeEmail()
    .matches(/^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .withMessage("Enter a valid email address"),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  validate,
]

// ✅ Incident Creation Validation
export const incidentValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10, max: 5000 })
    .withMessage("Description must be between 10 and 5000 characters"),

  body("projectId").trim().notEmpty().withMessage("Project ID is required"),

  body("severity")
    .optional()
    .isIn(["low", "medium", "high", "critical"])
    .withMessage("Severity must be one of: low, medium, high, critical"),

  body("affectedUsers")
    .optional()
    .isArray()
    .withMessage("Affected users must be an array"),

  body("affectedServices")
    .optional()
    .isArray()
    .withMessage("Affected services must be an array"),

  validate,
]

// ✅ Assign Members Validation
export const assignMembersValidator = [
  body("members")
    .isArray({ min: 1 })
    .withMessage("Members must be an array with at least one member"),

  body("members.*.userId")
    .trim()
    .notEmpty()
    .withMessage("User ID is required for each member"),

  validate,
]

// ✅ Update Incident Validation
export const updateIncidentValidator = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage("Description must be between 10 and 5000 characters"),

  body("severity")
    .optional()
    .isIn(["low", "medium", "high", "critical"])
    .withMessage("Severity must be one of: low, medium, high, critical"),

  body("status")
    .optional()
    .isIn(["open", "in-progress", "resolved"])
    .withMessage("Status must be one of: open, in-progress, resolved"),

  body("isPublic")
    .optional()
    .isBoolean()
    .withMessage("isPublic must be a boolean"),

  body("affectedUsers")
    .optional()
    .isArray()
    .withMessage("Affected users must be an array"),

  body("affectedServices")
    .optional()
    .isArray()
    .withMessage("Affected services must be an array"),

  validate,
]

// ✅ Project Creation Validation
export const projectValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Project name is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Project name must be between 3 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must not exceed 1000 characters"),

  validate,
]

// ✅ Project Update Validation (both fields are optional for a PATCH-style update)
export const updateProjectValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Project name must be between 3 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must not exceed 1000 characters"),

  validate,
]

// ✅ Add Project Members Validation
export const addProjectMembersValidator = [
  body("members")
    .isArray({ min: 1 })
    .withMessage("Members must be an array with at least one member"),

  body("members.*.email")
    .trim()
    .notEmpty()
    .withMessage("Email is required for each member")
    .isEmail()
    .withMessage("Must be a valid email"),

  body("members.*.role")
    .isIn(["leader", "member"])
    .withMessage("Role must be either 'leader' or 'member'"),

  validate,
]
