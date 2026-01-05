import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Message {
  id: string;
  content: string;
  user_name: string;
  user_id: string;
  created_at: number;
}

interface ProgressiveMessagesState {
  allMessages: Message[];
  displayedMessages: Message[];
  isLoadingMore: boolean;
  hasMore: boolean;
}

const BATCH_SIZE = 15; // Load 15 messages at a time
const DISPLAY_DELAY = 80; // Delay between showing each message (ms)
const INITIAL_DISPLAY_COUNT = 10; // Show first 10 messages immediately

export function useProgressiveMessages(chatroomId: string, enabled = true) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<ProgressiveMessagesState>({
    allMessages: [],
    displayedMessages: [],
    isLoadingMore: false,
    hasMore: true,
  });
  const [displayIndex, setDisplayIndex] = useState(0);

  // Fetch all messages initially
  const { data: messages = [], isLoading, error } = useQuery({
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
      
      if (!enabled || query.state.error) return false;
      
      if (!data || data.length === 0) return 5000;
      
      const lastMessage = data[data.length - 1];
      const lastMessageTime = lastMessage.created_at * 1000;
      const timeSinceLastMessage = Date.now() - lastMessageTime;
      
      if (timeSinceLastMessage < 60000) return 1500;
      if (timeSinceLastMessage < 300000) return 4000;
      return 8000;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
    networkMode: "online",
  });

  // Progressive display effect
  useEffect(() => {
    if (!messages.length) {
      setState(prev => {
        // Only update if we actually have messages to clear
        if (prev.allMessages.length > 0) {
          return {
            ...prev,
            allMessages: [],
            displayedMessages: [],
            hasMore: false,
          };
        }
        return prev;
      });
      setDisplayIndex(0);
      return;
    }

    // Check if we have new messages by comparing message IDs
    setState(prev => {
      const currentMessageIds = prev.allMessages.map(m => m.id).join(',');
      const newMessageIds = messages.map(m => m.id).join(',');
      const hasNewMessages = currentMessageIds !== newMessageIds;

      if (hasNewMessages) {
        // Show initial batch immediately for better UX
        const initialCount = Math.min(INITIAL_DISPLAY_COUNT, messages.length);
        
        // Update display index in the same effect cycle
        setDisplayIndex(initialCount);
        
        return {
          ...prev,
          allMessages: messages,
          displayedMessages: messages.slice(0, initialCount),
          hasMore: messages.length > initialCount,
        };
      }
      
      return prev;
    });
  }, [messages]);

  // Progressive display timer
  useEffect(() => {
    if (displayIndex >= state.allMessages.length) return;

    const timer = setTimeout(() => {
      setState(prev => ({
        ...prev,
        displayedMessages: prev.allMessages.slice(0, displayIndex + 1),
        hasMore: displayIndex + 1 < prev.allMessages.length,
      }));
      setDisplayIndex(prev => prev + 1);
    }, DISPLAY_DELAY);

    return () => clearTimeout(timer);
  }, [displayIndex, state.allMessages.length]);

  // Load more messages instantly (for user interaction)
  const loadMore = useCallback(() => {
    if (state.hasMore && !state.isLoadingMore) {
      setState(prev => {
        const nextBatchEnd = Math.min(
          prev.displayedMessages.length + BATCH_SIZE,
          prev.allMessages.length
        );

        return {
          ...prev,
          displayedMessages: prev.allMessages.slice(0, nextBatchEnd),
          hasMore: nextBatchEnd < prev.allMessages.length,
          isLoadingMore: false,
        };
      });

      // Update display index after state update
      const nextBatchEnd = Math.min(
        state.displayedMessages.length + BATCH_SIZE,
        state.allMessages.length
      );
      setDisplayIndex(nextBatchEnd);
    }
  }, [state.hasMore, state.isLoadingMore, state.displayedMessages.length, state.allMessages.length]);

  // Skip progressive loading and show all messages
  const showAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      displayedMessages: prev.allMessages,
      hasMore: false,
      isLoadingMore: false,
    }));
    setDisplayIndex(state.allMessages.length);
  }, [state.allMessages]);

  return {
    messages: state.displayedMessages,
    isLoading,
    error,
    hasMore: state.hasMore,
    isLoadingMore: state.isLoadingMore,
    loadMore,
    showAll,
    totalMessages: state.allMessages.length,
    displayedCount: state.displayedMessages.length,
  };
}