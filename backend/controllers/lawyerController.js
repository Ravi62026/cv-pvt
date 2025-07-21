import User from "../models/User.js";
import Query from "../models/Query.js";
import Dispute from "../models/Dispute.js";
import Chat from "../models/Chat.js";
import DirectConnection from "../models/DirectConnection.js";

// Get all verified lawyers
export const getVerifiedLawyers = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            specialization,
            experience,
            search,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = req.query;

        console.log("🔍 getVerifiedLawyers called with params:", req.query);

        // Build query for verified lawyers
        const query = {
            role: "lawyer",
            isActive: true,
            isVerified: true,
        };

        console.log("📋 Initial query:", query);

        // Add filters
        if (specialization && specialization !== "all") {
            query["lawyerDetails.specialization"] = { $in: [specialization] };
        }

        if (experience && experience !== "all") {
            const expRange = experience.split("-");
            if (expRange.length === 2) {
                query["lawyerDetails.experience"] = {
                    $gte: parseInt(expRange[0]),
                    $lte: parseInt(expRange[1]),
                };
            }
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                {
                    "lawyerDetails.specialization": {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    "lawyerDetails.education": {
                        $regex: search,
                        $options: "i",
                    },
                },
            ];
        }

        // Sort options
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

        console.log("🔍 Final query before execution:", query);
        console.log("📊 Sort options:", sortOptions);

        // First, let's check total lawyers in database
        const totalLawyersInDB = await User.countDocuments({ role: "lawyer" });
        const activeLawyers = await User.countDocuments({ role: "lawyer", isActive: true });
        const verifiedLawyers = await User.countDocuments({ role: "lawyer", isVerified: true });
        const activeAndVerifiedLawyers = await User.countDocuments({ role: "lawyer", isActive: true, isVerified: true });

        console.log("📈 Database stats:");
        console.log("   Total lawyers:", totalLawyersInDB);
        console.log("   Active lawyers:", activeLawyers);
        console.log("   Verified lawyers:", verifiedLawyers);
        console.log("   Active & Verified lawyers:", activeAndVerifiedLawyers);

        const lawyers = await User.find(query)
            .select("-password -refreshToken -messageRequests")
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        console.log("✅ Query executed successfully:");
        console.log("   Found lawyers:", lawyers.length);
        console.log("   Total matching query:", total);

        res.json({
            success: true,
            data: {
                lawyers,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total,
                },
            },
        });
    } catch (error) {
        console.error("Get verified lawyers error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get lawyers",
        });
    }
};

// Get lawyer profile by ID
export const getLawyerProfile = async (req, res) => {
    try {
        const { lawyerId } = req.params;

        const lawyer = await User.findOne({
            _id: lawyerId,
            role: "lawyer",
            isActive: true,
            isVerified: true,
        }).select("-password -refreshToken -messageRequests");

        if (!lawyer) {
            return res.status(404).json({
                success: false,
                message: "Lawyer not found",
            });
        }

        // Get lawyer's statistics
        const [resolvedQueries, resolvedDisputes, totalRating] =
            await Promise.all([
                Query.countDocuments({
                    assignedLawyer: lawyerId,
                    status: "resolved",
                }),
                Dispute.countDocuments({
                    assignedLawyer: lawyerId,
                    status: "resolved",
                }),
                // TODO: Calculate average rating from consultations
                Promise.resolve(4.5), // Dummy rating for now
            ]);

        const lawyerWithStats = {
            ...lawyer.toObject(),
            stats: {
                resolvedQueries,
                resolvedDisputes,
                totalCases: resolvedQueries + resolvedDisputes,
                rating: totalRating,
            },
        };

        res.json({
            success: true,
            data: { lawyer: lawyerWithStats },
        });
    } catch (error) {
        console.error("Get lawyer profile error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get lawyer profile",
        });
    }
};

