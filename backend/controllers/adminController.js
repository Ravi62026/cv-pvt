import User from "../models/User.js";
import Query from "../models/Query.js";
import Dispute from "../models/Dispute.js";
import Chat from "../models/Chat.js";
import { validationResult } from "express-validator";

// Helper function to clean user data based on role
const cleanUserData = (user) => {
    const userData = user.toObject ? user.toObject() : user;

    // Always remove sensitive fields
    delete userData.password;
    delete userData.refreshToken;

    // Role-specific field cleaning
    switch (userData.role) {
        case "citizen":
            // Citizens don't need these fields
            delete userData.lawyerDetails;
            // Keep isVerified as true for citizens
            userData.isVerified = true;
            break;

        case "lawyer":
            // Keep lawyerDetails for lawyers
            if (userData.lawyerDetails) {
                // Clean empty arrays
                if (!userData.lawyerDetails.specialization || userData.lawyerDetails.specialization.length === 0) {
                    userData.lawyerDetails.specialization = [];
                }
                if (!userData.lawyerDetails.verificationDocuments || userData.lawyerDetails.verificationDocuments.length === 0) {
                    userData.lawyerDetails.verificationDocuments = [];
                }
            }
            break;

        case "admin":
            // Admins don't need lawyer details
            delete userData.lawyerDetails;
            // Keep isVerified as true for admins
            userData.isVerified = true;
            break;

        default:
            // Unknown role, remove lawyer details
            delete userData.lawyerDetails;
            break;
    }

    return userData;
};

// Get dashboard analytics
export const getDashboardAnalytics = async (req, res) => {
    try {
        // Get counts
        const [
            totalCitizens,
            totalLawyers,
            totalQueries,
            totalDisputes,
            completedQueries,
            completedDisputes,
            pendingLawyerVerifications,
        ] = await Promise.all([
            User.countDocuments({ role: "citizen", isActive: true }),
            User.countDocuments({ role: "lawyer", isActive: true }),
            Query.countDocuments(),
            Dispute.countDocuments(),
            Query.countDocuments({ status: "resolved" }),
            Dispute.countDocuments({ status: "resolved" }),
            User.countDocuments({
                role: "lawyer",
                "lawyerDetails.verificationStatus": "pending",
            }),
        ]);

        // Get recent activities
        const recentQueries = await Query.find()
            .populate("citizen", "name email")
            .populate("assignedLawyer", "name email")
            .sort({ createdAt: -1 })
            .limit(5);

        const recentDisputes = await Dispute.find()
            .populate("citizen", "name email")
            .populate("assignedLawyer", "name email")
            .sort({ createdAt: -1 })
            .limit(5);

        // Monthly data for charts
        const currentYear = new Date().getFullYear();
        const monthlyStats = await Promise.all(
            Array.from({ length: 12 }, async (_, month) => {
                const startDate = new Date(currentYear, month, 1);
                const endDate = new Date(currentYear, month + 1, 0);

                const [queries, disputes] = await Promise.all([
                    Query.countDocuments({
                        createdAt: { $gte: startDate, $lte: endDate },
                    }),
                    Dispute.countDocuments({
                        createdAt: { $gte: startDate, $lte: endDate },
                    }),
                ]);

                return {
                    month: startDate.toLocaleDateString("en", {
                        month: "short",
                    }),
                    queries,
                    disputes,
                };
            })
        );

        // Dummy revenue stats (can be replaced with actual payment integration)
        const dummyRevenue = {
            totalRevenue: 125000,
            monthlyRevenue: 15000,
            growthRate: 12.5,
            averageConsultationFee: 1500,
        };

        res.json({
            success: true,
            data: {
                counts: {
                    totalCitizens,
                    totalLawyers,
                    totalQueries,
                    totalDisputes,
                    completedQueries,
                    completedDisputes,
                    pendingLawyerVerifications,
                },
                recentActivities: {
                    queries: recentQueries,
                    disputes: recentDisputes,
                },
                monthlyStats,
                revenue: dummyRevenue,
            },
        });
    } catch (error) {
        console.error("Get dashboard analytics error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get dashboard analytics",
        });
    }
};

// Get all users with pagination and filters
export const getAllUsers = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            role,
            status,
            verificationStatus,
            search,
        } = req.query;

        // Build query
        const query = {};

        if (role && role !== "all") {
            query.role = role;
        }

        if (status && status !== "all") {
            query.isActive = status === "active";
        }

        if (verificationStatus && verificationStatus !== "all") {
            query["lawyerDetails.verificationStatus"] = verificationStatus;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        // Manual pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Get users with manual pagination
        const users = await User.find(query)
            .select("-password -refreshToken")
            .populate({
                path: "connections.userId",
                select: "name email role",
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        // Get total count for pagination
        const total = await User.countDocuments(query);

        // Clean user data for each user
        const cleanedUsers = users.map(user => cleanUserData(user));

        // Create pagination object
        const pagination = {
            docs: cleanedUsers,
            totalDocs: total,
            limit: limitNum,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum),
            hasNextPage: pageNum < Math.ceil(total / limitNum),
            hasPrevPage: pageNum > 1,
            nextPage: pageNum < Math.ceil(total / limitNum) ? pageNum + 1 : null,
            prevPage: pageNum > 1 ? pageNum - 1 : null,
        };

        res.json({
            success: true,
            data: pagination,
        });
    } catch (error) {
        console.error("Get all users error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get users",
        });
    }
};

