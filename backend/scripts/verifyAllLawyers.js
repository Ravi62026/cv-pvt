import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const verifyAllLawyers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cv-platform');
        console.log('📦 Connected to MongoDB');

        // Update all lawyers to verified status
        const result = await User.updateMany(
            { role: 'lawyer' },
            { $set: { isVerified: true, isActive: true } }
        );

        console.log('✅ Updated', result.modifiedCount, 'lawyers to verified status');

        // Get counts
        const totalLawyers = await User.countDocuments({ role: 'lawyer' });
        const verifiedLawyers = await User.countDocuments({ role: 'lawyer', isVerified: true });
        const activeLawyers = await User.countDocuments({ role: 'lawyer', isActive: true });

        console.log('📊 Statistics:');
        console.log(`   Total lawyers: ${totalLawyers}`);
        console.log(`   Verified lawyers: ${verifiedLawyers}`);
        console.log(`   Active lawyers: ${activeLawyers}`);

        // Show some sample lawyers
        const sampleLawyers = await User.find({ role: 'lawyer' })
            .select('name email isVerified isActive')
            .limit(5);

        console.log('\n👥 Sample lawyers:');
        sampleLawyers.forEach(lawyer => {
            console.log(`   ${lawyer.name} (${lawyer.email}) - Verified: ${lawyer.isVerified}, Active: ${lawyer.isActive}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

verifyAllLawyers();
