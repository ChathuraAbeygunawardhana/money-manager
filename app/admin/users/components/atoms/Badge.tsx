"use client";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "admin" | "user" | "default";
  className?: string;
}

export default function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  const variantClasses = {
    admin: "bg-blue-100 text-blue-800",
    user: "bg-gray-100 text-gray-800",
    default: "bg-gray-100 text-gray-800"
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}