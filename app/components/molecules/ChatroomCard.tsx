"use client";

import Card from "../atoms/Card";
import Button from "../atoms/Button";
import IconButton from "../atoms/IconButton";

export interface ChatroomCardProps {
  id: string;
  name: string;
  description: string;
  creatorName: string;
  isMember: boolean;
  isAdmin?: boolean;
  isOpening?: boolean;
  messageCount?: number;
  onJoin: (id: string) => void;
  onOpen: (id: string) => void;
  onEdit?: (room: { id: string; name: string; description: string }) => void;
  onDelete?: (id: string, name: string) => void;
  onClear?: (id: string, name: string) => void;
  onHover?: (id: string) => void;
}

export default function ChatroomCard({
  id,
  name,
  description,
  creatorName,
  isMember,
  isAdmin = false,
  isOpening = false,
  messageCount = 0,
  onJoin,
  onOpen,
  onEdit,
  onDelete,
  onClear,
  onHover
}: ChatroomCardProps) {
  return (
    <div onMouseEnter={() => isMember && onHover?.(id)}>
      <Card className="h-full">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-semibold text-gray-900 tracking-tight">{name}</h3>
        {isAdmin && (
          <div className="flex gap-2">
            <IconButton
              variant="clear"
              onClick={() => onClear?.(id, name)}
              title="Clear all messages"
            />
            <IconButton
              variant="edit"
              onClick={() => onEdit?.({ id, name, description })}
              title="Edit chatroom"
            />
            <IconButton
              variant="delete"
              onClick={() => onDelete?.(id, name)}
              title="Delete chatroom"
            />
          </div>
        )}
      </div>
      <p className="text-gray-600 text-sm mb-4 leading-relaxed">{description}</p>
      {isAdmin && (
        <div className="flex items-center gap-2 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-xs text-gray-500">
            {messageCount} {messageCount === 1 ? 'message' : 'messages'}
          </span>
        </div>
      )}
      {isAdmin && <p className="text-xs text-gray-500 mb-6">Created by {creatorName}</p>}
      {isMember ? (
        <Button
          onClick={() => onOpen(id)}
          disabled={isOpening}
          loading={isOpening}
          fullWidth
        >
          {isOpening ? "Opening chat..." : "Open Chat"}
        </Button>
      ) : (
        <Button
          variant="secondary"
          onClick={() => onJoin(id)}
          fullWidth
        >
          Join Room
        </Button>
      )}
      </Card>
    </div>
  );
}