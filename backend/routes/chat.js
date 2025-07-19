import express from "express";
import {
    getUserChats,
    getChatById,
    createDirectChat,
    getChatMessages,
    getCaseChat,
    getCaseChatMessages,
} from "../controllers/chatController.js";
import { validateMessage } from "../middleware/validation.js";
import { protect } from "../middleware/auth.js";
import { messageLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get user's chats
router.get("/", getUserChats);

// Create or get direct chat with another user
router.post("/direct/:userId", createDirectChat);

// Case-specific chats
router.get("/case/:caseType/:caseId", getCaseChat);
router.get("/case/:caseType/:caseId/messages", getCaseChatMessages);

// Get specific chat by ID
router.get("/:chatId", getChatById);

// Get chat messages with pagination
router.get("/:chatId/messages", getChatMessages);

// Messages are sent via Socket.io real-time events, not HTTP endpoints
// Real-time messaging provides better user experience and instant delivery

export default router;
 