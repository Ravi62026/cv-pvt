import User from "../models/User.js";
import Query from "../models/Query.js";
import Dispute from "../models/Dispute.js";
import Chat from "../models/Chat.js";

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

        // Build query for verified lawyers
        const query = {
            role: "lawyer",
            isActive: true,
            "lawyerDetails.verificationStatus": "verified",
        };

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

        const lawyers = await User.find(query)
            .select("-password -refreshToken -messageRequests")
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

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
            "lawyerDetails.verificationStatus": "verified",
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
        const existingOffer = caseDoc.lawyerRequests?.find(
            req => req.lawyerId.toString() === req.user._id.toString() && req.status === "pending"
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
            status: { $in: ["pending", "open"] },
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

        // Get queries
        if (caseType === "all" || caseType === "query") {
            const queries = await Query.find(baseQuery)
                .populate("citizen", "name email phone")
                .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 });

            cases.push(...queries.map(query => ({
                ...query.toObject(),
                caseType: "query"
            })));
        }

        // Get disputes
        if (caseType === "all" || caseType === "dispute") {
            const disputes = await Dispute.find(baseQuery)
                .populate("citizen", "name email phone")
                .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 });

            cases.push(...disputes.map(dispute => ({
                ...dispute.toObject(),
                caseType: "dispute"
            })));
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
