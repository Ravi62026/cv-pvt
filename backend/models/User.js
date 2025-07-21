import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide a name"],
        trim: true,
        maxlength: [50, "Name cannot be more than 50 characters"],
    },
    email: {
        type: String,
        required: [true, "Please provide an email"],
        unique: true,
        lowercase: true,
        match: [
            /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
            "Please provide a valid email",
        ],
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        minlength: [6, "Password must be at least 6 characters"],
        select: false,
    },
    role: {
        type: String,
        enum: ["admin", "lawyer", "citizen"],
        default: "citizen",
    },
    phone: {
        type: String,
        match: [/^[0-9]{10}$/, "Please provide a valid 10-digit phone number"],
    },
    // Aadhaar number for citizens (optional)
    aadhaar: {
        type: String,
        match: [/^[0-9]{12}$/, "Please provide a valid 12-digit Aadhaar number"],
        function() { return this.role === "citizen"; }
    },
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
    },
    profilePicture: {
        type: String,
        default: null,
    },
    // Role-based verification (only for lawyers)
    isVerified: {
        type: Boolean,
        default: function() {
            return this.role === "citizen" ? true : false; // Citizens are auto-verified
        },
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    refreshToken: {
        type: String,
        select: false,
    },
    // Password reset fields
    passwordResetToken: {
        type: String,
        select: false,
    },
    passwordResetExpires: {
        type: Date,
        select: false,
    },
    // Profile completion tracking
    profileCompletion: {
        basicInfo: {
            type: Boolean,
            default: true, // Always true after registration
        },
        roleSpecificDetails: {
            type: Boolean,
            default: function() {
                return this.role === "citizen"; // Citizens auto-complete, lawyers need to fill details
            },
        },
        documentsUploaded: {
            type: Boolean,
            default: function() {
                return this.role === "citizen"; // Citizens don't need documents
            },
        },
    },
    // Lawyer specific fields (only populated for lawyers)
    lawyerDetails: {
        type: {
            barRegistrationNumber: {
                type: String,
                required: function() {
                    // Only required if lawyer profile is being completed
                    return this.parent().role === "lawyer" && this.parent().profileCompletion?.roleSpecificDetails;
                }
            },
            specialization: {
                type: [String],
                default: ['General Practice'],
                function() {
                    return this.parent().role === "lawyer" && this.parent().profileCompletion?.roleSpecificDetails;
                }
            },
            experience: {
                type: Number,
                min: 0,
                max: 50,
                default: 0,
                function() {
                    return this.parent().role === "lawyer" && this.parent().profileCompletion?.roleSpecificDetails;
                }
            },
            education: {
                type: String,
                default: 'Law Graduate',
                function() {
                    return this.parent().role === "lawyer" && this.parent().profileCompletion?.roleSpecificDetails;
                }
            },
            verificationStatus: {
                type: String,
                enum: ["pending", "verified", "rejected"],
                default: "pending",
            },
            verificationDocuments: [String],
            verificationNotes: {
                type: String,
                trim: true,
                maxlength: [500, "Verification notes cannot be more than 500 characters"]
            },
            consultationFee: {
                type: Number,
                min: 0
            },
            bio: String,
            licenseNumber: String,
            practiceAreas: [String],
            courtAdmissions: [String],
        },
        default: undefined // Only create this object for lawyers
    },
    // For rate limiting message requests
    messageRequests: [
        {
            toUserId: mongoose.Schema.Types.ObjectId,
            timestamp: Date,
        },
    ],
    // Direct connections with other users (lawyers/citizens)
    directConnections: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            userRole: {
                type: String,
                enum: ["citizen", "lawyer"],
                required: true,
            },
            status: {
                type: String,
                enum: ["pending", "accepted", "rejected", "blocked"],
                default: "pending",
            },
            requestedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            requestMessage: {
                type: String,
                maxlength: [500, "Request message cannot be more than 500 characters"],
            },
            connectedAt: {
                type: Date,
                default: Date.now,
            },
            chatId: {
                type: String, // Reference to the chat room
            },
        },
    ],
    // Connected lawyers/clients
    connections: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            connectionType: {
                type: String,
                enum: ["lawyer", "client"],
            },
            connectedAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Role-specific logic before saving
userSchema.pre("save", function (next) {
    // Update timestamps
    this.updatedAt = Date.now();

    // Handle role-specific fields
    if (this.role === "citizen") {
        // Citizens don't need lawyer details
        this.lawyerDetails = undefined;
        // Citizens are auto-verified
        this.isVerified = true;
    } else if (this.role === "lawyer") {
        // Lawyers need lawyer details
        if (!this.lawyerDetails) {
            this.lawyerDetails = {};
        }

        // New lawyers start as unverified (unless explicitly set)
        if (this.isNew && this.isVerified === undefined) {
            this.isVerified = false;
        }
    } else if (this.role === "admin") {
        // Admins don't need lawyer details
        this.lawyerDetails = undefined;
        // Admins are auto-verified
        this.isVerified = true;
    }

    next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Check if can send message request (2 per hour limit)
userSchema.methods.canSendMessageRequest = function (toUserId) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentRequests = this.messageRequests.filter(
        (req) =>
            req.toUserId.toString() === toUserId.toString() &&
            req.timestamp > oneHourAgo
    );
    return recentRequests.length < 2;
};

// Add message request
userSchema.methods.addMessageRequest = function (toUserId) {
    this.messageRequests.push({
        toUserId,
        timestamp: new Date(),
    });
    // Clean up old requests
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    this.messageRequests = this.messageRequests.filter(
        (req) => req.timestamp > oneHourAgo
    );
};

const User = mongoose.model("User", userSchema);

export default User;
