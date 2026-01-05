import { useQuery } from "@tanstack/react-query";

interface Analytics {
  overview: {
    totalUsers: number;
    totalChatrooms: number;
    totalMessages: number;
    activeUsers: number;
    usersWithMemberships: number;
    recentUsers: number;
  };
  roleStats: Array<{ role: string; count: number }>;
  topUsers: Array<{ name: string; email: string; messageCount: number }>;
  chatroomStats: Array<{ name: string; memberCount: number; messageCount: number }>;
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: number;
    chatroomCount: number;
    messageCount: number;
  }>;
}

export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const response = await fetch("/api/analytics");
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }
      return response.json() as Promise<Analytics>;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
