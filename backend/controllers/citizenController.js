import User from "../models/User.js";
import Query from "../models/Query.js";
import Dispute from "../models/Dispute.js";
import Chat from "../models/Chat.js";

// Get citizen dashboard stats
export const getCitizenDashboard = async (req, res) => {
    try {
        const citizenId = req.user._id;

        const [
            totalQueries,
            activeQueries,
            resolvedQueries,
            totalDisputes,
            activeDisputes,
            resolvedDisputes,
            connectedLawyers,
            pendingRequests,
            receivedOffers,
        ] = await Promise.all([
            Query.countDocuments({ citizen: citizenId }),
            Query.countDocuments({
                citizen: citizenId,
                status: { $in: ["assigned", "in-progress"] },
            }),
            Query.countDocuments({
                citizen: citizenId,
                status: "resolved",
            }),
            Dispute.countDocuments({ citizen: citizenId }),
            Dispute.countDocuments({
                citizen: citizenId,
                status: { $in: ["assigned", "in-progress"] },
            }),
            Dispute.countDocuments({
                citizen: citizenId,
                status: "resolved",
            }),
            User.findById(citizenId).then(
                (citizen) =>
                    citizen.connections.filter(
                        (conn) => conn.connectionType === "lawyer"
                    ).length
            ),
            // Count pending requests sent by citizen
            Query.countDocuments({
                citizen: citizenId,
                "citizenRequests.status": "pending",
            }) +
            Dispute.countDocuments({
                citizen: citizenId,
                "citizenRequests.status": "pending",
            }),
            // Count offers received from lawyers
            Query.countDocuments({
                citizen: citizenId,
                "lawyerRequests.status": "pending",
            }) +
            Dispute.countDocuments({
                citizen: citizenId,
                "lawyerRequests.status": "pending",
            }),
        ]);

        res.json({
            success: true,
            data: {
                totalQueries,
                activeQueries,
                resolvedQueries,
                totalDisputes,
                activeDisputes,
                resolvedDisputes,
                totalCases: totalQueries + totalDisputes,
                activeCases: activeQueries + activeDisputes,
                resolvedCases: resolvedQueries + resolvedDisputes,
                connectedLawyers,
                pendingRequests,
                receivedOffers,
            },
        });
    } catch (error) {
        console.error("Get citizen dashboard error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get dashboard statistics",
        });
    }
};

// Get citizen's connected lawyers
export const getMyLawyers = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const citizen = await User.findById(req.user._id).populate({
            path: "connections.userId",
            match: { role: "lawyer" },
            select: "name email phone lawyerDetails createdAt",
        });

        const lawyers = citizen.connections
            .filter((conn) => conn.connectionType === "lawyer" && conn.userId)
            .map((conn) => ({
                ...conn.userId.toObject(),
                connectedAt: conn.connectedAt,
            }));

        // Paginate results
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedLawyers = lawyers.slice(startIndex, endIndex);

        res.json({
            success: true,
            data: {
                lawyers: paginatedLawyers,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(lawyers.length / limit),
                    total: lawyers.length,
                },
            },
        });
    } catch (error) {
        console.error("Get my lawyers error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get lawyers",
        });
    }
};

