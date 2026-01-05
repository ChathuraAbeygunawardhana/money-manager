import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface Message {
  id: string;
  content: string;
  user_name: string;
  user_id: string;
  created_at: number;
  message_type?: 'text' | 'image';
  image_url?: string;
}

export function useMessages(chatroomId: string, enabled = true) {
  return useQuery({
    queryKey: ["messages", chatroomId],
    queryFn: async () => {
      const response = await fetch(`/api/messages/${chatroomId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      return response.json() as Promise<Message[]>;
    },
    enabled,
    refetchInterval: (query) => {
      const data = query.state.data as Message[] | undefined;
      
      // Don't poll if query is disabled or there's an error
      if (!enabled || query.state.error) return false;
      
      // Smart polling: slower when no recent activity
      if (!data || data.length === 0) return 5000; // 5 seconds if no messages
      
      const lastMessage = data[data.length - 1];
      const lastMessageTime = lastMessage.created_at * 1000;
      const timeSinceLastMessage = Date.now() - lastMessageTime;
      
      // More frequent polling for active chats
      if (timeSinceLastMessage < 60000) return 1500; // 1.5 seconds if recent activity
      if (timeSinceLastMessage < 300000) return 4000; // 4 seconds if moderately recent
      return 8000; // 8 seconds for older chats
    },
    staleTime: 0, // Always consider stale for real-time updates
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchIntervalInBackground: false, // Don't poll when tab is not active
    networkMode: "online", // Only fetch when online
  });
}

export function useSendMessage(chatroomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, messageType = 'text', imageUrl }: { 
      content: string; 
      messageType?: 'text' | 'image'; 
      imageUrl?: string; 
    }) => {
      const response = await fetch(`/api/messages/${chatroomId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content, 
          message_type: messageType,
          image_url: imageUrl 
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      return response.json();
    },
    // Optimistic update for better UX
    onMutate: async ({ content, messageType = 'text', imageUrl }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["messages", chatroomId] });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData<Message[]>(["messages", chatroomId]);

      // Get current user data from session cache
      const sessionData = queryClient.getQueryData(["session"]) as any;
      const currentUser = sessionData?.user;

      // Optimistically update to the new value
      if (previousMessages) {
        const optimisticMessage: Message = {
          id: `temp-${Date.now()}`,
          content,
          user_name: currentUser?.name || "You",
          user_id: currentUser?.id || "current-user",
          created_at: Math.floor(Date.now() / 1000),
          message_type: messageType,
          image_url: imageUrl,
        };

        queryClient.setQueryData<Message[]>(
          ["messages", chatroomId],
          [...previousMessages, optimisticMessage]
        );
      }

      // Return a context object with the snapshotted value
      return { previousMessages };
    },
    onError: (_err, _content, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousMessages) {
        queryClient.setQueryData(["messages", chatroomId], context.previousMessages);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ["messages", chatroomId] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useClearMessages(chatroomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/messages/${chatroomId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to clear messages");
      }

      return response.json();
    },
    onSuccess: () => {
      // Clear the messages cache and refetch
      queryClient.setQueryData<Message[]>(["messages", chatroomId], []);
      queryClient.invalidateQueries({ queryKey: ["messages", chatroomId] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}