// Get pending lawyer verifications
export const getPendingLawyerVerifications = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const pendingLawyers = await User.find({
            role: "lawyer",
            "lawyerDetails.verificationStatus": "pending",
        })
            .select("-password -refreshToken")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await User.countDocuments({
            role: "lawyer",
            "lawyerDetails.verificationStatus": "pending",
        });

        // Clean lawyer data
        const cleanedLawyers = pendingLawyers.map(lawyer => cleanUserData(lawyer));

        res.json({
            success: true,
            data: {
                lawyers: cleanedLawyers,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total,
                },
            },
        });
    } catch (error) {
        console.error("Get pending lawyer verifications error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get pending verifications",
        });
    }
};

// Verify or reject lawyer
export const updateLawyerVerification = async (req, res) => {
    try {
        const { lawyerId } = req.params;
        const { status, action, reason, notes } = req.body;

        // Support both 'status' and 'action' fields for flexibility
        let verificationStatus;
        if (status) {
            verificationStatus = status;
        } else if (action) {
            // Map action to status
            verificationStatus = action === "approve" ? "verified" :
                               action === "reject" ? "rejected" : action;
        }

        if (!["verified", "rejected"].includes(verificationStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid verification status. Use 'verified'/'rejected' for status or 'approve'/'reject' for action",
            });
        }

        const lawyer = await User.findOne({
            _id: lawyerId,
            role: "lawyer",
        });

        if (!lawyer) {
            return res.status(404).json({
                success: false,
                message: "Lawyer not found",
            });
        }

        // Update verification status
        lawyer.lawyerDetails.verificationStatus = verificationStatus;

        if (verificationStatus === "verified") {
            lawyer.isVerified = true;
        } else if (verificationStatus === "rejected") {
            lawyer.isVerified = false;
        }

        // Store rejection reason or approval notes
        if (reason || notes) {
            lawyer.lawyerDetails.verificationNotes = reason || notes;
        }

        await lawyer.save();

        // Clean lawyer data before sending response
        const cleanedLawyer = cleanUserData(lawyer);

        // TODO: Send email notification to lawyer about verification status

        res.json({
            success: true,
            message: `Lawyer ${verificationStatus} successfully`,
            data: { lawyer: cleanedLawyer },
        });
    } catch (error) {
        console.error("Update lawyer verification error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update verification status",
        });
    }
};

// Deactivate/Activate user account
export const toggleUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Prevent admin from deactivating themselves
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "Cannot deactivate your own account",
            });
        }

        user.isActive = isActive;
        await user.save();

        // Clean user data
        const cleanedUser = cleanUserData(user);

        res.json({
            success: true,
            message: `User account ${
                isActive ? "activated" : "deactivated"
            } successfully`,
            data: { user: cleanedUser },
        });
    } catch (error) {
        console.error("Toggle user status error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update user status",
        });
    }
};

// Get system statistics
export const getSystemStats = async (req, res) => {
    try {
        // Get detailed statistics
        const stats = await Promise.all([
            // User stats by role
            User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),

            // Query stats by status
            Query.aggregate([
                { $group: { _id: "$status", count: { $sum: 1 } } },
            ]),

            // Dispute stats by status
            Dispute.aggregate([
                { $group: { _id: "$status", count: { $sum: 1 } } },
            ]),

            // Top performing lawyers
            Query.aggregate([
                {
                    $match: {
                        assignedLawyer: { $exists: true },
                        status: "resolved",
                    },
                },
                {
                    $group: {
                        _id: "$assignedLawyer",
                        resolvedCases: { $sum: 1 },
                    },
                },
                { $sort: { resolvedCases: -1 } },
                { $limit: 10 },
                {
                    $lookup: {
                        from: "users",
                        localField: "_id",
                        foreignField: "_id",
                        as: "lawyer",
                    },
                },
                { $unwind: "$lawyer" },
                {
                    $project: {
                        lawyerName: "$lawyer.name",
                        lawyerEmail: "$lawyer.email",
                        resolvedCases: 1,
                    },
                },
            ]),

            // Case resolution time analysis
            Query.aggregate([
                {
                    $match: {
                        status: "resolved",
                        "resolution.resolvedAt": { $exists: true },
                    },
                },
                {
                    $addFields: {
                        resolutionTimeInDays: {
                            $divide: [
                                {
                                    $subtract: [
                                        "$resolution.resolvedAt",
                                        "$createdAt",
                                    ],
                                },
                                1000 * 60 * 60 * 24,
                            ],
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        averageResolutionTime: {
                            $avg: "$resolutionTimeInDays",
                        },
                        minResolutionTime: { $min: "$resolutionTimeInDays" },
                        maxResolutionTime: { $max: "$resolutionTimeInDays" },
                    },
                },
            ]),
        ]);

        const [
            userStats,
            queryStats,
            disputeStats,
            topLawyers,
            resolutionStats,
        ] = stats;

        res.json({
            success: true,
            data: {
                userStats,
                queryStats,
                disputeStats,
                topLawyers,
                resolutionStats: resolutionStats[0] || {
                    averageResolutionTime: 0,
                    minResolutionTime: 0,
                    maxResolutionTime: 0,
                },
            },
        });
    } catch (error) {
        console.error("Get system stats error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get system statistics",
        });
    }
};
