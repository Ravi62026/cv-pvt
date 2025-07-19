# 🧪 Postman API Testing Guide

## 📋 Setup Instructions

### 1. Environment Variables

Create a new environment in Postman with these variables:

```
BASE_URL: http://localhost:5000/api
ACCESS_TOKEN: (will be set automatically after login)
CITIZEN_ID: (will be set after citizen registration)
LAWYER_ID: (will be set after lawyer registration)
ADMIN_ID: (will be set after admin registration)
QUERY_ID: (will be set after query creation)
DISPUTE_ID: (will be set after dispute creation)
CHAT_ID: (will be set after chat creation)
REQUEST_ID: (will be set after lawyer request)
```

### 2. Pre-request Scripts (Global)

Add this to your collection's Pre-request Script:

```javascript
// Auto-set Authorization header if ACCESS_TOKEN exists
if (pm.environment.get("ACCESS_TOKEN")) {
  pm.request.headers.add({
    key: "Authorization",
    value: "Bearer " + pm.environment.get("ACCESS_TOKEN"),
  });
}
```

---

## �️ CAPTCHA Testing

For testing purposes, use these predefined CAPTCHA tokens:

- **`test-captcha`** - For citizen registration/login
- **`postman-test`** - For lawyer registration/login
- **`development-token`** - For admin registration/login

These tokens work only in **development mode** (`NODE_ENV=development`).

**Example:**

```json
{
  "email": "test@example.com",
  "password": "password123",
  "captchaToken": "test-captcha"
}
```

## 🚀 Rate Limiting Bypass (For Testing)

To bypass rate limiting during testing, add this header to your requests:

**Header:**

```
x-testing: true
```

**Rate Limits in Development:**

- **Auth routes**: 100 requests per minute (vs 5 in production)
- **Message routes**: 100 messages per minute (vs 30 in production)
- **With `x-testing: true` header**: No rate limiting

**How to add in Postman:**

1. Go to **Headers** tab in your request
2. Add: `Key: x-testing`, `Value: true`
3. This will completely bypass rate limiting for testing

---

## �🔐 Authentication Flow

### 1. Health Check

```
GET {{BASE_URL}}/health
```

### 2. Register Citizen

```
POST {{BASE_URL}}/auth/register
Content-Type: application/json

{
    "name": "John Citizen",
    "email": "citizen@test.com",
    "password": "password123",
    "role": "citizen",
    "phone": "+1234567890",
    "captchaToken": "test-captcha",
    "address": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "USA"
    }
}
```

**Test Script:**

```javascript
if (pm.response.code === 201) {
  const response = pm.response.json();
  pm.environment.set("ACCESS_TOKEN", response.data.tokens.accessToken);
  pm.environment.set("CITIZEN_ID", response.data.user._id);
}
```

**Expected Response (Citizen):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "...",
      "name": "John Citizen",
      "email": "citizen@test.com",
      "role": "citizen",
      "phone": "+1234567890",
      "address": { ... },
      "profilePicture": null,
      "isVerified": true,
      "isActive": true,
      "messageRequests": [],
      "connections": [],
      "createdAt": "...",
      "updatedAt": "..."
    },
    "tokens": { ... }
  }
}
```

**Note:** Citizens don't have `lawyerDetails` field and are auto-verified (`isVerified: true`).

### 3. Register Lawyer

```
POST {{BASE_URL}}/auth/register
Content-Type: application/json

{
    "name": "Jane Lawyer",
    "email": "lawyer@test.com",
    "password": "password123",
    "role": "lawyer",
    "phone": "+1234567891",
    "captchaToken": "postman-test",
    "address": {
        "street": "456 Legal Ave",
        "city": "Boston",
        "state": "MA",
        "zipCode": "02101",
        "country": "USA"
    },
    "lawyerDetails": {
        "barRegistrationNumber": "BAR123456",
        "specialization": ["Criminal Law", "Civil Rights"],
        "experience": 5,
        "education": "Harvard Law School",
        "certifications": ["State Bar Certified"],
        "languages": ["English", "Spanish"]
    }
}
```

**Test Script:**

```javascript
if (pm.response.code === 201) {
  const response = pm.response.json();
  pm.environment.set("ACCESS_TOKEN", response.data.tokens.accessToken);
  pm.environment.set("LAWYER_ID", response.data.user._id);
}
```

**Expected Response (Lawyer):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "...",
      "name": "Jane Lawyer",
      "email": "lawyer@test.com",
      "role": "lawyer",
      "phone": "+1234567891",
      "address": { ... },
      "profilePicture": null,
      "isVerified": false,
      "isActive": true,
      "messageRequests": [],
      "connections": [],
      "lawyerDetails": {
        "barRegistrationNumber": "BAR123456",
        "specialization": ["Criminal Law", "Civil Rights"],
        "experience": 5,
        "education": "Harvard Law School",
        "verificationStatus": "pending",
        "verificationDocuments": [],
        "certifications": ["State Bar Certified"],
        "languages": ["English", "Spanish"]
      },
      "createdAt": "...",
      "updatedAt": "..."
    },
    "tokens": { ... }
  }
}
```

**Note:** Lawyers have `lawyerDetails` field and start as unverified (`isVerified: false`) until admin approval.

### 4. Register Admin

```
POST {{BASE_URL}}/auth/register
Content-Type: application/json

{
    "name": "Admin User",
    "email": "admin@test.com",
    "password": "password123",
    "role": "admin",
    "phone": "+1234567892",
    "captchaToken": "development-token"
}
```

**Test Script:**

```javascript
if (pm.response.code === 201) {
  const response = pm.response.json();
  pm.environment.set("ACCESS_TOKEN", response.data.tokens.accessToken);
  pm.environment.set("ADMIN_ID", response.data.user._id);
}
```

