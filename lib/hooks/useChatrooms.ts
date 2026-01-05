import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface Chatroom {
  id: string;
  name: string;
  description: string;
  creator_name: string;
  is_member: number;
  message_count: number;
}

interface CreateChatroomData {
  name: string;
  description: string;
}

export function useChatrooms() {
  return useQuery({
    queryKey: ["chatrooms"],
    queryFn: async () => {
      const response = await fetch("/api/chatrooms");
      if (!response.ok) {
        throw new Error("Failed to fetch chatrooms");
      }
      return response.json() as Promise<Chatroom[]>;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes - chatrooms don't change frequently
    gcTime: 1000 * 60 * 30, // 30 minutes - keep in cache longer
    refetchOnWindowFocus: false, // Don't refetch when returning to tab
    refetchOnMount: false, // Don't refetch when component remounts if data is fresh
  });
}

export function useCreateChatroom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateChatroomData) => {
      const response = await fetch("/api/chatrooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create chatroom");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatrooms"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useJoinChatroom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chatroomId: string) => {
      const response = await fetch(`/api/chatrooms/${chatroomId}/join`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to join chatroom");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatrooms"] });
    },
  });
}

export function useUpdateChatroom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chatroomId, data }: { chatroomId: string; data: { name: string; description: string } }) => {
      const response = await fetch(`/api/chatrooms/${chatroomId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update chatroom");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatrooms"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useDeleteChatroom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chatroomId: string) => {
      const response = await fetch(`/api/chatrooms/${chatroomId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete chatroom");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatrooms"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useChatroom(chatroomId: string, enabled = true) {
  return useQuery({
    queryKey: ["chatroom", chatroomId],
    queryFn: async () => {
      const response = await fetch(`/api/chatrooms/${chatroomId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch chatroom");
      }
      return response.json() as Promise<Chatroom>;
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
