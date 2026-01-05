# 03 - Authentication & User Management

## 3.1 Authentication System

### Core Features
- Secure user registration with bcrypt password hashing
- Session-based authentication with NextAuth v5
- Protected routes (chat pages require authentication)
- Automatic redirect to sign-in for unauthenticated users
- Sign out functionality

### Authentication Flow
1. User registers with email, password, and name
2. Password is hashed with bcrypt (10 rounds)
3. User can sign in with email/password
4. Session includes user id, email, name, and role
5. Middleware protects authenticated routes

## 3.2 Email Verification

### Features
✅ **Email verification required for new signups**
✅ **Verification email sent automatically on registration**
✅ **Email verification page with token validation**
✅ **Resend verification email functionality**
✅ **Existing users marked as verified (backward compatibility)**
✅ **Updated signin flow with verification error handling**

### How It Works
1. **User signs up** → Account created but `email_verified = 0`
2. **Verification email sent** with unique token (24-hour expiry)
3. **User clicks link** → Redirected to `/auth/verify-email?token=...`
4. **Token validated** → User marked as verified (`email_verified = 1`)
5. **User can now sign in** → NextAuth checks verification status

### Email Configuration
Configure these environment variables:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@lankachat.com
NEXTAUTH_URL=http://localhost:8000
```

### Gmail Setup (Development)
1. Enable 2-factor authentication on Gmail
2. Generate App Password in Google Account settings
3. Use generated password as `EMAIL_PASSWORD`

### Production Email Services
- **SendGrid** - Reliable email delivery service
- **AWS SES** - Amazon's email service
- **Mailgun** - Developer-friendly email API
- **Postmark** - Transactional email service

## 3.3 Role-Based Access Control

### User Roles
- **Admin**: Can create chatrooms, manage users, view analytics, access all chatrooms
- **User**: Can join existing chatrooms and send messages

### Admin Features
- Role-based UI (Create Chatroom button only for admins)
- Admin badge next to name
- API protection (403 error for unauthorized access)
- Auto-membership in all chatrooms
- Access to analytics and user management

### Default Admin Credentials
- Email: admin@gmail.com
- Password: test

## 3.4 User Management (Admin Only)

### API Endpoints

#### GET /api/users
- Lists all users in the system
- Returns: id, email, name, role, created_at
- Access: Admin only

#### POST /api/users
- Creates a new user
- Required: email, password, name
- Optional: role (defaults to "user")
- Access: Admin only

#### PATCH /api/users/[id]
- Updates user information
- Updatable: email, password, name, role
- Password automatically hashed
- Access: Admin only

#### DELETE /api/users/[id]
- Deletes a user from the system
- Cannot delete your own account
- Access: Admin only

### User Management UI
- Access at `/users` (admin only)
- View all users in table format
- Create, edit, and delete users
- Visual role badges
- Responsive design
- Self-deletion prevention

## 3.5 Security Features

### Password Security
- bcrypt hashing with 10 rounds
- Password encryption key for additional security
- Secure password reset flow (via email verification)

### Session Security
- NextAuth v5 session management
- Secure session cookies
- Automatic session expiration
- CSRF protection

### API Security
- Authentication required for all protected endpoints
- Role-based authorization
- Input validation and sanitization
- Error handling without information leakage

### Email Security
- Token expiration (24 hours)
- Unique tokens using crypto.randomUUID()
- Database validation before marking as verified
- Rate limiting through email sending restrictions