**Expected Response (Admin):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "...",
      "name": "Admin User",
      "email": "admin@test.com",
      "role": "admin",
      "phone": "+1234567892",
      "profilePicture": null,
      "isVerified": true,
      "isActive": true,
      "messageRequests": [],
      "connections": [],
      "createdAt": "...",
      "updatedAt": "..."
    },
    "tokens": { ... }
  }
}
```

**Note:** Admins don't have `lawyerDetails` field and are auto-verified (`isVerified: true`).

### 5. Login Citizen

```
POST {{BASE_URL}}/auth/login
Content-Type: application/json

{
    "email": "citizen@test.com",
    "password": "password123",
    "captchaToken": "test-captcha"
}
```

**Test Script:**

```javascript
if (pm.response.code === 200) {
  const response = pm.response.json();
  pm.environment.set("ACCESS_TOKEN", response.data.accessToken);
  pm.environment.set("CITIZEN_ID", response.data.user._id);
}
```

### 6. Login Lawyer

```
POST {{BASE_URL}}/auth/login
Content-Type: application/json

{
    "email": "lawyer@test.com",
    "password": "password123",
    "captchaToken": "postman-test"
}
```

**Test Script:**

```javascript
if (pm.response.code === 200) {
  const response = pm.response.json();
  pm.environment.set("ACCESS_TOKEN", response.data.accessToken);
  pm.environment.set("LAWYER_ID", response.data.user._id);
}
```

### 7. Login Admin

```
POST {{BASE_URL}}/auth/login
Content-Type: application/json

{
    "email": "admin@test.com",
    "password": "password123",
    "captchaToken": "development-token"
}
```

**Test Script:**

```javascript
if (pm.response.code === 200) {
  const response = pm.response.json();
  pm.environment.set("ACCESS_TOKEN", response.data.accessToken);
  pm.environment.set("ADMIN_ID", response.data.user._id);
}
```

### 8. Get Current User

```
GET {{BASE_URL}}/auth/me
Authorization: Bearer {{ACCESS_TOKEN}}
```

### 9. Update Profile

```
PUT {{BASE_URL}}/auth/profile
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json

{
    "name": "Updated Name",
    "phone": "+1234567899"
}
```

### 10. Logout

```
POST {{BASE_URL}}/auth/logout
Authorization: Bearer {{ACCESS_TOKEN}}
```

---

## 👨‍💼 Admin Flow (Login as Admin first)

### 🔍 **Key Admin Actions Comparison:**

| Action                 | Endpoint                           | Purpose                                     | Changes                             | Applies To   |
| ---------------------- | ---------------------------------- | ------------------------------------------- | ----------------------------------- | ------------ |
| **Verify Lawyer**      | `/admin/lawyers/{id}/verification` | Professional credential verification        | `isVerified` + `verificationStatus` | Lawyers only |
| **Toggle User Status** | `/admin/users/{id}/toggle-status`  | Account activation/deactivation (ban/unban) | `isActive`                          | Any user     |

**Important:** These are two different actions:

- **Verify Lawyer**: Professional approval (lawyer can practice)
- **Toggle Status**: Account management (user can login)

### 1. Get Dashboard Analytics

```
GET {{BASE_URL}}/admin/dashboard/analytics
Authorization: Bearer {{ACCESS_TOKEN}}
```

### 2. Get System Stats

```
GET {{BASE_URL}}/admin/system/stats
Authorization: Bearer {{ACCESS_TOKEN}}
```

### 3. Get All Users

```
GET {{BASE_URL}}/admin/users?page=1&limit=10&role=lawyer&status=active&verificationStatus=pending&search=john
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "docs": [
      {
        "_id": "...",
        "name": "Jane Lawyer",
        "email": "lawyer@test.com",
        "role": "lawyer",
        "isVerified": false,
        "isActive": true,
        "lawyerDetails": {
          "barRegistrationNumber": "BAR123456",
          "specialization": ["Criminal Law"],
          "verificationStatus": "pending"
        },
        "createdAt": "...",
        "updatedAt": "..."
      }
    ],
    "totalDocs": 25,
    "limit": 10,
    "page": 1,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextPage": 2,
    "prevPage": null
  }
}
```

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `role`: Filter by role (`citizen`, `lawyer`, `admin`, `all`)
- `status`: Filter by status (`active`, `inactive`, `all`)
- `verificationStatus`: Filter by verification (`pending`, `verified`, `rejected`, `all`)
- `search`: Search in name and email

### 4. Get Pending Lawyer Verifications

```
GET {{BASE_URL}}/admin/lawyers/pending-verifications
Authorization: Bearer {{ACCESS_TOKEN}}
```

### 5. Verify Lawyer

```
PATCH {{BASE_URL}}/admin/lawyers/{{LAWYER_ID}}/verification
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json

{
    "action": "approve",
    "notes": "All documents verified successfully"
}
```

**Alternative Request Format:**

```json
{
  "status": "verified",
  "reason": "All documents verified successfully"
}
```

**For Rejection:**

```json
{
  "action": "reject",
  "notes": "Missing bar registration certificate"
}
```

**Or:**

```json
{
  "status": "rejected",
  "reason": "Missing bar registration certificate"
}
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Lawyer verified successfully",
  "data": {
    "lawyer": {
      "_id": "...",
      "name": "Jane Lawyer",
      "email": "lawyer@test.com",
      "role": "lawyer",
      "isVerified": true,
      "lawyerDetails": {
        "verificationStatus": "verified",
        "verificationNotes": "All documents verified successfully"
      }
    }
  }
}
```

### 6. Toggle User Status (Activate/Deactivate Account)

```
PATCH {{BASE_URL}}/admin/users/{{CITIZEN_ID}}/toggle-status
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json

