"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useUsers } from "@/lib/hooks/useUsers";
import { useSendDirectMessage } from "@/lib/hooks/useInbox";
import ProfilePicture from "./ProfilePicture";

export default function UsersList() {
  const { data: session } = useSession();
  const { data: users = [], isLoading } = useUsers();
  const router = useRouter();
  const sendMessage = useSendDirectMessage();
  
  const [showMessageModal, setShowMessageModal] = useState<{
    show: boolean;
    userId: string;
    userName: string;
  }>({
    show: false,
    userId: "",
    userName: "",
  });
  const [messageContent, setMessageContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Filter out current user from the list
  const otherUsers = users.filter(user => user.id !== session?.user?.id);
  
  // Debug: Log users data to see if profile_picture is included
  console.log('Users data:', otherUsers);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim() || !showMessageModal.userId) return;

    setIsSending(true);
    try {
      await sendMessage.mutateAsync({
        userId: showMessageModal.userId,
        content: messageContent.trim(),
      });
      
      // Close modal and redirect to inbox
      setShowMessageModal({ show: false, userId: "", userName: "" });
      setMessageContent("");
      router.push("/chat/inbox");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleStartConversation = (userId: string, userName: string) => {
    setShowMessageModal({ show: true, userId, userName });
  };

  const handleGoToInbox = (userId: string) => {
    router.push(`/chat/inbox?user=${userId}`);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 tracking-tight">Users</h2>
        <div className="text-gray-600 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 tracking-tight">Users</h2>
        <div className="space-y-3">
          {otherUsers.map((user) => (
            <div key={user.id} className="flex items-center gap-3 py-2 group">
              <ProfilePicture 
                src={user.profile_picture} 
                name={user.name} 
                size="md"
                className="shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{user.name}</div>
                <div className="text-xs text-gray-500 truncate">{user.email}</div>
              </div>
              <div className="flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => handleGoToInbox(user.id)}
                  className="text-gray-600 hover:text-gray-900 cursor-pointer"
                  title="View conversation"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleStartConversation(user.id, user.name)}
                  className="text-gray-600 hover:text-gray-900 cursor-pointer"
                  title="Send message"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
        {otherUsers.length === 0 && (
          <div className="text-center py-8 text-gray-600 text-sm">No other users found</div>
        )}
      </div>

      {/* Send Message Modal */}
      {showMessageModal.show && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">
              Send Message to {showMessageModal.userName}
            </h2>
            <form onSubmit={handleSendMessage}>
              <div className="mb-6">
                <textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Type your message..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                  required
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowMessageModal({ show: false, userId: "", userName: "" });
                    setMessageContent("");
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-900 border border-gray-300 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!messageContent.trim() || isSending}
                  className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200"
                >
                  {isSending ? "Sending..." : "Send"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}