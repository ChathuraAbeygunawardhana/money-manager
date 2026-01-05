"use client";

interface ClearButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function ClearButton({ onClick, children, className = "" }: ClearButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 cursor-pointer text-sm ${className}`}
    >
      {children}
    </button>
  );
}