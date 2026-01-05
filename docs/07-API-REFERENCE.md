# 07 - API Reference

## 7.1 Authentication Endpoints

### POST /api/auth/signup
Create a new user account with email verification.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

**Response:**
```json
{
  "message": "User created successfully. Please check your email to verify your account."
}
```

### GET /api/auth/verify-email
Verify email address with token.

**Query Parameters:**
- `token` (required): Email verification token

**Response:**
```json
{
  "message": "Email verified successfully"
}
```

### POST /api/auth/verify-email
Resend verification email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

## 7.2 User Management Endpoints

### GET /api/users
List all users (Admin only).

**Response:**
```json
[
  {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "user",
    "created_at": 1640995200
  }
]
```

### POST /api/users
Create a new user (Admin only).

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User",
  "role": "user"
}
```

### GET /api/users/[id]
Get a single user by ID (Admin only).

**Response:**
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "name": "User Name",
  "role": "user",
  "created_at": 1640995200
}
```

### PATCH /api/users/[id]
Update user information (Admin only).

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "password": "newpassword123",
  "role": "admin"
}
```

### DELETE /api/users/[id]
Delete a user (Admin only, cannot delete self).

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

## 7.3 Chatroom Endpoints

### GET /api/chatrooms
List all chatrooms.

**Response:**
```json
[
  {
    "id": "chatroom-uuid",
    "name": "General Chat",
    "description": "General discussion",
    "created_by": "user-uuid",
    "created_at": 1640995200,
    "creator_name": "Admin User",
    "is_member": true
  }
]
```

### POST /api/chatrooms
Create a new chatroom (Admin only).

**Request Body:**
```json
{
  "name": "New Chatroom",
  "description": "Description of the chatroom"
}
```

### POST /api/chatrooms/[id]/join
Join a chatroom.

**Response:**
```json
{
  "message": "Joined chatroom successfully"
}
```

## 7.4 Message Endpoints

### GET /api/messages/[chatroomId]
Get messages for a chatroom.

**Response:**
```json
[
  {
    "id": "message-uuid",
    "content": "Hello world!",
    "message_type": "text",
    "image_url": null,
    "user_name": "User Name",
    "created_at": 1640995200,
    "is_own_message": false
  }
]
```

### POST /api/messages/[chatroomId]
Send a message to a chatroom.

**Request Body (Text):**
```json
{
  "content": "Hello world!",
  "messageType": "text"
}
```

**Request Body (Image):**
```json
{
  "content": "Image message",
  "messageType": "image",
  "imageUrl": "https://cloudinary-url.com/image.jpg"
}
```

## 7.5 Inbox Endpoints

### GET /api/inbox
Get all conversations for the current user.

**Response:**
```json
[
  {
    "user_id": "other-user-uuid",
    "user_name": "Other User",
    "last_message": "Hello there!",
    "last_message_time": 1640995200,
    "unread_count": 2,
    "message_type": "text"
  }
]
```

### GET /api/inbox/[userId]
Get messages in a conversation with a specific user.

**Response:**
```json
[
  {
    "id": "message-uuid",
    "sender_id": "user-uuid",
    "content": "Hello!",
    "message_type": "text",
    "image_url": null,
    "created_at": 1640995200,
    "is_own_message": true
  }
]
```

### POST /api/inbox/[userId]
Send a direct message to a user.

**Request Body (Text):**
```json
{
  "content": "Hello there!",
  "messageType": "text"
}
```

**Request Body (Image):**
```json
{
  "content": "Image",
  "messageType": "image",
  "imageUrl": "https://cloudinary-url.com/image.jpg"
}
```

### DELETE /api/inbox/[userId]/delete
Delete entire conversation with a user.

**Response:**
```json
{
  "success": true,
  "message": "Conversation deleted successfully"
}
```

### GET /api/inbox/unread-count
Get total unread message count.

**Response:**
```json
{
  "unreadCount": 5
}
```

## 7.6 Analytics Endpoints

### GET /api/analytics
Get analytics data (Admin only).

**Response:**
```json
{
  "overview": {
    "totalUsers": 25,
    "activeUsers": 18,
    "newUsersLast7Days": 3,
    "totalChatrooms": 5,
    "totalMessages": 342,
    "usersWithMemberships": 20
  },
  "roleDistribution": {
    "admin": 2,
    "user": 23
  },
  "mostActiveUsers": [
    {
      "name": "User Name",
      "email": "user@example.com",
      "messageCount": 45
    }
  ],
  "chatroomStats": [
    {
      "name": "General Chat",
      "memberCount": 15,
      "messageCount": 120
    }
  ],
  "userDetails": [
    {
      "name": "User Name",
      "email": "user@example.com",
      "role": "user",
      "joinDate": "2024-01-01",
      "chatroomCount": 3,
      "messageCount": 25
    }
  ]
}
```

## 7.7 System Endpoints

### GET /api/init
Initialize database tables.

**Response:**
```json
{
  "message": "Database initialized"
}
```

### POST /api/seed-admin
Create default admin user.

**Response:**
```json
{
  "message": "Admin user created successfully"
}
```

## 7.8 Error Responses

### Common Error Codes
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

### Error Response Format
```json
{
  "error": "Error message description"
}
```

## 7.9 Authentication

### Session-based Authentication
All protected endpoints require a valid session cookie. Use NextAuth signin to establish a session.

### Admin-only Endpoints
Endpoints marked as "Admin only" require the user to have `role: "admin"` in their session.

### Rate Limiting
Some endpoints may have rate limiting to prevent abuse:
- Message sending: Limited to prevent spam
- User creation: Limited to prevent abuse
- Email verification: Limited to prevent email flooding