import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useConversations } from './useInbox';
import { useNotificationSound } from './useNotificationSound';

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

export function useConversationsWithSound() {
  const { data: session } = useSession();
  const conversationsQuery = useConversations();
  const { playNotificationSound } = useNotificationSound();
  const previousUnreadCountRef = useRef<number>(0);
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    if (!conversationsQuery.data || !session?.user?.id) return;

    const conversations: Conversation[] = conversationsQuery.data;
    const currentTotalUnread = conversations.reduce((total, conv) => total + conv.unread_count, 0);

    // Don't play sound on initial load or if no unread messages
    if (isInitialLoadRef.current) {
      previousUnreadCountRef.current = currentTotalUnread;
      isInitialLoadRef.current = false;
      return;
    }

    // Check if there are new unread messages (increase in unread count)
    if (currentTotalUnread > previousUnreadCountRef.current) {
      // Check if any of the new messages are from other users (not sent by current user)
      const hasNewMessagesFromOthers = conversations.some(conv => 
        conv.unread_count > 0 && conv.last_sender_id !== session.user.id
      );

      if (hasNewMessagesFromOthers) {
        playNotificationSound();
      }
    }

    previousUnreadCountRef.current = currentTotalUnread;
  }, [conversationsQuery.data, session?.user?.id, playNotificationSound]);

  return conversationsQuery;
}