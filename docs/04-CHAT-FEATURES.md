# 04 - Chat Features

## 4.1 Chatroom Management

### Core Features
- Create new chatrooms with name and description
- View all available chatrooms
- Join any chatroom
- See who created each chatroom
- Admin auto-membership in all chatrooms

### Chatroom Creation
- Admin-only feature
- Requires name and description
- Automatic admin membership
- UUID-based chatroom IDs

### Joining Chatrooms
- Users can join any existing chatroom
- Membership tracked in `chatroom_members` table
- Only members can view messages
- Join timestamp recorded

## 4.2 Messaging System

### Text Messages
- Send text messages in chatrooms
- Real-time message updates (2-second polling)
- Message history preservation
- User identification (shows sender name)
- Timestamp for each message
- Different styling for own messages vs others
- Auto-scroll to latest message

### Image Messages
- Upload and send images in chatrooms
- Cloudinary integration for image storage
- Image thumbnails with click-to-expand
- Max file size: 5MB
- Supported formats: JPG, PNG, GIF
- Lazy loading for performance

### Message Types
- **Text Messages**: Standard text content
- **Image Messages**: Images with optional text caption
- Message type stored in database for proper rendering

## 4.3 Direct Messaging (Inbox)

### Core Features
- **Integrated Tab Interface**: Inbox accessible as tab in main chat interface
- **Private Conversations**: Send direct messages between users
- **Conversation List**: View all ongoing conversations with unread counts
- **Real-time Updates**: Messages update every 2 seconds, conversations every 30 seconds
- **Read Status**: Messages automatically marked as read when viewed
- **User Discovery**: Start new conversations with users not in inbox
- **Message History**: Full conversation history between users
- **Quick Access**: Send messages from users list with modal interface
- **Seamless Navigation**: Switch between chatrooms and inbox without losing context

### Inbox Features
- **Text Messages**: Standard direct messaging
- **Image Messages**: Send and receive images in direct messages
- **Conversation Management**: Delete entire conversations
- **Sound Notifications**: Audio alerts for new messages
- **Unread Counts**: Visual indicators for unread messages
- **User Status**: See online/offline status (future enhancement)

### Conversation Management
- View all conversations with message previews
- Unread message counts per conversation
- Delete conversations with confirmation modal
- Search conversations (future enhancement)
- Archive conversations (future enhancement)

## 4.4 Real-time Updates

### Polling Strategy
- **Chatroom Messages**: 2-second polling for active chatroom
- **Inbox Conversations**: 30-second polling for conversation list
- **Direct Messages**: 2-second polling for active conversation
- **Unread Counts**: 30-second polling for global unread count

### Performance Optimizations
- Only poll when user is active
- Efficient database queries with proper indexing
- Minimal data transfer (only new messages)
- Client-side caching of message history

### Future Enhancements
- WebSocket support for true real-time messaging
- Push notifications for mobile devices
- Typing indicators
- Message delivery status

## 4.5 Message Features

### Message Display
- **Sender Identification**: Name and timestamp for each message
- **Message Grouping**: Consecutive messages from same user grouped
- **Time Formatting**: Human-readable timestamps
- **Message Status**: Read/unread indicators for direct messages
- **Message Actions**: Edit, delete, reply (future enhancements)

### Image Handling
- **Upload Interface**: Drag-and-drop or click to upload
- **Preview**: Image preview before sending
- **Compression**: Automatic image optimization via Cloudinary
- **Display**: Responsive image display with click-to-expand
- **Loading States**: Progress indicators during upload

### Message Validation
- **Length Limits**: Maximum message length enforcement
- **Content Filtering**: Basic profanity filtering (future enhancement)
- **Spam Prevention**: Rate limiting for message sending
- **File Validation**: Image type and size validation

## 4.6 User Interface

### Chat Interface
- **Clean Design**: Modern, professional appearance
- **Responsive Layout**: Works on desktop and mobile
- **Smooth Transitions**: Hover effects and animations
- **Accessibility**: Keyboard navigation and screen reader support
- **Dark Mode**: Theme switching (future enhancement)

### Navigation
- **Tab Interface**: Easy switching between chatrooms and inbox
- **Breadcrumbs**: Clear navigation hierarchy
- **Back Buttons**: Easy navigation between views
- **Search**: Find messages and conversations (future enhancement)

### Interactive Elements
- **Cursor Styles**: Proper cursor indicators for all interactive elements
- **Loading States**: Visual feedback during operations
- **Error Handling**: User-friendly error messages
- **Confirmation Dialogs**: Custom modals for destructive actions