# 08 - Development Guide

## 8.1 Development Workflow

### Getting Started
1. **Clone and Setup**: Follow the setup instructions in `01-SETUP.md`
2. **Environment Configuration**: Configure all required environment variables
3. **Database Initialization**: Run database initialization and migrations
4. **Start Development**: Use `npm run dev` to start the development server

### Development Commands
```bash
# Development
npm run dev              # Start development server on localhost:8000
npm run build            # Build for production
npm start                # Start production server

# Database Operations
npm run migrate:role     # Add role column to existing database
npm run migrate:inbox    # Add direct messages table for inbox feature
npm run migrate:passwords # Convert passwords to encrypted format
npm run add-admins       # Add all admins to all chatrooms

# User Management
npm run seed:admin       # Create admin user (admin@gmail.com / test)
npm run create:new-admin # Create new admin (newadmin@gmail.com / admin123)

# Code Quality
npm run lint             # Run ESLint
npm test                 # Run Jest tests
```

## 8.2 Code Style & Conventions

### TypeScript Guidelines
- Use strict TypeScript configuration
- Define interfaces for all data structures
- Use proper type annotations for function parameters and returns
- Leverage Next.js and React type definitions

### Component Structure
```typescript
"use client"; // For client components only

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface ComponentProps {
  // Define prop types
}

export default function Component({ prop }: ComponentProps) {
  // Component logic
  return (
    <div className="tailwind-classes">
      {/* Component JSX */}
    </div>
  );
}
```

### API Route Structure
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // API logic here
    
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Database Query Patterns
```typescript
import { db } from '@/lib/db';

// Parameterized queries
const result = await db.execute({
  sql: 'SELECT * FROM users WHERE id = ?',
  args: [userId]
});

// Insert with UUID
import { randomUUID } from 'crypto';

const id = randomUUID();
await db.execute({
  sql: 'INSERT INTO users (id, email, name) VALUES (?, ?, ?)',
  args: [id, email, name]
});
```

## 8.3 Testing Guidelines

### Test Structure
- Unit tests for utility functions
- Integration tests for API routes
- Component tests for React components
- End-to-end tests for critical user flows

### Running Tests
```bash
npm test                 # Run all tests
npm test -- --watch     # Run tests in watch mode
npm test -- --coverage  # Run tests with coverage report
```

### Test Examples
```typescript
// API Route Test
import { GET } from '@/app/api/users/route';
import { NextRequest } from 'next/server';

describe('/api/users', () => {
  it('should return users for admin', async () => {
    const request = new NextRequest('http://localhost:3000/api/users');
    const response = await GET(request);
    expect(response.status).toBe(200);
  });
});

// Component Test
import { render, screen } from '@testing-library/react';
import Component from './Component';

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## 8.4 Database Development

### Schema Changes
1. **Create Migration Script**: Add new script in `scripts/` directory
2. **Update Database Schema**: Modify table structure
3. **Update TypeScript Types**: Reflect changes in type definitions
4. **Test Migration**: Verify migration works on clean database

### Migration Script Template
```typescript
import { db } from '../lib/db.ts';

async function migrate() {
  try {
    await db.execute({
      sql: `ALTER TABLE table_name ADD COLUMN new_column TEXT DEFAULT 'default_value'`
    });
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
```

### Database Best Practices
- Always use parameterized queries
- Create indexes for frequently queried columns
- Use transactions for multi-step operations
- Handle database errors gracefully
- Log database operations for debugging

## 8.5 Authentication Development

### Session Management
```typescript
// Server-side auth check
import { auth } from '@/auth';

const session = await auth();
if (!session) {
  redirect('/auth/signin');
}

// Client-side auth check
import { useSession } from 'next-auth/react';

const { data: session, status } = useSession();
if (status === 'loading') return <Loading />;
if (!session) return <SignIn />;
```

### Role-based Access
```typescript
// Check admin role
if (session.user.role !== 'admin') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// Conditional rendering
{session?.user.role === 'admin' && (
  <AdminOnlyComponent />
)}
```

## 8.6 UI Development

### Tailwind CSS Guidelines
- Use utility classes consistently
- Follow the established design system
- Implement responsive design with mobile-first approach
- Use consistent spacing and color schemes

### Component Patterns
```typescript
// Button component with proper cursor styles
<button 
  className="bg-gray-900 text-white hover:bg-gray-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
  disabled={isLoading}
>
  {isLoading ? 'Loading...' : 'Submit'}
</button>

// Modal component
<div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center p-6 z-50">
  <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-md w-full p-8">
    {/* Modal content */}
  </div>
</div>
```

### Icon Usage
- Use consistent icon libraries (Heroicons recommended)
- Include proper accessibility attributes
- Maintain consistent sizing (h-5 w-5 for most icons)

## 8.7 Performance Optimization

### Frontend Optimization
- Implement code splitting for large components
- Use React.memo for expensive components
- Optimize images with Cloudinary
- Minimize bundle size with tree shaking

### Backend Optimization
- Use database indexes effectively
- Implement proper caching strategies
- Optimize API response sizes
- Use connection pooling for database

### Real-time Features
- Optimize polling intervals based on user activity
- Implement efficient data fetching strategies
- Consider WebSocket implementation for true real-time features

## 8.8 Debugging & Troubleshooting

### Common Issues
1. **Database Connection**: Check Turso credentials and network connectivity
2. **Authentication**: Verify NextAuth configuration and session handling
3. **Environment Variables**: Ensure all required variables are set
4. **Build Errors**: Check TypeScript types and import paths

### Debugging Tools
- Browser Developer Tools for frontend debugging
- Console logging for API route debugging
- Database query logging for performance analysis
- Network tab for API request/response inspection

### Error Handling
```typescript
// API Error Handling
try {
  const result = await apiCall();
  return NextResponse.json(result);
} catch (error) {
  console.error('API Error:', error);
  return NextResponse.json(
    { error: 'Internal server error' }, 
    { status: 500 }
  );
}

// Component Error Handling
const [error, setError] = useState<string | null>(null);

try {
  await operation();
} catch (err) {
  setError('Operation failed. Please try again.');
}
```

## 8.9 Deployment Considerations

### Environment Setup
- Configure production environment variables
- Set up proper database connections
- Configure email service for production
- Set up image upload service (Cloudinary)

### Build Process
```bash
npm run build    # Build the application
npm start        # Start production server
```

### Security Checklist
- [ ] Change default AUTH_SECRET
- [ ] Use strong PASSWORD_ENCRYPTION_KEY
- [ ] Configure HTTPS in production
- [ ] Set up proper CORS policies
- [ ] Implement rate limiting
- [ ] Configure secure headers