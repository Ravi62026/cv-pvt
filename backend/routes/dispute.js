import express from "express";
import {
    createDispute,
    getDisputes,
    getDisputeById,
    sendDisputeRequest,
    requestToHandleDispute,
    offerHelpOnDispute,
    respondToDisputeRequest,
    respondToLawyerRequest,
    updateDisputeStatus,
} from "../controllers/disputeController.js";
import { validateDispute } from "../middleware/validation.js";
import {
    protect,
    authorize,
    requireVerifiedLawyer,
} from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Citizen routes
router.post("/", authorize("citizen"), validateDispute, createDispute);

// Bidirectional request routes (both citizen and lawyer can use)
router.post(
    "/:disputeId/send-request",
    sendDisputeRequest
);
router.post(
    "/:disputeId/requests/:requestId/respond",
    respondToDisputeRequest
);

// Legacy routes for backward compatibility
router.post(
    "/:disputeId/request",
    authorize("lawyer"),
    requireVerifiedLawyer,
    requestToHandleDispute
);
router.post(
    "/:disputeId/offer-help",
    authorize("lawyer"),
    requireVerifiedLawyer,
    offerHelpOnDispute
);

// Common routes (with role-based access control in controller)
router.get("/", getDisputes);
router.get("/:disputeId", getDisputeById);
router.patch("/:disputeId/status", updateDisputeStatus);

export default router;
