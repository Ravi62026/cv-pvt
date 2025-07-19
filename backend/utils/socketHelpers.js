import Chat from "../models/Chat.js";
import User from "../models/User.js";

// Rate limiting for socket messages (per user)
const userMessageLimits = new Map();

export const checkMessageRateLimit = (userId) => {
    const now = Date.now();
    const userLimits = userMessageLimits.get(userId) || {
        count: 0,
        resetTime: now + 60000,
    }; // 1 minute window

    if (now > userLimits.resetTime) {
        userLimits.count = 0;
        userLimits.resetTime = now + 60000;
    }

    if (userLimits.count >= 30) {
        // 30 messages per minute
        return false;
    }

    userLimits.count++;
    userMessageLimits.set(userId, userLimits);
    return true;
};

export const validateChatAccess = async (chatId, userId) => {
    try {
        const chat = await Chat.findOne({
            chatId,
            "participants.user": userId,
        });
        return chat !== null;
    } catch (error) {
        console.error("Chat access validation error:", error);
        return false;
    }
};

export const saveMessageToDatabase = async (
    chatId,
    userId,
    content,
    messageType = "text"
) => {
    try {
        const chat = await Chat.findOne({ chatId });
        if (!chat) {
            throw new Error("Chat not found");
        }

        const message = chat.addMessage(userId, content, messageType);
        await chat.save();

        // Populate sender information
        await chat.populate("messages.sender", "name role");
        return chat.messages[chat.messages.length - 1];
    } catch (error) {
        console.error("Save message error:", error);
        throw error;
    }
};

export const createChatRoom = async (
    participants,
    chatType,
    relatedCase = null
) => {
    try {
        const chatId =
            chatType === "direct"
                ? `direct_${participants
                      .map((p) => p.user)
                      .sort()
                      .join("_")}`
                : `/${relatedCase.caseId}/${chatType}_${relatedCase.caseId}_${Date.now()}`;

        let chat = await Chat.findOne({ chatId });

        if (!chat) {
            chat = await Chat.create({
                chatId,
                participants,
                chatType,
                relatedCase,
            });
        }

        return chat;
    } catch (error) {
        console.error("Create chat room error:", error);
        throw error;
    }
};



// Clean up old rate limit data periodically
setInterval(() => {
    const now = Date.now();
    for (const [userId, limits] of userMessageLimits.entries()) {
        if (now > limits.resetTime) {
            userMessageLimits.delete(userId);
        }
    }
}, 60000); // Clean up every minute
