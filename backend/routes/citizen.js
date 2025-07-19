import express from "express";
import {
    getCitizenDashboard,
    getMyLawyers,
    getMyCases,
    sendDirectMessageRequest,
    getPendingRequests,
    getReceivedOffers,
    getAvailableLawyers,
    requestLawyerForQuery,
    requestLawyerForDispute,
} from "../controllers/citizenController.js";
import { protect, authorize } from "../middleware/auth.js";
import { messageLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// All routes require citizen authentication
router.use(protect);
router.use(authorize("citizen"));

// Dashboard and stats
router.get("/dashboard", getCitizenDashboard);

// Lawyer management
router.get("/my-lawyers", getMyLawyers);
router.get("/available-lawyers", getAvailableLawyers);

// Case management
router.get("/my-cases", getMyCases);

// Direct messaging (for general consultation)
router.post(
    "/message-request/:lawyerId",
    messageLimiter,
    sendDirectMessageRequest
);



// Dedicated lawyer request APIs
router.post(
    "/request-lawyer-for-query/:queryId/:lawyerId",
    requestLawyerForQuery
);
router.post(
    "/request-lawyer-for-dispute/:disputeId/:lawyerId",
    requestLawyerForDispute
);

// Request and offer management
router.get("/pending-requests", getPendingRequests);
router.get("/received-offers", getReceivedOffers);

export default router;
