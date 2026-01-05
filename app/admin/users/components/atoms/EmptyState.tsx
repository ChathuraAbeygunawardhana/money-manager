"use client";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
}

export default function EmptyState({ 
  icon, 
  title, 
  description, 
  className = "" 
}: EmptyStateProps) {
  const defaultIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );

  return (
    <div className={`text-center py-16 ${className}`}>
      <div className="text-gray-400 mb-4">
        {icon || defaultIcon}
      </div>
      <p className="text-gray-600 text-lg mb-2">{title}</p>
      {description && (
        <p className="text-gray-500 text-sm">{description}</p>
      )}
    </div>
  );
}