"use client";

import { useState, useMemo } from "react";
import type { User } from "../types";

export interface FilterState {
  searchQuery: string;
  ageFilter: { min: string; max: string };
  roleFilter: string;
  genderFilter: string;
}

export function useUserFilters(users: User[]) {
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: "",
    ageFilter: { min: "", max: "" },
    roleFilter: "all",
    genderFilter: "all"
  });

  const filteredUsers = useMemo(() => {
    const result = users.filter(user => {
      // Search filter (name and email)
      const matchesSearch = filters.searchQuery.trim() === "" || 
        user.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.searchQuery.toLowerCase());
      
      // Age filter (if user has age property)
      let matchesAge = true;
      if (filters.ageFilter.min || filters.ageFilter.max) {
        if ('age' in user && typeof user.age === 'number') {
          const userAge = user.age;
          const minAge = filters.ageFilter.min ? parseInt(filters.ageFilter.min) : 0;
          const maxAge = filters.ageFilter.max ? parseInt(filters.ageFilter.max) : Infinity;
          matchesAge = userAge >= minAge && userAge <= maxAge;
        } else {
          // If age filter is set but user has no age, exclude them
          matchesAge = false;
        }
      }
      
      // Gender filter
      const matchesGender = filters.genderFilter === "all" || 
        (user.gender && user.gender.toLowerCase() === filters.genderFilter.toLowerCase()) ||
        (filters.genderFilter === "unknown" && !user.gender);
      
      // Role filter
      const matchesRole = filters.roleFilter === "all" || 
        (user.role && user.role.toLowerCase() === filters.roleFilter.toLowerCase()) ||
        (filters.roleFilter === "user" && !user.role); // Users without role are considered "user"
      
      return matchesSearch && matchesAge && matchesGender && matchesRole;
    });

    return result;
  }, [users, filters]);

  const updateSearchQuery = (searchQuery: string) => {
    setFilters(prev => ({ ...prev, searchQuery }));
  };

  const updateAgeFilter = (ageFilter: { min: string; max: string }) => {
    setFilters(prev => ({ ...prev, ageFilter }));
  };

  const updateRoleFilter = (roleFilter: string) => {
    setFilters(prev => ({ ...prev, roleFilter }));
  };

  const updateGenderFilter = (genderFilter: string) => {
    setFilters(prev => ({ ...prev, genderFilter }));
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: "",
      ageFilter: { min: "", max: "" },
      roleFilter: "all",
      genderFilter: "all"
    });
  };

  const hasActiveFilters = 
    filters.searchQuery.trim() !== "" ||
    filters.ageFilter.min !== "" ||
    filters.ageFilter.max !== "" ||
    filters.roleFilter !== "all" ||
    filters.genderFilter !== "all";

  return {
    filters,
    filteredUsers,
    updateSearchQuery,
    updateAgeFilter,
    updateRoleFilter,
    updateGenderFilter,
    clearFilters,
    hasActiveFilters
  };
}