{
    "isActive": false
}
```

**Purpose:** Ban/Unban any user account (different from lawyer verification)

**Request Body:**

```json
{
  "isActive": true // true = activate, false = deactivate
}
```

**Expected Response:**

```json
{
  "success": true,
  "message": "User account deactivated successfully",
  "data": {
    "user": {
      "_id": "...",
      "name": "John Citizen",
      "isActive": false,
      "isVerified": true
    }
  }
}
```

**Key Differences:**

- **Verify Lawyer**: Changes `isVerified` (professional credentials)
- **Toggle Status**: Changes `isActive` (account ban/unban)
- **Verify Lawyer**: Only for lawyers
- **Toggle Status**: For any user (citizen/lawyer/admin)

---

## 👨‍⚖️ Lawyer Flow (Login as Lawyer first)

### 1. Get Verified Lawyers (Public)

```
GET {{BASE_URL}}/lawyers/verified?page=1&limit=10&specialization=Criminal Law
```

### 2. Get Lawyer Profile (Public)

```
GET {{BASE_URL}}/lawyers/{{LAWYER_ID}}/profile
```

### 3. Get Dashboard Stats

```
GET {{BASE_URL}}/lawyers/dashboard/stats
Authorization: Bearer {{ACCESS_TOKEN}}
```

### 4. Get Available Cases

```
GET {{BASE_URL}}/lawyers/available-cases?caseType=query&page=1&limit=10
Authorization: Bearer {{ACCESS_TOKEN}}
```

### 5. Get My Assigned Cases (With Chat Room Info)

```
GET {{BASE_URL}}/lawyers/my-cases?status=assigned&caseType=all&page=1&limit=10
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Query Parameters:**

- `status` (optional): Filter by case status ("assigned", "in-progress", "resolved", etc.)
- `caseType` (optional): Filter by case type ("all", "query", "dispute")
- `search` (optional): Search in title/description
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**

```json
{
  "success": true,
  "data": {
    "cases": [
      {
        "_id": "query123",
        "title": "Property Boundary Dispute",
        "description": "Need help with neighbor property line issue",
        "category": "property",
        "status": "assigned",
        "priority": "high",
        "citizen": {
          "_id": "citizen123",
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "+1234567890"
        },
        "caseType": "query",
        "chatRoom": {
          "chatId": "/query123/query_query123_1704123456789",
          "status": "active",
          "lastMessage": {
            "content": "Hello, I need help with this case",
            "timestamp": "2024-01-01T12:00:00Z"
          },
          "unreadCount": 2
        },
        "createdAt": "2024-01-01T10:00:00Z"
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 3,
      "total": 25
    }
  }
}
```

**Perfect for UI Cards:**

- ✅ **Case Details** - Title, description, priority, status
- ✅ **Citizen Info** - Name, contact details
- ✅ **Chat Room** - Direct access to chat with `chatId`
- ✅ **Unread Count** - Show notification badges
- ✅ **Last Message** - Preview in card

### 6. Get My Clients (Legacy)

```
GET {{BASE_URL}}/lawyers/my-clients?page=1&limit=10
Authorization: Bearer {{ACCESS_TOKEN}}
```

### 6.1. Get My Direct Clients

```
GET {{BASE_URL}}/lawyers/my-direct-clients?page=1&limit=10
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "clients": [
      {
        "_id": "citizen123",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "role": "citizen",
        "connectedAt": "2024-01-15T10:30:00Z",
        "lastChatUpdate": "2024-01-15T15:45:00Z",
        "chatId": "direct_citizen123_lawyer456"
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 1,
      "total": 1
    }
  }
}
```

**Note:** This endpoint fetches clients from active direct chats, not from the legacy connections field.

### 7. Get Pending Direct Message Requests

```
GET {{BASE_URL}}/lawyers/pending-requests?page=1&limit=10
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "chatId": "direct_citizen123_lawyer456",
        "participants": [
          {
            "user": {
              "_id": "citizen123",
              "name": "John Doe",
              "email": "john@example.com",
              "role": "citizen"
            },
            "role": "citizen"
          }
        ],
        "chatType": "direct",
        "status": "pending",
        "lastMessage": {
          "sender": "citizen123",
          "content": "I need legal consultation regarding property dispute",
          "timestamp": "2024-01-15T10:30:00Z"
        },
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 1,
      "total": 1
    }
  }
}
```

### 8. Accept Direct Message Request

```
POST {{BASE_URL}}/lawyers/accept-request/{{CHAT_ID}}
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Example:** `POST {{BASE_URL}}/lawyers/accept-request/direct_citizen123_lawyer456`

**Response:**

```json
{
    "success": true,
    "message": "Direct message request accepted successfully",
    "data": {
        "chat": {
            "chatId": "direct_citizen123_lawyer456",
            "status": "active",
            "participants": [...],
            "lastMessage": {...}
        }
    }
}
```

**What Happens:**

- ✅ Updates chat status from "pending" to "active"
- ✅ Sends real-time notification to citizen via Socket.io
- ✅ Chat room becomes available for messaging

### 9. Get My Active Direct Chats

```
GET {{BASE_URL}}/lawyers/my-chats?page=1&limit=10
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "chats": [
      {
        "chatId": "direct_citizen123_lawyer456",
        "status": "active",
        "participants": [
          {
            "user": {
              "_id": "citizen123",
              "name": "John Doe",
              "role": "citizen"
            },
            "role": "citizen"
          }
        ],
        "chatType": "direct",
        "lastMessage": {
          "sender": "lawyer456",
          "content": "Thank you for reaching out. How can I help you?",
          "timestamp": "2024-01-15T10:35:00Z"
        },
        "updatedAt": "2024-01-15T10:35:00Z"
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 1,
      "total": 1
    }
  }
}
```

---

## 👨‍💼 Citizen Flow (Login as Citizen first)

### 1. Get Dashboard

```
GET {{BASE_URL}}/citizens/dashboard
Authorization: Bearer {{ACCESS_TOKEN}}
```

### 2. Get My Lawyers

```
GET {{BASE_URL}}/citizens/my-lawyers?page=1&limit=10
Authorization: Bearer {{ACCESS_TOKEN}}
```

### 3. Get My Cases (With Chat Room Info)

```
GET {{BASE_URL}}/citizens/my-cases?status=assigned&type=all&page=1&limit=10
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Query Parameters:**

