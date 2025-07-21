import dotenv from "dotenv";
import connectDB from "../config/database.js";
import User from "../models/User.js";

// Load environment variables
dotenv.config();

const fixVerificationStatus = async () => {
    try {
        // Connect to database
        await connectDB();
        console.log("Connected to database");

        // Fix all users
        const users = await User.find({});
        let updatedCount = 0;

        for (const user of users) {
            let needsUpdate = false;

            if (user.role === "citizen") {
                // Citizens should not have lawyerDetails and should be verified
                if (user.lawyerDetails || !user.isVerified) {
                    user.lawyerDetails = undefined;
                    user.isVerified = true;
                    needsUpdate = true;
                }
            } else if (user.role === "lawyer") {
                // Lawyers should have lawyerDetails and isVerified should match verificationStatus
                if (!user.lawyerDetails) {
                    user.lawyerDetails = {
                        verificationStatus: "pending"
                    };
                    user.isVerified = false;
                    needsUpdate = true;
                } else {
                    const shouldBeVerified = user.lawyerDetails.verificationStatus === "verified";
                    if (user.isVerified !== shouldBeVerified) {
                        user.isVerified = shouldBeVerified;
                        needsUpdate = true;
                    }
                }
            } else if (user.role === "admin") {
                // Admins should not have lawyerDetails and should be verified
                if (user.lawyerDetails || !user.isVerified) {
                    user.lawyerDetails = undefined;
                    user.isVerified = true;
                    needsUpdate = true;
                }
            }

            if (needsUpdate) {
                await user.save();
                updatedCount++;
                console.log(`Updated user: ${user.email} (${user.role})`);
            }
        }

        console.log(`\n✅ Migration completed!`);
        console.log(`📊 Total users processed: ${users.length}`);
        console.log(`🔄 Users updated: ${updatedCount}`);
        console.log(`\n📋 Summary:`);
        
        // Show final counts
        const citizenCount = await User.countDocuments({ role: "citizen" });
        const lawyerCount = await User.countDocuments({ role: "lawyer" });
        const adminCount = await User.countDocuments({ role: "admin" });
        const verifiedLawyerCount = await User.countDocuments({ 
            role: "lawyer", 
            "lawyerDetails.verificationStatus": "verified" 
        });
        const pendingLawyerCount = await User.countDocuments({ 
            role: "lawyer", 
            "lawyerDetails.verificationStatus": "pending" 
        });

        console.log(`👥 Citizens: ${citizenCount} (all verified)`);
        console.log(`⚖️  Lawyers: ${lawyerCount} total`);
        console.log(`   ✅ Verified: ${verifiedLawyerCount}`);
        console.log(`   ⏳ Pending: ${pendingLawyerCount}`);
        console.log(`👨‍💼 Admins: ${adminCount} (all verified)`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
};

// Run the migration
fixVerificationStatus();
