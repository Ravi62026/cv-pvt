import { Server } from "socket.io";
import { verifyAccessToken } from "../utils/jwt.js";
import User from "../models/User.js";
import {
    checkMessageRateLimit,
    validateChatAccess,
    saveMessageToDatabase,
    createChatRoom,
} from "../utils/socketHelpers.js";

export const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true,
        },
        pingTimeout: 60000,
        pingInterval: 25000,
    });

    // Store active users and chat rooms
    const activeUsers = new Map();
    const activeChatRooms = new Map();

    // Socket authentication middleware
    io.use(async (socket, next) => {
        try {
            const token =
                socket.handshake.auth.token ||
                socket.handshake.headers.authorization?.split(" ")[1];

            if (!token) {
                return next(new Error("Authentication token required"));
            }

            const decoded = verifyAccessToken(token);
            const user = await User.findById(decoded.id).select(
                "-password -refreshToken"
            );

            if (!user || !user.isActive) {
                return next(new Error("User not found or inactive"));
            }

            socket.userId = user._id.toString();
            socket.userRole = user.role;
            socket.userName = user.name;
            next();
        } catch (error) {
            console.error("Socket auth error:", error.message);
            next(new Error("Authentication failed"));
        }
    });

    io.on("connection", (socket) => {
        console.log(`🔌 USER CONNECTED: ${socket.userName} (${socket.id})`);
        console.log(`   User ID: ${socket.userId}`);
        console.log(`   Role: ${socket.userRole}`);
        console.log(`   Socket ID: ${socket.id}`);

        // Store active user
        activeUsers.set(socket.id, {
            userId: socket.userId,
            role: socket.userRole,
            name: socket.userName,
            socketId: socket.id,
        });

        // Join user to their personal notification room
        socket.join(`user_${socket.userId}`);
        console.log(`   ✅ Joined personal room: user_${socket.userId}`);

        // Handle joining chat rooms
        socket.on("join_chat", async (chatId) => {
            console.log(`🏠 JOIN_CHAT EVENT:`);
            console.log(`   User: ${socket.userName} (${socket.userId})`);
            console.log(`   Chat ID: ${chatId}`);

            try {
                // Verify user has access to this chat
                const hasAccess = await validateChatAccess(
                    chatId,
                    socket.userId
                );
                console.log(`   Access Check: ${hasAccess ? '✅ GRANTED' : '❌ DENIED'}`);

                if (!hasAccess) {
                    console.log(`   ❌ Access denied for user ${socket.userName} to chat ${chatId}`);
                    socket.emit("error", {
                        message: "Access denied to chat room",
                    });
                    return;
                }

                socket.join(chatId);
                console.log(`   ✅ User joined chat room: ${chatId}`);

                if (!activeChatRooms.has(chatId)) {
                    activeChatRooms.set(chatId, new Set());
                }
                activeChatRooms.get(chatId).add(socket.id);

                // Mark messages as read when joining chat
                const { default: Chat } = await import("../models/Chat.js");
                const chat = await Chat.findOne({ chatId });
                if (chat) {
                    chat.markAsRead(socket.userId);
                    await chat.save();

                    // Notify other participants about read status
                    socket.to(chatId).emit("messages_read", {
                        chatId,
                        readBy: socket.userId,
                    });
                }

                socket.emit("chat_joined", { chatId, success: true });
                console.log(`User ${socket.userName} joined chat: ${chatId}`);
            } catch (error) {
                console.error("Join chat error:", error);
                socket.emit("error", { message: "Failed to join chat" });
            }
        });

        // Handle leaving chat rooms
        socket.on("leave_chat", (chatId) => {
            socket.leave(chatId);

            if (activeChatRooms.has(chatId)) {
                activeChatRooms.get(chatId).delete(socket.id);
                if (activeChatRooms.get(chatId).size === 0) {
                    activeChatRooms.delete(chatId);
                }
            }

            console.log(`User ${socket.userName} left chat: ${chatId}`);
        });

        // Handle new messages
        socket.on("send_message", async (messageData) => {
            console.log(`💬 SEND_MESSAGE EVENT:`);
            console.log(`   From: ${socket.userName} (${socket.userId})`);
            console.log(`   Data:`, messageData);

            try {
                const { chatId, content, messageType = "text" } = messageData;
                console.log(`   Chat ID: ${chatId}`);
                console.log(`   Content: ${content}`);
                console.log(`   Message Type: ${messageType}`);

                if (!content || content.trim().length === 0) {
                    console.log(`   ❌ Empty message content`);
                    socket.emit("error", {
                        message: "Message content cannot be empty",
                    });
                    return;
                }

                if (content.length > 1000) {
                    socket.emit("error", {
                        message: "Message too long. Maximum 1000 characters.",
                    });
                    return;
                }

                // Check rate limiting
                if (!checkMessageRateLimit(socket.userId)) {
                    socket.emit("error", {
                        message:
                            "Message rate limit exceeded. Please slow down.",
                    });
                    return;
                }

                // Verify user has access to this chat
                const hasAccess = await validateChatAccess(
                    chatId,
                    socket.userId
                );
                if (!hasAccess) {
                    socket.emit("error", {
                        message: "Chat not found or access denied",
                    });
                    return;
                }

                // Save message to database
                const savedMessage = await saveMessageToDatabase(
                    chatId,
                    socket.userId,
                    content,
                    messageType
                );

                // Broadcast message to all users in the chat room
                const messageToSend = {
                    _id: savedMessage._id,
                    chatId,
                    content: savedMessage.content,
                    messageType: savedMessage.messageType,
                    sender: {
                        _id: socket.userId,
                        name: socket.userName,
                        role: socket.userRole,
                    },
                    timestamp: savedMessage.timestamp,
                    isRead: savedMessage.isRead,
                };

                // Send to all users in the chat room
                io.to(chatId).emit("new_message", messageToSend);

                // Send confirmation to sender
                socket.emit("message_sent", {
                    success: true,
                    messageId: savedMessage._id,
                    timestamp: savedMessage.timestamp,
                });

                console.log(
                    `Message sent in chat ${chatId} by ${socket.userName}`
                );
            } catch (error) {
                console.error("Socket message error:", error);
                socket.emit("error", {
                    message: "Failed to send message",
                    details:
                        process.env.NODE_ENV === "development"
                            ? error.message
                            : undefined,
                });
            }
        });

        // Handle typing indicators
        socket.on("typing_start", (chatId) => {
            socket.to(chatId).emit("user_typing", {
                userId: socket.userId,
                name: socket.userName,
            });
        });

        socket.on("typing_stop", (chatId) => {
            socket.to(chatId).emit("user_stop_typing", {
                userId: socket.userId,
            });
        });

        // Handle consultation requests
        socket.on("consultation_request", (data) => {
            const { lawyerId, consultationData } = data;
            socket.to(`user_${lawyerId}`).emit("new_consultation_request", {
                ...consultationData,
                from: {
                    _id: socket.userId,
                    name: socket.userName,
                    role: socket.userRole,
                },
            });
        });

        // Handle consultation updates
        socket.on("consultation_update", (data) => {
            const { participants, updateData } = data;
            participants.forEach((participantId) => {
                if (participantId !== socket.userId) {
                    socket
                        .to(`user_${participantId}`)
                        .emit("consultation_updated", updateData);
                }
            });
        });

        // Handle case assignments and chat room creation
        socket.on("case_assigned", async (data) => {
            try {
                const { citizenId, lawyerId, caseData, caseType, caseId } = data;

                // Create case-specific chat room
                const participants = [
                    { user: citizenId, role: "citizen" },
                    { user: lawyerId, role: "lawyer" },
                ];

                const chat = await createChatRoom(
                    participants,
                    caseType,
                    { caseType, caseId }
                );

                // Notify both parties about case assignment and chat creation
                const assignmentData = {
                    ...caseData,
                    chatId: chat.chatId,
                    chatCreated: true,
                };

                socket.to(`user_${citizenId}`).emit("case_assignment_update", assignmentData);
                socket.to(`user_${lawyerId}`).emit("new_case_assigned", assignmentData);

                console.log(`Case chat created: ${chat.chatId} for case ${caseId}`);
            } catch (error) {
                console.error("Case assignment error:", error);
                socket.emit("error", { message: "Failed to process case assignment" });
            }
        });

        // Handle lawyer request notifications
        socket.on("lawyer_request_sent", (data) => {
            const { citizenId, requestData } = data;
            socket.to(`user_${citizenId}`).emit("new_lawyer_request", {
                ...requestData,
                timestamp: new Date(),
            });
        });

        // Handle citizen request notifications
        socket.on("citizen_request_sent", (data) => {
            const { lawyerId, requestData } = data;
            socket.to(`user_${lawyerId}`).emit("new_citizen_request", {
                ...requestData,
                timestamp: new Date(),
            });
        });

        // Handle request responses (accept/reject)
        socket.on("request_responded", async (data) => {
            try {
                const {
                    targetUserId,
                    responseData,
                    createChat = false,
                    caseType,
                    caseId,
                    citizenId,
                    lawyerId
                } = data;

                // If request was accepted and chat should be created
                if (createChat && responseData.action === "accepted") {
                    const participants = [
                        { user: citizenId, role: "citizen" },
                        { user: lawyerId, role: "lawyer" },
                    ];

                    const chat = await createChatRoom(
                        participants,
                        caseType,
                        { caseType, caseId }
                    );

                    responseData.chatId = chat.chatId;
                    responseData.chatCreated = true;

                    console.log(`Chat created for accepted request: ${chat.chatId}`);
                }

                socket.to(`user_${targetUserId}`).emit("request_response", {
                    ...responseData,
                    timestamp: new Date(),
                });
            } catch (error) {
                console.error("Request response error:", error);
                socket.emit("error", { message: "Failed to process request response" });
            }
        });

        // Handle direct message requests
        socket.on("direct_message_request", async (data) => {
            try {
                const { lawyerId, message } = data;

                // Create direct chat room
                const participants = [
                    { user: socket.userId, role: socket.userRole },
                    { user: lawyerId, role: "lawyer" },
                ];

                const chat = await createChatRoom(participants, "direct");

                // Notify lawyer about direct message request
                socket.to(`user_${lawyerId}`).emit("new_direct_message_request", {
                    from: {
                        _id: socket.userId,
                        name: socket.userName,
                        role: socket.userRole,
                    },
                    chatId: chat.chatId,
                    message: message || "New message request",
                    timestamp: new Date(),
                });

                // Confirm to sender
                socket.emit("direct_message_request_sent", {
                    success: true,
                    chatId: chat.chatId,
                });

                console.log(`Direct chat created: ${chat.chatId}`);
            } catch (error) {
                console.error("Direct message request error:", error);
                socket.emit("error", { message: "Failed to send direct message request" });
            }
        });

        // Handle direct connection requests (new system)
        socket.on("send_connection_request", async (data) => {
            console.log(`🤝 SEND_CONNECTION_REQUEST EVENT:`);
            console.log(`   From: ${socket.userName} (${socket.userId})`);
            console.log(`   Data:`, data);

            try {
                const { lawyerId, message, connectionType } = data;
                console.log(`   To Lawyer ID: ${lawyerId}`);
                console.log(`   Message: ${message}`);
                console.log(`   Connection Type: ${connectionType}`);

                // Import DirectConnection model
                const { default: DirectConnection } = await import("../models/DirectConnection.js");

                // Check if connection already exists
                const existingConnection = await DirectConnection.findExistingConnection(socket.userId, lawyerId);

                if (existingConnection && existingConnection.status === "pending") {
                    socket.emit("connection_request_error", {
                        message: "You already have a pending connection request with this lawyer",
                    });
                    return;
                }

                // Create new connection request
                const newConnection = await DirectConnection.create({
                    citizen: socket.userId,
                    lawyer: lawyerId,
                    requestMessage: message,
                    metadata: {
                        connectionType: connectionType || "general_consultation",
                    },
                });

                // Notify lawyer
                const notificationData = {
                    connectionId: newConnection._id,
                    citizen: {
                        _id: socket.userId,
                        name: socket.userName,
                        role: socket.userRole,
                    },
                    message,
                    connectionType,
                    timestamp: new Date(),
                };

                console.log(`   🔔 Sending notification to lawyer room: user_${lawyerId}`);
                console.log(`   Notification data:`, notificationData);

                socket.to(`user_${lawyerId}`).emit("new_connection_request", notificationData);

                // Confirm to sender
                const confirmationData = {
                    success: true,
                    connectionId: newConnection._id,
                };

                console.log(`   ✅ Sending confirmation to sender:`, confirmationData);
                socket.emit("connection_request_sent", confirmationData);
            } catch (error) {
                console.error("Connection request error:", error);
                socket.emit("connection_request_error", {
                    message: "Failed to send connection request",
                });
            }
        });

        // Handle connection request responses
        socket.on("respond_to_connection_request", async (data) => {
            try {
                const { connectionId, action, responseMessage } = data; // action: 'accept' or 'reject'

                // Import DirectConnection model
                const { default: DirectConnection } = await import("../models/DirectConnection.js");

                // Find the connection request
                const connection = await DirectConnection.findOne({
                    _id: connectionId,
                    lawyer: socket.userId,
                    status: "pending",
                }).populate("citizen", "name email");

                if (!connection) {
                    socket.emit("connection_response_error", {
                        message: "Connection request not found",
                    });
                    return;
                }

                if (action === "accept") {
                    await connection.accept(responseMessage);

                    // Create chat room
                    const chat = await createChatRoom([
                        { user: connection.citizen._id, role: "citizen" },
                        { user: socket.userId, role: "lawyer" },
                    ], "direct");

                    // Update connection with chat ID
                    connection.chatId = chat.chatId;
                    await connection.save();

                    // Notify citizen
                    socket.to(`user_${connection.citizen._id}`).emit("connection_request_accepted", {
                        connectionId: connection._id,
                        chatId: chat.chatId,
                        lawyer: {
                            _id: socket.userId,
                            name: socket.userName,
                        },
                        responseMessage,
                        timestamp: new Date(),
                    });

                    socket.emit("connection_response_success", {
                        action: "accepted",
                        connectionId: connection._id,
                        chatId: chat.chatId,
                    });
                } else if (action === "reject") {
                    await connection.reject(responseMessage);

                    // Notify citizen
                    socket.to(`user_${connection.citizen._id}`).emit("connection_request_rejected", {
                        connectionId: connection._id,
                        lawyer: {
                            _id: socket.userId,
                            name: socket.userName,
                        },
                        responseMessage,
                        timestamp: new Date(),
                    });

                    socket.emit("connection_response_success", {
                        action: "rejected",
                        connectionId: connection._id,
                    });
                }
            } catch (error) {
                console.error("Connection response error:", error);
                socket.emit("connection_response_error", {
                    message: "Failed to respond to connection request",
                });
            }
        });

        // Handle marking messages as read
        socket.on("mark_messages_read", async (data) => {
            try {
                const { chatId, messageIds } = data;

                const hasAccess = await validateChatAccess(
                    chatId,
                    socket.userId
                );
                if (!hasAccess) {
                    return;
                }

                const { default: Chat } = await import("../models/Chat.js");
                const chat = await Chat.findOne({ chatId });

                if (chat) {
                    chat.markAsRead(socket.userId, messageIds);
                    await chat.save();

                    // Notify other participants
                    socket.to(chatId).emit("messages_read", {
                        chatId,
                        readBy: socket.userId,
                        messageIds,
                    });
                }
            } catch (error) {
                console.error("Mark messages read error:", error);
            }
        });

        // Handle online status
        socket.on("update_status", (status) => {
            const user = activeUsers.get(socket.id);
            if (user) {
                user.status = status;
                // Broadcast status to relevant chats
                socket.broadcast.emit("user_status_update", {
                    userId: socket.userId,
                    status,
                });
            }
        });

        // Handle disconnect
        socket.on("disconnect", (reason) => {
            console.log(`🔌 USER DISCONNECTED: ${socket.userName} (${reason})`);
            console.log(`   User ID: ${socket.userId}`);
            console.log(`   Socket ID: ${socket.id}`);
            console.log(`   Reason: ${reason}`);

            // Remove user from active users
            activeUsers.delete(socket.id);
            console.log(`   ✅ Removed from active users`);

            // Remove user from active chat rooms
            let removedFromChats = 0;
            activeChatRooms.forEach((userSet, chatId) => {
                if (userSet.has(socket.id)) {
                    userSet.delete(socket.id);
                    removedFromChats++;
                    if (userSet.size === 0) {
                        activeChatRooms.delete(chatId);
                        console.log(`   🗑️ Deleted empty chat room: ${chatId}`);
                    }
                }
            });
            console.log(`   ✅ Removed from ${removedFromChats} chat rooms`);

            // Broadcast offline status
            socket.broadcast.emit("user_status_update", {
                userId: socket.userId,
                status: "offline",
            });
            console.log(`   📡 Broadcasted offline status`);
        });

        // Handle connection errors
        socket.on("error", (error) => {
            console.error("Socket error:", error);
        });
    });

    return io;
};
