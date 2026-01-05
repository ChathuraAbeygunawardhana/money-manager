# Project Structure

## Directory Organization

```
├── app/                    # Next.js App Router pages and layouts
│   ├── api/               # API route handlers
│   │   ├── analytics/     # Analytics data endpoints
│   │   ├── auth/          # Authentication endpoints (signup, NextAuth)
│   │   ├── chatrooms/     # Chatroom CRUD and join operations
│   │   ├── messages/      # Message retrieval and creation
│   │   ├── users/         # User management (admin only)
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

## Key Conventions

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

### Styling
- Tailwind CSS utility classes throughout
- Consistent design system: gray-900 for primary, gray-50 for backgrounds
- Rounded corners (rounded-lg), smooth transitions (transition-all duration-200)
- Responsive design with mobile-first approach

### Path Aliases
- `@/*` maps to project root (configured in tsconfig.json)
- Use `@/lib/db`, `@/auth`, etc. for imports

### Authentication Flow
- Credentials-based auth with email/password
- Passwords hashed with bcrypt (10 rounds)
- Session includes user id, email, name, and role
- Middleware protects `/chat/*` and related API routes
