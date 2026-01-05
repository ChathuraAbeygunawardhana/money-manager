# 02 - Architecture & Tech Stack

## 2.1 Technology Stack

### Core Framework & Libraries
- **Next.js 16** (App Router) - React framework with server-side rendering
- **React 19** - UI library
- **TypeScript 5** - Type-safe JavaScript
- **NextAuth v5** - Authentication with credentials provider
- **Turso SQLite** (@libsql/client) - Database
- **Tailwind CSS 4** - Utility-first styling
- **bcryptjs** - Password hashing

### Development Tools
- **ESLint** - Code linting
- **Jest** - Testing framework
- **tsx** - TypeScript execution for scripts

## 2.2 Project Structure

```
├── app/                    # Next.js App Router pages and layouts
│   ├── api/               # API route handlers
│   │   ├── analytics/     # Analytics data endpoints
│   │   ├── auth/          # Authentication endpoints (signup, NextAuth)
│   │   ├── chatrooms/     # Chatroom CRUD and join operations
│   │   ├── messages/      # Message retrieval and creation
│   │   ├── users/         # User management (admin only)
│   │   ├── inbox/         # Direct messaging endpoints
│   │   ├── init/          # Database initialization
│   │   └── seed-admin/    # Admin user seeding
│   ├── auth/              # Authentication pages (signin, signup)
│   ├── chat/              # Chat interface pages
│   │   └── [id]/          # Individual chatroom page
│   ├── analytics/         # Admin analytics dashboard
│   ├── users/             # Admin user management page
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles
├── lib/
│   └── db.ts              # Turso database client and initialization
├── types/
│   └── next-auth.d.ts     # NextAuth type extensions (role field)
├── scripts/               # Database migration and seeding scripts
├── auth.ts                # NextAuth configuration with credentials provider
└── middleware.ts          # Route protection for authenticated pages
```

## 2.3 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'user')),
  email_verified INTEGER DEFAULT 0,
  email_verification_token TEXT,
  email_verification_expires INTEGER,
  created_at INTEGER DEFAULT (unixepoch())
);
```

### Chatrooms Table
```sql
CREATE TABLE chatrooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by TEXT NOT NULL,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (created_by) REFERENCES users (id)
);
```

### Messages Table
```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  chatroom_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK(message_type IN ('text', 'image')),
  image_url TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (chatroom_id) REFERENCES chatrooms (id),
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

### Chatroom Members Table
```sql
CREATE TABLE chatroom_members (
  chatroom_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  joined_at INTEGER DEFAULT (unixepoch()),
  PRIMARY KEY (chatroom_id, user_id),
  FOREIGN KEY (chatroom_id) REFERENCES chatrooms (id),
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

### Direct Messages Table
```sql
CREATE TABLE direct_messages (
  id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK(message_type IN ('text', 'image')),
  image_url TEXT,
  read_at INTEGER,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (sender_id) REFERENCES users (id),
  FOREIGN KEY (recipient_id) REFERENCES users (id)
);
```

## 2.4 Key Conventions

### API Routes
- All API routes use Next.js App Router convention (`route.ts` files)
- Authentication checked via `auth()` from NextAuth
- Admin-only endpoints verify `session.user.role === "admin"`
- Return `NextResponse.json()` with appropriate status codes
- Use try-catch with 500 error responses for exceptions

### Components & Pages
- Client components marked with `"use client"` directive
- Use `useSession()` hook for client-side auth state
- Use `auth()` function for server-side auth
- Protected pages redirect unauthenticated users to `/auth/signin`
- Admin features conditionally rendered based on role

### Database Access
- Import `db` from `@/lib/db.ts`
- Use parameterized queries with `db.execute({ sql, args })`
- UUIDs generated with `randomUUID()` from crypto
- Timestamps stored as Unix epoch integers

### Authentication Flow
- Credentials-based auth with email/password
- Passwords hashed with bcrypt (10 rounds)
- Session includes user id, email, name, and role
- Middleware protects `/chat/*` and related API routes