"use client";

import { useEffect, useState, useRef, use, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useProgressiveMessages } from "@/lib/hooks/useProgressiveMessages";
import { useSendMessage } from "@/lib/hooks/useMessages";
import { useChatrooms } from "@/lib/hooks/useChatrooms";
import { useVisibilityChange } from "@/lib/hooks/useVisibilityChange";
import AnimatedMessage from "@/app/components/AnimatedMessage";
import MessageSkeleton from "@/app/components/MessageSkeleton";
import LoadingDots from "@/app/components/LoadingDots";
import ProfileModal from "@/app/components/ProfileModal";
import ImageUpload from "@/app/components/ImageUpload";
import MembersSidebar from "@/app/components/MembersSidebar";

export default function ChatroomPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Memoize the chatroom ID to prevent unnecessary re-renders
  const chatroomId = useMemo(() => resolvedParams.id, [resolvedParams.id]);
  
  const { 
    messages, 
    isLoading: messagesLoading, 
    hasMore, 
    isLoadingMore, 
    loadMore, 
    showAll,
    totalMessages,
    displayedCount 
  } = useProgressiveMessages(chatroomId, status === "authenticated");
  const sendMessageMutation = useSendMessage(chatroomId);
  
  // Get chatroom name from the chatrooms cache
  const { data: chatrooms = [] } = useChatrooms();
  const currentChatroom = useMemo(() => 
    chatrooms.find(room => room.id === chatroomId), 
    [chatrooms, chatroomId]
  );
  const [newMessage, setNewMessage] = useState("");
  const [showProfileModal, setShowProfileModal] = useState<{
    show: boolean;
    userId: string;
    userName: string;
  }>({
    show: false,
    userId: "",
    userName: "",
  });
  
  const [showMembersSidebar, setShowMembersSidebar] = useState(false);
  
  // Rate limiting state
  const [messageTimestamps, setMessageTimestamps] = useState<number[]>([]);
  const [rateLimitEndTime, setRateLimitEndTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Sync messages when user returns to tab
  useVisibilityChange(chatroomId);

  // Rate limiting logic
  const RATE_LIMIT_COUNT = 3;
  const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds

  // Update countdown timer
  useEffect(() => {
    if (!rateLimitEndTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, rateLimitEndTime - now);
      setTimeRemaining(Math.ceil(remaining / 1000));
      
      if (remaining <= 0) {
        setRateLimitEndTime(null);
        setTimeRemaining(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [rateLimitEndTime]);

  // Check if user is rate limited
  const isRateLimited = Boolean(rateLimitEndTime && Date.now() < rateLimitEndTime);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Memoize user ID to prevent unnecessary re-renders
  const currentUserId = useMemo(() => session?.user?.id, [session?.user?.id]);
  
  // Memoize messages with ownership info to prevent recalculation
  const messagesWithOwnership = useMemo(() => 
    messages.map((message: any) => ({
      ...message,
      isOwn: message.user_id === currentUserId
    })), [messages, currentUserId]
  );

  useEffect(() => {
    // Only auto-scroll if user is near the bottom or if it's a new message from current user
    const scrollContainer = messagesContainerRef.current;
    if (scrollContainer) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      
      if (isNearBottom || messages.length > 0) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages.length]); // Only scroll when message count changes

  // Auto-load more messages when user scrolls near bottom and show/hide scroll button
  useEffect(() => {
    const scrollContainer = messagesContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
      
      // Show scroll button when user is not near bottom
      setShowScrollButton(!isNearBottom && scrollHeight > clientHeight);
      
      if (isNearBottom && hasMore && !isLoadingMore) {
        loadMore();
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoadingMore, loadMore]);

  // Memoized callbacks to prevent unnecessary re-renders
  const sendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isRateLimited) return;

    const now = Date.now();
    
    // Clean old timestamps (older than 1 minute)
    const recentTimestamps = messageTimestamps.filter(
      timestamp => now - timestamp < RATE_LIMIT_WINDOW
    );

    // Check if user has reached the limit
    if (recentTimestamps.length >= RATE_LIMIT_COUNT) {
      // Set rate limit end time to 1 minute from the oldest recent message
      const oldestRecentMessage = Math.min(...recentTimestamps);
      const endTime = oldestRecentMessage + RATE_LIMIT_WINDOW;
      setRateLimitEndTime(endTime);
      setTimeRemaining(Math.ceil((endTime - now) / 1000));
      return;
    }

    try {
      await sendMessageMutation.mutateAsync({ 
        content: newMessage, 
        messageType: 'text' 
      });
      
      // Add current timestamp to the list
      const updatedTimestamps = [...recentTimestamps, now];
      setMessageTimestamps(updatedTimestamps);
      
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }, [newMessage, sendMessageMutation, isRateLimited, messageTimestamps, RATE_LIMIT_COUNT, RATE_LIMIT_WINDOW]);

  const sendImageMessage = useCallback(async (imageUrl: string) => {
    if (isRateLimited) return;

    const now = Date.now();
    
    // Clean old timestamps (older than 1 minute)
    const recentTimestamps = messageTimestamps.filter(
      timestamp => now - timestamp < RATE_LIMIT_WINDOW
    );

    // Check if user has reached the limit
    if (recentTimestamps.length >= RATE_LIMIT_COUNT) {
      // Set rate limit end time to 1 minute from the oldest recent message
      const oldestRecentMessage = Math.min(...recentTimestamps);
      const endTime = oldestRecentMessage + RATE_LIMIT_WINDOW;
      setRateLimitEndTime(endTime);
      setTimeRemaining(Math.ceil((endTime - now) / 1000));
      return;
    }

    try {
      await sendMessageMutation.mutateAsync({ 
        content: 'Image', 
        messageType: 'image', 
        imageUrl 
      });
      
      // Add current timestamp to the list
      const updatedTimestamps = [...recentTimestamps, now];
      setMessageTimestamps(updatedTimestamps);
    } catch (error) {
      console.error("Failed to send image:", error);
    }
  }, [sendMessageMutation, isRateLimited, messageTimestamps, RATE_LIMIT_COUNT, RATE_LIMIT_WINDOW]);

  const handleUserClick = useCallback((userId: string, userName: string) => {
    setShowProfileModal({ show: true, userId, userName });
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);



  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  const isAdmin = session?.user?.role === "admin";

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => router.push("/chat")}
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200 cursor-pointer shrink-0"
              title="Back to chatrooms"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight truncate">
              {currentChatroom?.name || "Chatroom"}
            </h1>
          </div>
          
          {/* Members Button */}
          <button
            onClick={() => setShowMembersSidebar(!showMembersSidebar)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
              showMembersSidebar 
                ? 'bg-gray-900 text-white' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            title="View members"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="hidden sm:inline text-sm font-medium">Members</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-6 py-6 relative">
            <div className="max-w-4xl mx-auto space-y-4">
              {messagesLoading ? (
                <MessageSkeleton count={3} />
              ) : (
                <>
                  {messagesWithOwnership.map((message, index) => (
                    <AnimatedMessage
                      key={message.id}
                      message={message}
                      isOwn={message.isOwn}
                      delay={Math.min(index * 30, 500)} // Stagger animation by 30ms per message, max 500ms
                      onUserClick={handleUserClick}
                    />
                  ))}
                  
                  {/* Show loading indicator when messages are still being displayed progressively */}
                  {hasMore && !isLoadingMore && displayedCount < totalMessages && (
                    <div className="flex justify-center py-2">
                      <LoadingDots />
                    </div>
                  )}
                  
                  {/* Progressive loading controls */}
                  {hasMore && (
                    <div className="flex flex-col items-center gap-3 py-4">
                      <div className="text-sm text-gray-500">
                        Showing {displayedCount} of {totalMessages} messages
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={loadMore}
                          disabled={isLoadingMore}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
                        >
                          {isLoadingMore ? "Loading..." : "Load More"}
                        </button>
                        <button
                          onClick={showAll}
                          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 cursor-pointer text-sm"
                        >
                          Show All
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {isLoadingMore && (
                    <MessageSkeleton count={2} />
                  )}
                </>
              )}
              
              {/* Scroll to Bottom Arrow */}
              {showScrollButton && (
                <div className="fixed bottom-24 right-6 z-10">
                  <button
                    onClick={scrollToBottom}
                    className="bg-gray-900 text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-all duration-200 cursor-pointer"
                    title="Scroll to bottom"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {!isAdmin && (
            <div className="bg-white border-t border-gray-200 px-6 py-4 shrink-0">
              {/* Rate limit warning */}
              {isRateLimited && (
                <div className="max-w-4xl mx-auto mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>
                      You've sent 3 messages. Please wait {timeRemaining} seconds before sending another message.
                    </span>
                  </div>
                </div>
              )}
              
              <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex gap-2 sm:gap-3">
                <div className="flex gap-2 shrink-0">
                  <ImageUpload 
                    onImageUploaded={sendImageMessage}
                    disabled={sendMessageMutation.isPending || isRateLimited}
                  />
                </div>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={isRateLimited ? "Rate limited - please wait..." : "Type a message..."}
                  disabled={isRateLimited}
                  className="flex-1 min-w-0 px-3 sm:px-4 py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={sendMessageMutation.isPending || !newMessage.trim() || isRateLimited}
                  className="px-3 sm:px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm sm:text-base shrink-0 whitespace-nowrap"
                >
                  {isRateLimited ? `Wait ${timeRemaining}s` : "Send"}
                </button>
              </form>
            </div>
          )}

          {isAdmin && (
            <div className="bg-white border-t border-gray-200 px-6 py-4 shrink-0">
              <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 text-gray-500 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Admins can view messages but cannot send messages</span>
              </div>
            </div>
          )}
        </div>

        {/* Members Sidebar */}
        <MembersSidebar
          chatroomId={chatroomId}
          isOpen={showMembersSidebar}
          onClose={() => setShowMembersSidebar(false)}
        />
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal.show}
        onClose={() => setShowProfileModal({ show: false, userId: "", userName: "" })}
        userId={showProfileModal.userId}
        userName={showProfileModal.userName}
      />

    </div>
  );
}