// Offer help on a case (for lawyers)
export const offerHelpOnCase = async (req, res) => {
    try {
        const { caseType, caseId } = req.params;
        const { message, proposedFee, estimatedDuration } = req.body;

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

        // Check if case is available for assignment
        if (caseDoc.status !== "pending" && caseDoc.status !== "open") {
            return res.status(400).json({
                success: false,
                message: "Case is not available for offers",
            });
        }

        // Check if case is already assigned
        if (caseDoc.assignedLawyer) {
            return res.status(400).json({
                success: false,
                message: "Case is already assigned to a lawyer",
            });
        }

        // Check if lawyer already offered help
        const lawyerId = req.user._id;
        const existingOffer = caseDoc.lawyerRequests?.find(
            request => request.lawyerId.toString() === lawyerId.toString() && request.status === "pending"
        );

        if (existingOffer) {
            return res.status(400).json({
                success: false,
                message: "You have already offered help for this case",
            });
        }

        // Add lawyer offer
        if (!caseDoc.lawyerRequests) {
            caseDoc.lawyerRequests = [];
        }

        caseDoc.lawyerRequests.push({
            lawyerId: req.user._id,
            message: message || `I would like to help you with this ${caseType}`,
            proposedFee: proposedFee || 0,
            estimatedDuration,
            requestedAt: new Date(),
            status: "pending",
        });

        await caseDoc.save();

        // Send real-time notification to citizen
        const io = req.app.get("socketio");
        io.to(`user_${caseDoc.citizen}`).emit("new_lawyer_offer", {
            caseType,
            caseId,
            from: {
                _id: req.user._id,
                name: req.user.name,
                specialization: req.user.lawyerDetails?.specialization,
            },
            message,
            proposedFee,
            estimatedDuration,
            timestamp: new Date(),
        });

        res.json({
            success: true,
            message: "Offer sent successfully",
        });
    } catch (error) {
        console.error("Offer help on case error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send offer",
        });
    }
};

// Get available cases for lawyers (unassigned queries and disputes)
export const getAvailableCases = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            caseType = "all", // all, query, dispute
            category,
            priority,
            search,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = req.query;



        let cases = [];

        // Build base query for unassigned cases
        const baseQuery = {
            $or: [
                { assignedLawyer: { $exists: false } },
                { assignedLawyer: null }
            ],
            status: "pending", // Only pending cases are available for assignment
        };

        // Add filters
        if (category && category !== "all") {
            baseQuery.category = category;
        }
        if (priority && priority !== "all") {
            baseQuery.priority = priority;
        }
        if (search) {
            baseQuery.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        const lawyerId = req.user._id;

        // Get queries
        if (caseType === "all" || caseType === "query") {
            const queries = await Query.find(baseQuery)
                .populate("citizen", "name email phone")
                .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 });



            cases.push(...queries.map(query => {
                const queryObj = query.toObject();
                // Check if current lawyer has already sent a request
                const hasRequested = query.lawyerRequests && query.lawyerRequests.some(req =>
                    req.lawyerId.toString() === lawyerId.toString()
                );
                return {
                    ...queryObj,
                    caseType: "query",
                    hasLawyerRequested: hasRequested
                };
            }));
        }

        // Get disputes
        if (caseType === "all" || caseType === "dispute") {
            const disputes = await Dispute.find(baseQuery)
                .populate("citizen", "name email phone")
                .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 });



            cases.push(...disputes.map(dispute => {
                const disputeObj = dispute.toObject();
                // Check if current lawyer has already sent a request
                const hasRequested = dispute.lawyerRequests && dispute.lawyerRequests.some(req =>
                    req.lawyerId.toString() === lawyerId.toString()
                );
                return {
                    ...disputeObj,
                    caseType: "dispute",
                    hasLawyerRequested: hasRequested
                };
            }));
        }



        // Sort combined results
        cases.sort((a, b) => {
            const aValue = a[sortBy];
            const bValue = b[sortBy];
            if (sortOrder === "desc") {
                return new Date(bValue) - new Date(aValue);
            }
            return new Date(aValue) - new Date(bValue);
        });

        // Paginate
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedCases = cases.slice(startIndex, endIndex);

        res.json({
            success: true,
            data: {
                cases: paginatedCases,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(cases.length / limit),
                    total: cases.length,
                },
            },
        });
    } catch (error) {
        console.error("Get available cases error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get available cases",
        });
    }
};

