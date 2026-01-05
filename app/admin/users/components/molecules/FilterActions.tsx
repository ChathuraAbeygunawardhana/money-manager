"use client";

import ClearButton from "../atoms/ClearButton";

interface FilterActionsProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  className?: string;
}

export default function FilterActions({
  hasActiveFilters,
  onClearFilters,
  className = ""
}: FilterActionsProps) {
  if (!hasActiveFilters) return null;

  return (
    <div className={`mt-4 pt-4 border-t border-gray-200 ${className}`}>
      <ClearButton onClick={onClearFilters}>
        Clear All Filters
      </ClearButton>
    </div>
  );
}