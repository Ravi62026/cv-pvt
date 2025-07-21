import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    chatId: {
        type: String,
        required: true,
        unique: true,
    },
    participants: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            role: {
                type: String,
                enum: ["citizen", "lawyer", "admin"],
            },
            joinedAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    chatType: {
        type: String,
        enum: ["direct", "query", "dispute"],
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "active", "closed"],
        default: function() {
            // Direct chats start as pending, case chats start as active
            return this.chatType === "direct" ? "pending" : "active";
        }
    },
    relatedCase: {
        caseType: {
            type: String,
            enum: ["query", "dispute"],
        },
        caseId: mongoose.Schema.Types.ObjectId,
    },
    // For direct connections
    directConnection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DirectConnection",
    },
    messages: [
        {
            sender: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            content: {
                type: String,
                required: true,
                maxlength: [
                    1000,
                    "Message cannot be more than 1000 characters",
                ],
            },
            messageType: {
                type: String,
                enum: ["text", "file", "image", "system"],
                default: "text",
            },
            attachments: [
                {
                    filename: String,
                    originalName: String,
                    path: String,
                    size: Number,
                    mimetype: String,
                },
            ],
            isRead: [
                {
                    user: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                    },
                    readAt: {
                        type: Date,
                        default: Date.now,
                    },
                },
            ],
            timestamp: {
                type: Date,
                default: Date.now,
            },
            editedAt: Date,
            isDeleted: {
                type: Boolean,
                default: false,
            },
        },
    ],
    lastMessage: {
        content: String,
        timestamp: Date,
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for faster queries
chatSchema.index({ "participants.user": 1 });
chatSchema.index({ "relatedCase.caseId": 1 });

// Update timestamps and last message
chatSchema.pre("save", function (next) {
    this.updatedAt = Date.now();

    if (this.messages && this.messages.length > 0) {
        const lastMsg = this.messages[this.messages.length - 1];
        this.lastMessage = {
            content: lastMsg.content,
            timestamp: lastMsg.timestamp,
            sender: lastMsg.sender,
        };
    }

    next();
});

// Method to add message
chatSchema.methods.addMessage = function (
    senderId,
    content,
    messageType = "text",
    attachments = []
) {
    const message = {
        sender: senderId,
        content,
        messageType,
        attachments,
        timestamp: new Date(),
    };

    this.messages.push(message);
    return message;
};

// Method to mark messages as read
chatSchema.methods.markAsRead = function (userId, messageIds = []) {
    if (messageIds.length === 0) {
        // Mark all unread messages as read
        this.messages.forEach((message) => {
            const hasRead = message.isRead.some(
                (read) => read.user.toString() === userId.toString()
            );
            if (!hasRead) {
                message.isRead.push({ user: userId });
            }
        });
    } else {
        // Mark specific messages as read
        messageIds.forEach((msgId) => {
            const message = this.messages.id(msgId);
            if (message) {
                const hasRead = message.isRead.some(
                    (read) => read.user.toString() === userId.toString()
                );
                if (!hasRead) {
                    message.isRead.push({ user: userId });
                }
            }
        });
    }
};

// Method to get unread message count for a user
chatSchema.methods.getUnreadCount = function (userId) {
    return this.messages.filter((message) => {
        return (
            message.sender.toString() !== userId.toString() &&
            !message.isRead.some(
                (read) => read.user.toString() === userId.toString()
            ) &&
            !message.isDeleted
        );
    }).length;
};

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
