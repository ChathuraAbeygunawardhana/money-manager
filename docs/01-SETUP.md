# 01 - Setup & Installation

## Quick Start Guide

### 1.1 Prerequisites
- Node.js and npm installed
- Turso database account and credentials

### 1.2 Environment Configuration

#### Required Environment Variables
Create `.env.development.local` with:
```env
# Database Configuration
TURSO_DATABASE_URL=your_turso_database_url
TURSO_AUTH_TOKEN=your_turso_auth_token

# Authentication
AUTH_SECRET=your_32_character_secret_key
AUTH_TRUST_HOST=true

# Password Encryption
PASSWORD_ENCRYPTION_KEY=your_32_character_encryption_key

# Email Configuration (Optional - for email verification)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@lankachat.com
NEXTAUTH_URL=http://localhost:8000

# Image Upload (Optional - for image messages)
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 1.3 Installation Steps

1. **Install Dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Initialize Database**:
   ```bash
   npm run dev
   ```
   Then visit: `http://localhost:8000/api/init`
   
   You should see: `{"message":"Database initialized"}`

3. **Create Admin User**:
   ```bash
   npm run seed:admin
   ```
   
   This creates an admin user with:
   - Email: admin@gmail.com
   - Password: test

### 1.4 Database Migration (For Existing Installations)

If upgrading from an older version, run these migrations:

```bash
# Add role column to users table
npm run migrate:role

# Add inbox/direct messages table
npm run migrate:inbox

# Convert passwords to encrypted format
npm run migrate:passwords

# Add all admins to all chatrooms
npm run add-admins
```

### 1.5 Verification

1. Go to `http://localhost:8000`
2. Sign up for a new account or sign in with admin credentials
3. Verify all features are working correctly

## 1.6 Common Commands

```bash
# Development
npm run dev              # Start development server on localhost:8000

# Build & Production
npm run build            # Build for production
npm start                # Start production server

# Admin Management
npm run seed:admin       # Create admin user (admin@gmail.com / test)
npm run create:new-admin # Create new admin (newadmin@gmail.com / admin123)

# Code Quality
npm run lint             # Run ESLint
```