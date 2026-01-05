"use client";

interface ResultsCountProps {
  filteredCount: number;
  totalCount: number;
  itemName?: string;
  className?: string;
}

export default function ResultsCount({ 
  filteredCount, 
  totalCount, 
  itemName = "items",
  className = "" 
}: ResultsCountProps) {
  return (
    <div className={`mb-6 ${className}`}>
      <p className="text-sm text-gray-600">
        Showing {filteredCount} of {totalCount} {itemName}
      </p>
    </div>
  );
}