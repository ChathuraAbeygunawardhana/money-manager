"use client";

interface PaginationButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  className?: string;
}

export default function PaginationButton({
  children,
  onClick,
  disabled = false,
  active = false,
  className = ""
}: PaginationButtonProps) {
  const baseClasses = "px-3 py-2 text-sm font-medium border transition-all duration-200 cursor-pointer";
  const activeClasses = active 
    ? "bg-gray-900 text-white border-gray-900" 
    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50";
  const disabledClasses = disabled 
    ? "opacity-50 cursor-not-allowed" 
    : "";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${activeClasses} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  );
}