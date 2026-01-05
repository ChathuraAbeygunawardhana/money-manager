"use client";

import { memo, useEffect, useState } from "react";
import ProfilePicture from "./ProfilePicture";

interface MessageWithOwnership {
  id: string;
  content: string;
  user_name: string;
  user_id: string;
  created_at: number;
  isOwn: boolean;
  message_type?: 'text' | 'image';
  image_url?: string;
  profile_picture?: string;
}

interface AnimatedMessageProps {
  message: MessageWithOwnership;
  isOwn: boolean;
  delay?: number;
  onUserClick?: (userId: string, userName: string) => void;
}

const AnimatedMessage = memo(({ message, isOwn, delay = 0, onUserClick }: AnimatedMessageProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const handleUserClick = () => {
    if (onUserClick && !isOwn) {
      onUserClick(message.user_id, message.user_name);
    }
  };

  return (
    <div 
      className={`flex ${isOwn ? "justify-end" : "justify-start"} gap-3 transition-all duration-300 ease-out transform ${
        isVisible 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-2"
      }`}
    >
      {!isOwn && (
        <button
          onClick={handleUserClick}
          className="shrink-0 cursor-pointer hover:opacity-80 transition-opacity duration-200"
          title="View profile"
        >
          <ProfilePicture 
            src={message.profile_picture} 
            name={message.user_name} 
            size="sm"
          />
        </button>
      )}
      
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg transition-all duration-200 ${
          isOwn
            ? "bg-gray-900 text-white"
            : "bg-white text-gray-900 border border-gray-200"
        }`}
      >
        {!isOwn && (
          <button
            onClick={handleUserClick}
            className="text-xs font-medium mb-2 text-gray-500 hover:text-gray-700 transition-colors duration-200 cursor-pointer"
            title="View profile"
          >
            {message.user_name}
          </button>
        )}
        {message.message_type === 'image' && message.image_url ? (
          <div className="space-y-2">
            <img 
              src={message.image_url} 
              alt="Shared image" 
              className="max-w-48 max-h-48 w-auto h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity duration-200 object-cover"
              onClick={() => window.open(message.image_url, '_blank')}
              loading="lazy"
            />
            {message.content !== 'Image' && (
              <p className="wrap-break-word leading-relaxed text-sm">{message.content}</p>
            )}
          </div>
        ) : (
          <p className="wrap-break-word leading-relaxed">{message.content}</p>
        )}
        <p
          className={`text-xs mt-2 ${
            isOwn ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {new Date(message.created_at * 1000).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
});

AnimatedMessage.displayName = "AnimatedMessage";

export default AnimatedMessage;