import Query from "../models/Query.js";
import { validationResult } from "express-validator";

// Create a new query (citizen only)
export const createQuery = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array(),
            });
        }

        const { title, description, category, priority } = req.body;

        const query = await Query.create({
            title,
            description,
            category,
            priority: priority || "medium",
            citizen: req.user._id,
        });

        // Add timeline entry
        query.timeline.push({
            action: "created",
            description: "Query created by citizen",
            performedBy: req.user._id,
        });

        await query.save();

        // Populate citizen details
        await query.populate("citizen", "name email");

        res.status(201).json({
            success: true,
            message: "Query created successfully",
            data: { query },
        });
    } catch (error) {
        console.error("Create query error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create query",
        });
    }
};

// Get queries with filters and pagination
export const getQueries = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            category,
            priority,
            search,
            citizenId,
            lawyerId,
        } = req.query;

        // Build query based on user role
        let query = {};

        if (req.user.role === "citizen") {
            query.citizen = req.user._id;
        } else if (req.user.role === "lawyer") {
            const { type = "available" } = req.query;

            switch (type) {
                case "available":
                    // Show unassigned queries only
                    query.$or = [
                        { assignedLawyer: { $exists: false } },
                        { assignedLawyer: null }
                    ];
                    query.status = { $in: ["pending", "open"] };
                    break;

                case "assigned":
                    // Show queries assigned to this lawyer
                    query.assignedLawyer = req.user._id;
                    break;

                case "requests":
                    // Show queries where lawyer has sent request
                    query["lawyerRequests.lawyerId"] = req.user._id;
                    break;

                default:
                    // Default: show available queries
                    query.$or = [
                        { assignedLawyer: { $exists: false } },
                        { assignedLawyer: null }
                    ];
                    query.status = { $in: ["pending", "open"] };
            }
        } else if (req.user.role === "admin") {
            // Admin sees all queries
            // No additional filtering needed
        }

        // Apply filters
        if (status && status !== "all") {
            query.status = status;
        }
        if (category && category !== "all") {
            query.category = category;
        }
        if (priority && priority !== "all") {
            query.priority = priority;
        }
        if (citizenId) {
            query.citizen = citizenId;
        }
        if (lawyerId) {
            query.assignedLawyer = lawyerId;
        }
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        const queries = await Query.find(query)
            .populate("citizen", "name email phone")
            .populate(
                "assignedLawyer",
                "name email lawyerDetails.specialization"
            )
            .populate(
                "lawyerRequests.lawyerId",
                "name email lawyerDetails.specialization"
            )
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Query.countDocuments(query);

        res.json({
            success: true,
            data: {
                queries,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total,
                },
            },
        });
    } catch (error) {
        console.error("Get queries error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get queries",
        });
    }
};

// Get single query by ID
export const getQueryById = async (req, res) => {
    try {
        const { queryId } = req.params;

        const query = await Query.findById(queryId)
            .populate("citizen", "name email phone address")
            .populate("assignedLawyer", "name email phone lawyerDetails")
            .populate(
                "lawyerRequests.lawyerId",
                "name email lawyerDetails.specialization"
            )
            .populate("timeline.performedBy", "name role")
            .populate("notes.author", "name role");

        if (!query) {
            return res.status(404).json({
                success: false,
                message: "Query not found",
            });
        }

        // Check access permissions
        if (
            req.user.role === "citizen" &&
            query.citizen._id.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        if (req.user.role === "lawyer") {
            const hasAccess =
                query.assignedLawyer?._id.toString() ===
                    req.user._id.toString() ||
                query.lawyerRequests.some(
                    (req) =>
                        req.lawyerId._id.toString() === req.user._id.toString()
                );

            if (!hasAccess) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied",
                });
            }
        }

        res.json({
            success: true,
            data: { query },
        });
    } catch (error) {
        console.error("Get query by ID error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get query",
        });
    }
};