- `status` (optional): Filter by case status ("pending", "assigned", "in-progress", "resolved", etc.)
- `type` (optional): Filter by case type ("all", "queries", "disputes")
- `search` (optional): Search in title/description
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**

```json
{
  "success": true,
  "data": {
    "cases": [
      {
        "_id": "query123",
        "title": "Property Boundary Dispute",
        "description": "Need help with neighbor property line issue",
        "category": "property",
        "status": "assigned",
        "priority": "high",
        "assignedLawyer": {
          "_id": "lawyer123",
          "name": "Jane Smith",
          "email": "jane@lawfirm.com",
          "lawyerDetails": {
            "specialization": ["property", "civil"]
          }
        },
        "caseType": "query",
        "chatRoom": {
          "chatId": "/query123/query_query123_1704123456789",
          "status": "active",
          "lastMessage": {
            "content": "I'll help you with this case",
            "timestamp": "2024-01-01T12:00:00Z"
          },
          "unreadCount": 1
        },
        "createdAt": "2024-01-01T10:00:00Z"
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 2,
      "total": 15
    }
  }
}
```

**Perfect for UI Cards:**

- ✅ **Case Details** - Title, description, priority, status
- ✅ **Lawyer Info** - Name, specialization (if assigned)
- ✅ **Chat Room** - Direct access to chat with `chatId` (if assigned)
- ✅ **Unread Count** - Show notification badges
- ✅ **Last Message** - Preview in card

### 4. Send Direct Message Request

```
POST {{BASE_URL}}/citizens/message-request/{{LAWYER_ID}}
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json

{
    "message": "I need legal consultation regarding a contract issue"
}
```

**Note:** Message field is optional. If not provided, default message will be used.

**Rate Limit:** 2 requests per hour per lawyer

**Response:**

```json
{
  "success": true,
  "message": "Message request sent successfully",
  "data": {
    "chatId": "direct_citizen123_lawyer456"
  }
}
```

**What Happens:**

- ✅ Creates pending chat with status "pending"
- ✅ Adds initial message to chat
- ✅ Sends real-time notification to lawyer via Socket.io

### 5. Get Available Lawyers (New Dedicated API)

