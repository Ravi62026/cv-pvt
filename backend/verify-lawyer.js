import mongoose from 'mongoose';
import User from './models/User.js';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://cv-pvt:cv-pvt@cluster0.wh0zsdm.mongodb.net/cv-pvt?retryWrites=true&w=majority&appName=Cluster0')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Find the test lawyer
      const lawyer = await User.findOne({ email: 'testlawyer@example.com' });
      
      if (!lawyer) {
        console.log('Lawyer not found');
        process.exit(1);
      }
      
      console.log('Found lawyer:', lawyer.name);
      console.log('Current verification status:', lawyer.lawyerDetails?.verificationStatus);
      
      // Update verification status
      lawyer.lawyerDetails.verificationStatus = 'verified';
      lawyer.isVerified = true;
      await lawyer.save();
      
      console.log('✅ Lawyer verified successfully!');
      console.log('Updated verification status:', lawyer.lawyerDetails.verificationStatus);
      
    } catch (error) {
      console.error('Error verifying lawyer:', error);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
