import express from "express";
import {
    createQuery,
    getQueries,
    getQueryById,
    sendQueryRequest,
    requestToHandleQuery,
    offerHelpOnQuery,
    respondToQueryRequest,
    respondToLawyerRequest,
    updateQueryStatus,
} from "../controllers/queryController.js";
import { validateQuery } from "../middleware/validation.js";
import {
    protect,
    authorize,
    requireVerifiedLawyer,
} from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Citizen routes
router.post("/", authorize("citizen"), validateQuery, createQuery);

// Bidirectional request routes (both citizen and lawyer can use)
router.post(
    "/:queryId/send-request",
    sendQueryRequest
);
router.post(
    "/:queryId/requests/:requestId/respond",
    respondToQueryRequest
);

// Legacy routes for backward compatibility
router.post(
    "/:queryId/request",
    authorize("lawyer"),
    requireVerifiedLawyer,
    requestToHandleQuery
);
router.post(
    "/:queryId/offer-help",
    authorize("lawyer"),
    requireVerifiedLawyer,
    offerHelpOnQuery
);

// Common routes (with role-based access control in controller)
router.get("/", getQueries);
router.get("/:queryId", getQueryById);
router.patch("/:queryId/status", updateQueryStatus);

export default router;
