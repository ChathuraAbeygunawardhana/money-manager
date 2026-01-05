import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: session, status } = useSession();
  
  return {
    user: session?.user,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    isAdmin: session?.user?.role === "admin",
    session,
    status,
  };
}

// Hook for getting current user profile with React Query caching
export function useCurrentUser() {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const response = await fetch("/api/auth/me");
      if (!response.ok) {
        throw new Error("Failed to fetch current user");
      }
      return response.json();
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}