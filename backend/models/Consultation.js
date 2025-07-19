import mongoose from "mongoose";

const consultationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please provide a consultation title"],
        trim: true,
        maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
        type: String,
        maxlength: [500, "Description cannot be more than 500 characters"],
    },
    citizen: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    lawyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    relatedCase: {
        caseType: {
            type: String,
            enum: ["query", "dispute", "general"],
        },
        caseId: mongoose.Schema.Types.ObjectId,
    },
    consultationType: {
        type: String,
        enum: ["video", "audio", "in-person"],
        required: true,
    },
    status: {
        type: String,
        enum: [
            "requested",
            "scheduled",
            "confirmed",
            "in-progress",
            "completed",
            "cancelled",
            "rescheduled",
        ],
        default: "requested",
    },
    scheduledDateTime: {
        type: Date,
        required: true,
    },
    duration: {
        type: Number, // in minutes
        default: 30,
        min: [15, "Minimum consultation duration is 15 minutes"],
        max: [180, "Maximum consultation duration is 180 minutes"],
    },
    fee: {
        amount: {
            type: Number,
            min: [0, "Fee cannot be negative"],
        },
        currency: {
            type: String,
            default: "INR",
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "refunded"],
            default: "pending",
        },
    },
    meetingDetails: {
        platform: {
            type: String,
            enum: ["zoom", "google-meet", "teams", "phone", "in-person"],
        },
        meetingLink: String,
        meetingId: String,
        passcode: String,
        phoneNumber: String,
        address: {
            street: String,
            city: String,
            state: String,
            pincode: String,
        },
    },
    agenda: [
        {
            topic: String,
            priority: {
                type: String,
                enum: ["low", "medium", "high"],
                default: "medium",
            },
        },
    ],
    notes: {
        citizenNotes: String, // Notes from citizen before consultation
        lawyerNotes: String, // Notes from lawyer after consultation
        summary: String, // Overall consultation summary
    },
    followUp: {
        required: {
            type: Boolean,
            default: false,
        },
        scheduledDate: Date,
        reason: String,
    },
    cancellation: {
        cancelledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        reason: String,
        cancelledAt: Date,
    },
    reschedule: {
        requestedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        originalDateTime: Date,
        reason: String,
        requestedAt: Date,
    },
    feedback: {
        citizenRating: {
            type: Number,
            min: 1,
            max: 5,
        },
        citizenReview: String,
        lawyerRating: {
            type: Number,
            min: 1,
            max: 5,
        },
        lawyerReview: String,
    },
    reminders: [
        {
            type: {
                type: String,
                enum: ["email", "sms", "notification"],
            },
            scheduledFor: Date,
            sent: {
                type: Boolean,
                default: false,
            },
            sentAt: Date,
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

// Index for faster queries
consultationSchema.index({ citizen: 1, lawyer: 1 });
consultationSchema.index({ scheduledDateTime: 1 });
consultationSchema.index({ status: 1 });

// Update timestamps
consultationSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

// Method to check if consultation can be cancelled
consultationSchema.methods.canBeCancelled = function () {
    const now = new Date();
    const scheduledTime = new Date(this.scheduledDateTime);
    const hoursDifference = (scheduledTime - now) / (1000 * 60 * 60);

    return (
        hoursDifference >= 2 &&
        ["requested", "scheduled", "confirmed"].includes(this.status)
    );
};

// Method to check if consultation can be rescheduled
consultationSchema.methods.canBeRescheduled = function () {
    const now = new Date();
    const scheduledTime = new Date(this.scheduledDateTime);
    const hoursDifference = (scheduledTime - now) / (1000 * 60 * 60);

    return (
        hoursDifference >= 4 && ["scheduled", "confirmed"].includes(this.status)
    );
};

// Method to generate meeting link placeholder
consultationSchema.methods.generateMeetingLink = function () {
    if (this.consultationType === "video") {
        // In a real app, integrate with Zoom/Google Meet API
        this.meetingDetails.meetingLink = `https://meet.example.com/consultation/${this._id}`;
        this.meetingDetails.meetingId = `consultation-${this._id}`;
    }
};

const Consultation = mongoose.model("Consultation", consultationSchema);

export default Consultation;