// Get lawyer's assigned cases
export const getMyAssignedCases = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            caseType = "all",
            status,
            search,
        } = req.query;

        const lawyerId = req.user._id;
        let cases = [];

        // Build base query
        const baseQuery = { assignedLawyer: lawyerId };
        if (status && status !== "all") {
            baseQuery.status = status;
        }
        if (search) {
            baseQuery.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        // Get assigned queries
        if (caseType === "all" || caseType === "query") {
            const queries = await Query.find(baseQuery)
                .populate("citizen", "name email phone")
                .sort({ createdAt: -1 });

            for (const query of queries) {
                // Find associated chat room
                const chatId = `/${query._id}/query_${query._id}_${Date.now()}`;
                const chat = await Chat.findOne({
                    "relatedCase.caseId": query._id,
                    "relatedCase.caseType": "query",
                    "participants.user": lawyerId
                });

                cases.push({
                    ...query.toObject(),
                    caseType: "query",
                    chatRoom: chat ? {
                        chatId: chat.chatId,
                        status: chat.status,
                        lastMessage: chat.lastMessage,
                        unreadCount: chat.getUnreadCount ? chat.getUnreadCount(lawyerId) : 0
                    } : null
                });
            }
        }

        // Get assigned disputes
        if (caseType === "all" || caseType === "dispute") {
            const disputes = await Dispute.find(baseQuery)
                .populate("citizen", "name email phone")
                .sort({ createdAt: -1 });

            for (const dispute of disputes) {
                // Find associated chat room
                const chat = await Chat.findOne({
                    "relatedCase.caseId": dispute._id,
                    "relatedCase.caseType": "dispute",
                    "participants.user": lawyerId
                });

                cases.push({
                    ...dispute.toObject(),
                    caseType: "dispute",
                    chatRoom: chat ? {
                        chatId: chat.chatId,
                        status: chat.status,
                        lastMessage: chat.lastMessage,
                        unreadCount: chat.getUnreadCount ? chat.getUnreadCount(lawyerId) : 0
                    } : null
                });
            }
        }

        // Sort by creation date
        cases.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Paginate
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedCases = cases.slice(startIndex, endIndex);

        res.json({
            success: true,
            data: {
                cases: paginatedCases,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(cases.length / limit),
                    total: cases.length,
                },
            },
        });
    } catch (error) {
        console.error("Get my assigned cases error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get assigned cases",
        });
    }
};

// Accept client connection (for lawyers)
export const acceptClientConnection = async (req, res) => {
    try {
        const { citizenId } = req.params;

        // Check if lawyer
        if (req.user.role !== "lawyer") {
            return res.status(403).json({
                success: false,
                message: "Only lawyers can accept client connections",
            });
        }

        // Check if citizen exists
        const citizen = await User.findOne({
            _id: citizenId,
            role: "citizen",
            isActive: true,
        });

        if (!citizen) {
            return res.status(404).json({
                success: false,
                message: "Citizen not found",
            });
        }

        // Add connection for both users
        const lawyer = await User.findById(req.user._id);

        // Check if already connected
        const existingConnection = lawyer.connections.find(
            (conn) =>
                conn.userId.toString() === citizenId &&
                conn.connectionType === "client"
        );

        if (existingConnection) {
            return res.status(400).json({
                success: false,
                message: "Already connected with this client",
            });
        }

        // Add connections
        lawyer.connections.push({
            userId: citizenId,
            connectionType: "client",
        });

        citizen.connections.push({
            userId: req.user._id,
            connectionType: "lawyer",
        });

        await Promise.all([lawyer.save(), citizen.save()]);

        // Send real-time notification
        const io = req.app.get("socketio");
        io.to(`user_${citizenId}`).emit("connection_accepted", {
            lawyer: {
                _id: req.user._id,
                name: req.user.name,
                specialization: req.user.lawyerDetails?.specialization,
            },
        });

        res.json({
            success: true,
            message: "Client connection accepted successfully",
        });
    } catch (error) {
        console.error("Accept client connection error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to accept client connection",
        });
    }
};

// Get pending direct message requests for lawyer
export const getPendingDirectRequests = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const lawyerId = req.user._id;

        // Find all chats where this lawyer is a participant and chat is pending
        const pendingChats = await Chat.find({
            "participants.user": lawyerId,
            chatType: "direct",
            status: "pending"
        })
        .populate("participants.user", "name email role")
        .populate("lastMessage.sender", "name role")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

        const total = await Chat.countDocuments({
            "participants.user": lawyerId,
            chatType: "direct",
            status: "pending"
        });

        res.json({
            success: true,
            data: {
                requests: pendingChats,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total,
                },
            },
        });
    } catch (error) {
        console.error("Get pending direct requests error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get pending requests",
        });
    }
};

// Accept direct message request
export const acceptDirectRequest = async (req, res) => {
    try {
        const { chatId } = req.params;
        const lawyerId = req.user._id;

        // Find the chat
        const chat = await Chat.findOne({
            chatId,
            "participants.user": lawyerId,
            chatType: "direct"
        }).populate("participants.user", "name email role");

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat request not found",
            });
        }

        // Update chat status to active
        chat.status = "active";
        await chat.save();

        // Get the citizen from participants
        const citizen = chat.participants.find(p => p.user.role === "citizen");

        if (citizen) {
            // Send real-time notification to citizen
            const io = req.app.get("socketio");
            io.to(`user_${citizen.user._id}`).emit("direct_request_accepted", {
                chatId,
                lawyer: {
                    _id: lawyerId,
                    name: req.user.name,
                    specialization: req.user.lawyerDetails?.specialization,
                },
                timestamp: new Date(),
            });
        }

        res.json({
            success: true,
            message: "Direct message request accepted successfully",
            data: { chat },
        });
    } catch (error) {
        console.error("Accept direct request error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to accept request",
        });
    }
};

