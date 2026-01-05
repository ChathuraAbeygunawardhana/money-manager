"use client";

import { memo } from "react";

interface MessageSkeletonProps {
  isOwn?: boolean;
  count?: number;
}

const MessageSkeleton = memo(({ isOwn = false, count = 1 }: MessageSkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={`flex ${isOwn ? "justify-end" : "justify-start"} animate-pulse`}>
          <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-lg bg-gray-200">
            {!isOwn && (
              <div className="h-3 bg-gray-300 rounded w-20 mb-2"></div>
            )}
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
            <div className="h-3 bg-gray-300 rounded w-16 mt-2"></div>
          </div>
        </div>
      ))}
    </>
  );
});

MessageSkeleton.displayName = "MessageSkeleton";

export default MessageSkeleton;