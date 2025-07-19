import express from "express";
import {
    getVerifiedLawyers,
    getLawyerProfile,
    offerHelpOnCase,
    getAvailableCases,
    getMyAssignedCases,
    acceptClientConnection,
    getMyClients,
    getMyDirectClients,
    getLawyerDashboardStats,
    getPendingDirectRequests,
    acceptDirectRequest,
    getMyDirectChats,
} from "../controllers/lawyerController.js";
import {
    protect,
    authorize,
    requireVerifiedLawyer,
} from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/verified", getVerifiedLawyers);
router.get("/:lawyerId/profile", getLawyerProfile);

// Protected routes - Lawyer only
router.use(protect);
router.use(authorize("lawyer"));

// Dashboard and stats
router.get("/dashboard/stats", getLawyerDashboardStats);

// Case management
router.get("/available-cases", getAvailableCases);
router.get("/my-cases", getMyAssignedCases);
router.post(
    "/offer-help/:caseType/:caseId",
    requireVerifiedLawyer,
    offerHelpOnCase
);

// Client management
router.get("/my-clients", getMyClients);
router.get("/my-direct-clients", getMyDirectClients);
router.post(
    "/accept-client/:citizenId",
    requireVerifiedLawyer,
    acceptClientConnection
);

// Direct message request management
router.get("/pending-requests", getPendingDirectRequests);
router.post("/accept-request/:chatId", requireVerifiedLawyer, acceptDirectRequest);
router.get("/my-chats", getMyDirectChats);

export default router;