// Get lawyer's active direct chats
export const getMyDirectChats = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const lawyerId = req.user._id;

        // Find all active direct chats for this lawyer
        const activeChats = await Chat.find({
            "participants.user": lawyerId,
            chatType: "direct",
            status: "active"
        })
        .populate("participants.user", "name email role")
        .populate("lastMessage.sender", "name role")
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

        const total = await Chat.countDocuments({
            "participants.user": lawyerId,
            chatType: "direct",
            status: "active"
        });

        res.json({
            success: true,
            data: {
                chats: activeChats,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total,
                },
            },
        });
    } catch (error) {
        console.error("Get my direct chats error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get direct chats",
        });
    }
};

// Get lawyer's direct clients (from active direct chats)
export const getMyDirectClients = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const lawyerId = req.user._id;

        // Find all active direct chats for this lawyer
        const activeChats = await Chat.find({
            "participants.user": lawyerId,
            chatType: "direct",
            status: "active"
        })
        .populate("participants.user", "name email phone role createdAt")
        .sort({ updatedAt: -1 });

        // Extract unique citizens from these chats
        const clientsMap = new Map();

        activeChats.forEach(chat => {
            const citizen = chat.participants.find(p => p.user.role === "citizen");
            if (citizen && !clientsMap.has(citizen.user._id.toString())) {
                clientsMap.set(citizen.user._id.toString(), {
                    _id: citizen.user._id,
                    name: citizen.user.name,
                    email: citizen.user.email,
                    phone: citizen.user.phone,
                    role: citizen.user.role,
                    connectedAt: citizen.joinedAt,
                    lastChatUpdate: chat.updatedAt,
                    chatId: chat.chatId
                });
            }
        });

        const allClients = Array.from(clientsMap.values());

        // Apply pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedClients = allClients.slice(startIndex, endIndex);

        res.json({
            success: true,
            data: {
                clients: paginatedClients,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(allClients.length / limit),
                    total: allClients.length,
                },
            },
        });
    } catch (error) {
        console.error("Get my direct clients error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get direct clients",
        });
    }
};

// Get lawyer's clients (legacy - from connections field)
export const getMyClients = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const lawyer = await User.findById(req.user._id).populate({
            path: "connections.userId",
            match: { role: "citizen" },
            select: "name email phone createdAt",
        });

        const clients = lawyer.connections
            .filter((conn) => conn.connectionType === "client" && conn.userId)
            .map((conn) => ({
                ...conn.userId.toObject(),
                connectedAt: conn.connectedAt,
            }));

        // Paginate results
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedClients = clients.slice(startIndex, endIndex);

        res.json({
            success: true,
            data: {
                clients: paginatedClients,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(clients.length / limit),
                    total: clients.length,
                },
            },
        });
    } catch (error) {
        console.error("Get my clients error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get clients",
        });
    }
};

// Get lawyer dashboard stats
export const getLawyerDashboardStats = async (req, res) => {
    try {
        const lawyerId = req.user._id;

        const [
            totalClients,
            activeQueries,
            activeDisputes,
            totalQueries,
            totalDisputes,
            resolvedQueries,
            resolvedDisputes,
        ] = await Promise.all([
            User.findById(lawyerId).then(
                (lawyer) =>
                    lawyer.connections.filter(
                        (conn) => conn.connectionType === "client"
                    ).length
            ),
            Query.countDocuments({
                assignedLawyer: lawyerId,
                status: { $in: ["assigned", "in-progress"] },
            }),
            Dispute.countDocuments({
                assignedLawyer: lawyerId,
                status: { $in: ["assigned", "in-progress"] },
            }),
            Query.countDocuments({ assignedLawyer: lawyerId }),
            Dispute.countDocuments({ assignedLawyer: lawyerId }),
            Query.countDocuments({
                assignedLawyer: lawyerId,
                status: "resolved",
            }),
            Dispute.countDocuments({
                assignedLawyer: lawyerId,
                status: "resolved",
            }),
        ]);

        res.json({
            success: true,
            data: {
                totalClients,
                activeQueries,
                activeDisputes,
                totalCases: totalQueries + totalDisputes,
                resolvedCases: resolvedQueries + resolvedDisputes,
                activeCases: activeQueries + activeDisputes,
            },
        });
    } catch (error) {
        console.error("Get lawyer dashboard stats error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get dashboard statistics",
        });
    }
};

