# 05 - Admin Features

## 5.1 Admin Dashboard

### Analytics Overview
Access the analytics dashboard at `/analytics` (admin only).

#### Overview Statistics
- **Total Users**: Count of all registered users
- **Active Users**: Users who have sent at least one message
- **New Users**: Users registered in the last 7 days
- **Total Chatrooms**: Count of all chatrooms
- **Total Messages**: Count of all messages across all chatrooms
- **Users with Memberships**: Users who have joined at least one chatroom

#### Role Distribution
- Breakdown of users by role (admin/user)
- Visual representation of admin vs user ratio

#### Most Active Users
- Top 10 users by message count
- Shows name, email, and total message count
- Helps identify most engaged community members

#### Chatroom Statistics
- Member count per chatroom
- Message count per chatroom
- Identifies most popular chatrooms

#### User Details Table
- Complete list of all users
- Shows name, email, role, join date
- Chatroom participation count per user
- Message count per user
- Sortable columns for easy analysis

### Access Control
- Analytics page is admin-only
- Protected API endpoint with role verification
- Automatic redirect for non-admin users
- Analytics link visible in navigation for admins only

## 5.2 User Management

### User Management Interface
Access user management at `/users` (admin only).

#### Features
- **View All Users**: Table format with all user information
- **Create New Users**: Form to add users with email, password, name, and role
- **Edit Users**: Update any user field including role changes
- **Delete Users**: Remove users from system (except self-deletion)
- **Visual Role Badges**: Clear Admin/User role indicators
- **Responsive Design**: Works on all screen sizes

#### User Operations

##### Create User
- Required fields: email, password, name
- Optional field: role (defaults to "user")
- Email uniqueness validation
- Password automatically hashed
- Immediate addition to user list

##### Edit User
- Update any field: email, password, name, role
- Password changes are properly hashed
- Email uniqueness maintained
- Role changes take effect immediately

##### Delete User
- Confirmation modal prevents accidental deletion
- Cannot delete your own account
- Removes user and all associated data
- Cascading deletion of user's messages and memberships

### Security Features
- All endpoints require authentication
- Admin role verification (403 for non-admins)
- Self-deletion prevention
- Input validation and sanitization
- Secure password handling

## 5.3 Chatroom Management

### Admin Privileges
- **Auto-membership**: Admins automatically join all chatrooms
- **Create Chatrooms**: Only admins can create new chatrooms
- **View All Messages**: Access to all chatroom messages
- **Moderate Content**: Edit/delete messages (future enhancement)

### Chatroom Creation
- Admin-only "Create Chatroom" button
- Required fields: name and description
- Automatic admin membership upon creation
- All existing admins added to new chatrooms

### Admin Auto-join
- New admins automatically added to all existing chatrooms
- Existing chatrooms get all admins as members
- Ensures admins have oversight of all conversations

## 5.4 System Administration

### Database Management
- **Migration Scripts**: Handle database schema updates
- **Seeding Scripts**: Create default admin users
- **Backup Tools**: Database backup and restore (future enhancement)
- **Performance Monitoring**: Query optimization and indexing

### User Role Management
- **Role Assignment**: Change user roles through UI
- **Bulk Operations**: Mass role changes (future enhancement)
- **Permission Management**: Fine-grained permissions (future enhancement)
- **Audit Logging**: Track admin actions (future enhancement)

### System Monitoring
- **Error Logging**: Track system errors and issues
- **Performance Metrics**: Monitor response times and usage
- **Security Monitoring**: Track failed login attempts
- **Usage Analytics**: Understand user behavior patterns

## 5.5 Content Moderation

### Current Features
- **Message Visibility**: Admins can see all messages
- **User Management**: Remove problematic users
- **Chatroom Oversight**: Monitor all chatroom activity

### Future Enhancements
- **Message Moderation**: Edit or delete inappropriate messages
- **Content Filtering**: Automatic profanity and spam detection
- **User Reporting**: Allow users to report inappropriate content
- **Moderation Queue**: Review flagged content before action
- **Moderation Logs**: Track all moderation actions

## 5.6 Admin Navigation

### Navigation Elements
- **Analytics Link**: Access to dashboard and statistics
- **Users Link**: User management interface
- **Admin Badge**: Visual indicator of admin status
- **Create Chatroom**: Button visible only to admins

### Admin-only Pages
- `/analytics` - Analytics dashboard
- `/users` - User management
- `/admin` - Future admin control panel

### Security
- Automatic redirect for non-admin access attempts
- Role-based UI rendering
- Protected API endpoints
- Session-based authorization