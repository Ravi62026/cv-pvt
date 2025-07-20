import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { createServer } from "http";
import { initializeSocket } from "./config/socket.js";

// Import configurations and middleware
import connectDB from "./config/database.js";
import { apiLimiter } from "./middleware/rateLimiter.js";

// Import routes
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import lawyerRoutes from "./routes/lawyer.js";
import citizenRoutes from "./routes/citizen.js";
import queryRoutes from "./routes/query.js";
import disputeRoutes from "./routes/dispute.js";
import chatRoutes from "./routes/chat.js";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const server = createServer(app);

// Socket.io setup
const io = initializeSocket(server);

// Connect to database
connectDB();

// Security middleware
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
    })
);

// CORS configuration
app.use(
    cors({
        // origin: process.env.CLIENT_URL || "http://localhost:5173",
        origin: "*",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Logging middleware
if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
}

// Rate limiting
app.use("/api", apiLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/lawyers", lawyerRoutes);
app.use("/api/citizens", citizenRoutes);
app.use("/api/queries", queryRoutes);
app.use("/api/disputes", disputeRoutes);
app.use("/api/chats", chatRoutes);

// Health check route
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Server is running",
        timestamp: new Date().toISOString(),
    });
});

// Socket.io is now configured in config/socket.js for better organization

// Make io accessible to routes
app.set("socketio", io);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);

    res.status(err.status || 500).json({
        success: false,
        message:
            process.env.NODE_ENV === "production"
                ? "Something went wrong!"
                : err.message,
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    });
});

// 404 handler
app.use("*", (req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    );
    console.log(`Socket.io server ready for connections`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
    console.log("Unhandled Rejection:", err.message);
    server.close(() => {
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
    console.log("Uncaught Exception:", err.message);
    process.exit(1);
});

export default app;
