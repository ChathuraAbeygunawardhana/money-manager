"use client";

import { SearchInput, AgeRangeFilter } from "@/app/components/shared";
import FilterActions from "../molecules/FilterActions";
import CustomDropdown from "@/app/components/CustomDropdown";

export interface SearchAndFilterState {
  searchQuery: string;
  ageFilter: { min: string; max: string };
  roleFilter: string;
  genderFilter: string;
}

interface SearchAndFilterPanelProps {
  searchQuery: string;
  ageFilter: { min: string; max: string };
  roleFilter: string;
  genderFilter: string;
  onSearchChange: (value: string) => void;
  onAgeFilterChange: (ageFilter: { min: string; max: string }) => void;
  onRoleFilterChange: (role: string) => void;
  onGenderFilterChange: (gender: string) => void;
  onClearFilters: () => void;
  searchPlaceholder?: string;
  showAgeFilter?: boolean;
  showRoleFilter?: boolean;
  showGenderFilter?: boolean;
  className?: string;
}

export default function SearchAndFilterPanel({
  searchQuery,
  ageFilter,
  roleFilter,
  genderFilter,
  onSearchChange,
  onAgeFilterChange,
  onRoleFilterChange,
  onGenderFilterChange,
  onClearFilters,
  searchPlaceholder = "Search users...",
  showAgeFilter = true,
  showRoleFilter = true,
  showGenderFilter = true,
  className = ""
}: SearchAndFilterPanelProps) {
  const hasActiveFilters = 
    searchQuery.trim() !== "" ||
    ageFilter.min !== "" ||
    ageFilter.max !== "" ||
    roleFilter !== "all" ||
    genderFilter !== "all";

  const handleMinAgeChange = (min: string) => {
    onAgeFilterChange({ ...ageFilter, min });
  };

  const handleMaxAgeChange = (max: string) => {
    onAgeFilterChange({ ...ageFilter, max });
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 mb-8 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search Input */}
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          label="Search Users"
          id="user-search"
          className="lg:col-span-2"
        />

        {/* Age Filter */}
        {showAgeFilter && (
          <AgeRangeFilter
            minAge={ageFilter.min}
            maxAge={ageFilter.max}
            onMinAgeChange={handleMinAgeChange}
            onMaxAgeChange={handleMaxAgeChange}
          />
        )}

        {/* Gender Filter */}
        {showGenderFilter && (
          <CustomDropdown
            label="Gender"
            id="gender-filter"
            options={[
              { value: "all", label: "All Genders" },
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "unknown", label: "Not Specified" }
            ]}
            value={genderFilter}
            onChange={onGenderFilterChange}
          />
        )}

        {/* Role Filter */}
        {showRoleFilter && (
          <CustomDropdown
            label="Role"
            id="role-filter"
            options={[
              { value: "all", label: "All Roles" },
              { value: "admin", label: "Admin" },
              { value: "user", label: "User" }
            ]}
            value={roleFilter}
            onChange={onRoleFilterChange}
          />
        )}
      </div>

      {/* Clear Filters */}
      <FilterActions
        hasActiveFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
      />
    </div>
  );
}