```
GET {{BASE_URL}}/citizens/available-lawyers?page=1&limit=12&specialization=property&experience=5+
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 12)
- `specialization` (optional): Filter by specialization (civil, criminal, family, property, etc.)
- `experience` (optional): Filter by experience (e.g., "5+", "3-7", "10+")
- `search` (optional): Search by name, email, or specialization
- `sortBy` (optional): Sort field (default: "createdAt")
- `sortOrder` (optional): Sort order "asc" or "desc" (default: "desc")

**Response:**

```json
{
  "success": true,
  "data": {
    "lawyers": [
      {
        "_id": "lawyer123",
        "name": "John Smith",
        "email": "john.smith@law.com",
        "phone": "+1234567890",
        "lawyerDetails": {
          "specialization": ["property", "civil"],
          "experience": 8,
          "verificationStatus": "verified"
        },
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 3,
      "total": 25
    }
  }
}
```

### 6. Request Lawyer for Query (New Dedicated API)

```
POST {{BASE_URL}}/citizens/request-lawyer-for-query/{{QUERY_ID}}/{{LAWYER_ID}}
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json

{
    "message": "I need help with my property dispute. Please handle my case."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Request sent to lawyer successfully",
  "data": {
    "requestId": "req123",
    "lawyer": {
      "_id": "lawyer123",
      "name": "John Smith",
      "specialization": ["property", "civil"]
    }
  }
}
```

### 7. Request Lawyer for Dispute (New Dedicated API)

```
POST {{BASE_URL}}/citizens/request-lawyer-for-dispute/{{DISPUTE_ID}}/{{LAWYER_ID}}
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json

{
    "message": "I need experienced representation for my contract dispute."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Request sent to lawyer successfully",
  "data": {
    "requestId": "req124",
    "lawyer": {
      "_id": "lawyer123",
      "name": "John Smith",
      "specialization": ["corporate", "contract"]
    }
  }
}
```

### 8. Accept/Reject Lawyer Request (When Lawyer Sends Request to Citizen)

```
POST {{BASE_URL}}/queries/{{QUERY_ID}}/requests/{{REQUEST_ID}}/respond
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json

{
    "action": "accept"
}
```

**For Disputes:**

```
POST {{BASE_URL}}/disputes/{{DISPUTE_ID}}/requests/{{REQUEST_ID}}/respond
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json

{
    "action": "reject"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Request accepted successfully",
  "data": {
    "caseId": "query123",
    "assignedLawyer": {
      "_id": "lawyer123",
      "name": "John Smith"
    }
  }
}
```

**🔄 Automatic Chat Room Creation:**
When a request is accepted, the system automatically:

- ✅ **Creates chat room** with path format: `/queryId/chatRoomId` or `/disputeId/chatRoomId`
- ✅ **Sends Socket.io event** `case_assigned` to both parties
- ✅ **Notifies participants** about chat room creation
- ✅ **Enables real-time messaging** between citizen and lawyer

**Example Chat Room Paths:**

- Query: `/67b7c8a980e2c772a13c9456f/query_67b7c8a980e2c772a13c9456f_1704123456789`
- Dispute: `/67b7c8a980e2c772a13c9456f/dispute_67b7c8a980e2c772a13c9456f_1704123456789`

**Socket.io Events Triggered:**

```javascript
// Both parties receive this event
socket.on("case_assigned", (data) => {
  console.log("Case assigned:", data);
  // data.chatId contains the chat room path
  // data.caseData contains case information
});

// Request responder receives this
socket.on("request_response", (data) => {
  console.log("Request response:", data);
  // data.action = "accept" or "reject"
  // data.chatCreated = true (if accepted)
});
```

### 9. Get Pending Requests

```
GET {{BASE_URL}}/citizens/pending-requests?page=1&limit=10
Authorization: Bearer {{ACCESS_TOKEN}}
```

### 10. Get Received Offers

```
GET {{BASE_URL}}/citizens/received-offers?page=1&limit=10
Authorization: Bearer {{ACCESS_TOKEN}}
```

---

## � Bidirectional Request System

The system now supports **bidirectional requests** where both lawyers and citizens can send requests to each other:

### **Request Types:**

1. **Lawyer → Citizen**: Lawyer requests to handle citizen's case

   - Use: `POST /api/queries/:id/send-request` or `POST /api/disputes/:id/send-request`
   - Body: `{ "message": "I can help with your case" }`

2. **Citizen → Lawyer**: Citizen requests specific lawyer for their case
   - Use: `POST /api/queries/:id/send-request` or `POST /api/disputes/:id/send-request`
   - Body: `{ "message": "Please handle my case", "targetUserId": "lawyer_id" }`

### **Response System:**

Both roles can accept/reject requests:

- Use: `POST /api/queries/:id/requests/:requestId/respond` or `POST /api/disputes/:id/requests/:requestId/respond`
- Body: `{ "action": "accept" }` or `{ "action": "reject" }`

### **Authorization Rules:**

- **Lawyers** can only request unassigned cases (status: "pending")
- **Citizens** can only request lawyers for their own cases
- **Both** can respond to requests directed to them
- **Auto-reject** other pending requests when one is accepted

---

## �📝 Query Management Flow

### 1. Create Query (Citizen)

```
POST {{BASE_URL}}/queries
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json

{
    "title": "Property Dispute Resolution",
    "description": "I need help with a property boundary dispute with my neighbor. The issue has been ongoing for 6 months.",
    "category": "property",
    "priority": "high"
}
```

**Required Fields:**

- `title` (string, max 100 chars): Query title
- `description` (string, max 2000 chars): Detailed description
- `category` (string): Legal category

**Optional Fields:**

- `priority` (string): Priority level (default: "medium")

**Valid Values:**

- `category`: "civil", "criminal", "family", "property", "corporate", "tax", "labor", "other"
- `priority`: "low", "medium", "high", "urgent"

**Test Script:**

```javascript
if (pm.response.code === 201) {
  const response = pm.response.json();
  pm.environment.set("QUERY_ID", response.data._id);
}
```

### 2. Get All Queries (Role-based)

```
GET {{BASE_URL}}/queries?page=1&limit=10&category=property&status=pending&priority=high
Authorization: Bearer {{ACCESS_TOKEN}}
```

### 3. Get Specific Query

```
GET {{BASE_URL}}/queries/{{QUERY_ID}}
Authorization: Bearer {{ACCESS_TOKEN}}
```

### 4. Lawyer Request to Handle Query

```
POST {{BASE_URL}}/queries/{{QUERY_ID}}/send-request
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json

{
    "message": "I have 5 years of experience in property law and can help resolve this dispute efficiently."
}
```

### 5. Respond to Query Request

```
POST {{BASE_URL}}/queries/{{QUERY_ID}}/requests/{{REQUEST_ID}}/respond
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json

{
    "action": "accept"
}
```

**Note:** Use `"action": "reject"` to reject the request.

### 6. Update Query Status

```
PATCH {{BASE_URL}}/queries/{{QUERY_ID}}/status
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json

{
    "status": "in_progress",
    "notes": "Started working on the query"
}
```

---

## ⚖️ Dispute Management Flow

### 1. Create Dispute (Citizen)

```
POST {{BASE_URL}}/disputes
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json

{
    "title": "Contract Breach Dispute",
    "description": "The contractor failed to complete work as per agreement and is demanding full payment",
    "disputeType": "contract",
    "category": "civil",
    "priority": "high",
    "opposingParty": {
        "name": "ABC Construction",
        "contact": "+1234567890",
        "address": "123 Builder St, City, State"
    },
    "disputeValue": 5000
}
```

**Required Fields:**

- `title` (string, max 100 chars): Dispute title
- `description` (string, max 2000 chars): Detailed description
- `disputeType` (string): Type of dispute
- `category` (string): Legal category

**Optional Fields:**

- `priority` (string): Priority level (default: "medium")
- `opposingParty` (object): Details of opposing party
- `disputeValue` (number): Monetary value of dispute

**Valid Values:**

- `disputeType`: "property", "contract", "family", "employment", "business", "consumer", "landlord-tenant", "other"
- `category`: "civil", "criminal", "family", "property", "corporate", "tax", "labor", "other"
- `priority`: "low", "medium", "high", "urgent"

**Test Script:**

```javascript
if (pm.response.code === 201) {
  const response = pm.response.json();
  pm.environment.set("DISPUTE_ID", response.data._id);
}
```

### 2. Get All Disputes (Role-based)

```
GET {{BASE_URL}}/disputes?page=1&limit=10&category=civil&status=pending&priority=high
Authorization: Bearer {{ACCESS_TOKEN}}
```

### 3. Get Specific Dispute

```
GET {{BASE_URL}}/disputes/{{DISPUTE_ID}}
Authorization: Bearer {{ACCESS_TOKEN}}
```

### 4. Lawyer Request to Handle Dispute

```
POST {{BASE_URL}}/disputes/{{DISPUTE_ID}}/send-request
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json

{
    "message": "I specialize in civil disputes and have handled similar contract cases successfully."
}
```

### 5. Respond to Dispute Request

```
POST {{BASE_URL}}/disputes/{{DISPUTE_ID}}/requests/{{REQUEST_ID}}/respond
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json

{
    "action": "accept"
}
```

**Note:** Use `"action": "reject"` to reject the request.

### 6. Update Dispute Status

```
PATCH {{BASE_URL}}/disputes/{{DISPUTE_ID}}/status
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json

{
    "status": "in_progress",
    "notes": "Case investigation started"
}
```

---

## 💬 Chat Management Flow

### 1. Get User Chats (All Types)

```
GET {{BASE_URL}}/chats?page=1&limit=20
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "chats": [
      {
        "chatId": "/query123/query_query123_1704123456789",
        "chatType": "query",
        "status": "active",
        "participants": [
          {
            "user": {
              "_id": "citizen123",
              "name": "John Doe",
              "role": "citizen"
            }
          },
          {
            "user": {
              "_id": "lawyer123",
              "name": "Jane Smith",
              "role": "lawyer"
            }
          }
        ],
        "lastMessage": {
          "content": "I'll help you with this case",
          "sender": { "name": "Jane Smith" },
          "timestamp": "2024-01-01T12:00:00Z"
        },
        "unreadCount": 2,
        "relatedCase": {
          "caseType": "query",
          "caseId": "query123"
        }
      }
    ]
  }
}
```

### 2. Get Case Chat (Auto-Created After Assignment)

```
GET {{BASE_URL}}/chats/case/query/{{QUERY_ID}}
Authorization: Bearer {{ACCESS_TOKEN}}
```

**For Disputes:**

```
GET {{BASE_URL}}/chats/case/dispute/{{DISPUTE_ID}}
Authorization: Bearer {{ACCESS_TOKEN}}
```

### 3. Get Chat Messages (Pagination)

```
GET {{BASE_URL}}/chats/{{CHAT_ID}}/messages?page=1&limit=50
Authorization: Bearer {{ACCESS_TOKEN}}
```

### 4. Get Case Chat Messages

```
GET {{BASE_URL}}/chats/case/query/{{QUERY_ID}}/messages?page=1&limit=50
Authorization: Bearer {{ACCESS_TOKEN}}
```

### 5. Create Direct Chat (For General Consultation)

```
POST {{BASE_URL}}/chats/direct/{{LAWYER_ID}}
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json

