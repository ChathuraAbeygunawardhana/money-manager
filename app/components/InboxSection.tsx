"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useMessages, useSendDirectMessage, useDeleteConversation } from "@/lib/hooks/useInbox";
import { useConversationsWithSound } from "@/lib/hooks/useConversationsWithSound";
import { useUsers } from "@/lib/hooks/useUsers";
import ProfileModal from "./ProfileModal";
import ProfilePicture from "./ProfilePicture";
import DirectMessage from "./DirectMessage";
import ImageUpload from "./ImageUpload";

export default function InboxSection() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState<{
    show: boolean;
    userId: string;
    userName: string;
  }>({
    show: false,
    userId: "",
    userName: "",
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    userId: string;
    userName: string;
  }>({
    show: false,
    userId: "",
    userName: "",
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [], isLoading: conversationsLoading } = useConversationsWithSound();
  const { data: messages = [], isLoading: messagesLoading } = useMessages(selectedUserId);
  const { data: allUsers = [] } = useUsers();
  const sendMessage = useSendDirectMessage();
  const deleteConversation = useDeleteConversation();

  // Handle URL parameter for direct user selection
  useEffect(() => {
    const userParam = searchParams.get('user');
    if (userParam) {
      setSelectedUserId(userParam);
      setShowNewConversation(false);
    }
  }, [searchParams]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (!session) {
    return null;
  }

  const isAdmin = session.user.role === "admin";
  const selectedUser = allUsers.find(user => user.id === selectedUserId);
  const availableUsers = allUsers.filter(user => user.id !== session.user.id);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !newMessage.trim()) return;

    try {
      await sendMessage.mutateAsync({
        userId: selectedUserId,
        content: newMessage.trim(),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleSendImage = async (imageUrl: string) => {
    if (!selectedUserId) return;

    try {
      await sendMessage.mutateAsync({
        userId: selectedUserId,
        content: 'Image',
        messageType: 'image',
        imageUrl,
      });
    } catch (error) {
      console.error("Failed to send image:", error);
    }
  };

  const handleDeleteConversation = async () => {
    if (!deleteConfirm.userId) return;

    try {
      await deleteConversation.mutateAsync(deleteConfirm.userId);
      
      // Clear the selected user if we just deleted their conversation
      if (selectedUserId === deleteConfirm.userId) {
        setSelectedUserId(null);
      }
      
      // Close the confirmation modal
      setDeleteConfirm({ show: false, userId: "", userName: "" });
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString();
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Mobile Full-Screen Chat View */}
      {selectedUserId && (
        <div className="lg:hidden bg-white rounded-lg border border-gray-200 flex flex-col h-full overflow-hidden">
          {/* Mobile Chat Header with Back Button */}
          <div className="p-4 border-b border-gray-200 flex items-center gap-3 shrink-0">
            <button
              onClick={() => setSelectedUserId(null)}
              className="text-gray-600 hover:text-gray-900 cursor-pointer"
              title="Back to conversations"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1 min-w-0">
              <button
                onClick={() => selectedUser && setShowProfileModal({ 
                  show: true, 
                  userId: selectedUser.id, 
                  userName: selectedUser.name 
                })}
                className="text-left cursor-pointer hover:text-gray-700 transition-colors duration-200"
              >
                <h2 className="text-lg font-semibold text-gray-900 truncate">{selectedUser?.name}</h2>
                {isAdmin && <p className="text-sm text-gray-600 truncate">{selectedUser?.email}</p>}
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messagesLoading ? (
              <div className="text-center text-gray-500">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500">
                No messages yet. Send the first message!
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <DirectMessage
                    key={message.id}
                    message={message}
                    isOwn={message.sender_id === session.user.id}
                    onUserClick={(userId, userName) => setShowProfileModal({ 
                      show: true, 
                      userId, 
                      userName 
                    })}
                  />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Message Input */}
          <div className="p-3 sm:p-4 border-t border-gray-200 shrink-0">
            <form onSubmit={handleSendMessage} className="flex gap-2 sm:gap-3">
              <div className="flex gap-2 shrink-0">
                <ImageUpload 
                  onImageUploaded={handleSendImage}
                  disabled={sendMessage.isPending}
                />
              </div>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 min-w-0 px-3 sm:px-4 py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sendMessage.isPending}
                className="px-3 sm:px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200 text-sm sm:text-base shrink-0 whitespace-nowrap"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Fixed Header Section - Always visible and never scrolls */}
      <div className={`${selectedUserId ? 'hidden lg:block' : 'block'} shrink-0`}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Inbox</h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Send direct messages to other users</p>
          </div>
          <button
            onClick={() => setShowNewConversation(true)}
            className="bg-gray-900 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 cursor-pointer text-sm sm:text-base shrink-0"
          >
            New Message
          </button>
        </div>
      </div>

      {/* Content Area - Only this scrolls */}
      <div className={`${selectedUserId ? 'hidden lg:flex' : 'flex'} flex-1 overflow-hidden`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 w-full h-full">
          {/* Conversations Sidebar */}
          <div className="lg:col-span-1 bg-white rounded-lg border border-gray-200 flex flex-col h-64 sm:h-80 lg:h-full overflow-hidden">
            <div className="p-3 lg:p-4 border-b border-gray-200 shrink-0">
              <h2 className="text-base lg:text-lg font-semibold text-gray-900">Conversations</h2>
            </div>

            <div className="flex-1 overflow-y-auto">
              {conversationsLoading ? (
                <div className="p-4 text-center text-gray-500">Loading conversations...</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No conversations yet. Start a new conversation!
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`group relative flex items-center gap-3 p-3 lg:p-4 hover:bg-gray-50 transition-all duration-200 ${
                        selectedUserId === conversation.id ? 'bg-gray-100' : ''
                      }`}
                    >
                      <button
                        onClick={() => {
                          setSelectedUserId(conversation.id);
                          setShowNewConversation(false);
                        }}
                        className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer"
                      >
                        <ProfilePicture 
                          src={conversation.profile_picture} 
                          name={conversation.name} 
                          size="md"
                          className="shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">{conversation.name}</h3>
                            <span className="text-xs text-gray-500 shrink-0 ml-2">
                              {formatTime(conversation.last_message_time)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600 truncate flex-1 mr-2">
                              {conversation.last_sender_id === session.user.id ? 'You: ' : ''}
                              {conversation.last_message_content}
                            </p>
                            {conversation.unread_count > 0 && (
                              <span className="bg-gray-900 text-white text-xs px-2 py-1 rounded-full shrink-0">
                                {conversation.unread_count}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                      
                      {/* Delete Button - Always visible */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm({
                            show: true,
                            userId: conversation.id,
                            userName: conversation.name
                          });
                        }}
                        className="text-gray-600 hover:text-gray-900 cursor-pointer transition-all duration-200 p-1 shrink-0"
                        title="Delete conversation"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3,6 5,6 21,6" />
                          <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 flex flex-col h-64 sm:h-80 lg:h-full mt-4 lg:mt-0 overflow-hidden">
            {showNewConversation ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-3 lg:p-4 border-b border-gray-200 shrink-0">
                  <h2 className="text-base lg:text-lg font-semibold text-gray-900">Start New Conversation</h2>
                </div>
                <div className="flex-1 p-3 lg:p-4 overflow-y-auto">
                  {availableUsers.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                      No other users found.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {availableUsers.map((user) => {
                        const hasConversation = conversations.some(conv => conv.id === user.id);
                        return (
                          <button
                            key={user.id}
                            onClick={() => {
                              setSelectedUserId(user.id);
                              setShowNewConversation(false);
                            }}
                            className="w-full p-3 lg:p-4 text-left bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all duration-200 cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <ProfilePicture 
                                src={user.profile_picture} 
                                name={user.name} 
                                size="md"
                                className="shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <div className="min-w-0 flex-1">
                                    <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
                                    {isAdmin && <p className="text-sm text-gray-600 truncate">{user.email}</p>}
                                  </div>
                                  {hasConversation && (
                                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded shrink-0 ml-2">
                                      Existing chat
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : selectedUserId ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Chat Header */}
                <div className="p-3 lg:p-4 border-b border-gray-200 shrink-0">
                  <button
                    onClick={() => selectedUser && setShowProfileModal({ 
                      show: true, 
                      userId: selectedUser.id, 
                      userName: selectedUser.name 
                    })}
                    className="text-left cursor-pointer hover:text-gray-700 transition-colors duration-200"
                  >
                    <h2 className="text-base lg:text-lg font-semibold text-gray-900 truncate">{selectedUser?.name}</h2>
                    {isAdmin && <p className="text-xs lg:text-sm text-gray-600 truncate">{selectedUser?.email}</p>}
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-3 lg:space-y-4">
                  {messagesLoading ? (
                    <div className="text-center text-gray-500">Loading messages...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-gray-500">
                      No messages yet. Send the first message!
                    </div>
                  ) : (
                    <>
                      {messages.map((message) => (
                        <DirectMessage
                          key={message.id}
                          message={message}
                          isOwn={message.sender_id === session.user.id}
                          onUserClick={(userId, userName) => setShowProfileModal({ 
                            show: true, 
                            userId, 
                            userName 
                          })}
                        />
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-3 lg:p-4 border-t border-gray-200 shrink-0">
                  <form onSubmit={handleSendMessage} className="flex gap-2 lg:gap-4">
                    <div className="flex gap-2">
                      <ImageUpload 
                        onImageUploaded={handleSendImage}
                        disabled={sendMessage.isPending}
                      />
                    </div>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      autoComplete="off"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sendMessage.isPending}
                      className="px-4 lg:px-6 py-2 lg:py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200 text-sm lg:text-base shrink-0"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a conversation or start a new one
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal.show}
        onClose={() => setShowProfileModal({ show: false, userId: "", userName: "" })}
        userId={showProfileModal.userId}
        userName={showProfileModal.userName}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Delete Conversation</h2>
            <p className="text-gray-600 mb-8">
              Are you sure you want to delete your conversation with <span className="font-semibold text-gray-900">{deleteConfirm.userName}</span>? This action cannot be undone and will permanently delete all messages between you.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirm({ show: false, userId: "", userName: "" })}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-900 border border-gray-300 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConversation}
                disabled={deleteConversation.isPending}
                className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {deleteConversation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}