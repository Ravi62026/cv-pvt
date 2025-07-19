import dotenv from "dotenv";
import connectDB from "../config/database.js";
import User from "../models/User.js";

// Load environment variables
dotenv.config();

const seedAdmin = async () => {
    try {
        // Connect to database
        await connectDB();

        // Check if admin already exists
        const adminEmail =
            process.env.ADMIN_EMAIL || "admin@casemanagement.com";
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log("Admin user already exists");
            process.exit(0);
        }

        // Create admin user
        const adminData = {
            name: "System Administrator",
            email: adminEmail,
            password: process.env.ADMIN_PASSWORD || "Admin@123456",
            role: "admin",
            phone: "9999999999",
            isVerified: true,
            isActive: true,
            address: {
                street: "Admin Office",
                city: "System City",
                state: "System State",
                pincode: "000000",
            },
        };

        const admin = await User.create(adminData);
        console.log("Admin user created successfully:", {
            id: admin._id,
            email: admin.email,
            role: admin.role,
        });

        console.log("\n🎉 Admin account created!");
        console.log("📧 Email:", adminEmail);
        console.log(
            "🔑 Password:",
            process.env.ADMIN_PASSWORD || "Admin@123456"
        );
        console.log(
            "\n⚠️  Please change the password after first login for security."
        );

        process.exit(0);
    } catch (error) {
        console.error("Error seeding admin:", error);
        process.exit(1);
    }
};


seedAdmin()

export default seedAdmin;
