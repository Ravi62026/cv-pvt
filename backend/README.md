# Case Management & Dispute Resolution System - Backend

A comprehensive backend system for managing legal queries, disputes, and real-time communication between citizens, lawyers, and administrators.

## 🚀 Features

### 🔐 Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (Admin, Lawyer, Citizen)
- Google reCAPTCHA integration for security
- Password hashing with bcrypt

### 👥 User Management
- Multi-role user system
- Lawyer verification by admin
- Profile management
- Connection system between users

### 📋 Case Management
- **Legal Queries**: Citizens can file legal questions
- **Disputes**: Comprehensive dispute resolution system
- Case assignment workflow
- Timeline tracking
- Document management
- Status updates and notifications

### 💬 Real-time Communication
- Socket.io powered real-time chat
- Message rate limiting
- Typing indicators
- Read receipts
- Online/offline status

### 📊 Admin Dashboard
- System analytics and statistics
- User management
- Lawyer verification
- Case monitoring

### 🔒 Security Features
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- Helmet security headers
- Environment-based configuration

## 🛠️ Tech Stack

- **Runtime**: Node.js with ES6+ modules
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.io
- **Authentication**: JWT with refresh tokens
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate limiting
- **File Upload**: Multer
- **Environment**: dotenv

## 📁 Project Structure

```
backend/
├── models/          # MongoDB schemas
│   ├── User.js
│   ├── Query.js
│   ├── Dispute.js
│   ├── Chat.js
│   └── Consultation.js
├── controllers/     # Request handlers
│   ├── authController.js
│   ├── adminController.js
│   ├── lawyerController.js
│   ├── queryController.js
│   ├── disputeController.js
│   └── chatController.js
├── routes/          # API endpoints
│   ├── auth.js
│   ├── admin.js
│   ├── lawyer.js
│   ├── query.js
│   ├── dispute.js
│   └── chat.js
├── middleware/      # Custom middleware
│   ├── auth.js
│   ├── validation.js
│   └── rateLimiter.js
├── utils/           # Utility functions
│   ├── jwt.js
│   ├── captcha.js
│   └── socketHelpers.js
├── config/          # Configuration files
│   ├── database.js
│   └── socket.js
├── seeds/           # Database seeders
│   └── adminSeed.js
└── server.js        # Main server file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   
   Update the environment variables:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/case-management-system
   
   # JWT Secrets
   JWT_SECRET=your-secret-key
   JWT_REFRESH_SECRET=your-refresh-secret
   
   # Google reCAPTCHA
   RECAPTCHA_SECRET_KEY=your-recaptcha-secret
   
   # Admin Account
   ADMIN_EMAIL=admin@casemanagement.com
   ADMIN_PASSWORD=Admin@123456
   ```

4. **Database Setup**
   ```bash
   # Seed admin account
   npm run seed
   ```

5. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /refresh-token` - Refresh access token
- `GET /me` - Get current user
- `PUT /profile` - Update profile

### Admin (`/api/admin`)
- `GET /dashboard/analytics` - Dashboard statistics
- `GET /users` - Get all users
- `GET /lawyers/pending-verifications` - Pending verifications
- `PATCH /lawyers/:id/verification` - Verify/reject lawyer
- `PATCH /users/:id/toggle-status` - Toggle user status

### Lawyers (`/api/lawyers`)
- `GET /verified` - Get verified lawyers
- `GET /:id/profile` - Get lawyer profile
- `POST /:id/message-request` - Send message request
- `GET /my-clients` - Get lawyer's clients
- `GET /dashboard/stats` - Lawyer statistics

### Queries (`/api/queries`)
- `POST /` - Create query
- `GET /` - Get queries (filtered by role)
- `GET /:id` - Get specific query
- `POST /:id/request` - Request to handle query
- `POST /:id/requests/:requestId/respond` - Accept/reject request
- `PATCH /:id/status` - Update query status

### Disputes (`/api/disputes`)
- `POST /` - Create dispute
- `GET /` - Get disputes (filtered by role)
- `GET /:id` - Get specific dispute
- `POST /:id/request` - Request to handle dispute
- `POST /:id/requests/:requestId/respond` - Accept/reject request
- `PATCH /:id/status` - Update dispute status

### Chat (`/api/chats`)
- `GET /` - Get user's chats
- `POST /direct/:userId` - Create direct chat
- `GET /:chatId` - Get chat with messages
- `GET /:chatId/messages` - Get messages (pagination)

## 🔌 Socket.io Events

### Connection Events
- `connect` - User connects
- `disconnect` - User disconnects
- `authenticate` - User authentication (via token)

### Chat Events
- `join_chat` - Join a chat room
- `leave_chat` - Leave a chat room
- `send_message` - Send a message
- `new_message` - Receive a message
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator
- `mark_messages_read` - Mark messages as read
- `messages_read` - Messages marked as read

### Notification Events
- `new_lawyer_request` - Lawyer request notification
- `request_response` - Request accepted/rejected
- `case_assigned` - Case assignment notification
- `consultation_request` - Consultation request
- `user_status_update` - User online/offline status

## 🔒 Security Features

### Rate Limiting
- General API: 100 requests per hour
- Authentication: 5 attempts per 15 minutes
- Messages: 30 messages per minute
- Password reset: 3 attempts per hour

### Input Validation
- All inputs validated using express-validator
- XSS protection
- SQL injection prevention
- File upload restrictions

### Access Control
- JWT token-based authentication
- Role-based route protection
- Resource-level permissions
- Admin-only operations

## 🏗️ Database Schema

### User Model
- Multi-role support (admin/lawyer/citizen)
- Lawyer verification system
- Connection management
- Message rate limiting

### Query/Dispute Models
- Case lifecycle management
- Lawyer request system
- Timeline tracking
- Document storage

### Chat Model
- Real-time messaging
- Message read status
- Participant management
- Message history

## 🚀 Deployment

### Environment Variables
Ensure all required environment variables are set:
- Database connection string
- JWT secrets
- reCAPTCHA keys
- Email configuration
- Frontend URL for CORS

### Production Considerations
- Use production MongoDB instance
- Set strong JWT secrets
- Configure proper CORS origins
- Enable SSL/HTTPS
- Set up monitoring and logging
- Configure rate limiting appropriately

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Health check
curl http://localhost:5000/api/health
```

## 📝 Admin Account

Default admin credentials (change after first login):
- **Email**: admin@casemanagement.com
- **Password**: Admin@123456

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints and socket events 