"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface NavigationItemProps {
  href: string;
  icon: ReactNode;
  children: ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}

export default function NavigationItem({ 
  href, 
  icon, 
  children, 
  isActive = false, 
  onClick 
}: NavigationItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
        isActive
          ? "bg-gray-900 text-white"
          : "text-gray-700 hover:bg-gray-100"
      )}
    >
      {icon}
      {children}
    </Link>
  );
}