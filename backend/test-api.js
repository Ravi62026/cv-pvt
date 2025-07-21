import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const testAPI = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cv-platform');
        console.log('📦 Connected to MongoDB');

        // Test the query that the API uses
        const query = {
            role: "lawyer",
            isActive: true,
            isVerified: true,
        };

        console.log('🔍 Testing query:', query);

        // Get database stats
        const totalLawyers = await User.countDocuments({ role: "lawyer" });
        const activeLawyers = await User.countDocuments({ role: "lawyer", isActive: true });
        const verifiedLawyers = await User.countDocuments({ role: "lawyer", isVerified: true });
        const activeAndVerifiedLawyers = await User.countDocuments(query);

        console.log('📈 Database stats:');
        console.log('   Total lawyers:', totalLawyers);
        console.log('   Active lawyers:', activeLawyers);
        console.log('   Verified lawyers:', verifiedLawyers);
        console.log('   Active & Verified lawyers:', activeAndVerifiedLawyers);

        // Test the actual query
        const lawyers = await User.find(query)
            .select("name email phone lawyerDetails createdAt isActive isVerified")
            .sort({ createdAt: -1 })
            .limit(12);

        console.log('✅ Query executed successfully:');
        console.log('   Found lawyers:', lawyers.length);

        if (lawyers.length > 0) {
            console.log('\n👥 Sample lawyers:');
            lawyers.forEach((lawyer, index) => {
                console.log(`   ${index + 1}. ${lawyer.name} (${lawyer.email})`);
                console.log(`      isActive: ${lawyer.isActive}, isVerified: ${lawyer.isVerified}`);
                console.log(`      lawyerDetails: ${lawyer.lawyerDetails ? 'Present' : 'Missing'}`);
            });
        } else {
            console.log('❌ No lawyers found with the query');
            
            // Let's check what lawyers exist
            const allLawyers = await User.find({ role: "lawyer" })
                .select("name email isActive isVerified lawyerDetails")
                .limit(5);
            
            console.log('\n🔍 All lawyers in database:');
            allLawyers.forEach((lawyer, index) => {
                console.log(`   ${index + 1}. ${lawyer.name} (${lawyer.email})`);
                console.log(`      isActive: ${lawyer.isActive}, isVerified: ${lawyer.isVerified}`);
                console.log(`      lawyerDetails: ${lawyer.lawyerDetails ? 'Present' : 'Missing'}`);
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

testAPI();