// Send request for query (both lawyer and citizen can send)
export const sendQueryRequest = async (req, res) => {
    try {
        const { queryId } = req.params;
        const { message, targetUserId } = req.body;

        const query = await Query.findById(queryId).populate("citizen", "name email");
        if (!query) {
            return res.status(404).json({
                success: false,
                message: "Query not found",
            });
        }

        if (query.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Query is not available for requests",
            });
        }

        // Determine request type based on user role
        let requestData;
        let notificationTarget;

        if (req.user.role === "lawyer") {
            // Lawyer requesting to handle citizen's query
            if (query.citizen._id.toString() === req.user._id.toString()) {
                return res.status(400).json({
                    success: false,
                    message: "You cannot request to handle your own query",
                });
            }

            // Check if lawyer already requested
            if (query.hasRequestedLawyer(req.user._id)) {
                return res.status(400).json({
                    success: false,
                    message: "You have already requested to handle this query",
                });
            }

            query.addLawyerRequest(req.user._id, message);
            notificationTarget = query.citizen._id;
            requestData = {
                queryId: query._id,
                requestId: query.lawyerRequests[query.lawyerRequests.length - 1]._id,
                caseType: "query",
                requestType: "lawyer_to_citizen",
                lawyer: {
                    _id: req.user._id,
                    name: req.user.name,
                    specialization: req.user.lawyerDetails?.specialization,
                },
                message,
            };
        } else if (req.user.role === "citizen") {
            // Citizen requesting specific lawyer for their query
            if (!targetUserId) {
                return res.status(400).json({
                    success: false,
                    message: "Target lawyer ID is required",
                });
            }

            // Check if it's citizen's own query
            if (query.citizen._id.toString() !== req.user._id.toString()) {
                return res.status(400).json({
                    success: false,
                    message: "You can only request lawyers for your own queries",
                });
            }

            // Check if already requested this lawyer
            if (query.hasRequestedLawyer(targetUserId)) {
                return res.status(400).json({
                    success: false,
                    message: "This lawyer has already been requested for this query",
                });
            }

            query.addLawyerRequest(targetUserId, message);
            notificationTarget = targetUserId;
            requestData = {
                queryId: query._id,
                requestId: query.lawyerRequests[query.lawyerRequests.length - 1]._id,
                caseType: "query",
                requestType: "citizen_to_lawyer",
                citizen: {
                    _id: req.user._id,
                    name: req.user.name,
                },
                message,
            };
        }

        await query.save();

        // Send notification via Socket.io
        const io = req.app.get("socketio");
        io.emit("query_request_sent", {
            targetUserId: notificationTarget,
            requestData,
        });

        res.json({
            success: true,
            message: "Request sent successfully",
        });
    } catch (error) {
        console.error("Send query request error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send request",
        });
    }
};

// Legacy function for backward compatibility
export const requestToHandleQuery = sendQueryRequest;

// Offer help on query (lawyer only) - Alternative to requestToHandleQuery
export const offerHelpOnQuery = async (req, res) => {
    try {
        const { queryId } = req.params;
        const { message, proposedFee, estimatedDuration } = req.body;

        const query = await Query.findById(queryId);
        if (!query) {
            return res.status(404).json({
                success: false,
                message: "Query not found",
            });
        }

        if (query.status !== "pending" && query.status !== "open") {
            return res.status(400).json({
                success: false,
                message: "Query is not available for offers",
            });
        }

        // Check if query is already assigned
        if (query.assignedLawyer) {
            return res.status(400).json({
                success: false,
                message: "Query is already assigned to a lawyer",
            });
        }

        // Check if lawyer already offered help
        if (query.hasRequestedLawyer(req.user._id)) {
            return res.status(400).json({
                success: false,
                message: "You have already offered help for this query",
            });
        }

        // Add lawyer offer
        query.addLawyerRequest(req.user._id, message, proposedFee, estimatedDuration);
        await query.save();

        // Send notification to citizen via Socket.io
        const io = req.app.get("socketio");
        io.emit("lawyer_request_sent", {
            citizenId: query.citizen,
            requestData: {
                queryId: query._id,
                requestId: query.lawyerRequests[query.lawyerRequests.length - 1]._id,
                caseType: "query",
                lawyer: {
                    _id: req.user._id,
                    name: req.user.name,
                    specialization: req.user.lawyerDetails?.specialization,
                },
                message,
                proposedFee,
                estimatedDuration,
            },
        });

        res.json({
            success: true,
            message: "Offer sent successfully",
        });
    } catch (error) {
        console.error("Offer help on query error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send offer",
        });
    }
};


