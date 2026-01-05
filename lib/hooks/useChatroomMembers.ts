import { useQuery } from "@tanstack/react-query";

interface ChatroomMember {
  id: string;
  name: string;
  email: string;
  role: string;
  joined_at: string;
}

export function useChatroomMembers(chatroomId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["chatroom-members", chatroomId],
    queryFn: async (): Promise<ChatroomMember[]> => {
      const response = await fetch(`/api/chatrooms/${chatroomId}/members`);
      if (!response.ok) {
        throw new Error("Failed to fetch chatroom members");
      }
      const data = await response.json();
      return data.members;
    },
    enabled,
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}