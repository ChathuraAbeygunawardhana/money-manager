"use client";

import { ReactNode, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, hover = true, padding = "md" }, ref) => {
    const paddings = {
      sm: "p-4",
      md: "p-6",
      lg: "p-8"
    };

    return (
      <div
        ref={ref}
        className={cn(
          "bg-white rounded-lg border border-gray-200 transition-all duration-200",
          hover && "hover:border-gray-300",
          paddings[padding],
          className
        )}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;