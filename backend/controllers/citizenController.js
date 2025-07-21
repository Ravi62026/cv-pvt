import User from "../models/User.js";
import Query from "../models/Query.js";
import Dispute from "../models/Dispute.js";
import Chat from "../models/Chat.js";
import DirectConnection from "../models/DirectConnection.js";

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
            DirectConnection.countDocuments({
                citizen: citizenId,
                status: "accepted",
                isActive: true,
            }),
            // Count pending requests sent by citizen (including direct connection requests)
            Promise.all([
                Query.countDocuments({
                    citizen: citizenId,
                    "citizenRequests.status": "pending",
                }),
                Dispute.countDocuments({
                    citizen: citizenId,
                    "citizenRequests.status": "pending",
                }),
                DirectConnection.countDocuments({
                    citizen: citizenId,
                    status: "pending",
                    isActive: true,
                }),
            ]).then(([queryRequests, disputeRequests, connectionRequests]) =>
                queryRequests + disputeRequests + connectionRequests
            ),
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

        console.log("📨 DIRECT MESSAGE REQUEST:");
        console.log("   From Citizen ID:", req.user._id);
        console.log("   From Citizen Name:", req.user.name);
        console.log("   To Lawyer ID:", lawyerId);
        console.log("   Message:", message);

        // Check if lawyer exists and is verified
        const lawyer = await User.findOne({
            _id: lawyerId,
            role: "lawyer",
            isActive: true,
            isVerified: true,
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
        const chatId = `direct_${[req.user._id.toString(), lawyerId.toString()].sort().join("_")}`;
        console.log("💬 CHAT CREATION:");
        console.log("   Generated Chat ID:", chatId);

        let chat = await Chat.findOne({ chatId });
        console.log("   Existing Chat Found:", !!chat);

        if (!chat) {
            console.log("   Creating new pending chat...");
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
            console.log("   ✅ New chat created with ID:", chat._id);

            // Add initial message to the chat
            const messageContent = message || "Hi, I would like to connect with you for legal assistance.";
            console.log("   Adding initial message:", messageContent);

            chat.messages.push({
                sender: req.user._id,
                content: messageContent,
                timestamp: new Date(),
                messageType: "text"
            });

            // Update last message
            chat.lastMessage = {
                sender: req.user._id,
                content: messageContent,
                timestamp: new Date(),
            };

            await chat.save();
            console.log("   ✅ Chat saved with message");
        }

        // Send direct message request via Socket.io
        const io = req.app.get("socketio");
        const socketData = {
            chatId,
            message: message || "Hi, I would like to connect with you for legal assistance.",
            from: {
                _id: req.user._id,
                name: req.user.name,
                role: req.user.role,
            },
            timestamp: new Date(),
        };

        console.log("🔌 SOCKET EVENT:");
        console.log("   Event: direct_message_request");
        console.log("   To Room: user_" + lawyerId);
        console.log("   Data:", socketData);

        io.to(`user_${lawyerId}`).emit("direct_message_request", socketData);

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
            isVerified: true,
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

        console.log("🔍 getAvailableLawyers called with params:", req.query);

        // Build query for verified lawyers
        const query = {
            role: "lawyer",
            isActive: true,
            isVerified: true,
        };

        console.log("📋 Initial query:", query);

        // Debug: Check total lawyers and verified lawyers
        const totalLawyers = await User.countDocuments({ role: "lawyer" });
        const verifiedLawyers = await User.countDocuments(query);
        console.log(`Total lawyers: ${totalLawyers}, Verified lawyers: ${verifiedLawyers}`);

        // Add filters
        if (specialization && specialization !== "all" && specialization !== "undefined") {
            query["lawyerDetails.specialization"] = { $in: [specialization] };
        }

        if (experience && experience !== "all" && experience !== "undefined") {
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

        console.log("🔍 Final query before execution:", query);
        console.log("📊 Pagination: page =", page, ", limit =", limit, ", skip =", skip);

        // Get lawyers with pagination
        const lawyers = await User.find(query)
            .select("name email phone lawyerDetails createdAt isActive isVerified")
            .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const total = await User.countDocuments(query);
        const pages = Math.ceil(total / limit);

        console.log("✅ Query executed successfully:");
        console.log("   Found lawyers:", lawyers.length);
        console.log("   Total matching query:", total);
        console.log("   Pages:", pages);

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

// Utility function to verify all lawyers (for testing)
export const verifyAllLawyers = async (req, res) => {
    try {
        const result = await User.updateMany(
            { role: "lawyer" },
            {
                $set: {
                    isVerified: true,
                    isActive: true
                }
            }
        );

        res.json({
            success: true,
            message: `Updated ${result.modifiedCount} lawyers to verified status`,
            data: result
        });
    } catch (error) {
        console.error("Verify lawyers error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to verify lawyers",
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
        if (query.hasCitizenRequestedLawyer(lawyerId)) {
            return res.status(400).json({
                success: false,
                message: "You have already requested this lawyer for this query",
            });
        }

        // Add citizen request
        query.addCitizenRequest(lawyerId, message);
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
        if (dispute.hasCitizenRequestedLawyer(lawyerId)) {
            return res.status(400).json({
                success: false,
                message: "You have already requested this lawyer for this dispute",
            });
        }

        // Add citizen request
        dispute.addCitizenRequest(lawyerId, message);
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

// Send direct connection request to lawyer (new system)
export const sendDirectConnectionRequest = async (req, res) => {
    try {
        const { lawyerId } = req.params;
        const { message, connectionType = "general_consultation" } = req.body;
        const citizenId = req.user._id;

        // Validate message
        if (!message || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Message is required",
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

        // Check if connection already exists
        const existingConnection = await DirectConnection.findExistingConnection(citizenId, lawyerId);

        if (existingConnection) {
            if (existingConnection.status === "pending") {
                return res.status(400).json({
                    success: false,
                    message: "You already have a pending connection request with this lawyer",
                });
            } else if (existingConnection.status === "accepted") {
                return res.status(400).json({
                    success: false,
                    message: "You are already connected with this lawyer",
                });
            } else if (existingConnection.status === "rejected") {
                // Allow new request after rejection, but update existing record
                existingConnection.status = "pending";
                existingConnection.requestMessage = message.trim();
                existingConnection.requestedAt = new Date();
                existingConnection.respondedAt = undefined;
                existingConnection.responseMessage = undefined;
                existingConnection.metadata.connectionType = connectionType;

                await existingConnection.save();

                // Send real-time notification
                const io = req.app.get("socketio");
                if (io) {
                    io.to(`user_${lawyerId}`).emit("new_connection_request", {
                        connectionId: existingConnection._id,
                        citizen: {
                            _id: citizenId,
                            name: req.user.name,
                            email: req.user.email,
                        },
                        message: message.trim(),
                        connectionType,
                        timestamp: new Date(),
                    });
                }

                return res.json({
                    success: true,
                    message: "Connection request sent successfully",
                    data: { connectionId: existingConnection._id },
                });
            }
        }

        // Create new connection request
        const newConnection = await DirectConnection.create({
            citizen: citizenId,
            lawyer: lawyerId,
            requestMessage: message.trim(),
            metadata: {
                connectionType,
                citizenLocation: req.user.address?.city || "Unknown",
                lawyerSpecialization: lawyer.lawyerDetails?.specialization || [],
            },
        });

        // Send real-time notification
        const io = req.app.get("socketio");
        if (io) {
            io.to(`user_${lawyerId}`).emit("new_connection_request", {
                connectionId: newConnection._id,
                citizen: {
                    _id: citizenId,
                    name: req.user.name,
                    email: req.user.email,
                },
                message: message.trim(),
                connectionType,
                timestamp: new Date(),
            });
        }

        res.json({
            success: true,
            message: "Connection request sent successfully",
            data: { connectionId: newConnection._id },
        });
    } catch (error) {
        console.error("Send direct connection request error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send connection request",
        });
    }
};

// Get citizen's connected lawyers (new system)
export const getMyConnectedLawyers = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const citizenId = req.user._id;

        // Get accepted connections
        const connections = await DirectConnection.findAcceptedForUser(citizenId, "citizen");

        // Paginate results
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedConnections = connections.slice(startIndex, endIndex);

        // Add chat information for each connection
        const connectionsWithChat = await Promise.all(
            paginatedConnections.map(async (connection) => {
                let chatInfo = null;

                if (connection.chatId) {
                    const chat = await Chat.findOne({ chatId: connection.chatId })
                        .populate("lastMessage.sender", "name role");

                    if (chat) {
                        chatInfo = {
                            chatId: chat.chatId,
                            status: chat.status,
                            lastMessage: chat.lastMessage,
                            unreadCount: chat.getUnreadCount ? chat.getUnreadCount(citizenId) : 0,
                        };
                    }
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
        console.error("Get connected lawyers error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get connected lawyers",
        });
    }
};

// Get citizen's direct chats (new system)
export const getMyDirectChats = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const citizenId = req.user._id;

        // Get all accepted connections with chat rooms
        const connections = await DirectConnection.find({
            citizen: citizenId,
            status: "accepted",
            chatId: { $exists: true, $ne: null },
            isActive: true,
        }).populate("lawyer", "name email lawyerDetails.specialization");

        // Get chat details for each connection
        const chatsWithDetails = await Promise.all(
            connections.map(async (connection) => {
                const chat = await Chat.findOne({ chatId: connection.chatId })
                    .populate("lastMessage.sender", "name role")
                    .populate("participants.user", "name role");

                if (!chat) return null;

                return {
                    connectionId: connection._id,
                    chatId: chat.chatId,
                    lawyer: connection.lawyer,
                    status: chat.status,
                    lastMessage: chat.lastMessage,
                    unreadCount: chat.getUnreadCount ? chat.getUnreadCount(citizenId) : 0,
                    connectedAt: connection.connectedAt,
                    participants: chat.participants,
                };
            })
        );

        // Filter out null chats and sort by last message time
        const validChats = chatsWithDetails
            .filter(chat => chat !== null)
            .sort((a, b) => {
                const aTime = a.lastMessage?.timestamp || a.connectedAt;
                const bTime = b.lastMessage?.timestamp || b.connectedAt;
                return new Date(bTime) - new Date(aTime);
            });

        // Paginate
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedChats = validChats.slice(startIndex, endIndex);

        res.json({
            success: true,
            data: {
                chats: paginatedChats,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(validChats.length / limit),
                    total: validChats.length,
                },
            },
        });
    } catch (error) {
        console.error("Get direct chats error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get direct chats",
        });
    }
};

// Get citizen's pending requests (requests sent by citizen to lawyers)
export const getMyCaseRequests = async (req, res) => {
    try {
        const citizenId = req.user.id;
        const { page = 1, limit = 10, status } = req.query;

        // Get all queries and disputes where this citizen has sent requests
        const [queries, disputes] = await Promise.all([
            Query.find({
                citizen: citizenId,
                'citizenRequests.0': { $exists: true },
                ...(status && { 'citizenRequests.status': status })
            })
            .populate('citizenRequests.lawyerId', 'name email lawyerDetails')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit),

            Dispute.find({
                citizen: citizenId,
                'citizenRequests.0': { $exists: true },
                ...(status && { 'citizenRequests.status': status })
            })
            .populate('citizenRequests.lawyerId', 'name email lawyerDetails')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
        ]);

        // Format the requests
        const requests = [];

        queries.forEach(query => {
            query.citizenRequests.forEach(citizenRequest => {
                requests.push({
                    requestId: citizenRequest._id,
                    caseId: query._id,
                    caseType: 'query',
                    caseTitle: query.title,
                    description: query.description,
                    category: query.category,
                    priority: query.priority,
                    lawyer: {
                        _id: citizenRequest.lawyerId._id,
                        name: citizenRequest.lawyerId.name,
                        email: citizenRequest.lawyerId.email,
                        specialization: citizenRequest.lawyerId.lawyerDetails?.specialization,
                        experience: citizenRequest.lawyerId.lawyerDetails?.experience
                    },
                    status: citizenRequest.status,
                    message: citizenRequest.message,
                    requestedAt: citizenRequest.requestedAt,
                    respondedAt: citizenRequest.respondedAt
                });
            });
        });

        disputes.forEach(dispute => {
            dispute.citizenRequests.forEach(citizenRequest => {
                requests.push({
                    requestId: citizenRequest._id,
                    caseId: dispute._id,
                    caseType: 'dispute',
                    caseTitle: dispute.title,
                    description: dispute.description,
                    category: dispute.category,
                    priority: dispute.priority,
                    disputeValue: dispute.disputeValue,
                    lawyer: {
                        _id: citizenRequest.lawyerId._id,
                        name: citizenRequest.lawyerId.name,
                        email: citizenRequest.lawyerId.email,
                        specialization: citizenRequest.lawyerId.lawyerDetails?.specialization,
                        experience: citizenRequest.lawyerId.lawyerDetails?.experience
                    },
                    status: citizenRequest.status,
                    message: citizenRequest.message,
                    requestedAt: citizenRequest.requestedAt,
                    respondedAt: citizenRequest.respondedAt
                });
            });
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
        console.error('Get pending requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending requests'
        });
    }
};

// Get received offers (requests sent by lawyers to citizen's cases)
export const getMyCaseOffers = async (req, res) => {
    try {
        const citizenId = req.user.id;
        const { page = 1, limit = 10, status } = req.query;

        // Get all queries and disputes where lawyers have sent requests
        const [queries, disputes] = await Promise.all([
            Query.find({
                citizen: citizenId,
                'lawyerRequests.0': { $exists: true },
                ...(status && { 'lawyerRequests.status': status })
            })
            .populate('lawyerRequests.lawyerId', 'name email lawyerDetails')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit),

            Dispute.find({
                citizen: citizenId,
                'lawyerRequests.0': { $exists: true },
                ...(status && { 'lawyerRequests.status': status })
            })
            .populate('lawyerRequests.lawyerId', 'name email lawyerDetails')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
        ]);

        // Format the offers
        const offers = [];

        queries.forEach(query => {
            query.lawyerRequests.forEach(lawyerRequest => {
                offers.push({
                    requestId: lawyerRequest._id,
                    caseId: query._id,
                    caseType: 'query',
                    caseTitle: query.title,
                    description: query.description,
                    category: query.category,
                    priority: query.priority,
                    lawyer: {
                        _id: lawyerRequest.lawyerId._id,
                        name: lawyerRequest.lawyerId.name,
                        email: lawyerRequest.lawyerId.email,
                        specialization: lawyerRequest.lawyerId.lawyerDetails?.specialization,
                        experience: lawyerRequest.lawyerId.lawyerDetails?.experience
                    },
                    status: lawyerRequest.status,
                    message: lawyerRequest.message,
                    requestedAt: lawyerRequest.requestedAt,
                    respondedAt: lawyerRequest.respondedAt
                });
            });
        });

        disputes.forEach(dispute => {
            dispute.lawyerRequests.forEach(lawyerRequest => {
                offers.push({
                    requestId: lawyerRequest._id,
                    caseId: dispute._id,
                    caseType: 'dispute',
                    caseTitle: dispute.title,
                    description: dispute.description,
                    category: dispute.category,
                    priority: dispute.priority,
                    disputeValue: dispute.disputeValue,
                    lawyer: {
                        _id: lawyerRequest.lawyerId._id,
                        name: lawyerRequest.lawyerId.name,
                        email: lawyerRequest.lawyerId.email,
                        specialization: lawyerRequest.lawyerId.lawyerDetails?.specialization,
                        experience: lawyerRequest.lawyerId.lawyerDetails?.experience
                    },
                    status: lawyerRequest.status,
                    message: lawyerRequest.message,
                    requestedAt: lawyerRequest.requestedAt,
                    respondedAt: lawyerRequest.respondedAt
                });
            });
        });

        // Sort by request date
        offers.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));

        res.json({
            success: true,
            data: {
                offers,
                pagination: {
                    current: parseInt(page),
                    total: offers.length,
                    pages: Math.ceil(offers.length / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get received offers error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch received offers'
        });
    }
};

// Accept case offer
export const acceptCaseOffer = async (req, res) => {
    try {
        const citizenId = req.user._id;
        const { offerId } = req.params;
        const { response } = req.body;

        // Find the request in queries (lawyer requests to citizen)
        let request = await Query.findOne({
            'lawyerRequests._id': offerId,
            citizen: citizenId
        });

        let caseType = 'query';
        let caseId = null;
        let lawyerId = null;

        if (request) {
            const requestIndex = request.lawyerRequests.findIndex(r => r._id.toString() === offerId);
            if (requestIndex !== -1) {
                request.lawyerRequests[requestIndex].status = 'accepted';
                request.lawyerRequests[requestIndex].respondedAt = new Date();
                if (response) {
                    request.lawyerRequests[requestIndex].response = response;
                }

                // Set case assignment
                request.assignedLawyer = request.lawyerRequests[requestIndex].lawyerId;
                request.status = 'assigned';

                // Auto-accept any pending citizen requests for this case from the same lawyer
                if (request.citizenRequests && request.citizenRequests.length > 0) {
                    request.citizenRequests.forEach(cr => {
                        if (cr.lawyerId.toString() === request.lawyerRequests[requestIndex].lawyerId.toString() && cr.status === 'pending') {
                            cr.status = 'accepted';
                            cr.respondedAt = new Date();
                        }
                    });
                }

                await request.save();

                caseType = 'query';
                caseId = request._id;
                lawyerId = request.lawyerRequests[requestIndex].lawyerId;
            } else {
                return res.status(404).json({
                    success: false,
                    message: 'Case offer not found in query requests'
                });
            }
        } else {
            // If not found in queries, check disputes (lawyer requests to citizen)
            request = await Dispute.findOne({
                'lawyerRequests._id': offerId,
                citizen: citizenId
            });

            if (request) {
                const requestIndex = request.lawyerRequests.findIndex(r => r._id.toString() === offerId);
                if (requestIndex !== -1) {
                    request.lawyerRequests[requestIndex].status = 'accepted';
                    request.lawyerRequests[requestIndex].respondedAt = new Date();
                    if (response) {
                        request.lawyerRequests[requestIndex].response = response;
                    }

                    // Set case assignment
                    request.assignedLawyer = request.lawyerRequests[requestIndex].lawyerId;
                    request.status = 'assigned';

                    // Auto-accept any pending citizen requests for this case from the same lawyer
                    if (request.citizenRequests && request.citizenRequests.length > 0) {
                        request.citizenRequests.forEach(cr => {
                            if (cr.lawyerId.toString() === request.lawyerRequests[requestIndex].lawyerId.toString() && cr.status === 'pending') {
                                cr.status = 'accepted';
                                cr.respondedAt = new Date();
                            }
                        });
                    }

                    await request.save();

                    caseType = 'dispute';
                    caseId = request._id;
                    lawyerId = request.lawyerRequests[requestIndex].lawyerId;
                } else {
                    return res.status(404).json({
                        success: false,
                        message: 'Case offer not found in dispute requests'
                    });
                }
            } else {
                return res.status(404).json({
                    success: false,
                    message: 'Case offer not found'
                });
            }
        }

        // Validate that we have all required data
        if (!caseId || !lawyerId) {
            return res.status(500).json({
                success: false,
                message: 'Failed to process case offer - missing case or lawyer information'
            });
        }

        // Create chat for the case
        const chatId = `${caseType}_${caseId}`;
        console.log('💬 BACKEND: Creating chat for accepted offer');
        console.log('   Case Type:', caseType);
        console.log('   Case ID:', caseId);
        console.log('   Lawyer ID:', lawyerId);
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

        // Send real-time notification to lawyer
        const io = req.app.get("socketio");
        if (io) {
            io.to(`user_${lawyerId}`).emit("case_offer_accepted", {
                caseType,
                caseId,
                chatId,
                citizen: {
                    _id: citizenId,
                    name: req.user.name,
                },
                timestamp: new Date(),
            });
        }

        res.json({
            success: true,
            message: 'Case offer accepted successfully',
            data: {
                request: request.lawyerRequests ?
                    request.lawyerRequests.find(r => r._id.toString() === offerId) :
                    request,
                chat: {
                    chatId: chat.chatId,
                    _id: chat._id
                }
            }
        });

    } catch (error) {
        console.error('Accept case offer error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to accept case offer'
        });
    }
};

// Reject case offer
export const rejectCaseOffer = async (req, res) => {
    try {
        const citizenId = req.user._id;
        const { offerId } = req.params;
        const { response } = req.body;

        // Find the request in queries (lawyer requests to citizen)
        let request = await Query.findOne({
            'lawyerRequests._id': offerId,
            citizen: citizenId
        });

        if (request) {
            const requestIndex = request.lawyerRequests.findIndex(r => r._id.toString() === offerId);
            if (requestIndex !== -1) {
                request.lawyerRequests[requestIndex].status = 'rejected';
                request.lawyerRequests[requestIndex].respondedAt = new Date();
                if (response) {
                    request.lawyerRequests[requestIndex].response = response;
                }
                await request.save();

                res.json({
                    success: true,
                    message: 'Case offer rejected',
                    data: { request: request.lawyerRequests[requestIndex] }
                });
                return;
            }
        }

        // If not found in queries, check disputes (lawyer requests to citizen)
        request = await Dispute.findOne({
            'lawyerRequests._id': offerId,
            citizen: citizenId
        });

        if (request) {
            const requestIndex = request.lawyerRequests.findIndex(r => r._id.toString() === offerId);
            if (requestIndex !== -1) {
                request.lawyerRequests[requestIndex].status = 'rejected';
                request.lawyerRequests[requestIndex].respondedAt = new Date();
                if (response) {
                    request.lawyerRequests[requestIndex].response = response;
                }
                await request.save();

                res.json({
                    success: true,
                    message: 'Case offer rejected',
                    data: { request: request.lawyerRequests[requestIndex] }
                });
                return;
            }
        }

        res.status(404).json({
            success: false,
            message: 'Case offer not found'
        });

    } catch (error) {
        console.error('Reject case offer error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject case offer'
        });
    }
};
