"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAdminUsers, useCreateUser, useUpdateUser, useDeleteUser, useBulkDeleteUsers, useBulkCreateUsers } from "@/lib/hooks/useUsers";
import { useNotification } from "@/lib/hooks/useNotification";
import ProfileModal from "@/app/components/ProfileModal";

// Types
import type { 
  User, 
  CreateUserData, 
  UpdateUserData, 
  BulkCreateData, 
  DeleteConfirmState, 
  BulkDeleteConfirmState, 
  ProfileModalState 
} from "../../types";

// Hooks
import { useUserFilters } from "../../hooks/useUserFilters";
import { usePagination } from "../../hooks/usePagination";

// Components
import PageHeader from "../molecules/PageHeader";
import SearchAndFilterPanel from "../organisms/SearchAndFilterPanel";
import UsersTable from "../organisms/UsersTable";
import CreateUserModal from "../organisms/CreateUserModal";
import EditUserModal from "../organisms/EditUserModal";
import BulkCreateModal from "../organisms/BulkCreateModal";
import ConfirmationModal from "../organisms/ConfirmationModal";
import Pagination from "../organisms/Pagination";
import ResultsCount from "../atoms/ResultsCount";
import EmptyState from "../atoms/EmptyState";

export default function UsersPageTemplate() {
  const { data: session } = useSession();
  const { data: users = [], isLoading: loading, refetch } = useAdminUsers();
  const createUser = useCreateUser();
  const bulkCreateUsers = useBulkCreateUsers();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const bulkDeleteUsers = useBulkDeleteUsers();
  const { showNotification } = useNotification();

  // Search and filter functionality
  const {
    filters,
    filteredUsers,
    updateSearchQuery,
    updateAgeFilter,
    updateRoleFilter,
    updateGenderFilter,
    clearFilters,
    hasActiveFilters
  } = useUserFilters(users);

  // Pagination functionality
  const {
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    paginatedData: paginatedUsers,
    goToPage,
    resetPagination
  } = usePagination(filteredUsers, 10);

  // Reset pagination when filters change and clear selections
  useEffect(() => {
    resetPagination();
    setSelectedUsers(new Set()); // Clear selections when filters change
  }, [filters, resetPagination]);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkCreateModal, setShowBulkCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
    show: false,
    userId: "",
    userName: "",
  });
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState<BulkDeleteConfirmState>({
    show: false,
    userCount: 0,
  });
  const [showProfileModal, setShowProfileModal] = useState<ProfileModalState>({
    show: false,
    userId: "",
    userName: "",
  });

  // Other states
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, string>>({});
  const [loadingPasswords, setLoadingPasswords] = useState<Record<string, boolean>>({});
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handlers
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      showNotification("Users list refreshed");
    } catch (error) {
      showNotification("Failed to refresh users list", "error");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreateUser = async (formData: CreateUserData) => {
    try {
      await createUser.mutateAsync(formData);
      setShowCreateModal(false);
      showNotification("User created successfully");
    } catch (error: any) {
      showNotification(error.message, "error");
    }
  };

  const handleUpdateUser = async (formData: UpdateUserData) => {
    if (!editingUser) return;
    try {
      await updateUser.mutateAsync({ userId: editingUser.id, data: formData });
      setEditingUser(null);
      showNotification("User updated successfully");
    } catch (error: any) {
      showNotification(error.message, "error");
    }
  };

  const handleBulkCreate = async (formData: BulkCreateData) => {
    try {
      const result = await bulkCreateUsers.mutateAsync(formData);
      setShowBulkCreateModal(false);
      showNotification(result.message);
    } catch (error: any) {
      showNotification(error.message, "error");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser.mutateAsync(deleteConfirm.userId);
      setDeleteConfirm({ show: false, userId: "", userName: "" });
      showNotification("User deleted successfully");
    } catch (error: any) {
      showNotification(error.message, "error");
    }
  };

  const handleBulkDelete = async () => {
    try {
      const result = await bulkDeleteUsers.mutateAsync(Array.from(selectedUsers));
      setBulkDeleteConfirm({ show: false, userCount: 0 });
      setSelectedUsers(new Set());
      showNotification(result.message);
    } catch (error: any) {
      showNotification(error.message, "error");
    }
  };

  const togglePasswordVisibility = async (userId: string) => {
    if (visiblePasswords[userId]) {
      setVisiblePasswords(prev => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
    } else {
      setLoadingPasswords(prev => ({ ...prev, [userId]: true }));
      try {
        const res = await fetch(`/api/users/${userId}/password`);
        if (!res.ok) throw new Error("Failed to fetch password");
        const data = await res.json();
        setVisiblePasswords(prev => ({ ...prev, [userId]: data.password }));
      } catch (error) {
        showNotification("Failed to fetch password", "error");
      } finally {
        setLoadingPasswords(prev => ({ ...prev, [userId]: false }));
      }
    }
  };

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    const selectableUsers = paginatedUsers.filter(user => user.id !== session?.user?.id);
    const allCurrentPageSelected = selectableUsers.every(user => selectedUsers.has(user.id));
    
    if (allCurrentPageSelected) {
      // Deselect all users on current page
      const newSelected = new Set(selectedUsers);
      selectableUsers.forEach(user => newSelected.delete(user.id));
      setSelectedUsers(newSelected);
    } else {
      // Select all users on current page
      const newSelected = new Set(selectedUsers);
      selectableUsers.forEach(user => newSelected.add(user.id));
      setSelectedUsers(newSelected);
    }
  };

  const openDeleteConfirm = (userId: string, userName: string) => {
    setDeleteConfirm({ show: true, userId, userName });
  };

  const openBulkDeleteConfirm = () => {
    setBulkDeleteConfirm({ show: true, userCount: selectedUsers.size });
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
  };

  const openProfileModal = (userId: string, userName: string) => {
    setShowProfileModal({ show: true, userId, userName });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        selectedCount={selectedUsers.size}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onBulkDelete={openBulkDeleteConfirm}
        onCreateUser={() => setShowCreateModal(true)}
        onBulkCreate={() => setShowBulkCreateModal(true)}
      />

      <SearchAndFilterPanel
        searchQuery={filters.searchQuery}
        ageFilter={filters.ageFilter}
        roleFilter={filters.roleFilter}
        genderFilter={filters.genderFilter}
        onSearchChange={updateSearchQuery}
        onAgeFilterChange={updateAgeFilter}
        onRoleFilterChange={updateRoleFilter}
        onGenderFilterChange={updateGenderFilter}
        onClearFilters={clearFilters}
        searchPlaceholder="Search by name or email..."
        showAgeFilter={true}
        showRoleFilter={true}
        showGenderFilter={true}
      />

      <ResultsCount
        filteredCount={totalItems}
        totalCount={users.length}
        itemName="users"
      />

      {filteredUsers.length > 0 ? (
        <>
          <UsersTable
            users={paginatedUsers}
            selectedUsers={selectedUsers}
            currentUserId={session?.user?.id}
            visiblePasswords={visiblePasswords}
            loadingPasswords={loadingPasswords}
            onSelectUser={handleSelectUser}
            onSelectAll={handleSelectAll}
            onTogglePassword={togglePasswordVisibility}
            onViewProfile={openProfileModal}
            onEditUser={openEditModal}
            onDeleteUser={openDeleteConfirm}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={goToPage}
          />
        </>
      ) : users.length > 0 ? (
        <EmptyState
          title="No users match your filters"
          description="Try adjusting your search or filter criteria"
        />
      ) : (
        <EmptyState
          title="No users found"
          description="There are no users in the system yet"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
      )}

      {/* Modals */}
      <CreateUserModal
        isOpen={showCreateModal}
        isLoading={createUser.isPending}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateUser}
      />

      <EditUserModal
        user={editingUser}
        isLoading={updateUser.isPending}
        onClose={() => setEditingUser(null)}
        onSubmit={handleUpdateUser}
      />

      <BulkCreateModal
        isOpen={showBulkCreateModal}
        isLoading={bulkCreateUsers.isPending}
        onClose={() => setShowBulkCreateModal(false)}
        onSubmit={handleBulkCreate}
      />

      <ConfirmationModal
        isOpen={deleteConfirm.show}
        title="Delete User"
        message={`Are you sure you want to delete <span class="font-semibold text-gray-900">${deleteConfirm.userName}</span>? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={deleteUser.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ show: false, userId: "", userName: "" })}
      />

      <ConfirmationModal
        isOpen={bulkDeleteConfirm.show}
        title="Delete Users"
        message={`Are you sure you want to delete <span class="font-semibold text-gray-900">${bulkDeleteConfirm.userCount} user${bulkDeleteConfirm.userCount > 1 ? 's' : ''}</span>? This action cannot be undone.`}
        confirmText="Delete All"
        variant="danger"
        isLoading={bulkDeleteUsers.isPending}
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteConfirm({ show: false, userCount: 0 })}
      />

      <ProfileModal
        isOpen={showProfileModal.show}
        onClose={() => setShowProfileModal({ show: false, userId: "", userName: "" })}
        userId={showProfileModal.userId}
        userName={showProfileModal.userName}
        onUserUpdate={refetch}
      />
    </div>
  );
}