"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "edit" | "delete" | "close" | "menu" | "clear";
  size?: "sm" | "md" | "lg";
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = "edit", size = "md", title, ...props }, ref) => {
    const baseStyles = "text-gray-600 hover:text-gray-900 cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const sizes = {
      sm: "p-1",
      md: "p-2", 
      lg: "p-3"
    };

    const iconSizes = {
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6"
    };

    const icons = {
      edit: (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconSizes[size]} viewBox="0 0 20 20" fill="currentColor">
          <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
          <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
        </svg>
      ),
      delete: (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconSizes[size]} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
      close: (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconSizes[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      menu: (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconSizes[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
      clear: (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconSizes[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    };

    const defaultTitles = {
      edit: "Edit item",
      delete: "Delete item", 
      close: "Close",
      menu: "Toggle menu",
      clear: "Clear messages"
    };

    return (
      <button
        className={cn(baseStyles, sizes[size], className)}
        title={title || defaultTitles[variant]}
        ref={ref}
        {...props}
      >
        {icons[variant]}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";

export default IconButton;