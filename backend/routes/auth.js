import express from "express";
import {
    register,
    login,
    logout,
    refreshToken,
    getCurrentUser,
    updateProfile,
} from "../controllers/authController.js";
import {
    validateRegister,
    validateLogin,
    validateProfileUpdate,
} from "../middleware/validation.js";
import { protect } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Public routes
router.post("/register", authLimiter, validateRegister, register);
router.post("/login", authLimiter, validateLogin, login);
router.post("/refresh-token", refreshToken);

// Protected routes
router.use(protect); // All routes below require authentication

router.post("/logout", logout);
router.get("/me", getCurrentUser);
router.put("/profile", validateProfileUpdate, updateProfile);

export default router;
