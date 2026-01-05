import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export function usePrefetch() {
  const queryClient = useQueryClient();

  const prefetchChatrooms = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ["chatrooms"],
      queryFn: async () => {
        const response = await fetch("/api/chatrooms");
        if (!response.ok) throw new Error("Failed to fetch chatrooms");
        return response.json();
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  }, [queryClient]);

  const prefetchMessages = useCallback((chatroomId: string) => {
    queryClient.prefetchQuery({
      queryKey: ["messages", chatroomId],
      queryFn: async () => {
        const response = await fetch(`/api/messages/${chatroomId}`);
        if (!response.ok) throw new Error("Failed to fetch messages");
        return response.json();
      },
      staleTime: 0, // Always fresh for real-time
    });
  }, [queryClient]);

  const prefetchAnalytics = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ["analytics"],
      queryFn: async () => {
        const response = await fetch("/api/analytics");
        if (!response.ok) throw new Error("Failed to fetch analytics");
        return response.json();
      },
      staleTime: 1000 * 60 * 2, // 2 minutes
    });
  }, [queryClient]);

  const prefetchUsers = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ["users"],
      queryFn: async () => {
        const response = await fetch("/api/users");
        if (!response.ok) throw new Error("Failed to fetch users");
        return response.json();
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  }, [queryClient]);

  return {
    prefetchChatrooms,
    prefetchMessages,
    prefetchAnalytics,
    prefetchUsers,
  };
}