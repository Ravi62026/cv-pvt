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
    // Lawyer specific fields (only populated for lawyers)
    lawyerDetails: {
        type: {
            barRegistrationNumber: {
                type: String,
                required: function() { return this.parent().role === "lawyer"; }
            },
            specialization: {
                type: [String],
                required: function() { return this.parent().role === "lawyer"; }
            },
            experience: {
                type: Number,
                min: 0,
                max: 50,
                required: function() { return this.parent().role === "lawyer"; }
            },
            education: {
                type: String,
                required: function() { return this.parent().role === "lawyer"; }
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
        if (this.isNew) {
            this.isVerified = true;
        }
    } else if (this.role === "lawyer") {
        // Lawyers need lawyer details
        if (!this.lawyerDetails) {
            this.lawyerDetails = {
                verificationStatus: "pending"
            };
        }
        // Lawyers start as unverified
        if (this.isNew) {
            this.isVerified = false;
        }
    } else if (this.role === "admin") {
        // Admins don't need lawyer details
        this.lawyerDetails = undefined;
        // Admins are auto-verified
        if (this.isNew) {
            this.isVerified = true;
        }
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