// Respond to request (both citizen and lawyer can respond)
export const respondToQueryRequest = async (req, res) => {
    try {
        const { queryId, requestId } = req.params;
        const { action } = req.body; // 'accept' or 'reject'

        if (!["accept", "reject"].includes(action)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid action. Use "accept" or "reject"',
            });
        }

        const query = await Query.findById(queryId);
        if (!query) {
            return res.status(404).json({
                success: false,
                message: "Query not found",
            });
        }

        // Find the request
        const lawyerRequest = query.lawyerRequests.id(requestId);
        if (!lawyerRequest) {
            return res.status(404).json({
                success: false,
                message: "Request not found",
            });
        }

        // Check authorization based on user role and request type
        let canRespond = false;
        let notificationTarget;

        if (req.user.role === "citizen") {
            // Citizen can respond to lawyer requests for their own queries
            if (query.citizen.toString() === req.user._id.toString()) {
                canRespond = true;
                notificationTarget = lawyerRequest.lawyerId;
            }
        } else if (req.user.role === "lawyer") {
            // Lawyer can respond to citizen requests directed to them
            if (lawyerRequest.lawyerId.toString() === req.user._id.toString()) {
                canRespond = true;
                notificationTarget = query.citizen;
            }
        }

        if (!canRespond) {
            return res.status(403).json({
                success: false,
                message: "Access denied - you cannot respond to this request",
            });
        }

        if (lawyerRequest.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Request has already been responded to",
            });
        }

        // Update request status
        lawyerRequest.status = action === "accept" ? "accepted" : "rejected";
        lawyerRequest.respondedAt = new Date();

        if (action === "accept") {
            // Assign lawyer and update query status
            query.assignedLawyer = lawyerRequest.lawyerId;
            query.status = "assigned";

            // Reject all other pending requests
            query.lawyerRequests.forEach((req) => {
                if (
                    req._id.toString() !== requestId &&
                    req.status === "pending"
                ) {
                    req.status = "rejected";
                    req.respondedAt = new Date();
                }
            });

            // Add timeline entry
            query.timeline.push({
                action: "assigned",
                description: "Lawyer assigned to query",
                performedBy: req.user._id,
            });
        }

        await query.save();

        // Send notification via Socket.io
        const io = req.app.get("socketio");

        if (action === "accept") {
            // Emit case assignment event to create chat room via Socket.io
            io.emit("case_assigned", {
                citizenId: query.citizen,
                lawyerId: lawyerRequest.lawyerId,
                caseType: "query",
                caseId: queryId,
                caseData: {
                    queryId: query._id,
                    title: query.title,
                    action: "accepted",
                    responder: {
                        _id: req.user._id,
                        name: req.user.name,
                        role: req.user.role,
                    },
                },
            });
        }

        // Send request response notification to the appropriate user
        io.to(`user_${notificationTarget}`).emit("request_response", {
            queryId: query._id,
            requestId,
            action,
            caseType: "query",
            responder: {
                _id: req.user._id,
                name: req.user.name,
                role: req.user.role,
            },
        });

        res.json({
            success: true,
            message: `Request ${action}ed successfully`,
        });
    } catch (error) {
        console.error("Respond to query request error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to respond to request",
        });
    }
};

// Legacy function for backward compatibility
export const respondToLawyerRequest = respondToQueryRequest;

// Update query status
export const updateQueryStatus = async (req, res) => {
    try {
        const { queryId } = req.params;
        const { status, notes } = req.body;

        const query = await Query.findById(queryId);
        if (!query) {
            return res.status(404).json({
                success: false,
                message: "Query not found",
            });
        }

        // Check permissions
        const canUpdate =
            (req.user.role === "lawyer" &&
                query.assignedLawyer?.toString() === req.user._id.toString()) ||
            (req.user.role === "citizen" &&
                query.citizen.toString() === req.user._id.toString()) ||
            req.user.role === "admin";

        if (!canUpdate) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        const oldStatus = query.status;
        query.status = status;

        // Add notes if provided
        if (notes) {
            query.notes.push({
                author: req.user._id,
                content: notes,
            });
        }

        // Handle resolution
        if (status === "resolved" && oldStatus !== "resolved") {
            query.resolution = {
                resolvedBy: req.user._id,
                resolvedAt: new Date(),
            };
        }

        await query.save();

        // Send notification
        const io = req.app.get("socketio");
        const notificationUsers = [query.citizen];
        if (query.assignedLawyer) {
            notificationUsers.push(query.assignedLawyer);
        }

        notificationUsers.forEach((userId) => {
            if (userId.toString() !== req.user._id.toString()) {
                io.to(`user_${userId}`).emit("query_status_updated", {
                    queryId: query._id,
                    newStatus: status,
                    updatedBy: {
                        _id: req.user._id,
                        name: req.user.name,
                        role: req.user.role,
                    },
                });
            }
        });

        res.json({
            success: true,
            message: "Query status updated successfully",
        });
    } catch (error) {
        console.error("Update query status error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update query status",
        });
    }
};
