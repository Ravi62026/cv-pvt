import User from "../models/User.js";
import { generateTokenPair, verifyRefreshToken } from "../utils/jwt.js";
import { verifyCaptcha } from "../utils/captcha.js";
import { validationResult } from "express-validator";

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
        if (role === "lawyer" && lawyerDetails) {
            userData.lawyerDetails = {
                ...lawyerDetails,
                verificationStatus: "pending",
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

        // Update refresh token
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

        // Update refresh token
        user.refreshToken = newRefreshToken;
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
