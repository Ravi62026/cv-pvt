import { verifyAccessToken } from "../utils/jwt.js";
import User from "../models/User.js";

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
    try {
        let token;



        // Check for token in headers
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }
        // Check for token in cookies
        else if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, no token provided",
            });
        }

        // Verify token
        const decoded = verifyAccessToken(token);

        // Get user from database
        const user = await User.findById(decoded.id).select(
            "-password -refreshToken"
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, user not found",
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: "Account has been deactivated",
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Auth middleware error:", error.message);
        return res.status(401).json({
            success: false,
            message: "Not authorized, token failed",
        });
    }
};

// Role-based access control
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Not authorized",
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user.role} is not authorized to access this route`,
            });
        }

        next();
    };
};

// Check if lawyer is verified (for lawyer-specific routes)
export const requireVerifiedLawyer = (req, res, next) => {
    if (req.user.role !== "lawyer") {
        return res.status(403).json({
            success: false,
            message: "Access restricted to lawyers only",
        });
    }

    if (!req.user.isVerified) {
        return res.status(403).json({
            success: false,
            message: "Lawyer verification required to access this feature",
        });
    }

    next();
};

// Optional auth - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        } else if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        }

        if (token) {
            const decoded = verifyAccessToken(token);
            const user = await User.findById(decoded.id).select(
                "-password -refreshToken"
            );

            if (user && user.isActive) {
                req.user = user;
            }
        }

        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
};
