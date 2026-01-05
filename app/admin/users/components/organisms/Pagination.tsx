"use client";

import PaginationInfo from "../atoms/PaginationInfo";
import PaginationControls from "../molecules/PaginationControls";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className = ""
}: PaginationProps) {
  if (totalItems === 0) return null;

  return (
    <div className={`flex items-center justify-between bg-white px-6 py-4 border-t border-gray-200 rounded-b-lg ${className}`}>
      <PaginationInfo
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
      />
      
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}