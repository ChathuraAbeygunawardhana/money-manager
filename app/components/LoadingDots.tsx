"use client";

import { memo } from "react";

const LoadingDots = memo(() => {
  return (
    <div className="flex items-center justify-center space-x-1">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
    </div>
  );
});

LoadingDots.displayName = "LoadingDots";

export default LoadingDots;