// Get pending direct connection requests for lawyer (new system)
export const getPendingDirectConnectionRequests = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const lawyerId = req.user._id;

        // Get pending connection requests
        const pendingRequests = await DirectConnection.findPendingForLawyer(lawyerId)
            .sort({ requestedAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await DirectConnection.countDocuments({
            lawyer: lawyerId,
            status: "pending",
            isActive: true,
        });

        res.json({
            success: true,
            data: {
                requests: pendingRequests,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total,
                },
            },
        });
    } catch (error) {
        console.error("Get pending connection requests error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get pending connection requests",
        });
    }
};

// Accept direct connection request (new system)
export const acceptDirectConnectionRequest = async (req, res) => {
    try {
        const { connectionId } = req.params;
        const { responseMessage = "" } = req.body;
        const lawyerId = req.user._id;

        // Find the connection request
        const connection = await DirectConnection.findOne({
            _id: connectionId,
            lawyer: lawyerId,
            status: "pending",
            isActive: true,
        }).populate("citizen", "name email");

        if (!connection) {
            return res.status(404).json({
                success: false,
                message: "Connection request not found",
            });
        }

        // Accept the connection
        await connection.accept(responseMessage);

        // Create or get the chat room
        let chat = await Chat.findOne({ chatId: connection.chatId });

        if (!chat) {
            chat = await Chat.create({
                chatId: connection.chatId,
                participants: [
                    { user: connection.citizen._id, role: "citizen" },
                    { user: lawyerId, role: "lawyer" },
                ],
                chatType: "direct",
                status: "active",
                directConnection: connection._id,
            });
        } else {
            chat.status = "active";
            await chat.save();
        }

        // Send real-time notification to citizen
        const io = req.app.get("socketio");
        if (io) {
            io.to(`user_${connection.citizen._id}`).emit("connection_request_accepted", {
                connectionId: connection._id,
                chatId: connection.chatId,
                lawyer: {
                    _id: lawyerId,
                    name: req.user.name,
                    specialization: req.user.lawyerDetails?.specialization,
                },
                responseMessage,
                timestamp: new Date(),
            });
        }

        res.json({
            success: true,
            message: "Connection request accepted successfully",
            data: {
                connection: connection.toObject(),
                chatId: connection.chatId,
            },
        });
    } catch (error) {
        console.error("Accept connection request error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to accept connection request",
        });
    }
};

// Reject direct connection request (new system)
export const rejectDirectConnectionRequest = async (req, res) => {
    try {
        const { connectionId } = req.params;
        const { responseMessage = "" } = req.body;
        const lawyerId = req.user._id;

        // Find the connection request
        const connection = await DirectConnection.findOne({
            _id: connectionId,
            lawyer: lawyerId,
            status: "pending",
            isActive: true,
        }).populate("citizen", "name email");

        if (!connection) {
            return res.status(404).json({
                success: false,
                message: "Connection request not found",
            });
        }

        // Reject the connection
        await connection.reject(responseMessage);

        // Send real-time notification to citizen
        const io = req.app.get("socketio");
        if (io) {
            io.to(`user_${connection.citizen._id}`).emit("connection_request_rejected", {
                connectionId: connection._id,
                lawyer: {
                    _id: lawyerId,
                    name: req.user.name,
                    specialization: req.user.lawyerDetails?.specialization,
                },
                responseMessage,
                timestamp: new Date(),
            });
        }

        res.json({
            success: true,
            message: "Connection request rejected",
            data: { connection: connection.toObject() },
        });
    } catch (error) {
        console.error("Reject connection request error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to reject connection request",
        });
    }
};

