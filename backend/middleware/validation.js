import { body } from "express-validator";

// User registration validation
export const validateRegister = [
    body("name")
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("Name must be between 2 and 50 characters"),

    body("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email"),

    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage(
            "Password must contain at least one uppercase letter, one lowercase letter, and one number"
        ),

    body("role")
        .optional()
        .isIn(["citizen", "lawyer"])
        .withMessage("Role must be either citizen or lawyer"),

    body("phone")
        .optional()
        .matches(/^[0-9]{10}$/)
        .withMessage("Phone number must be 10 digits"),

    body("captchaToken")
        .notEmpty()
        .withMessage("CAPTCHA verification is required"),

    body("aadhaar")
        .if(body("role").equals("citizen"))
        .notEmpty()
        .withMessage("Aadhaar number is required for citizens")
        .matches(/^[0-9]{12}$/)
        .withMessage("Aadhaar number must be 12 digits"),

    // Lawyer-specific validations (optional during registration)
    body("lawyerDetails.barRegistrationNumber")
        .optional()
        .if(body("role").equals("lawyer"))
        .isLength({ min: 1 })
        .withMessage("Bar registration number cannot be empty if provided"),

    body("lawyerDetails.specialization")
        .optional()
        .if(body("role").equals("lawyer"))
        .isArray({ min: 1 })
        .withMessage("At least one specialization is required if provided"),

    body("lawyerDetails.experience")
        .optional()
        .if(body("role").equals("lawyer"))
        .isInt({ min: 0, max: 50 })
        .withMessage("Experience must be between 0 and 50 years"),

    body("lawyerDetails.education")
        .optional()
        .if(body("role").equals("lawyer"))
        .isLength({ min: 1 })
        .withMessage("Education details cannot be empty if provided"),
];

// User login validation
export const validateLogin = [
    body("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email"),

    body("password").notEmpty().withMessage("Password is required"),

    body("captchaToken")
        .notEmpty()
        .withMessage("CAPTCHA verification is required"),
];

// Profile update validation
export const validateProfileUpdate = [
    body("name")
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("Name must be between 2 and 50 characters"),

    body("phone")
        .optional()
        .matches(/^[0-9]{10}$/)
        .withMessage("Phone number must be 10 digits"),

    body("lawyerDetails.specialization")
        .optional()
        .isArray({ min: 1 })
        .withMessage("At least one specialization is required"),

    body("lawyerDetails.experience")
        .optional()
        .isInt({ min: 0, max: 50 })
        .withMessage("Experience must be between 0 and 50 years"),

    body("lawyerDetails.consultationFee")
        .optional()
        .isNumeric()
        .withMessage("Consultation fee must be a number"),
];

// Query validation
export const validateQuery = [
    body("title")
        .trim()
        .isLength({ min: 5, max: 100 })
        .withMessage("Title must be between 5 and 100 characters"),

    body("description")
        .trim()
        .isLength({ min: 20, max: 2000 })
        .withMessage("Description must be between 20 and 2000 characters"),

    body("category")
        .isIn([
            "civil",
            "criminal",
            "family",
            "property",
            "corporate",
            "tax",
            "labor",
            "other",
        ])
        .withMessage("Please select a valid category"),

    body("priority")
        .optional()
        .isIn(["low", "medium", "high", "urgent"])
        .withMessage("Priority must be low, medium, high, or urgent"),
];

// Dispute validation
export const validateDispute = [
    body("title")
        .trim()
        .isLength({ min: 5, max: 100 })
        .withMessage("Title must be between 5 and 100 characters"),

    body("description")
        .trim()
        .isLength({ min: 20, max: 2000 })
        .withMessage("Description must be between 20 and 2000 characters"),

    body("disputeType")
        .isIn([
            "property",
            "contract",
            "family",
            "employment",
            "business",
            "consumer",
            "landlord-tenant",
            "other",
        ])
        .withMessage("Please select a valid dispute type"),

    body("category")
        .isIn([
            "civil",
            "criminal",
            "family",
            "property",
            "corporate",
            "tax",
            "labor",
            "other",
        ])
        .withMessage("Please select a valid category"),

    body("disputeValue")
        .optional()
        .isNumeric()
        .withMessage("Dispute value must be a number"),

    body("opposingParty.name")
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage(
            "Opposing party name must be between 2 and 100 characters"
        ),
];

// Consultation validation
export const validateConsultation = [
    body("title")
        .trim()
        .isLength({ min: 5, max: 100 })
        .withMessage("Title must be between 5 and 100 characters"),

    body("consultationType")
        .isIn(["video", "audio", "in-person"])
        .withMessage("Consultation type must be video, audio, or in-person"),

    body("scheduledDateTime")
        .isISO8601()
        .withMessage("Please provide a valid date and time")
        .custom((value) => {
            const scheduledDate = new Date(value);
            const now = new Date();
            if (scheduledDate <= now) {
                throw new Error("Scheduled date must be in the future");
            }
            return true;
        }),

    body("duration")
        .optional()
        .isInt({ min: 15, max: 180 })
        .withMessage("Duration must be between 15 and 180 minutes"),
];

// Message validation
export const validateMessage = [
    body("content")
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage("Message must be between 1 and 1000 characters"),

    body("chatId").notEmpty().withMessage("Chat ID is required"),
];

// Password change validation
export const validatePasswordChange = [
    body("currentPassword")
        .notEmpty()
        .withMessage("Current password is required"),

    body("newPassword")
        .isLength({ min: 6 })
        .withMessage("New password must be at least 6 characters long")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage(
            "New password must contain at least one uppercase letter, one lowercase letter, and one number"
        ),

    body("confirmPassword").custom((value, { req }) => {
        if (value !== req.body.newPassword) {
            throw new Error(
                "Password confirmation does not match new password"
            );
        }
        return true;
    }),
];

// Forgot password validation
export const validateForgotPassword = [
    body("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email"),
];

// Reset password validation
export const validateResetPassword = [
    body("token")
        .notEmpty()
        .withMessage("Reset token is required"),

    body("newPassword")
        .isLength({ min: 6 })
        .withMessage("New password must be at least 6 characters long")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage(
            "New password must contain at least one uppercase letter, one lowercase letter, and one number"
        ),

    body("confirmPassword").custom((value, { req }) => {
        if (value !== req.body.newPassword) {
            throw new Error(
                "Password confirmation does not match new password"
            );
        }
        return true;
    }),
];
