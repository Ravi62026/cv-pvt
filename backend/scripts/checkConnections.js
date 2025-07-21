import mongoose from 'mongoose';
import DirectConnection from '../models/DirectConnection.js';
import Chat from '../models/Chat.js';
import User from '../models/User.js';

const checkConnections = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb+srv://cv-pvt:cv-pvt@cluster0.wh0zsdm.mongodb.net/cv-pvt?retryWrites=true&w=majority&appName=Cluster0');
        console.log('Connected to MongoDB');

        // Get all connections
        const connections = await DirectConnection.find({})
            .populate('citizen', 'name email')
            .populate('lawyer', 'name email');

        console.log(`\nFound ${connections.length} total connections:`);
        
        for (const conn of connections) {
            console.log(`\n--- Connection ${conn._id} ---`);
            console.log(`Citizen: ${conn.citizen?.name} (${conn.citizen?.email})`);
            console.log(`Lawyer: ${conn.lawyer?.name} (${conn.lawyer?.email})`);
            console.log(`Status: ${conn.status}`);
            console.log(`ChatId: ${conn.chatId || 'NOT SET'}`);
            
            if (conn.chatId) {
                const chat = await Chat.findOne({ chatId: conn.chatId });
                console.log(`Chat exists: ${chat ? 'YES' : 'NO'}`);
                if (chat) {
                    console.log(`Chat status: ${chat.status}`);
                    console.log(`Messages: ${chat.messages?.length || 0}`);
                }
            }
        }

        // Check accepted connections specifically
        const acceptedConnections = await DirectConnection.find({ status: 'accepted' });
        console.log(`\n\n=== ACCEPTED CONNECTIONS (${acceptedConnections.length}) ===`);
        
        for (const conn of acceptedConnections) {
            console.log(`Connection ${conn._id}:`);
            console.log(`  ChatId: ${conn.chatId || 'MISSING!'}`);
            
            if (conn.chatId) {
                const chat = await Chat.findOne({ chatId: conn.chatId });
                console.log(`  Chat exists: ${chat ? 'YES' : 'NO'}`);
            }
        }

        // Create missing Chat documents
        console.log('\n\n=== CREATING MISSING CHAT DOCUMENTS ===');

        for (const conn of acceptedConnections) {
            if (conn.chatId) {
                const chat = await Chat.findOne({ chatId: conn.chatId });
                if (!chat) {
                    console.log(`Creating Chat document for chatId: ${conn.chatId}`);
                    await Chat.create({
                        chatId: conn.chatId,
                        participants: [
                            { user: conn.citizen, role: 'citizen' },
                            { user: conn.lawyer, role: 'lawyer' }
                        ],
                        chatType: 'direct',
                        status: 'active',
                        messages: []
                    });
                    console.log(`✅ Created Chat document for ${conn.chatId}`);
                }
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkConnections();
