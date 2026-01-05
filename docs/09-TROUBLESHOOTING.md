# 09 - Troubleshooting Guide

## 9.1 Common Setup Issues

### Database Connection Problems

#### Issue: "Database connection failed"
**Symptoms:**
- Error messages about Turso connection
- API endpoints returning 500 errors
- Database initialization failing

**Solutions:**
1. **Check Environment Variables:**
   ```bash
   # Verify these are set in .env.development.local
   TURSO_DATABASE_URL=your_turso_database_url
   TURSO_AUTH_TOKEN=your_turso_auth_token
   ```

2. **Verify Turso Credentials:**
   - Log into Turso dashboard
   - Confirm database URL and token are correct
   - Check if database exists and is accessible

3. **Test Database Connection:**
   ```bash
   # Visit this URL to test database initialization
   http://localhost:8000/api/init
   ```

#### Issue: "Table doesn't exist" errors
**Symptoms:**
- SQL errors about missing tables
- 500 errors when accessing features

**Solutions:**
1. **Initialize Database:**
   ```bash
   curl -X GET http://localhost:8000/api/init
   ```

2. **Run Migrations:**
   ```bash
   npm run migrate:role
   npm run migrate:inbox
   ```

### Authentication Issues

#### Issue: "NextAuth configuration error"
**Symptoms:**
- Sign in/sign up not working
- Session not persisting
- Redirect loops

**Solutions:**
1. **Check AUTH_SECRET:**
   ```env
   # Must be at least 32 characters
   AUTH_SECRET=your_32_character_secret_key
   AUTH_TRUST_HOST=true
   ```

2. **Verify NextAuth Configuration:**
   - Check `auth.ts` configuration
   - Ensure credentials provider is properly configured
   - Verify callback URLs are correct

#### Issue: "Email verification not working"
**Symptoms:**
- Verification emails not sending
- Email verification tokens invalid
- Users can't complete signup

**Solutions:**
1. **Configure Email Settings:**
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   EMAIL_FROM=noreply@lankachat.com
   ```

2. **Gmail App Password Setup:**
   - Enable 2FA on Gmail account
   - Generate App Password in Google Account settings
   - Use App Password as EMAIL_PASSWORD

3. **Check Console Logs:**
   - Look for email sending errors in server logs
   - Verify SMTP connection is working

## 9.2 Runtime Issues

### Real-time Messaging Problems

#### Issue: "Messages not updating in real-time"
**Symptoms:**
- New messages don't appear automatically
- Need to refresh page to see messages
- Polling not working

**Solutions:**
1. **Check Network Connectivity:**
   - Verify API endpoints are accessible
   - Check browser network tab for failed requests
   - Ensure no ad blockers are interfering

2. **Verify Polling Implementation:**
   - Check if useEffect hooks are running
   - Verify polling intervals are set correctly
   - Look for JavaScript errors in console

#### Issue: "Images not uploading"
**Symptoms:**
- Image upload fails
- Error messages about file size or type
- Images not displaying

**Solutions:**
1. **Configure Cloudinary:**
   ```env
   CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

2. **Check File Constraints:**
   - Maximum file size: 5MB
   - Supported formats: JPG, PNG, GIF
   - Verify file meets requirements

### Permission and Access Issues

#### Issue: "403 Forbidden" errors
**Symptoms:**
- Admin features not accessible
- User management returns forbidden
- Analytics page blocked

**Solutions:**
1. **Verify User Role:**
   ```bash
   # Check user role in database
   # Admin users should have role = 'admin'
   ```

2. **Create Admin User:**
   ```bash
   npm run seed:admin
   # Creates admin@gmail.com with password: test
   ```

3. **Check Session:**
   - Verify user is signed in
   - Check if session includes role information
   - Try signing out and back in

## 9.3 Performance Issues

### Slow Loading Times

#### Issue: "Application loads slowly"
**Symptoms:**
- Long page load times
- Slow API responses
- Delayed message updates

**Solutions:**
1. **Database Optimization:**
   - Check if database queries are efficient
   - Verify indexes are in place
   - Monitor query execution times

2. **Network Optimization:**
   - Check internet connection speed
   - Verify CDN (Cloudinary) is working
   - Look for large file transfers

