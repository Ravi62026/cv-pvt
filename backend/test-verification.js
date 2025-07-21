import dotenv from "dotenv";
import connectDB from "./config/database.js";
import User from "./models/User.js";

// Load environment variables
dotenv.config();

const testVerification = async () => {
    try {
        console.log("Testing verification status logic...");
        
        // Test 1: Create a citizen
        console.log("\n1. Testing Citizen:");
        const citizenData = {
            name: "Test Citizen",
            email: "citizen@test.com",
            password: "password123",
            role: "citizen",
            phone: "1234567890"
        };
        
        const citizen = new User(citizenData);
        console.log("Before save - isVerified:", citizen.isVerified);
        console.log("Before save - lawyerDetails:", citizen.lawyerDetails);
        
        // Test 2: Create a lawyer
        console.log("\n2. Testing Lawyer:");
        const lawyerData = {
            name: "Test Lawyer",
            email: "lawyer@test.com",
            password: "password123",
            role: "lawyer",
            phone: "1234567891"
        };
        
        const lawyer = new User(lawyerData);
        console.log("Before save - isVerified:", lawyer.isVerified);
        console.log("Before save - lawyerDetails:", lawyer.lawyerDetails);
        
        // Test 3: Update lawyer verification status
        console.log("\n3. Testing Lawyer Verification Update:");
        if (!lawyer.lawyerDetails) {
            lawyer.lawyerDetails = {};
        }
        lawyer.lawyerDetails.verificationStatus = "verified";
        
        console.log("After setting verificationStatus to 'verified':");
        console.log("isVerified:", lawyer.isVerified);
        console.log("verificationStatus:", lawyer.lawyerDetails.verificationStatus);
        
        // Test the pre-save middleware
        console.log("\n4. Testing pre-save middleware:");
        lawyer.validate((err) => {
            if (err) {
                console.log("Validation error:", err);
            } else {
                console.log("Validation passed");
                
                // Manually trigger the pre-save logic
                lawyer.updatedAt = Date.now();
                
                if (lawyer.role === "lawyer") {
                    if (lawyer.lawyerDetails && lawyer.lawyerDetails.verificationStatus) {
                        lawyer.isVerified = lawyer.lawyerDetails.verificationStatus === "verified";
                    } else {
                        lawyer.isVerified = false;
                    }
                }
                
                console.log("After pre-save logic:");
                console.log("isVerified:", lawyer.isVerified);
                console.log("verificationStatus:", lawyer.lawyerDetails.verificationStatus);
            }
        });
        
        console.log("\n✅ Test completed successfully!");
        
    } catch (error) {
        console.error("❌ Test failed:", error);
    }
};

// Run the test
testVerification();
