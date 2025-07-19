import Chat from "../models/Chat.js";
import User from "../models/User.js";
import Query from "../models/Query.js";
import Dispute from "../models/Dispute.js";

// Get user's chats
export const getUserChats = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const chats = await Chat.find({
            "participants.user": req.user._id,
            isActive: true,
        })
            .populate(
                "participants.user",
                "name email role lawyerDetails.specialization"
            )
            .populate("lastMessage.sender", "name role")
            .sort({ updatedAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        // Add unread count for each chat
        const chatsWithUnreadCount = chats.map((chat) => ({
            ...chat.toObject(),
            unreadCount: chat.getUnreadCount(req.user._id),
        }));

        res.json({
            success: true,
            data: { chats: chatsWithUnreadCount },
        });
    } catch (error) {
        console.error("Get user chats error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get chats",
        });
    }
};

// Get chat by ID with messages
export const getChatById = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { page = 1, limit = 50 } = req.query;

        const chat = await Chat.findOne({
            chatId,
            "participants.user": req.user._id,
        })
            .populate(
                "participants.user",
                "name email role lawyerDetails.specialization"
            )
            .populate("messages.sender", "name role")
            .populate("relatedCase.caseId");

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found",
            });
        }

        // Paginate messages
        const totalMessages = chat.messages.length;
        const startIndex = Math.max(0, totalMessages - page * limit);
        const endIndex = totalMessages - (page - 1) * limit;

        const paginatedMessages = chat.messages.slice(startIndex, endIndex);

        // Mark messages as read
        chat.markAsRead(req.user._id);
        await chat.save();

        res.json({
            success: true,
            data: {
                chat: {
                    ...chat.toObject(),
                    messages: paginatedMessages,
                },
                pagination: {
                    current: parseInt(page),
                    total: totalMessages,
                    hasMore: startIndex > 0,
                },
            },
        });
    } catch (error) {
        console.error("Get chat by ID error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get chat",
        });
    }
};

// Note: Message sending is handled via Socket.io real-time events
// This function is kept for reference but not used in routes

// Create or get direct chat between users
export const createDirectChat = async (req, res) => {
    try {
        const { userId } = req.params;

        // Check if target user exists
        const targetUser = await User.findById(userId);
        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Create chat ID (sorted to ensure consistency)
        const chatId = `direct_${[req.user._id, userId].sort().join("_")}`;

        // Check if chat already exists
        let chat = await Chat.findOne({ chatId }).populate(
            "participants.user",
            "name email role lawyerDetails.specialization"
        );

        if (!chat) {
            // Create new chat
            chat = await Chat.create({
                chatId,
                participants: [
                    { user: req.user._id, role: req.user.role },
                    { user: userId, role: targetUser.role },
                ],
                chatType: "direct",
            });

            await chat.populate(
                "participants.user",
                "name email role lawyerDetails.specialization"
            );
        }

        res.json({
            success: true,
            data: { chat },
        });
    } catch (error) {
        console.error("Create direct chat error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create chat",
        });
    }
};

// Get chat messages (additional endpoint for loading more messages)
export const getChatMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { page = 1, limit = 50, before } = req.query;

        const chat = await Chat.findOne({
            chatId,
            "participants.user": req.user._id,
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found",
            });
        }

        let messages = chat.messages;

        // Filter messages before a certain timestamp if provided
        if (before) {
            const beforeDate = new Date(before);
            messages = messages.filter((msg) => msg.timestamp < beforeDate);
        }

        // Sort by timestamp and paginate
        messages.sort((a, b) => b.timestamp - a.timestamp);
        const startIndex = (page - 1) * limit;
        const paginatedMessages = messages.slice(
            startIndex,
            startIndex + parseInt(limit)
        );

        // Populate sender information
        await Chat.populate(paginatedMessages, {
            path: "sender",
            select: "name role",
        });

        res.json({
            success: true,
            data: {
                messages: paginatedMessages.reverse(), // Return in chronological order
                pagination: {
                    current: parseInt(page),
                    hasMore: startIndex + parseInt(limit) < messages.length,
                },
            },
        });
    } catch (error) {
        console.error("Get chat messages error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get messages",
        });
    }
};

// Get or create case-specific chat
export const getCaseChat = async (req, res) => {
    try {
        const { caseType, caseId } = req.params;

        // Validate case type
        if (!["query", "dispute"].includes(caseType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid case type. Must be 'query' or 'dispute'",
            });
        }

        // Get the appropriate model
        const Model = caseType === "query" ? Query : Dispute;

        // Find the case
        const caseDoc = await Model.findById(caseId);
        if (!caseDoc) {
            return res.status(404).json({
                success: false,
                message: `${caseType.charAt(0).toUpperCase() + caseType.slice(1)} not found`,
            });
        }

        // Check if user has access to this case
        const hasAccess =
            caseDoc.citizen.toString() === req.user._id.toString() ||
            (caseDoc.assignedLawyer && caseDoc.assignedLawyer.toString() === req.user._id.toString()) ||
            req.user.role === "admin";

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        // Check if case has an assigned lawyer
        if (!caseDoc.assignedLawyer) {
            return res.status(400).json({
                success: false,
                message: "Chat is only available after a lawyer is assigned to the case",
            });
        }

        // Create chat ID for the case
        const chatId = `${caseType}_${caseId}`;

        // Find or create chat
        let chat = await Chat.findOne({ chatId })
            .populate("participants.user", "name email role lawyerDetails.specialization")
            .populate("lastMessage.sender", "name role");

        if (!chat) {
            // Create new case chat
            chat = await Chat.create({
                chatId,
                participants: [
                    { user: caseDoc.citizen, role: "citizen" },
                    { user: caseDoc.assignedLawyer, role: "lawyer" },
                ],
                chatType: caseType,
                relatedCase: {
                    caseType,
                    caseId,
                },
            });

            // Populate the newly created chat
            chat = await Chat.findOne({ chatId })
                .populate("participants.user", "name email role lawyerDetails.specialization")
                .populate("lastMessage.sender", "name role");
        }

        res.json({
            success: true,
            data: { chat },
        });
    } catch (error) {
        console.error("Get case chat error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get case chat",
        });
    }
};

// Get case chat messages
export const getCaseChatMessages = async (req, res) => {
    try {
        const { caseType, caseId } = req.params;
        const { page = 1, limit = 50 } = req.query;

        // Validate case type
        if (!["query", "dispute"].includes(caseType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid case type. Must be 'query' or 'dispute'",
            });
        }

        // Create chat ID for the case
        const chatId = `${caseType}_${caseId}`;

        // Find chat and verify user access
        const chat = await Chat.findOne({
            chatId,
            "participants.user": req.user._id,
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found or access denied",
            });
        }

        // Get messages with pagination
        const messages = chat.messages || [];
        const startIndex = Math.max(0, messages.length - page * limit);
        const endIndex = messages.length - (page - 1) * limit;
        const paginatedMessages = messages.slice(startIndex, endIndex);

        // Populate sender information
        await chat.populate("messages.sender", "name role");

        // Mark messages as read
        chat.markMessagesAsRead(req.user._id);
        await chat.save();

        res.json({
            success: true,
            data: {
                messages: paginatedMessages.reverse(), // Return in chronological order
                pagination: {
                    current: parseInt(page),
                    hasMore: startIndex > 0,
                },
            },
        });
    } catch (error) {
        console.error("Get case chat messages error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get messages",
        });
    }
};