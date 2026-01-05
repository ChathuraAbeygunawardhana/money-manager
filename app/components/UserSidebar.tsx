"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useChatrooms } from "@/lib/hooks/useChatrooms";
import { usePrefetch } from "@/lib/hooks/usePrefetch";
import { useUnreadCountWithSound } from "@/lib/hooks/useUnreadCountWithSound";


import { Button } from "./atoms";
import { NavigationItem, UserInfo, ConfirmationModal } from "./molecules";
import { Sidebar } from "./organisms";

interface UserSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserSidebar({ isOpen, onClose }: UserSidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const { data: chatrooms = [] } = useChatrooms();
  const { prefetchMessages } = usePrefetch();
  const { data: unreadCount = 0 } = useUnreadCountWithSound();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [openingChatId, setOpeningChatId] = useState<string | null>(null);

  // Reset opening state when navigation completes
  useEffect(() => {
    if (openingChatId && pathname === `/chat/${openingChatId}`) {
      setOpeningChatId(null);
    }
  }, [pathname, openingChatId]);

  if (!session || session.user.role === "admin") {
    return null;
  }

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + "/");

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ callbackUrl: "/auth/signin" });
  };

  const handleOpenChat = async (roomId: string) => {
    setOpeningChatId(roomId);
    onClose();
    // Prefetch messages immediately when user clicks
    prefetchMessages(roomId);
    // Navigate immediately without delay
    router.push(`/chat/${roomId}`);
  };

  const handleChatroomHover = (roomId: string) => {
    // Prefetch messages on hover for instant loading
    prefetchMessages(roomId);
  };

  // Filter to only show chatrooms the user is a member of
  const userChatrooms = chatrooms.filter(room => room.is_member);

  const sidebarFooter = (
    <>
      <UserInfo 
        name={session.user.name || ""} 
        email={session.user.email || ""} 
      />
      <Button
        variant="ghost"
        fullWidth
        onClick={() => setShowLogoutConfirm(true)}
        className="justify-start"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
        </svg>
        Sign Out
      </Button>
    </>
  );

  return (
    <>
      <Sidebar
        isOpen={isOpen}
        onClose={onClose}
        title="Your Chats"
        showOnDesktop={true}
        footer={sidebarFooter}
      >
        <nav className="px-4 py-6 space-y-2">
          {/* All Chatrooms Link */}
          <NavigationItem
            href="/chat"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>
            }
            isActive={pathname === "/chat"}
            onClick={onClose}
          >
            All Chatrooms
          </NavigationItem>

          {/* Inbox Link with Unread Count */}
          <Link
            href="/chat/inbox"
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
              isActive("/chat/inbox")
                ? "bg-gray-900 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <span className="flex-1">Inbox</span>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

          {/* People Link */}
          <NavigationItem
            href="/chat/people"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            }
            isActive={isActive("/chat/people")}
            onClick={onClose}
          >
            People
          </NavigationItem>

          {/* Settings Link */}
          <NavigationItem
            href="/chat/settings"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            }
            isActive={isActive("/chat/settings")}
            onClick={onClose}
          >
            Settings
          </NavigationItem>



          {/* Divider */}
          {userChatrooms.length > 0 && (
            <div className="px-4 py-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Your Chats</div>
            </div>
          )}

          {/* User's Chatrooms */}
          {userChatrooms.map((room) => (
            <button
              key={room.id}
              onClick={() => handleOpenChat(room.id)}
              onMouseEnter={() => handleChatroomHover(room.id)}
              disabled={openingChatId === room.id}
              className={`w-full flex items-start gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 cursor-pointer text-left ${
                isActive(`/chat/${room.id}`)
                  ? "bg-gray-900 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                isActive(`/chat/${room.id}`) ? "bg-white" : "bg-gray-400"
              }`} />
              <div className="flex-1 min-w-0">
                <div className={`font-medium truncate ${
                  isActive(`/chat/${room.id}`) ? "text-white" : "text-gray-900"
                }`}>
                  {openingChatId === room.id ? "Opening..." : room.name}
                </div>
                <div className={`text-xs truncate mt-1 ${
                  isActive(`/chat/${room.id}`) ? "text-gray-300" : "text-gray-500"
                }`}>
                  {room.description}
                </div>
              </div>
            </button>
          ))}

          {/* Empty State */}
          {userChatrooms.length === 0 && (
            <div className="px-4 py-8 text-center">
              <div className="text-gray-400 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500 mb-3">No chats yet</p>
              <Link
                href="/chat"
                onClick={onClose}
                className="text-sm text-gray-900 hover:underline cursor-pointer"
              >
                Browse chatrooms to join
              </Link>
            </div>
          )}
        </nav>
      </Sidebar>

      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Sign Out"
        message="Are you sure you want to sign out? You will need to sign in again to access your chats."
        confirmText={isLoggingOut ? "Signing Out..." : "Sign Out"}
        isLoading={isLoggingOut}
      />
    </>
  );
}