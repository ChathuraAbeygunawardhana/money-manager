"use client";

interface IconButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  className?: string;
}

export default function IconButton({ 
  children, 
  onClick, 
  disabled = false, 
  title, 
  className = "" 
}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`text-gray-600 hover:text-gray-900 transition-colors duration-150 inline-flex items-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title={title}
    >
      {children}
    </button>
  );
}