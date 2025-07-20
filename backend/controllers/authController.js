import User from "../models/User.js";
import { generateTokenPair, verifyRefreshToken } from "../utils/jwt.js";
import { verifyCaptcha } from "../utils/captcha.js";
import { validationResult } from "express-validator";
import crypto from "crypto";
import bcrypt from "bcryptjs";

// Helper function to clean user data based on role
const cleanUserData = (user) => {
    const userData = user.toObject();

    // Always remove sensitive fields
    delete userData.password;
    delete userData.refreshToken;

    // Role-specific field cleaning
    switch (userData.role) {
        case "citizen":
            // Citizens don't need these fields
            delete userData.lawyerDetails;
            // Keep isVerified as true for citizens
            userData.isVerified = true;
            break;

        case "lawyer":
            // Keep lawyerDetails for lawyers
            if (userData.lawyerDetails) {
                // Clean empty arrays
                if (!userData.lawyerDetails.specialization || userData.lawyerDetails.specialization.length === 0) {
                    userData.lawyerDetails.specialization = [];
                }
                if (!userData.lawyerDetails.verificationDocuments || userData.lawyerDetails.verificationDocuments.length === 0) {
                    userData.lawyerDetails.verificationDocuments = [];
                }
            }
            break;

        case "admin":
            // Admins don't need lawyer details
            delete userData.lawyerDetails;
            // Keep isVerified as true for admins
            userData.isVerified = true;
            break;

        default:
            // Unknown role, remove lawyer details
            delete userData.lawyerDetails;
            break;
    }

    return userData;
};

// Register user
export const register = async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array(),
            });
        }

        const {
            name,
            email,
            password,
            role,
            phone,
            address,
            captchaToken,
            lawyerDetails,
        } = req.body;

        // Verify CAPTCHA
        if (process.env.NODE_ENV !== "development") {
            await verifyCaptcha(captchaToken);
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists",
            });
        }

        // Create user data
        const userData = {
            name,
            email,
            password,
            role: role || "citizen",
            phone,
            address,
        };

        // Add lawyer details if role is lawyer
        if (role === "lawyer") {
            if (lawyerDetails) {
                userData.lawyerDetails = {
                    ...lawyerDetails,
                    verificationStatus: "pending",
                };
                // Mark role-specific details as complete if provided
                userData.profileCompletion = {
                    basicInfo: true,
                    roleSpecificDetails: true,
                    documentsUploaded: false, // Will be updated when documents are uploaded
                };
            } else {
                // Lawyer without details - allow partial registration
                userData.lawyerDetails = {
                    verificationStatus: "pending",
                };
                userData.profileCompletion = {
                    basicInfo: true,
                    roleSpecificDetails: false,
                    documentsUploaded: false,
                };
            }
        } else {
            // Citizens have auto-complete profile
            userData.profileCompletion = {
                basicInfo: true,
                roleSpecificDetails: true,
                documentsUploaded: true,
            };
        }

        // Create user
        const user = await User.create(userData);

        // Generate tokens
        const { accessToken, refreshToken } = generateTokenPair({
            id: user._id,
            email: user.email,
            role: user.role,
        });

        // Save refresh token to user
        user.refreshToken = refreshToken;
        await user.save();

        // Set cookie options
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        };

        // Set cookies
        res.cookie("accessToken", accessToken, {
            ...cookieOptions,
            maxAge: 24 * 60 * 60 * 1000,
        }); // 1 day
        res.cookie("refreshToken", refreshToken, cookieOptions);

        // Clean user data based on role
        const cleanedUser = cleanUserData(user);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                user: cleanedUser,
                tokens: {
                    accessToken,
                    refreshToken,
                },
            },
        });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Registration failed",
        });
    }
};

// Login user
export const login = async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array(),
            });
        }

        const { email, password, captchaToken } = req.body;

        // Verify CAPTCHA
        if (process.env.NODE_ENV !== "development") {
            await verifyCaptcha(captchaToken);
        }

        // Check if user exists and get password
        const user = await User.findOne({ email }).select(
            "+password +refreshToken"
        );
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: "Account has been deactivated",
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // Generate new tokens
        const { accessToken, refreshToken } = generateTokenPair({
            id: user._id,
            email: user.email,
            role: user.role,
        });

        // Update refresh token without triggering full validation
        await User.findByIdAndUpdate(user._id, { refreshToken }, { runValidators: false });

        // Set cookie options
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        };

        // Set cookies
        res.cookie("accessToken", accessToken, {
            ...cookieOptions,
            maxAge: 24 * 60 * 60 * 1000,
        }); // 1 day
        res.cookie("refreshToken", refreshToken, cookieOptions);

        // Clean user data based on role
        const cleanedUser = cleanUserData(user);

        res.json({
            success: true,
            message: "Login successful",
            data: {
                user: cleanedUser,
                tokens: {
                    accessToken,
                    refreshToken,
                },
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Login failed",
        });
    }
};