{
    "initialMessage": "Hello, I need legal consultation"
}
```

**Note:** Case-specific chats are auto-created when requests are accepted. Use direct chats only for general consultation.

---

## 🔄 Real-time Messaging (Socket.io Only)

### Join Chat Room

```javascript
socket.emit("join_chat", chatId);
```

### Send Message

```javascript
socket.emit("send_message", {
  chatId: "/query123/query_query123_1704123456789",
  content: "Hello, I need help with this case",
  messageType: "text",
});
```

### Receive Messages

```javascript
socket.on("new_message", (message) => {
  console.log("New message:", message);
  // Display message in UI
});
```

### Typing Indicators

```javascript
// Start typing
socket.emit("typing_start", { chatId });

// Stop typing
socket.emit("typing_stop", { chatId });

// Receive typing status
socket.on("user_typing", (data) => {
  console.log(`${data.userName} is typing...`);
});
```

---

## 🧪 Complete Testing Scenarios

### Scenario 1: Citizen Posts Query → Lawyer Responds → Chat Created

1. **Login as Citizen** (Step 5 from Auth Flow)
2. **Create Query** (Query Flow Step 1)
3. **Login as Admin** (Step 7 from Auth Flow)
4. **Verify Lawyer** (Admin Flow Step 5)
5. **Login as Lawyer** (Step 6 from Auth Flow)
6. **Request to Handle Query** (Query Flow Step 4)
7. **Login as Citizen** (Step 5 from Auth Flow)
8. **Accept Lawyer Request** (Query Flow Step 6)
9. **Get Case Chat** (Chat Flow Step 3)

### Scenario 2: Citizen Creates Dispute → Multiple Lawyers Offer Help

1. **Login as Citizen**
2. **Create Dispute** (Dispute Flow Step 1)
3. **Login as Lawyer 1**
4. **Offer Help on Dispute** (Dispute Flow Step 5)
5. **Login as Lawyer 2**
6. **Request to Handle Dispute** (Dispute Flow Step 4)
7. **Login as Citizen**
8. **Get Received Offers** (Citizen Flow Step 7)
9. **Accept One Lawyer Request** (Dispute Flow Step 6)

### Scenario 3: Complete Direct Consultation Flow

1. **Login as Citizen** (Auth Flow Step 5)
2. **Get Verified Lawyers** (Lawyer Flow Step 1)
3. **Send Direct Message Request** (Citizen Flow Step 4)
4. **Login as Lawyer** (Auth Flow Step 6)
5. **Get Pending Direct Requests** (Lawyer Flow Step 7)
6. **Accept Direct Message Request** (Lawyer Flow Step 8)
7. **Get My Active Direct Chats** (Lawyer Flow Step 9)
8. **Access Chat Room for Messaging** (Chat Flow Step 6)

**Expected Flow:**

- ✅ Citizen sends request → Creates pending chat
- ✅ Lawyer sees pending request → Can view citizen details
- ✅ Lawyer accepts request → Chat becomes active
- ✅ Both can now message in real-time via Socket.io
- ✅ Chat history is maintained in database

---

## 🔧 Common Test Scripts

### Auto-Extract IDs from Responses

Add to Test tab of requests:

```javascript
// For registration/login responses
if (pm.response.code === 200 || pm.response.code === 201) {
  const response = pm.response.json();

  if (response.data.accessToken) {
    pm.environment.set("ACCESS_TOKEN", response.data.accessToken);
  }

  if (response.data.user) {
    pm.environment.set("USER_ID", response.data.user._id);

    if (response.data.user.role === "citizen") {
      pm.environment.set("CITIZEN_ID", response.data.user._id);
    } else if (response.data.user.role === "lawyer") {
      pm.environment.set("LAWYER_ID", response.data.user._id);
    } else if (response.data.user.role === "admin") {
      pm.environment.set("ADMIN_ID", response.data.user._id);
    }
  }

  // For query/dispute creation
  if (response.data._id) {
    if (pm.request.url.toString().includes("/queries")) {
      pm.environment.set("QUERY_ID", response.data._id);
    } else if (pm.request.url.toString().includes("/disputes")) {
      pm.environment.set("DISPUTE_ID", response.data._id);
    } else if (pm.request.url.toString().includes("/chats")) {
      pm.environment.set("CHAT_ID", response.data._id);
    }
  }

  // For request responses
  if (response.data.requestId) {
    pm.environment.set("REQUEST_ID", response.data.requestId);
  }
}
```

### Status Code Validation

```javascript
pm.test("Status code is successful", function () {
  pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});

