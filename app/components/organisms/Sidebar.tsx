"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import IconButton from "../atoms/IconButton";

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: "sm" | "md" | "lg";
  showOnDesktop?: boolean;
}

export default function Sidebar({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  width = "md",
  showOnDesktop = true
}: SidebarProps) {
  const widths = {
    sm: "w-64",
    md: "w-80", 
    lg: "w-96"
  };

  const desktopClasses = showOnDesktop 
    ? "lg:relative lg:translate-x-0" 
    : "lg:hidden";

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-40 bg-white border-r border-gray-200 flex flex-col h-screen transition-transform duration-300 ease-in-out lg:z-auto",
        widths[width],
        desktopClasses,
        isOpen ? "translate-x-0" : "-translate-x-full",
        showOnDesktop ? "lg:translate-x-0" : ""
      )}>
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 shrink-0">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h1>
          <IconButton
            variant="close"
            onClick={onClose}
            className="lg:hidden"
            title="Close menu"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-4 border-t border-gray-200 shrink-0">
            {footer}
          </div>
        )}
      </aside>
    </>
  );
}