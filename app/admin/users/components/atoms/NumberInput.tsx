"use client";

interface NumberInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  className?: string;
}

export default function NumberInput({ 
  value, 
  onChange, 
  placeholder, 
  min, 
  max, 
  className = "" 
}: NumberInputProps) {
  return (
    <input
      type="number"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm ${className}`}
      min={min}
      max={max}
    />
  );
}