// Get citizen's cases (queries + disputes)
export const getMyCases = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            type = "all", // all, queries, disputes
            status,
            search,
        } = req.query;

        const citizenId = req.user._id;
        let cases = [];

        // Build base query
        const baseQuery = { citizen: citizenId };
        if (status && status !== "all") {
            baseQuery.status = status;
        }

        // Add search functionality
        if (search) {
            baseQuery.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        if (type === "all" || type === "queries") {
            const queries = await Query.find(baseQuery)
                .populate("assignedLawyer", "name email lawyerDetails.specialization")
                .sort({ createdAt: -1 });

            for (const query of queries) {
                // Find associated chat room if case is assigned
                let chatRoom = null;
                if (query.assignedLawyer) {
                    const chat = await Chat.findOne({
                        "relatedCase.caseId": query._id,
                        "relatedCase.caseType": "query",
                        "participants.user": citizenId
                    });

                    if (chat) {
                        chatRoom = {
                            chatId: chat.chatId,
                            status: chat.status,
                            lastMessage: chat.lastMessage,
                            unreadCount: chat.getUnreadCount ? chat.getUnreadCount(citizenId) : 0
                        };
                    }
                }

                cases.push({
                    ...query.toObject(),
                    caseType: "query",
                    chatRoom
                });
            }
        }

        if (type === "all" || type === "disputes") {
            const disputes = await Dispute.find(baseQuery)
                .populate("assignedLawyer", "name email lawyerDetails.specialization")
                .sort({ createdAt: -1 });

            for (const dispute of disputes) {
                // Find associated chat room if case is assigned
                let chatRoom = null;
                if (dispute.assignedLawyer) {
                    const chat = await Chat.findOne({
                        "relatedCase.caseId": dispute._id,
                        "relatedCase.caseType": "dispute",
                        "participants.user": citizenId
                    });

                    if (chat) {
                        chatRoom = {
                            chatId: chat.chatId,
                            status: chat.status,
                            lastMessage: chat.lastMessage,
                            unreadCount: chat.getUnreadCount ? chat.getUnreadCount(citizenId) : 0
                        };
                    }
                }

                cases.push({
                    ...dispute.toObject(),
                    caseType: "dispute",
                    chatRoom
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
        console.error("Get my cases error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get cases",
        });
    }
};

// Send direct message request to lawyer (for general consultation)
export const sendDirectMessageRequest = async (req, res) => {
    try {
        const { lawyerId } = req.params;
        const { message } = req.body;

        // Check if lawyer exists and is verified
        const lawyer = await User.findOne({
            _id: lawyerId,
            role: "lawyer",
            isActive: true,
            "lawyerDetails.verificationStatus": "verified",
        });

        if (!lawyer) {
            return res.status(404).json({
                success: false,
                message: "Lawyer not found or not verified",
            });
        }

        // Check rate limiting (2 messages per hour)
        const citizen = await User.findById(req.user._id);
        if (!citizen.canSendMessageRequest(lawyerId)) {
            return res.status(429).json({
                success: false,
                message:
                    "You can only send 2 message requests per hour to the same lawyer",
            });
        }

        // Add message request
        citizen.addMessageRequest(lawyerId);
        await citizen.save();

        // Create or get pending chat
        const chatId = `direct_${[req.user._id, lawyerId].sort().join("_")}`;

        let chat = await Chat.findOne({ chatId });

        if (!chat) {
            // Create new pending chat
            chat = await Chat.create({
                chatId,
                participants: [
                    { user: req.user._id, role: "citizen" },
                    { user: lawyerId, role: "lawyer" },
                ],
                chatType: "direct",
                status: "pending"
            });

            // Add initial message to the chat
            chat.messages.push({
                sender: req.user._id,
                content: message || "Hi, I would like to connect with you for legal assistance.",
                timestamp: new Date(),
                messageType: "text"
            });

            // Update last message
            chat.lastMessage = {
                sender: req.user._id,
                content: message || "Hi, I would like to connect with you for legal assistance.",
                timestamp: new Date(),
            };

            await chat.save();
        }

        // Send direct message request via Socket.io
        const io = req.app.get("socketio");
        io.to(`user_${lawyerId}`).emit("direct_message_request", {
            chatId,
            message: message || "Hi, I would like to connect with you for legal assistance.",
            from: {
                _id: req.user._id,
                name: req.user.name,
                role: req.user.role,
            },
            timestamp: new Date(),
        });

        res.json({
            success: true,
            message: "Message request sent successfully",
            data: { chatId },
        });
    } catch (error) {
        console.error("Send direct message request error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send message request",
        });
    }
};

// Request specific lawyer for a case
export const requestLawyerForCase = async (req, res) => {
    try {
        const { caseType, caseId, lawyerId } = req.params;
        const { message, proposedFee } = req.body;

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

        // Check if citizen owns the case
        if (caseDoc.citizen.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        // Check if case is available for assignment
        if (caseDoc.status !== "pending" && caseDoc.status !== "open") {
            return res.status(400).json({
                success: false,
                message: "Case is not available for lawyer assignment",
            });
        }

        // Check if lawyer exists and is verified
        const lawyer = await User.findOne({
            _id: lawyerId,
            role: "lawyer",
            isActive: true,
            "lawyerDetails.verificationStatus": "verified",
        });

        if (!lawyer) {
            return res.status(404).json({
                success: false,
                message: "Lawyer not found or not verified",
            });
        }

        // Check if citizen already requested this lawyer
        const existingRequest = caseDoc.citizenRequests?.find(
            req => req.lawyerId.toString() === lawyerId && req.status === "pending"
        );

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: "You have already sent a request to this lawyer for this case",
            });
        }

        // Add citizen request
        if (!caseDoc.citizenRequests) {
            caseDoc.citizenRequests = [];
        }

        caseDoc.citizenRequests.push({
            lawyerId,
            message: message || `I would like to request your assistance with this ${caseType}`,
            proposedFee: proposedFee || 0,
            requestedAt: new Date(),
            status: "pending",
        });

        await caseDoc.save();

        // Send real-time notification to lawyer via Socket.io
        const io = req.app.get("socketio");
        io.emit("citizen_request_sent", {
            lawyerId,
            requestData: {
                caseType,
                caseId,
                requestId: caseDoc.citizenRequests[caseDoc.citizenRequests.length - 1]._id,
                from: {
                    _id: req.user._id,
                    name: req.user.name,
                    role: req.user.role,
                },
                message,
                proposedFee,
                timestamp: new Date(),
            },
        });

        res.json({
            success: true,
            message: "Request sent to lawyer successfully",
        });
    } catch (error) {
        console.error("Request lawyer for case error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send request",
        });
    }
};

