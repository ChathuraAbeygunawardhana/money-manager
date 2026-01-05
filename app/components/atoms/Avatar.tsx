"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ name, size = "md", className }, ref) => {
    const sizes = {
      sm: "w-6 h-6 text-xs",
      md: "w-8 h-8 text-sm", 
      lg: "w-12 h-12 text-lg"
    };

    const initial = name?.charAt(0).toUpperCase() || "?";

    return (
      <div
        ref={ref}
        className={cn(
          "bg-gray-900 rounded-full flex items-center justify-center shrink-0",
          sizes[size],
          className
        )}
      >
        <span className="text-white font-medium">
          {initial}
        </span>
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

export default Avatar;