pm.test("Response has success field", function () {
  const response = pm.response.json();
  pm.expect(response.success).to.be.true;
});
```

---

## 📋 Testing Checklist

### ✅ Authentication

- [ ] Register Citizen
- [ ] Register Lawyer
- [ ] Register Admin
- [ ] Login all roles
- [ ] Get current user
- [ ] Update profile
- [ ] Logout

### ✅ Admin Functions

- [ ] Dashboard analytics
- [ ] User management
- [ ] Lawyer verification
- [ ] System stats

### ✅ Lawyer Functions

- [ ] Get verified lawyers
- [ ] Dashboard stats
- [ ] Available cases
- [ ] My cases
- [ ] Client management

### ✅ Citizen Functions

- [ ] Dashboard
- [ ] My lawyers
- [ ] My cases
- [ ] Message requests
- [ ] Pending requests

### ✅ Query Management

- [ ] Create query
- [ ] Get queries
- [ ] Lawyer requests
- [ ] Citizen responses
- [ ] Status updates

### ✅ Dispute Management

- [ ] Create dispute
- [ ] Get disputes
- [ ] Lawyer offers
- [ ] Citizen responses
- [ ] Status updates

### ✅ Chat System

- [ ] Get chats
- [ ] Direct chats
- [ ] Case chats
- [ ] Chat messages

### ✅ Direct Message Request System

- [ ] Send direct message request (Citizen)
- [ ] Get pending requests (Lawyer)
- [ ] Accept request (Lawyer)
- [ ] Get active chats (Lawyer)
- [ ] Real-time messaging via Socket.io

---

## � Complete API Reference Summary

### 🎯 **Citizen APIs (Clean & Dedicated)**

```bash
# Find & Request Lawyers
GET /api/citizens/available-lawyers?specialization=property&experience=5+
POST /api/citizens/request-lawyer-for-query/:queryId/:lawyerId
POST /api/citizens/request-lawyer-for-dispute/:disputeId/:lawyerId

# Case Management with Chat Info
GET /api/citizens/my-cases?status=assigned&type=all
GET /api/citizens/pending-requests
GET /api/citizens/received-offers

# Direct Messaging
POST /api/citizens/message-request/:lawyerId
```

### 👨‍💼 **Lawyer APIs (Enhanced with Chat)**

```bash
# Case Management
GET /api/lawyers/available-cases?caseType=all
GET /api/lawyers/my-cases?status=assigned&caseType=all  # ✅ Enhanced with chat info

# Request Management
POST /api/queries/:id/send-request
POST /api/disputes/:id/send-request

# Direct Client Management
GET /api/lawyers/pending-requests
POST /api/lawyers/accept-request/:chatId
GET /api/lawyers/my-chats
GET /api/lawyers/my-direct-clients
```

### 💬 **Chat APIs (Management Only)**

```bash
# Chat Management (REST)
GET /api/chats                              # Get all user chats
GET /api/chats/case/query/:queryId          # Get case chat
GET /api/chats/:chatId/messages             # Get message history

# Real-time Messaging (Socket.io Only)
socket.emit("join_chat", chatId)
socket.emit("send_message", { chatId, content })
socket.on("new_message", callback)
```

### 🔄 **Accept/Reject with Auto Chat Creation**

```bash
# Accept Request → Auto Status Change + Chat Creation
POST /api/queries/:queryId/requests/:requestId/respond
POST /api/disputes/:disputeId/requests/:requestId/respond
Body: { "action": "accept" }

