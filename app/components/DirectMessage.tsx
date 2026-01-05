"use client";

import { memo } from "react";
import ProfilePicture from "./ProfilePicture";

interface DirectMessageProps {
  message: {
    id: string;
    content: string;
    sender_id: string;
    recipient_id: string;
    read_at: number | null;
    created_at: number;
    sender_name: string;
    profile_picture?: string;
    message_type?: string;
    image_url?: string;
  };
  isOwn: boolean;
  onUserClick?: (userId: string, userName: string) => void;
}

const DirectMessage = memo(({ message, isOwn, onUserClick }: DirectMessageProps) => {
  const handleUserClick = () => {
    if (onUserClick && !isOwn) {
      onUserClick(message.sender_id, message.sender_name);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString();
  };

  return (
    <div className={`flex gap-3 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {!isOwn && (
        <button
          onClick={handleUserClick}
          className="shrink-0 cursor-pointer hover:opacity-80 transition-opacity duration-200"
          title="View profile"
        >
          <ProfilePicture 
            src={message.profile_picture} 
            name={message.sender_name} 
            size="sm"
          />
        </button>
      )}
      
      <div
        className={`max-w-[280px] sm:max-w-xs lg:max-w-md px-3 lg:px-4 py-2 rounded-lg ${
          isOwn
            ? 'bg-gray-900 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
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
              <p className="text-sm wrap-break-word">{message.content}</p>
            )}
          </div>
        ) : (
          <p className="text-sm wrap-break-word">{message.content}</p>
        )}
        <p className={`text-xs mt-1 ${
          isOwn ? 'text-gray-300' : 'text-gray-500'
        }`}>
          {formatTime(message.created_at)}
        </p>
      </div>
    </div>
  );
});

DirectMessage.displayName = "DirectMessage";

export default DirectMessage;