// Get pending requests sent by citizen
export const getPendingRequests = async (req, res) => {
    try {
        const { page = 1, limit = 10, caseType } = req.query;
        const citizenId = req.user._id;

        let requests = [];

        // Get requests from queries
        if (!caseType || caseType === "query") {
            const queryRequests = await Query.find({
                citizen: citizenId,
                "citizenRequests.status": "pending",
            })
            .populate("citizenRequests.lawyerId", "name email lawyerDetails.specialization")
            .select("title citizenRequests createdAt");

            queryRequests.forEach(query => {
                query.citizenRequests
                    .filter(req => req.status === "pending")
                    .forEach(req => {
                        requests.push({
                            ...req.toObject(),
                            caseType: "query",
                            caseId: query._id,
                            caseTitle: query.title,
                            caseCreatedAt: query.createdAt,
                        });
                    });
            });
        }

        // Get requests from disputes
        if (!caseType || caseType === "dispute") {
            const disputeRequests = await Dispute.find({
                citizen: citizenId,
                "citizenRequests.status": "pending",
            })
            .populate("citizenRequests.lawyerId", "name email lawyerDetails.specialization")
            .select("title citizenRequests createdAt");

            disputeRequests.forEach(dispute => {
                dispute.citizenRequests
                    .filter(req => req.status === "pending")
                    .forEach(req => {
                        requests.push({
                            ...req.toObject(),
                            caseType: "dispute",
                            caseId: dispute._id,
                            caseTitle: dispute.title,
                            caseCreatedAt: dispute.createdAt,
                        });
                    });
            });
        }

        // Sort by request date
        requests.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));

        // Paginate
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedRequests = requests.slice(startIndex, endIndex);

        res.json({
            success: true,
            data: {
                requests: paginatedRequests,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(requests.length / limit),
                    total: requests.length,
                },
            },
        });
    } catch (error) {
        console.error("Get pending requests error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get pending requests",
        });
    }
};

// Get offers received from lawyers
export const getReceivedOffers = async (req, res) => {
    try {
        const { page = 1, limit = 10, caseType, status = "pending" } = req.query;
        const citizenId = req.user._id;

        let offers = [];

        // Get offers from queries
        if (!caseType || caseType === "query") {
            const queryOffers = await Query.find({
                citizen: citizenId,
                "lawyerRequests.status": status,
            })
            .populate("lawyerRequests.lawyerId", "name email lawyerDetails.specialization")
            .select("title lawyerRequests createdAt");

            queryOffers.forEach(query => {
                query.lawyerRequests
                    .filter(req => req.status === status)
                    .forEach(req => {
                        offers.push({
                            ...req.toObject(),
                            caseType: "query",
                            caseId: query._id,
                            caseTitle: query.title,
                            caseCreatedAt: query.createdAt,
                        });
                    });
            });
        }

        // Get offers from disputes
        if (!caseType || caseType === "dispute") {
            const disputeOffers = await Dispute.find({
                citizen: citizenId,
                "lawyerRequests.status": status,
            })
            .populate("lawyerRequests.lawyerId", "name email lawyerDetails.specialization")
            .select("title lawyerRequests createdAt");

            disputeOffers.forEach(dispute => {
                dispute.lawyerRequests
                    .filter(req => req.status === status)
                    .forEach(req => {
                        offers.push({
                            ...req.toObject(),
                            caseType: "dispute",
                            caseId: dispute._id,
                            caseTitle: dispute.title,
                            caseCreatedAt: dispute.createdAt,
                        });
                    });
            });
        }

        // Sort by request date
        offers.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));

        // Paginate
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedOffers = offers.slice(startIndex, endIndex);

        res.json({
            success: true,
            data: {
                offers: paginatedOffers,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(offers.length / limit),
                    total: offers.length,
                },
            },
        });
    } catch (error) {
        console.error("Get received offers error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get received offers",
        });
    }
};

// Get available lawyers for case assignment
export const getAvailableLawyers = async (req, res) => {
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
            } else if (experience.includes("+")) {
                const minExp = parseInt(experience.replace("+", ""));
                query["lawyerDetails.experience"] = { $gte: minExp };
            }
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { "lawyerDetails.specialization": { $regex: search, $options: "i" } },
            ];
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get lawyers with pagination
        const lawyers = await User.find(query)
            .select("name email phone lawyerDetails createdAt")
            .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const total = await User.countDocuments(query);
        const pages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: {
                lawyers,
                pagination: {
                    current: parseInt(page),
                    pages,
                    total,
                },
            },
        });
    } catch (error) {
        console.error("Get available lawyers error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get available lawyers",
        });
    }
};

