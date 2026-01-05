# Lankachat - Real-time Chat Application

A modern, real-time chat application built with Next.js 15, NextAuth, and Turso SQLite database.

## Features

- User authentication (Sign up / Sign in)
- Create and join chatrooms
- Real-time messaging
- Problem reporting system for users
- Admin dashboard with analytics and problem reports
- Clean and professional UI with Tailwind CSS
- Secure password hashing with bcrypt
- SQLite database with Turso

## Getting Started

### 1. Initialize the Database

First, initialize the database tables by visiting:

```
http://localhost:8000/api/init
```

This will create all necessary tables in your Turso database.

### 2. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:8000](http://localhost:8000) to see the application.

### 3. Create an Account

1. Click "Sign Up" on the homepage
2. Enter your name, email, and password
3. Sign in with your credentials

### 4. Start Chatting

1. Create a new chatroom or join an existing one
2. Send messages in real-time
3. Messages refresh automatically every 2 seconds

### 5. Report Problems (Users)

Users can report problems from any chatroom:
1. Click the "Report Problem" button in the chatroom navigation
2. Enter a title and description of the issue
3. Submit the report for admin review

### 6. Admin Features

Admins have access to additional features:
- View analytics dashboard at `/admin/analytics`
- Manage users at `/admin/users`
- View and manage problem reports in the analytics dashboard
- Mark reports as resolved or dismissed

## Database Migrations

If you have an existing database, run this migration to add the problem reports table:

```bash
npm run migrate:reports
```

## Environment Variables

The following environment variables are required:

- `TURSO_DATABASE_URL` - Your Turso database URL
- `TURSO_AUTH_TOKEN` - Your Turso authentication token
- `AUTH_SECRET` - Secret key for NextAuth (change in production)
- `AUTH_TRUST_HOST` - Set to `true` for development

## Tech Stack

- Next.js 15 (App Router)
- NextAuth v5 (Authentication)
- Turso SQLite (Database)
- Tailwind CSS (Styling)
- TypeScript
- bcryptjs (Password hashing)

## Project Structure

```
├── app/
│   ├── api/          # API routes
│   ├── auth/         # Authentication pages
│   ├── chat/         # Chat pages
│   └── page.tsx      # Homepage
├── lib/
│   └── db.ts         # Database configuration
├── types/
│   └── next-auth.d.ts # NextAuth type definitions
└── auth.ts           # NextAuth configuration
```
