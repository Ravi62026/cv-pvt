import mongoose from "mongoose";

const directConnectionSchema = new mongoose.Schema({
    // The citizen who sent the request
    citizen: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    // The lawyer who received the request
    lawyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    // Status of the connection request
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected", "blocked"],
        default: "pending",
    },
    // Message from citizen when requesting connection
    requestMessage: {
        type: String,
        required: true,
        maxlength: [500, "Request message cannot be more than 500 characters"],
        trim: true,
    },
    // When the request was sent
    requestedAt: {
        type: Date,
        default: Date.now,
    },
    // When the lawyer responded (accepted/rejected)
    respondedAt: {
        type: Date,
    },
    // Response message from lawyer (optional)
    responseMessage: {
        type: String,
        maxlength: [500, "Response message cannot be more than 500 characters"],
        trim: true,
    },
    // Chat room ID for this connection
    chatId: {
        type: String,
        unique: true,
        sparse: true, // Only create index for non-null values
    },
    // Additional metadata
    metadata: {
        citizenLocation: String,
        lawyerSpecialization: [String],
        connectionType: {
            type: String,
            enum: ["general_consultation", "specific_case", "ongoing_support"],
            default: "general_consultation",
        },
    },
    // Tracking fields
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

// Indexes for better query performance
directConnectionSchema.index({ citizen: 1, status: 1 });
directConnectionSchema.index({ lawyer: 1, status: 1 });
directConnectionSchema.index({ citizen: 1, lawyer: 1 }, { unique: true });
// chatId index is already created by unique: true in schema definition

// Update timestamps on save
directConnectionSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

// Instance methods
directConnectionSchema.methods.accept = function (responseMessage = "") {
    this.status = "accepted";
    this.respondedAt = new Date();
    this.responseMessage = responseMessage;
    
    // Generate chat ID for this connection
    if (!this.chatId) {
        this.chatId = `direct_${[this.citizen.toString(), this.lawyer.toString()].sort().join("_")}`;
    }
    
    return this.save();
};

directConnectionSchema.methods.reject = function (responseMessage = "") {
    this.status = "rejected";
    this.respondedAt = new Date();
    this.responseMessage = responseMessage;
    return this.save();
};

directConnectionSchema.methods.block = function () {
    this.status = "blocked";
    this.respondedAt = new Date();
    this.isActive = false;
    return this.save();
};

// Static methods
directConnectionSchema.statics.findPendingForLawyer = function (lawyerId) {
    return this.find({
        lawyer: lawyerId,
        status: "pending",
        isActive: true,
    }).populate("citizen", "name email phone address");
};

directConnectionSchema.statics.findAcceptedForUser = function (userId, userRole) {
    const query = {
        status: "accepted",
        isActive: true,
    };
    
    if (userRole === "citizen") {
        query.citizen = userId;
        return this.find(query).populate("lawyer", "name email phone lawyerDetails");
    } else if (userRole === "lawyer") {
        query.lawyer = userId;
        return this.find(query).populate("citizen", "name email phone address");
    }
    
    return this.find({ _id: null }); // Return empty result for invalid role
};

directConnectionSchema.statics.findExistingConnection = function (citizenId, lawyerId) {
    return this.findOne({
        citizen: citizenId,
        lawyer: lawyerId,
        isActive: true,
    });
};

const DirectConnection = mongoose.model("DirectConnection", directConnectionSchema);

export default DirectConnection;
