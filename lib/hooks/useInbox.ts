import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface DirectMessage {
  id: string;
  content: string;
  sender_id: string;
  recipient_id: string;
  read_at: number | null;
  created_at: number;
  sender_name: string;
  profile_picture?: string;
  message_type?: string;
  image_url?: string;
}

interface Conversation {
  id: string;
  name: string;
  email: string;
  profile_picture?: string;
  last_message_time: number;
  last_message_content: string;
  last_sender_id: string;
  unread_count: number;
}

// Hook for fetching all conversations
export function useConversations() {
  return useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await fetch("/api/inbox");
      if (!res.ok) throw new Error("Failed to fetch conversations");
      return res.json();
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 30, // Refetch every 30 seconds for new messages
  });
}

// Hook for fetching messages with a specific user
export function useMessages(userId: string | null) {
  const queryClient = useQueryClient();
  
  return useQuery<DirectMessage[]>({
    queryKey: ["messages", userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await fetch(`/api/inbox/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      const messages = await res.json();
      
      // Invalidate conversations and unread count to update UI immediately
      // This ensures unread counts are updated when messages are viewed
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
      
      return messages;
    },
    enabled: !!userId,
    staleTime: 1000 * 10, // 10 seconds
    refetchInterval: 1000 * 2, // Refetch every 2 seconds for real-time feel
  });
}

// Hook for sending a message
export function useSendDirectMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      content, 
      messageType = 'text', 
      imageUrl 
    }: { 
      userId: string; 
      content: string; 
      messageType?: string; 
      imageUrl?: string; 
    }) => {
      const res = await fetch(`/api/inbox/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, messageType, imageUrl }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to send message");
      }

      return res.json();
    },
    onSuccess: (_, { userId }) => {
      // Invalidate conversations, messages, and unread count for real-time updates
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["messages", userId] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });
}

// Hook for getting total unread message count
export function useUnreadCount() {
  return useQuery<number>({
    queryKey: ["unreadCount"],
    queryFn: async () => {
      const res = await fetch("/api/inbox");
      if (!res.ok) return 0;
      const conversations: Conversation[] = await res.json();
      return conversations.reduce((total, conv) => total + conv.unread_count, 0);
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
  });
}

// Hook for deleting a conversation
export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/inbox/${userId}/delete`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete conversation");
      }

      return res.json();
    },
    onSuccess: () => {
      // Invalidate all inbox-related queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });
}