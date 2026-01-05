# Tech Stack

## Framework & Core Libraries

- **Next.js 16** (App Router) - React framework with server-side rendering
- **React 19** - UI library
- **TypeScript 5** - Type-safe JavaScript
- **NextAuth v5** - Authentication with credentials provider
- **Turso SQLite** (@libsql/client) - Database
- **Tailwind CSS 4** - Utility-first styling
- **bcryptjs** - Password hashing

## Development Tools

- **ESLint** - Code linting
- **tsx** - TypeScript execution for scripts

## Common Commands

```bash
# Development
npm run dev              # Start development server on localhost:8000

# Build & Production
npm run build            # Build for production
npm start                # Start production server

# Database Setup
# Visit http://localhost:8000/api/init to initialize database tables

# Admin & User Management
npm run seed:admin       # Create admin user (admin@gmail.com / test)
npm run create:new-admin # Create new admin with encrypted password (newadmin@gmail.com / admin123)
npm run migrate:passwords # Convert all bcrypt passwords to encrypted (sets default: password123)
npm run migrate:role     # Add role column to existing database
npm run migrate:inbox    # Add direct messages table for inbox feature
npm run add-admins       # Add all admins to all chatrooms

# Code Quality
npm run lint             # Run ESLint
```

## Environment Variables

Required in `.env.development.local`:
- `TURSO_DATABASE_URL` - Turso database connection URL
- `TURSO_AUTH_TOKEN` - Turso authentication token
- `AUTH_SECRET` - NextAuth secret key
- `PASSWORD_ENCRYPTION_KEY` - 32-character key for password encryption
- `AUTH_TRUST_HOST=true` - For development

## Database Schema

- **users**: id, email, password, name, role, age, gender, height, weight, bio, orientation, profile_picture, created_at
- **chatrooms**: id, name, description, created_by, created_at
- **messages**: id, chatroom_id, user_id, content, created_at
- **chatroom_members**: chatroom_id, user_id, joined_at
- **direct_messages**: id, sender_id, recipient_id, content, read_at, created_at