// Refresh access token
export const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.cookies || req.body;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token not provided",
            });
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        // Find user and check if refresh token matches
        const user = await User.findById(decoded.id).select("+refreshToken");
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token",
            });
        }

        // Generate new tokens
        const { accessToken, refreshToken: newRefreshToken } =
            generateTokenPair({
                id: user._id,
                email: user.email,
                role: user.role,
            });

        // Update refresh token without triggering full validation
        await User.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken }, { runValidators: false });

        // Set cookie options
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        };

        // Set cookies
        res.cookie("accessToken", accessToken, {
            ...cookieOptions,
            maxAge: 24 * 60 * 60 * 1000,
        }); // 1 day
        res.cookie("refreshToken", newRefreshToken, cookieOptions);

        res.json({
            success: true,
            message: "Token refreshed successfully",
            data: {
                accessToken,
                refreshToken: newRefreshToken,
            },
        });
    } catch (error) {
        console.error("Refresh token error:", error);
        res.status(401).json({
            success: false,
            message: "Invalid refresh token",
        });
    }
};

// Logout user
export const logout = async (req, res) => {
    try {
        // Clear refresh token from database
        if (req.user) {
            await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
        }

        // Clear cookies
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        res.json({
            success: true,
            message: "Logout successful",
        });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({
            success: false,
            message: "Logout failed",
        });
    }
};

// Get current user
export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: "connections.userId",
            select: "name email role lawyerDetails.specialization",
        });

        // Clean user data based on role
        const cleanedUser = cleanUserData(user);

        res.json({
            success: true,
            data: { user: cleanedUser },
        });
    } catch (error) {
        console.error("Get current user error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get user data",
        });
    }
};

// Update profile
export const updateProfile = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array(),
            });
        }

        const { name, phone, address, lawyerDetails } = req.body;
        const updateData = { name, phone, address };

        // Update lawyer details if user is a lawyer
        if (req.user.role === "lawyer" && lawyerDetails) {
            updateData.lawyerDetails = {
                ...req.user.lawyerDetails,
                ...lawyerDetails,
            };
        }

        const user = await User.findByIdAndUpdate(req.user._id, updateData, {
            new: true,
            runValidators: true,
        });

        // Clean user data based on role
        const cleanedUser = cleanUserData(user);

        res.json({
            success: true,
            message: "Profile updated successfully",
            data: { user: cleanedUser },
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update profile",
        });
    }
};

// Forgot password
export const forgotPassword = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array(),
            });
        }

        const { email } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal if user exists or not for security
            return res.json({
                success: true,
                message: "If an account with that email exists, a password reset link has been sent.",
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

        // Set reset token and expiry (10 minutes) without triggering full validation
        await User.findByIdAndUpdate(user._id, {
            passwordResetToken: resetTokenHash,
            passwordResetExpires: Date.now() + 10 * 60 * 1000
        }, { runValidators: false });

        // In development, return the token for testing
        if (process.env.NODE_ENV === "development") {
            return res.json({
                success: true,
                message: "Password reset token generated successfully",
                data: {
                    resetToken, // Only for testing
                    message: "Use this token to reset your password",
                },
            });
        }

        // In production, send email (implement email service)
        // await sendPasswordResetEmail(user.email, resetToken);

        res.json({
            success: true,
            message: "If an account with that email exists, a password reset link has been sent.",
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to process password reset request",
        });
    }
};

// Reset password
export const resetPassword = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array(),
            });
        }

        const { token, newPassword } = req.body;

        // Hash the token to compare with stored hash
        const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");

        // Find user with valid reset token
        const user = await User.findOne({
            passwordResetToken: resetTokenHash,
            passwordResetExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired password reset token",
            });
        }

        // Update password
        user.password = newPassword; // Will be hashed by pre-save middleware
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        user.refreshToken = null; // Invalidate all sessions
        await user.save({ validateBeforeSave: false });

        res.json({
            success: true,
            message: "Password reset successfully. Please login with your new password.",
        });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to reset password",
        });
    }
};

// Update password (for authenticated users)
export const updatePassword = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array(),
            });
        }

        const { currentPassword, newPassword } = req.body;

        // Get user with password
        const user = await User.findById(req.user._id).select("+password");

        // Verify current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect",
            });
        }

        // Update password
        user.password = newPassword; // Will be hashed by pre-save middleware
        user.refreshToken = null; // Invalidate all sessions
        await user.save({ validateBeforeSave: false });

        res.json({
            success: true,
            message: "Password updated successfully. Please login again.",
        });
    } catch (error) {
        console.error("Update password error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update password",
        });
    }
};
