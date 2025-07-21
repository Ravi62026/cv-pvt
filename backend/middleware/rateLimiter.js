import rateLimit from "express-rate-limit";

// General API rate limiter
export const apiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === "development" ? 1000 : (parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100), // 1000 in dev, 100 in prod
    message: {
        success: false,
        message: process.env.NODE_ENV === "development"
            ? "Rate limit reached (development mode - 1000 requests per 15 minutes)"
            : "Too many requests from this IP, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting in development for testing
        return process.env.NODE_ENV === "development" && req.headers['x-testing'] === 'true';
    }
});

// Rate limiter for auth routes (relaxed for testing)
export const authLimiter = rateLimit({
    windowMs: process.env.NODE_ENV === "development" ? 1 * 60 * 1000 : 15 * 60 * 1000, // 1 minute in dev, 15 minutes in prod
    max: process.env.NODE_ENV === "development" ? 100 : 5, // 100 requests in dev, 5 in prod
    message: {
        success: false,
        message: process.env.NODE_ENV === "development"
            ? "Rate limit reached (development mode - 100 requests per minute)"
            : "Too many authentication attempts, please try again after 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting in development for testing
        return process.env.NODE_ENV === "development" && req.headers['x-testing'] === 'true';
    }
});

// Rate limiter for password reset
export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // limit each IP to 3 password reset requests per hour
    message: {
        success: false,
        message:
            "Too many password reset attempts, please try again after 1 hour.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter for message sending (relaxed for testing)
export const messageLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: process.env.NODE_ENV === "development" ? 100 : 30, // 100 in dev, 30 in prod
    message: {
        success: false,
        message: process.env.NODE_ENV === "development"
            ? "Rate limit reached (development mode - 100 messages per minute)"
            : "Too many messages sent, please slow down.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting in development for testing
        return process.env.NODE_ENV === "development" && req.headers['x-testing'] === 'true';
    }
});

// Rate limiter for file uploads
export const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 uploads per 15 minutes
    message: {
        success: false,
        message: "Too many file uploads, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