// Get lawyer's connected citizens (new system)
export const getMyConnectedCitizens = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const lawyerId = req.user._id;

        // Get accepted connections
        const connections = await DirectConnection.findAcceptedForUser(lawyerId, "lawyer");
        console.log('🔍 BACKEND: Found connections for lawyer:', lawyerId, connections.length);
        console.log('🔍 BACKEND: Connections:', connections.map(c => ({ id: c._id, chatId: c.chatId, status: c.status })));

        // Paginate results
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedConnections = connections.slice(startIndex, endIndex);

        // Add chat information for each connection
        const connectionsWithChat = await Promise.all(
            paginatedConnections.map(async (connection) => {
                let chatInfo = null;

                if (connection.chatId) {
                    console.log('🔍 BACKEND: Looking for chat with chatId:', connection.chatId);
                    const chat = await Chat.findOne({ chatId: connection.chatId })
                        .populate("lastMessage.sender", "name role");

                    console.log('🔍 BACKEND: Found chat:', chat ? 'YES' : 'NO');
                    if (chat) {
                        chatInfo = {
                            chatId: chat.chatId,
                            status: chat.status,
                            lastMessage: chat.lastMessage,
                            unreadCount: chat.getUnreadCount ? chat.getUnreadCount(lawyerId) : 0,
                        };
                    }
                } else {
                    console.log('🔍 BACKEND: Connection has no chatId:', connection._id);
                }

                return {
                    ...connection.toObject(),
                    chatInfo,
                };
            })
        );

        res.json({
            success: true,
            data: {
                connections: connectionsWithChat,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(connections.length / limit),
                    total: connections.length,
                },
            },
        });
    } catch (error) {
        console.error("Get connected citizens error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get connected citizens",
        });
    }
};

