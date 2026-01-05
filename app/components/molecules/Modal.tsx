"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import IconButton from "../atoms/IconButton";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
}

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = "md",
  showCloseButton = true 
}: ModalProps) {
  if (!isOpen) return null;

  const maxWidths = {
    sm: "max-w-sm",
    md: "max-w-md", 
    lg: "max-w-lg",
    xl: "max-w-xl"
  };

  return (
    <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className={cn(
        "bg-white rounded-lg border border-gray-200 shadow-xl w-full p-8",
        maxWidths[maxWidth]
      )}>
        {(title || showCloseButton) && (
          <div className="flex justify-between items-center mb-6">
            {title && (
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h2>
            )}
            {showCloseButton && (
              <IconButton 
                variant="close" 
                onClick={onClose}
                className="ml-auto"
              />
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}