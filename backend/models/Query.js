import mongoose from "mongoose";

const querySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please provide a title"],
        trim: true,
        maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
    type: String,
        required: [true, "Please provide a description"],
        maxlength: [2000, "Description cannot be more than 2000 characters"],
    },
    category: {
        type: String,
        required: [true, "Please select a category"],
        enum: [
            "civil",
            "criminal",
            "family",
            "property",
            "corporate",
            "tax",
            "labor",
            "other",
        ],
    },
    status: {
        type: String,
        enum: ["pending", "assigned", "in-progress", "resolved", "closed"],
        default: "pending",
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high", "urgent"],
        default: "medium",
    },
    citizen: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    assignedLawyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    lawyerRequests: [
        {
            lawyerId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            status: {
                type: String,
                enum: ["pending", "accepted", "rejected"],
                default: "pending",
            },
            requestedAt: {
                type: Date,
                default: Date.now,
            },
            respondedAt: Date,
            message: String,
        },
    ],
    documents: [
        {
            filename: String,
            originalName: String,
            path: String,
            uploadedAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    notes: [
        {
            author: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            content: String,
            createdAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    timeline: [
        {
            action: String,
            description: String,
            performedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            timestamp: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    resolution: {
        summary: String,
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        resolvedAt: Date,
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

// Update timestamps
querySchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

// Add timeline entry on status change
querySchema.pre("save", function (next) {
    if (this.isModified("status")) {
        this.timeline.push({
            action: "status_change",
            description: `Status changed to ${this.status}`,
            timestamp: new Date(),
        });
    }
    next();
});

// Method to check if lawyer request already exists
querySchema.methods.hasRequestedLawyer = function (lawyerId) {
    return this.lawyerRequests.some(
        (req) =>
            req.lawyerId.toString() === lawyerId.toString() &&
            req.status === "pending"
    );
};

// Method to add lawyer request
querySchema.methods.addLawyerRequest = function (lawyerId, message = "") {
    if (!this.hasRequestedLawyer(lawyerId)) {
        this.lawyerRequests.push({
            lawyerId,
            message,
        });
    }
};

const Query = mongoose.model("Query", querySchema);

export default Query;