3. **Client-side Optimization:**
   - Check for memory leaks in browser
   - Verify polling intervals aren't too aggressive
   - Look for unnecessary re-renders

### High Resource Usage

#### Issue: "High CPU or memory usage"
**Symptoms:**
- Browser becomes unresponsive
- High memory consumption
- Excessive network requests

**Solutions:**
1. **Optimize Polling:**
   - Increase polling intervals if needed
   - Stop polling when user is inactive
   - Implement proper cleanup in useEffect

2. **Memory Management:**
   - Check for memory leaks in React components
   - Verify event listeners are properly cleaned up
   - Monitor component re-renders

## 9.4 UI/UX Issues

### Layout and Styling Problems

#### Issue: "UI elements not displaying correctly"
**Symptoms:**
- Broken layouts on mobile
- Missing styles
- Overlapping elements

**Solutions:**
1. **Check Tailwind CSS:**
   - Verify Tailwind is properly configured
   - Check if custom styles are conflicting
   - Ensure responsive classes are applied

2. **Browser Compatibility:**
   - Test in different browsers
   - Check for CSS feature support
   - Verify JavaScript compatibility

#### Issue: "Modal dialogs not working"
**Symptoms:**
- Modals don't appear
- Background not clickable
- Confirmation dialogs broken

**Solutions:**
1. **Check Z-index:**
   - Ensure modals have high z-index (z-50)
   - Verify no other elements are overlapping
   - Check backdrop implementation

2. **Event Handling:**
   - Verify click handlers are attached
   - Check for event propagation issues
   - Ensure state management is correct

## 9.5 Development Environment Issues

### Build and Compilation Errors

#### Issue: "TypeScript compilation errors"
**Symptoms:**
- Build fails with type errors
- IDE showing red squiggles
- Runtime type mismatches

**Solutions:**
1. **Update Type Definitions:**
   - Check if all imports have proper types
   - Verify NextAuth types are extended correctly
   - Update @types packages if needed

2. **Fix Type Issues:**
   ```typescript
   // Common fixes
   interface User {
     id: string;
     email: string;
     name: string;
     role: 'admin' | 'user';
   }
   ```

#### Issue: "Module not found" errors
**Symptoms:**
- Import statements failing
- Path aliases not working
- Missing dependencies

**Solutions:**
1. **Check Path Aliases:**
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./*"]
       }
     }
   }
   ```

2. **Install Missing Dependencies:**
   ```bash
   npm install
   # or
   npm install missing-package
   ```

## 9.6 Production Issues

### Deployment Problems

#### Issue: "Application not starting in production"
**Symptoms:**
- Build succeeds but app won't start
- Environment variable issues
- Database connection failures

**Solutions:**
1. **Check Production Environment:**
   - Verify all environment variables are set
   - Ensure database is accessible from production
   - Check if ports are properly configured

2. **Build Verification:**
   ```bash
   npm run build
   npm start
   ```

#### Issue: "Features working in development but not production"
**Symptoms:**
- Authentication issues in production
- API endpoints returning errors
- Static files not loading

**Solutions:**
1. **Environment Configuration:**
   - Verify production environment variables
   - Check NEXTAUTH_URL is set correctly
   - Ensure AUTH_TRUST_HOST is configured

2. **Security Settings:**
   - Check CORS configuration
   - Verify HTTPS is properly configured
   - Ensure security headers are set

## 9.7 Getting Help

### Debug Information to Collect
When reporting issues, include:
- Browser console errors
- Network tab showing failed requests
- Server logs (if accessible)
- Environment configuration (without sensitive data)
- Steps to reproduce the issue

### Useful Commands for Debugging
```bash
# Check application logs
npm run dev

# Test database connection
curl -X GET http://localhost:8000/api/init

# Verify admin user exists
curl -X POST http://localhost:8000/api/seed-admin

# Check API endpoints
curl -X GET http://localhost:8000/api/chatrooms

# Run tests
npm test
```

### Common Log Locations
- Browser Console: F12 → Console tab
- Network Requests: F12 → Network tab
- Server Logs: Terminal running `npm run dev`
- Database Logs: Check Turso dashboard