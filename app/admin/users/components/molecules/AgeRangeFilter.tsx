"use client";

import NumberInput from "@/app/components/shared/NumberInput";

interface AgeRangeFilterProps {
  minAge: string;
  maxAge: string;
  onMinAgeChange: (value: string) => void;
  onMaxAgeChange: (value: string) => void;
  label?: string;
  className?: string;
}

export default function AgeRangeFilter({
  minAge,
  maxAge,
  onMinAgeChange,
  onMaxAgeChange,
  label = "Age Range",
  className = ""
}: AgeRangeFilterProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex gap-2">
        <NumberInput
          value={minAge}
          onChange={onMinAgeChange}
          placeholder="Min"
          min={18}
          max={100}
        />
        <NumberInput
          value={maxAge}
          onChange={onMaxAgeChange}
          placeholder="Max"
          min={18}
          max={100}
        />
      </div>
    </div>
  );
}