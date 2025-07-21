import mongoose from "mongoose";
import User from "./models/User.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const testUserData = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        // Find the lawyer user
        const lawyer = await User.findOne({
            email: "cursorfreetrials100@gmail.com",
            role: "lawyer"
        });

        if (!lawyer) {
            console.log("Lawyer not found");
            return;
        }

        console.log("Lawyer found:");
        console.log("Name:", lawyer.name);
        console.log("Email:", lawyer.email);
        console.log("isVerified:", lawyer.isVerified);
        console.log("lawyerDetails.verificationStatus:", lawyer.lawyerDetails?.verificationStatus);
        
        // Check if there's a mismatch
        const expectedIsVerified = lawyer.lawyerDetails?.verificationStatus === "verified";
        if (lawyer.isVerified !== expectedIsVerified) {
            console.log("❌ MISMATCH DETECTED!");
            console.log("Expected isVerified:", expectedIsVerified);
            console.log("Actual isVerified:", lawyer.isVerified);
            
            // Fix the mismatch
            lawyer.isVerified = expectedIsVerified;
            await lawyer.save();
            console.log("✅ Fixed the mismatch");
        } else {
            console.log("✅ No mismatch - data is consistent");
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    }
};

testUserData();