// Request specific lawyer for query
export const requestLawyerForQuery = async (req, res) => {
    try {
        const { queryId, lawyerId } = req.params;
        const { message = "I would like you to handle my legal query." } = req.body;
        const citizenId = req.user._id;

        // Validate query exists and belongs to citizen
        const query = await Query.findOne({
            _id: queryId,
            citizen: citizenId,
        });

        if (!query) {
            return res.status(404).json({
                success: false,
                message: "Query not found or access denied",
            });
        }

        // Check if query is available for assignment
        if (query.status !== "pending" && query.status !== "open") {
            return res.status(400).json({
                success: false,
                message: "Query is not available for lawyer assignment",
            });
        }

        // Check if lawyer exists and is verified
        const lawyer = await User.findOne({
            _id: lawyerId,
            role: "lawyer",
            isActive: true,
            "lawyerDetails.verificationStatus": "verified",
        });

        if (!lawyer) {
            return res.status(404).json({
                success: false,
                message: "Lawyer not found or not verified",
            });
        }

        // Check if already requested this lawyer
        if (query.hasRequestedLawyer(lawyerId)) {
            return res.status(400).json({
                success: false,
                message: "You have already requested this lawyer for this query",
            });
        }

        // Add lawyer request
        query.addLawyerRequest(lawyerId, message);
        await query.save();

        // Send real-time notification
        const io = req.app.get("socketio");
        io.to(`user_${lawyerId}`).emit("citizen_request_received", {
            type: "query",
            caseId: queryId,
            caseTitle: query.title,
            citizen: {
                _id: citizenId,
                name: req.user.name,
                email: req.user.email,
            },
            message,
            requestId: query.lawyerRequests[query.lawyerRequests.length - 1]._id,
        });

        res.json({
            success: true,
            message: "Request sent to lawyer successfully",
            data: {
                requestId: query.lawyerRequests[query.lawyerRequests.length - 1]._id,
                lawyer: {
                    _id: lawyer._id,
                    name: lawyer.name,
                    specialization: lawyer.lawyerDetails?.specialization,
                },
            },
        });
    } catch (error) {
        console.error("Request lawyer for query error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send request to lawyer",
        });
    }
};

// Request specific lawyer for dispute
export const requestLawyerForDispute = async (req, res) => {
    try {
        const { disputeId, lawyerId } = req.params;
        const { message = "I would like you to handle my legal dispute." } = req.body;
        const citizenId = req.user._id;

        // Validate dispute exists and belongs to citizen
        const dispute = await Dispute.findOne({
            _id: disputeId,
            citizen: citizenId,
        });

        if (!dispute) {
            return res.status(404).json({
                success: false,
                message: "Dispute not found or access denied",
            });
        }

        // Check if dispute is available for assignment
        if (dispute.status !== "pending" && dispute.status !== "open") {
            return res.status(400).json({
                success: false,
                message: "Dispute is not available for lawyer assignment",
            });
        }

        // Check if lawyer exists and is verified
        const lawyer = await User.findOne({
            _id: lawyerId,
            role: "lawyer",
            isActive: true,
            "lawyerDetails.verificationStatus": "verified",
        });

        if (!lawyer) {
            return res.status(404).json({
                success: false,
                message: "Lawyer not found or not verified",
            });
        }

        // Check if already requested this lawyer
        if (dispute.hasRequestedLawyer(lawyerId)) {
            return res.status(400).json({
                success: false,
                message: "You have already requested this lawyer for this dispute",
            });
        }

        // Add lawyer request
        dispute.addLawyerRequest(lawyerId, message);
        await dispute.save();

        // Send real-time notification
        const io = req.app.get("socketio");
        io.to(`user_${lawyerId}`).emit("citizen_request_received", {
            type: "dispute",
            caseId: disputeId,
            caseTitle: dispute.title,
            citizen: {
                _id: citizenId,
                name: req.user.name,
                email: req.user.email,
            },
            message,
            requestId: dispute.lawyerRequests[dispute.lawyerRequests.length - 1]._id,
        });

        res.json({
            success: true,
            message: "Request sent to lawyer successfully",
            data: {
                requestId: dispute.lawyerRequests[dispute.lawyerRequests.length - 1]._id,
                lawyer: {
                    _id: lawyer._id,
                    name: lawyer.name,
                    specialization: lawyer.lawyerDetails?.specialization,
                },
            },
        });
    } catch (error) {
        console.error("Request lawyer for dispute error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send request to lawyer",
        });
    }
};
