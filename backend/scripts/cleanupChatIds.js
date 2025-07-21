import mongoose from 'mongoose';
import Chat from '../models/Chat.js';
import DirectConnection from '../models/DirectConnection.js';
import dotenv from 'dotenv';

dotenv.config();

const cleanupChatIds = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find chats with malformed chatIds (containing encoded characters or objects)
        const malformedChats = await Chat.find({
            $or: [
                { chatId: { $regex: /%7B|%20|%7D/ } }, // Contains URL encoded characters
                { chatId: { $regex: /ObjectId|new|{|}/ } }, // Contains object references
                { chatId: { $regex: /\s/ } } // Contains spaces
            ]
        });

        console.log(`Found ${malformedChats.length} chats with malformed IDs`);

        for (const chat of malformedChats) {
            console.log(`Deleting malformed chat: ${chat.chatId}`);
            await Chat.deleteOne({ _id: chat._id });
        }

        // Find direct connections with malformed chatIds
        const malformedConnections = await DirectConnection.find({
            $or: [
                { chatId: { $regex: /%7B|%20|%7D/ } },
                { chatId: { $regex: /ObjectId|new|{|}/ } },
                { chatId: { $regex: /\s/ } }
            ]
        });

        console.log(`Found ${malformedConnections.length} connections with malformed chat IDs`);

        for (const connection of malformedConnections) {
            console.log(`Clearing malformed chatId from connection: ${connection._id}`);
            connection.chatId = null;
            await connection.save();
        }

        // Fix accepted connections without chatId
        const acceptedConnectionsWithoutChatId = await DirectConnection.find({
            status: 'accepted',
            $or: [
                { chatId: { $exists: false } },
                { chatId: null },
                { chatId: '' }
            ]
        });

        console.log(`Found ${acceptedConnectionsWithoutChatId.length} accepted connections without chatId`);

        for (const connection of acceptedConnectionsWithoutChatId) {
            const chatId = `direct_${[connection.citizen.toString(), connection.lawyer.toString()].sort().join("_")}`;
            console.log(`Setting chatId for connection ${connection._id}: ${chatId}`);
            connection.chatId = chatId;
            await connection.save();

            // Create Chat document if it doesn't exist
            const existingChat = await Chat.findOne({ chatId });
            if (!existingChat) {
                console.log(`Creating Chat document for chatId: ${chatId}`);
                await Chat.create({
                    chatId,
                    participants: [
                        { user: connection.citizen, role: 'citizen' },
                        { user: connection.lawyer, role: 'lawyer' }
                    ],
                    chatType: 'direct',
                    status: 'active',
                    messages: []
                });
            }
        }

        console.log('Cleanup completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Cleanup failed:', error);
        process.exit(1);
    }
};

cleanupChatIds();
