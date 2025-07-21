import mongoose from 'mongoose';
import User from './models/User.js';
import Query from './models/Query.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/legal-platform')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Find or create a citizen user
      let citizen = await User.findOne({ role: 'citizen' });
      if (!citizen) {
        citizen = new User({
          name: 'Test Citizen',
          email: 'citizen@test.com',
          password: 'password123',
          role: 'citizen',
          isActive: true,
          isVerified: true
        });
        await citizen.save();
        console.log('Created test citizen:', citizen.email);
      } else {
        console.log('Found existing citizen:', citizen.email);
      }
      
      // Check existing queries
      const existingQueries = await Query.find({ citizen: citizen._id });
      console.log('Existing queries for citizen:', existingQueries.length);
      
      if (existingQueries.length === 0) {
        // Create a test query
        const testQuery = new Query({
          citizen: citizen._id,
          title: 'Property Ownership Dispute',
          description: 'I need legal advice regarding a property ownership dispute with my neighbor. The issue involves boundary lines and property rights.',
          category: 'property',
          priority: 'high',
          status: 'pending'
        });
        
        await testQuery.save();
        console.log('Created test query:', testQuery._id);
      }
      
      // List all queries for this citizen
      const queries = await Query.find({ citizen: citizen._id });
      console.log('\nQueries for citizen:');
      queries.forEach(query => {
        console.log('- ID:', query._id);
        console.log('  Title:', query.title);
        console.log('  Status:', query.status);
        console.log('  Created:', query.createdAt);
      });
      
      console.log('\n✅ Test data setup complete!');
      console.log('Citizen ID:', citizen._id);
      console.log('You can now test the My Cases API with this citizen ID');
      
    } catch (error) {
      console.error('Error setting up test data:', error);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
