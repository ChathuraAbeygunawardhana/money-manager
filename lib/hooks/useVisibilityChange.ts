import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useVisibilityChange(chatroomId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // User returned to tab - immediately sync messages
        queryClient.invalidateQueries({ 
          queryKey: ["messages", chatroomId],
          refetchType: "active" 
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [queryClient, chatroomId]);
}