// Get lawyer's case requests (requests sent by lawyer)
export const getMyCaseRequests = async (req, res) => {
    try {
        const lawyerId = req.user._id;
        const { page = 1, limit = 10, status } = req.query;



        // Get all queries and disputes where this lawyer has sent requests
        const [queries, disputes] = await Promise.all([
            Query.find({
                'lawyerRequests.lawyerId': lawyerId,
                ...(status && { 'lawyerRequests.status': status })
            })
            .populate('citizen', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit),

            Dispute.find({
                'lawyerRequests.lawyerId': lawyerId,
                ...(status && { 'lawyerRequests.status': status })
            })
            .populate('citizen', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
        ]);



        // Format the requests
        const requests = [];

        queries.forEach(query => {
            const lawyerRequest = query.lawyerRequests.find(
                req => req.lawyerId.toString() === lawyerId.toString()
            );
            if (lawyerRequest) {
                requests.push({
                    requestId: lawyerRequest._id,
                    caseId: query._id,
                    caseType: 'query',
                    caseTitle: query.title,
                    description: query.description,
                    category: query.category,
                    priority: query.priority,
                    citizen: query.citizen,
                    status: lawyerRequest.status,
                    message: lawyerRequest.message,
                    requestedAt: lawyerRequest.requestedAt,
                    respondedAt: lawyerRequest.respondedAt
                });
            }
        });

        disputes.forEach(dispute => {
            const lawyerRequest = dispute.lawyerRequests.find(
                req => req.lawyerId.toString() === lawyerId.toString()
            );
            if (lawyerRequest) {
                requests.push({
                    requestId: lawyerRequest._id,
                    caseId: dispute._id,
                    caseType: 'dispute',
                    caseTitle: dispute.title,
                    description: dispute.description,
                    category: dispute.category,
                    priority: dispute.priority,
                    disputeValue: dispute.disputeValue,
                    citizen: dispute.citizen,
                    status: lawyerRequest.status,
                    message: lawyerRequest.message,
                    requestedAt: lawyerRequest.requestedAt,
                    respondedAt: lawyerRequest.respondedAt
                });
            }
        });

        // Sort by request date
        requests.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));

        res.json({
            success: true,
            data: {
                requests,
                pagination: {
                    current: parseInt(page),
                    total: requests.length,
                    pages: Math.ceil(requests.length / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get my case requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch case requests'
        });
    }
};

// Get received case requests (requests sent by citizens to this lawyer)
export const getReceivedCaseRequests = async (req, res) => {
    try {
        const lawyerId = req.user._id;
        const { page = 1, limit = 10, status } = req.query;



        // Get all queries and disputes where citizens have requested this lawyer
        const [queries, disputes] = await Promise.all([
            Query.find({
                'citizenRequests.lawyerId': lawyerId
            })
            .populate('citizen', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit),

            Dispute.find({
                'citizenRequests.lawyerId': lawyerId
            })
            .populate('citizen', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
        ]);



        // Format the requests
        const requests = [];

        queries.forEach(query => {
            const citizenRequest = query.citizenRequests.find(
                req => req.lawyerId.toString() === lawyerId.toString()
            );
            if (citizenRequest && (!status || citizenRequest.status === status)) {
                requests.push({
                    requestId: citizenRequest._id,
                    caseId: query._id,
                    caseType: 'query',
                    caseTitle: query.title,
                    description: query.description,
                    category: query.category,
                    priority: query.priority,
                    citizen: query.citizen,
                    status: citizenRequest.status,
                    message: citizenRequest.message,
                    requestedAt: citizenRequest.requestedAt,
                    respondedAt: citizenRequest.respondedAt
                });
            }
        });

        disputes.forEach(dispute => {
            const citizenRequest = dispute.citizenRequests.find(
                req => req.lawyerId.toString() === lawyerId.toString()
            );
            if (citizenRequest && (!status || citizenRequest.status === status)) {
                requests.push({
                    requestId: citizenRequest._id,
                    caseId: dispute._id,
                    caseType: 'dispute',
                    caseTitle: dispute.title,
                    description: dispute.description,
                    category: dispute.category,
                    priority: dispute.priority,
                    disputeValue: dispute.disputeValue,
                    citizen: dispute.citizen,
                    status: citizenRequest.status,
                    message: citizenRequest.message,
                    requestedAt: citizenRequest.requestedAt,
                    respondedAt: citizenRequest.respondedAt
                });
            }
        });

        // Sort by request date
        requests.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));

        res.json({
            success: true,
            data: {
                requests,
                pagination: {
                    current: parseInt(page),
                    total: requests.length,
                    pages: Math.ceil(requests.length / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get received case requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch received requests'
        });
    }
};

// Accept case request
export const acceptCaseRequest = async (req, res) => {
    try {
        const lawyerId = req.user._id;
        const { requestId } = req.params;
        const { response } = req.body;

        // Find the request in queries (citizen requests to lawyer)
        let request = await Query.findOne({
            'citizenRequests._id': requestId,
            'citizenRequests.lawyerId': lawyerId
        });

        let caseType = 'query';
        let caseId = null;
        let citizenId = null;

        if (request) {
            const requestIndex = request.citizenRequests.findIndex(r => r._id.toString() === requestId);
            if (requestIndex !== -1) {
                request.citizenRequests[requestIndex].status = 'accepted';
                request.citizenRequests[requestIndex].respondedAt = new Date();
                if (response) {
                    request.citizenRequests[requestIndex].response = response;
                }

                // Set case assignment - this is the key fix!
                request.assignedLawyer = lawyerId;
                request.status = 'assigned';

                // Auto-accept any pending lawyer requests for this case since it's now assigned
                if (request.lawyerRequests && request.lawyerRequests.length > 0) {
                    request.lawyerRequests.forEach(lr => {
                        if (lr.lawyerId.toString() === lawyerId.toString() && lr.status === 'pending') {
                            lr.status = 'accepted';
                            lr.respondedAt = new Date();
                        }
                    });
                }

                await request.save();

                caseType = 'query';
                caseId = request._id;
                citizenId = request.citizen;

                // Create chat for the case
                const chatId = `${caseType}_${caseId}`;
                console.log('💬 BACKEND: Creating chat for accepted case request');
                console.log('   Case Type:', caseType);
                console.log('   Case ID:', caseId);
                console.log('   Citizen ID:', citizenId);
                console.log('   Generated Chat ID:', chatId);

                // Check if chat already exists
                let chat = await Chat.findOne({ chatId })
                    .populate("participants.user", "name email role lawyerDetails.specialization")
                    .populate("lastMessage.sender", "name role");

                if (!chat) {
                    // Create new case chat
                    chat = await Chat.create({
                        chatId,
                        participants: [
                            { user: citizenId, role: "citizen" },
                            { user: lawyerId, role: "lawyer" },
                        ],
                        chatType: caseType,
                        relatedCase: {
                            caseType,
                            caseId,
                        },
                        status: "active"
                    });

                    // Populate the newly created chat
                    chat = await Chat.findOne({ chatId })
                        .populate("participants.user", "name email role lawyerDetails.specialization")
                        .populate("lastMessage.sender", "name role");
                }

                // Send real-time notification to citizen
                const io = req.app.get("socketio");
                if (io) {
                    io.to(`user_${citizenId}`).emit("case_request_accepted", {
                        caseType,
                        caseId,
                        chatId,
                        lawyer: {
                            _id: lawyerId,
                            name: req.user.name
                        }
                    });
                }

                res.json({
                    success: true,
                    message: 'Case request accepted successfully',
                    data: {
                        request: request.citizenRequests[requestIndex],
                        chat: {
                            chatId,
                            caseType
                        }
                    }
                });
                return;
            }
        }

        // If not found in queries, check disputes (citizen requests to lawyer)
        request = await Dispute.findOne({
            'citizenRequests._id': requestId,
            'citizenRequests.lawyerId': lawyerId
        });

        if (request) {
            const requestIndex = request.citizenRequests.findIndex(r => r._id.toString() === requestId);
            if (requestIndex !== -1) {
                request.citizenRequests[requestIndex].status = 'accepted';
                request.citizenRequests[requestIndex].respondedAt = new Date();
                if (response) {
                    request.citizenRequests[requestIndex].response = response;
                }

                // Set case assignment - this is the key fix!
                request.assignedLawyer = lawyerId;
                request.status = 'assigned';

                // Auto-accept any pending lawyer requests for this case since it's now assigned
                if (request.lawyerRequests && request.lawyerRequests.length > 0) {
                    request.lawyerRequests.forEach(lr => {
                        if (lr.lawyerId.toString() === lawyerId.toString() && lr.status === 'pending') {
                            lr.status = 'accepted';
                            lr.respondedAt = new Date();
                        }
                    });
                }

                await request.save();

                caseType = 'dispute';
                caseId = request._id;
                citizenId = request.citizen;

                // Create chat for the case
                const chatId = `${caseType}_${caseId}`;
                console.log('💬 BACKEND: Creating chat for accepted case request');
                console.log('   Case Type:', caseType);
                console.log('   Case ID:', caseId);
                console.log('   Citizen ID:', citizenId);
                console.log('   Generated Chat ID:', chatId);

                // Check if chat already exists
                let chat = await Chat.findOne({ chatId })
                    .populate("participants.user", "name email role lawyerDetails.specialization")
                    .populate("lastMessage.sender", "name role");

                if (!chat) {
                    // Create new case chat
                    chat = await Chat.create({
                        chatId,
                        participants: [
                            { user: citizenId, role: "citizen" },
                            { user: lawyerId, role: "lawyer" },
                        ],
                        chatType: caseType,
                        relatedCase: {
                            caseType,
                            caseId,
                        },
                        status: "active"
                    });

                    // Populate the newly created chat
                    chat = await Chat.findOne({ chatId })
                        .populate("participants.user", "name email role lawyerDetails.specialization")
                        .populate("lastMessage.sender", "name role");
                }

                // Send real-time notification to citizen
                const io = req.app.get("socketio");
                if (io) {
                    io.to(`user_${citizenId}`).emit("case_request_accepted", {
                        caseType,
                        caseId,
                        chatId,
                        lawyer: {
                            _id: lawyerId,
                            name: req.user.name
                        }
                    });
                }

                res.json({
                    success: true,
                    message: 'Case request accepted successfully',
                    data: {
                        request: request.citizenRequests[requestIndex],
                        chat: {
                            chatId,
                            caseType
                        }
                    }
                });
                return;
            }
        }

        res.status(404).json({
            success: false,
            message: 'Case request not found'
        });

    } catch (error) {
        console.error('Accept case request error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to accept case request'
        });
    }
};

// Reject case request
export const rejectCaseRequest = async (req, res) => {
    try {
        const lawyerId = req.user._id;
        const { requestId } = req.params;
        const { response } = req.body;

        // Find the request in queries (citizen requests to lawyer)
        let request = await Query.findOne({
            'citizenRequests._id': requestId,
            'citizenRequests.lawyerId': lawyerId
        });

        if (request) {
            const requestIndex = request.citizenRequests.findIndex(r => r._id.toString() === requestId);
            if (requestIndex !== -1) {
                request.citizenRequests[requestIndex].status = 'rejected';
                request.citizenRequests[requestIndex].respondedAt = new Date();
                if (response) {
                    request.citizenRequests[requestIndex].response = response;
                }
                await request.save();

                res.json({
                    success: true,
                    message: 'Case request rejected',
                    data: { request: request.citizenRequests[requestIndex] }
                });
                return;
            }
        }

        // If not found in queries, check disputes (citizen requests to lawyer)
        request = await Dispute.findOne({
            'citizenRequests._id': requestId,
            'citizenRequests.lawyerId': lawyerId
        });

        if (request) {
            const requestIndex = request.citizenRequests.findIndex(r => r._id.toString() === requestId);
            if (requestIndex !== -1) {
                request.citizenRequests[requestIndex].status = 'rejected';
                request.citizenRequests[requestIndex].respondedAt = new Date();
                if (response) {
                    request.citizenRequests[requestIndex].response = response;
                }
                await request.save();

                res.json({
                    success: true,
                    message: 'Case request rejected',
                    data: { request: request.citizenRequests[requestIndex] }
                });
                return;
            }
        }

        res.status(404).json({
            success: false,
            message: 'Case request not found'
        });

    } catch (error) {
        console.error('Reject case request error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject case request'
        });
    }
};
