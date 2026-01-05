# Users Management - Component Architecture

This directory contains the refactored users management interface following atomic design principles with integrated search and filter functionality.

## Structure

```
app/admin/users/
├── components/
│   ├── atoms/              # Basic building blocks
│   │   ├── Avatar.tsx      # User profile picture display
│   │   ├── Badge.tsx       # Role badges (admin/user)
│   │   ├── Button.tsx      # Reusable button component
│   │   ├── IconButton.tsx  # Icon-only buttons
│   │   ├── LoadingSpinner.tsx # Loading indicator
│   │   ├── ClearButton.tsx # Clear filters button
│   │   ├── ResultsCount.tsx # Display filtered results count
│   │   └── EmptyState.tsx  # Empty state with icon and message
│   ├── molecules/          # Combinations of atoms
│   │   ├── PageHeader.tsx  # Page title and action buttons
│   │   ├── PasswordToggle.tsx # Password show/hide functionality
│   │   ├── UserActions.tsx # View/Edit/Delete action buttons
│   │   └── FilterActions.tsx # Clear filters section
│   ├── organisms/          # Complex UI sections
│   │   ├── BulkCreateModal.tsx     # Bulk user creation modal
│   │   ├── ConfirmationModal.tsx   # Generic confirmation dialog
│   │   ├── CreateUserModal.tsx     # Single user creation modal
│   │   ├── EditUserModal.tsx       # User editing modal
│   │   ├── UserTableRow.tsx        # Individual table row
│   │   ├── UsersTable.tsx          # Complete users table
│   │   └── SearchAndFilterPanel.tsx # Search and filter controls
│   ├── templates/          # Page layouts
│   │   └── UsersPageTemplate.tsx   # Main page template
│   └── index.ts           # Component exports
├── hooks/
│   └── useUserFilters.ts  # Search and filter logic hook
├── types/
│   └── index.ts           # Shared TypeScript interfaces
├── page.tsx               # Main page (simplified)
└── README.md              # This file
```

## Shared Components

The following components are shared across the application in `app/components/shared/`:
- **SearchInput**: Reusable search input with icon
- **NumberInput**: Number input for age ranges
- **AgeRangeFilter**: Min/max age range selector

These components are used in both the admin users page and the regular users people page.

## Search and Filter Features

### Search Functionality
- **Text Search**: Search by user name or email (admin can search both, regular users only names)
- **Real-time Filtering**: Results update as you type
- **Case Insensitive**: Search is not case sensitive

### Filter Options
- **Age Range**: Filter users by minimum and maximum age
- **Role Filter**: Filter by user role (All, Admin, User)
- **Clear Filters**: One-click to clear all active filters

### Filter Logic
- All filters work together (AND logic)
- Users without age data are excluded when age filters are applied
- Users without explicit role are treated as "user" role
- Current user is excluded from selection operations

## Key Features

### Reusability
- Search and filter components are shared between admin and regular user pages
- Consistent UI patterns across the application
- Flexible component props for different use cases

### Performance
- `useMemo` for efficient filtering
- Custom hook (`useUserFilters`) encapsulates all filter logic
- Minimal re-renders with proper state management

### User Experience
- Results count shows filtered vs total users
- Empty states for no results and no users
- Clear visual feedback for active filters
- Responsive design for mobile and desktop

## Usage

The search and filter functionality is integrated into the main template:

```tsx
// Search and filter functionality
const {
  filters,
  filteredUsers,
  updateSearchQuery,
  updateAgeFilter,
  updateRoleFilter,
  clearFilters,
  hasActiveFilters
} = useUserFilters(users);

// In JSX
<SearchAndFilterPanel
  searchQuery={filters.searchQuery}
  ageFilter={filters.ageFilter}
  roleFilter={filters.roleFilter}
  onSearchChange={updateSearchQuery}
  onAgeFilterChange={updateAgeFilter}
  onRoleFilterChange={updateRoleFilter}
  onClearFilters={clearFilters}
  searchPlaceholder="Search by name or email..."
  showAgeFilter={true}
  showRoleFilter={true}
/>
```

## Component Dependencies

```
UsersPageTemplate
├── PageHeader
├── SearchAndFilterPanel (NEW)
│   ├── SearchInput (shared)
│   ├── AgeRangeFilter (shared)
│   │   └── NumberInput (shared)
│   ├── CustomDropdown
│   └── FilterActions
│       └── ClearButton
├── ResultsCount (NEW)
├── UsersTable
│   └── UserTableRow
│       ├── Avatar
│       ├── Badge
│       ├── PasswordToggle
│       └── UserActions
├── EmptyState (NEW)
└── [Modals...]
```

## Benefits

1. **Enhanced User Experience**: Easy to find specific users with powerful search and filtering
2. **Consistent UI**: Same components used across admin and regular user interfaces
3. **Performance Optimized**: Efficient filtering with memoization
4. **Maintainable**: Clear separation of concerns with custom hooks
5. **Accessible**: Proper labels and keyboard navigation
6. **Responsive**: Works well on all device sizes
7. **Extensible**: Easy to add new filter types or search criteria

This architecture demonstrates how atomic design principles can be applied to create a scalable, maintainable, and user-friendly interface with advanced functionality.