import express from "express";
import {
    getDashboardAnalytics,
    getAllUsers,
    getPendingLawyerVerifications,
    updateLawyerVerification,
    toggleUserStatus,
    getSystemStats,
} from "../controllers/adminController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(authorize("admin"));

// Dashboard and analytics
router.get("/dashboard/analytics", getDashboardAnalytics);
router.get("/system/stats", getSystemStats);

// User management
router.get("/users", getAllUsers);
router.patch("/users/:userId/toggle-status", toggleUserStatus);

// Lawyer verification
router.get("/lawyers/pending-verifications", getPendingLawyerVerifications);
router.patch("/lawyers/:lawyerId/verification", updateLawyerVerification);

export default router;
