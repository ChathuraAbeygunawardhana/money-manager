import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useUnreadCount } from './useInbox';
import { useNotificationSound } from './useNotificationSound';

export function useUnreadCountWithSound() {
  const { data: session } = useSession();
  const unreadCountQuery = useUnreadCount();
  const { playNotificationSound } = useNotificationSound();
  const previousCountRef = useRef<number>(0);
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    if (typeof unreadCountQuery.data !== 'number' || !session?.user?.id) return;

    const currentCount = unreadCountQuery.data;

    // Don't play sound on initial load
    if (isInitialLoadRef.current) {
      previousCountRef.current = currentCount;
      isInitialLoadRef.current = false;
      return;
    }

    // Play sound if unread count increased (new messages received)
    if (currentCount > previousCountRef.current) {
      playNotificationSound();
    }

    previousCountRef.current = currentCount;
  }, [unreadCountQuery.data, session?.user?.id, playNotificationSound]);

  return unreadCountQuery;
}