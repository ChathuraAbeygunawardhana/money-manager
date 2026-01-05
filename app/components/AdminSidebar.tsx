"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

import { Button, IconButton } from "./atoms";
import { NavigationItem, UserInfo, ConfirmationModal } from "./molecules";
import { Sidebar } from "./organisms";
import { APP_CONFIG } from "@/lib/config";

export default function AdminSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!session || session.user.role !== "admin") {
    return null;
  }

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + "/");

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ callbackUrl: "/auth/signin" });
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  const navigationItems = [
    {
      href: "/chat",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
          <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
        </svg>
      ),
      label: "Chatrooms"
    },

    {
      href: "/admin/analytics",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
      ),
      label: "Analytics"
    },
    {
      href: "/admin/users",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      ),
      label: "Users"
    },
    {
      href: "/admin/reports",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
      label: "Problem Reports"
    },
    {
      href: "/admin/inbox-images",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      ),
      label: "Inbox Images"
    }
  ];

  const sidebarFooter = (
    <>
      <UserInfo 
        name={session.user.name || ""} 
        email={session.user.email || ""} 
        showAvatar={false}
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
      {/* Mobile Menu Button */}
      <IconButton
        variant="menu"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white rounded-lg border border-gray-200 shadow-lg hover:bg-gray-50"
        size="lg"
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        title={`${APP_CONFIG.name} Admin`}
        width="sm"
        footer={sidebarFooter}
      >
        <nav className="px-4 py-6 space-y-1">
          {navigationItems.map((item) => (
            <NavigationItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              isActive={isActive(item.href)}
              onClick={closeSidebar}
            >
              {item.label}
            </NavigationItem>
          ))}
        </nav>
      </Sidebar>

      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Sign Out"
        message="Are you sure you want to sign out? You will need to sign in again to access the admin dashboard."
        confirmText={isLoggingOut ? "Signing Out..." : "Sign Out"}
        isLoading={isLoggingOut}
      />
    </>
  );
}
