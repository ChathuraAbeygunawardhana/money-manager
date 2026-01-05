# 06 - Advanced Features

## 6.1 Image Upload System

### Cloudinary Integration
- **Cloud Storage**: Images stored on Cloudinary CDN
- **Automatic Optimization**: Images compressed and optimized
- **Multiple Formats**: Support for JPG, PNG, GIF
- **Responsive Delivery**: Automatic sizing for different devices
- **Secure Upload**: Direct upload with signed URLs

### Image Upload Features
- **Drag & Drop**: Intuitive file upload interface
- **File Validation**: Size and type checking (max 5MB)
- **Preview**: Image preview before sending
- **Progress Indicators**: Upload progress feedback
- **Error Handling**: User-friendly error messages

### Image Display
- **Thumbnails**: Optimized thumbnails in chat
- **Click to Expand**: Full-size image viewing
- **Lazy Loading**: Performance optimization
- **Responsive Design**: Adapts to screen size
- **Accessibility**: Alt text and keyboard navigation

### Configuration
```env
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 6.2 Sound Notifications

### Notification System
- **Audio Alerts**: Sound notifications for new direct messages
- **Smart Detection**: Only plays for messages from other users
- **Fallback Support**: Web Audio API beep if MP3 unavailable
- **Volume Control**: Set to 50% to avoid being jarring
- **Browser Compatibility**: Works across modern browsers

### Sound Features
- **Custom Sounds**: Replace `/public/notification.mp3` with custom sound
- **Autoplay Handling**: Respects browser autoplay policies
- **Error Recovery**: Graceful fallback if audio fails
- **Performance**: Minimal resource usage

### Technical Implementation
- **useNotificationSound Hook**: Manages audio playback
- **Dual Detection**: Triggers from conversation or unread count changes
- **User Filtering**: Prevents sound for self-sent messages
- **Initial Load Handling**: Skips sound on page load

### Audio Specifications
- **Duration**: 0.5-2 seconds recommended
- **Format**: MP3 for best compatibility
- **File Size**: Under 50KB
- **Volume**: Moderate level (not jarring)

## 6.3 Conversation Management

### Delete Conversations
- **Full Deletion**: Remove entire conversation history
- **Confirmation Modal**: Prevents accidental deletion
- **Bidirectional**: Deletes messages from both users
- **Immediate UI Update**: Conversation disappears instantly
- **Navigation Handling**: Returns to conversation list if current chat deleted

### Conversation Features
- **Unread Counts**: Visual indicators for new messages
- **Message Previews**: Last message preview in conversation list
- **User Status**: Online/offline indicators (future enhancement)
- **Search**: Find specific conversations (future enhancement)
- **Archive**: Hide conversations without deleting (future enhancement)

### Security & Privacy
- **User Scope**: Users can only delete their own conversations
- **No Admin Override**: Even admins cannot delete other users' conversations
- **Atomic Operations**: Ensures data consistency during deletion
- **Audit Trail**: Track deletion events (future enhancement)

## 6.4 Real-time Communication

### Current Implementation
- **Polling Strategy**: 2-second intervals for active chats
- **Efficient Queries**: Only fetch new messages since last update
- **Multiple Endpoints**: Separate polling for chatrooms and inbox
- **Performance Optimized**: Minimal bandwidth usage

### Polling Intervals
- **Active Chatroom**: 2 seconds
- **Inbox Conversations**: 30 seconds
- **Unread Counts**: 30 seconds
- **User Presence**: Not implemented (future enhancement)

### Future WebSocket Implementation
- **Real-time Messaging**: Instant message delivery
- **Typing Indicators**: Show when users are typing
- **Presence System**: Online/offline status
- **Push Notifications**: Mobile and desktop notifications
- **Connection Management**: Automatic reconnection handling

## 6.5 UI/UX Enhancements

### Design System
- **Modern Gradients**: Professional color schemes
- **Smooth Transitions**: Hover effects and animations
- **Responsive Layout**: Mobile-first design approach
- **Accessibility**: WCAG compliance and keyboard navigation
- **Loading States**: Visual feedback for all operations

### Interactive Elements
- **Cursor Styles**: Proper cursor indicators (`cursor-pointer`, `cursor-not-allowed`)
- **Modal Dialogs**: Custom modals with backdrop blur
- **Confirmation Dialogs**: Prevent accidental destructive actions
- **Icon Buttons**: Consistent edit/delete icons with tooltips
- **Form Validation**: Real-time input validation

### Component Conventions
- **Fixed Overlays**: `fixed inset-0` for full viewport coverage
- **Backdrop Effects**: `bg-gray-900/30 backdrop-blur-sm`
- **Centered Content**: `flex items-center justify-center`
- **High Z-index**: `z-50` for modals
- **Consistent Shadows**: `shadow-xl` for depth

## 6.6 Performance Optimizations

### Database Optimizations
- **Indexed Queries**: Proper indexing on frequently queried columns
- **Parameterized Queries**: Prevent SQL injection and improve performance
- **Connection Pooling**: Efficient database connection management
- **Query Optimization**: Minimize database round trips

### Frontend Optimizations
- **Code Splitting**: Lazy loading of components
- **Image Optimization**: Cloudinary automatic optimization
- **Caching Strategy**: Browser and CDN caching
- **Bundle Size**: Tree shaking and dead code elimination

### Real-time Optimizations
- **Efficient Polling**: Only poll when user is active
- **Debounced Updates**: Prevent excessive API calls
- **Client-side Caching**: Reduce redundant requests
- **Optimistic Updates**: Immediate UI feedback

## 6.7 Security Features

### Data Protection
- **Input Sanitization**: Prevent XSS attacks
- **SQL Injection Prevention**: Parameterized queries
- **CSRF Protection**: NextAuth built-in protection
- **Rate Limiting**: Prevent abuse and spam

### Authentication Security
- **Secure Sessions**: HTTPOnly cookies
- **Password Hashing**: bcrypt with salt rounds
- **Token Expiration**: Time-limited verification tokens
- **Role-based Access**: Granular permission system

### Privacy Features
- **Data Encryption**: Sensitive data encryption at rest
- **Secure Communication**: HTTPS enforcement
- **User Data Control**: Delete account and data
- **Privacy Settings**: Control message visibility (future enhancement)