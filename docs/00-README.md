# Lankachat Documentation

## Overview
Lankachat is a real-time chat application with role-based access control built with Next.js, TypeScript, and Turso SQLite. Users can join chatrooms and send messages, while admins have additional privileges to create chatrooms, manage users, and view analytics.

## Quick Start
1. **Setup**: Follow [01-SETUP.md](./01-SETUP.md) for installation and configuration
2. **Architecture**: Review [02-ARCHITECTURE.md](./02-ARCHITECTURE.md) to understand the tech stack
3. **Development**: Use [08-DEVELOPMENT-GUIDE.md](./08-DEVELOPMENT-GUIDE.md) for development workflows

## Documentation Structure

### Getting Started
- **[01-SETUP.md](./01-SETUP.md)** - Installation, environment setup, and initial configuration
- **[02-ARCHITECTURE.md](./02-ARCHITECTURE.md)** - Tech stack, project structure, and database schema

### Core Features
- **[03-AUTHENTICATION.md](./03-AUTHENTICATION.md)** - User authentication, email verification, and role-based access
- **[04-CHAT-FEATURES.md](./04-CHAT-FEATURES.md)** - Messaging, chatrooms, direct messages, and real-time updates
- **[05-ADMIN-FEATURES.md](./05-ADMIN-FEATURES.md)** - Admin dashboard, user management, and analytics

### Advanced Topics
- **[06-ADVANCED-FEATURES.md](./06-ADVANCED-FEATURES.md)** - Image uploads, sound notifications, and performance optimizations
- **[07-API-REFERENCE.md](./07-API-REFERENCE.md)** - Complete API documentation with endpoints and examples

### Development & Maintenance
- **[08-DEVELOPMENT-GUIDE.md](./08-DEVELOPMENT-GUIDE.md)** - Development workflows, coding standards, and best practices
- **[09-TROUBLESHOOTING.md](./09-TROUBLESHOOTING.md)** - Common issues, debugging, and solutions
- **[10-FUTURE-ENHANCEMENTS.md](./10-FUTURE-ENHANCEMENTS.md)** - Roadmap and planned features

### Legacy Files
- **[TODO.md](./TODO.md)** - Development tasks and feature requests

## Key Features

### Core Functionality
- **User Authentication**: Secure signup/signin with email verification
- **Real-time Messaging**: 2-second polling for message updates
- **Chatroom Management**: Create and join chatrooms
- **Direct Messaging**: Private conversations with inbox interface
- **Image Sharing**: Upload and share images via Cloudinary
- **Sound Notifications**: Audio alerts for new direct messages

### Admin Features
- **User Management**: Full CRUD operations for user accounts
- **Analytics Dashboard**: User statistics and engagement metrics
- **Role-based Access**: Admin and user role system
- **Content Oversight**: Access to all chatrooms and messages

### Technical Highlights
- **Next.js 16** with App Router
- **TypeScript 5** for type safety
- **NextAuth v5** for authentication
- **Turso SQLite** database
- **Tailwind CSS 4** for styling
- **Cloudinary** for image storage

## Default Admin Access
- **Email**: admin@gmail.com
- **Password**: test

## Quick Commands
```bash
# Start development
npm run dev

# Initialize database
curl -X GET http://localhost:8000/api/init

# Create admin user
npm run seed:admin

# Run migrations
npm run migrate:role
npm run migrate:inbox
```

## Support
For issues and troubleshooting, refer to [09-TROUBLESHOOTING.md](./09-TROUBLESHOOTING.md) or check the specific feature documentation above.