# Result:
# ✅ Status: "pending" → "assigned"
# ✅ Chat Room: Auto-created with path /caseId/chatRoomId
# ✅ Socket Events: case_assigned, request_response
```

---

## �📬 Complete Direct Message Request API Reference

### 🎯 **New UI Flow Testing Guide**

#### **📱 Citizen "Find Lawyer" Flow:**

##### **Step 1: Citizen Creates a Query/Dispute**

```
POST {{BASE_URL}}/queries
Authorization: Bearer {{CITIZEN_TOKEN}}
Content-Type: application/json

{
    "title": "Property Boundary Dispute",
    "description": "Need help with neighbor property line issue",
    "category": "property",
    "priority": "high"
}
```

##### **Step 2: Citizen Clicks "Find Lawyer" → Get Available Lawyers**

```
GET {{BASE_URL}}/citizens/available-lawyers?specialization=property&experience=5+&page=1&limit=10
Authorization: Bearer {{CITIZEN_TOKEN}}
```

##### **Step 3: Citizen Selects Lawyer → Send Request**

```
POST {{BASE_URL}}/citizens/request-lawyer-for-query/{{QUERY_ID}}/{{LAWYER_ID}}
Authorization: Bearer {{CITIZEN_TOKEN}}
Content-Type: application/json

{
    "message": "I need help with my property boundary dispute. Please handle my case."
}
```

##### **Step 4: Lawyer Receives Notification & Responds**

```
# Lawyer gets notification via Socket.io
# Then lawyer can respond to the request
POST {{BASE_URL}}/queries/{{QUERY_ID}}/requests/{{REQUEST_ID}}/respond
Authorization: Bearer {{LAWYER_TOKEN}}
Content-Type: application/json

{
    "action": "accept"
}
```

#### **🔄 Same Flow for Disputes:**

Replace `/request-lawyer-for-query/` with `/request-lawyer-for-dispute/` and use dispute endpoints.

---

### 🎯 **Direct Message Testing Guide**

#### **1. Citizen Sends Request**

```
POST {{BASE_URL}}/citizens/message-request/{{LAWYER_ID}}
Authorization: Bearer {{CITIZEN_TOKEN}}
Content-Type: application/json

{
    "message": "I need help with property dispute"  // Optional
}
```

#### **2. Lawyer Gets Pending Requests**

```
GET {{BASE_URL}}/lawyers/pending-requests?page=1&limit=10
Authorization: Bearer {{LAWYER_TOKEN}}
```

#### **3. Lawyer Accepts Request**

```
POST {{BASE_URL}}/lawyers/accept-request/{{CHAT_ID}}
Authorization: Bearer {{LAWYER_TOKEN}}
```

#### **4. Lawyer Gets Active Chats**

```
GET {{BASE_URL}}/lawyers/my-chats?page=1&limit=10
Authorization: Bearer {{LAWYER_TOKEN}}
```

#### **4.1. Lawyer Gets Direct Clients List**

```
GET {{BASE_URL}}/lawyers/my-direct-clients?page=1&limit=10
Authorization: Bearer {{LAWYER_TOKEN}}
```

#### **5. Access Chat Messages**

```
GET {{BASE_URL}}/chats/{{CHAT_ID}}/messages?page=1&limit=50
Authorization: Bearer {{TOKEN}}
```

### 🔄 **Real-time Events (Socket.io)**

```javascript
// Lawyer receives new request
socket.on("direct_message_request", (data) => {
  console.log("New request from:", data.from.name);
  console.log("Chat ID:", data.chatId);
});

// Citizen receives acceptance
socket.on("direct_request_accepted", (data) => {
  console.log("Request accepted by:", data.lawyer.name);
});

// Both receive messages
socket.on("new_message", (data) => {
  console.log("New message:", data.content);
});
```

### 📋 **Testing Checklist**

- [ ] **Rate Limiting**: Try sending 3+ requests in 1 hour (should fail)
- [ ] **Optional Message**: Send request without message field
- [ ] **Pending Status**: Verify chat status is "pending" initially
- [ ] **Active Status**: Verify chat status becomes "active" after acceptance
- [ ] **Real-time Notifications**: Test Socket.io events
- [ ] **Chat History**: Verify messages are stored in database
- [ ] **Pagination**: Test with multiple requests/chats

---

## 🚀 Quick Start Commands

Copy these into Postman and run in sequence:

1. **Setup Environment** with variables listed above
2. **Import Collection** with pre-request scripts
3. **Run Authentication Flow** (Steps 1-8)
4. **Run Admin Verification** (Admin Steps 4-5)
5. **Run Complete Scenario 1** for end-to-end testing

---

## ✅ **Quick Testing Checklist**

### **🎯 Core Flows to Test:**

#### **1. Citizen Request Flow:**

- [ ] Create query/dispute
- [ ] Get available lawyers
- [ ] Send request to specific lawyer
- [ ] Check pending requests

#### **2. Lawyer Accept Flow:**

- [ ] Get available cases
- [ ] Send request to citizen
- [ ] Accept citizen request
- [ ] Verify status change to "assigned"
- [ ] Check chat room creation

#### **3. Chat Integration:**

- [ ] Get assigned cases with chat info
- [ ] Access chat room via chatId
- [ ] Send/receive messages via Socket.io
- [ ] Check unread counts

#### **4. Enhanced APIs:**

- [ ] Lawyer: `GET /lawyers/my-cases` returns chat info
- [ ] Citizen: `GET /citizens/my-cases` returns chat info
- [ ] Both: Chat rooms auto-created on accept
- [ ] Both: Status auto-changes to "assigned"

### **🔧 Key Test Points:**

- ✅ **Status Changes:** pending → assigned
- ✅ **Chat Creation:** Auto-created with correct path format
- ✅ **Socket Events:** case_assigned, request_response
- ✅ **API Responses:** Include chatRoom object
- ✅ **Real-time:** Messages via Socket.io only

---

**Happy Testing! 🎯**
