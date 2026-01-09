"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";

type NotificationType = "success" | "error" | "info";

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const showNotification = useCallback((message: string, type: NotificationType = "success") => {
    if (!isClient) return;
    
    const id = `notification-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    setNotifications((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {isClient && (
        <div className="fixed top-0 left-0 right-0 z-100 flex flex-col items-center pt-4 pointer-events-none">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`mb-2 px-6 py-3 rounded-lg shadow-lg pointer-events-auto animate-slide-down ${
                notification.type === "success"
                  ? "bg-green-600 text-white"
                  : notification.type === "error"
                  ? "bg-red-600 text-white"
                  : "bg-gray-600 text-white"
              }`}
              style={{
                animation: "slideDown 0.3s ease-out",
              }}
            >
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
          ))}
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
}
