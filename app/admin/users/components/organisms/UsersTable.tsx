"use client";

import UserTableRow from "./UserTableRow";
import type { User } from "../../types";

interface UsersTableProps {
  users: User[];
  selectedUsers: Set<string>;
  currentUserId?: string;
  visiblePasswords: Record<string, string>;
  loadingPasswords: Record<string, boolean>;
  onSelectUser: (userId: string) => void;
  onSelectAll: () => void;
  onTogglePassword: (userId: string) => Promise<void>;
  onViewProfile: (userId: string, userName: string) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string, userName: string) => void;
}

export default function UsersTable({
  users,
  selectedUsers,
  currentUserId,
  visiblePasswords,
  loadingPasswords,
  onSelectUser,
  onSelectAll,
  onTogglePassword,
  onViewProfile,
  onEditUser,
  onDeleteUser
}: UsersTableProps) {
  const selectableUsers = users.filter(user => user.id !== currentUserId);
  const allCurrentPageSelected = selectableUsers.length > 0 && selectableUsers.every(user => selectedUsers.has(user.id));
  const someCurrentPageSelected = selectableUsers.some(user => selectedUsers.has(user.id));

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={allCurrentPageSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = someCurrentPageSelected && !allCurrentPageSelected;
                    }}
                    onChange={onSelectAll}
                    className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded cursor-pointer"
                  />
                  <span className="ml-3">Name</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Age
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gender
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Profile
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Password
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <UserTableRow
                key={user.id}
                user={user}
                isSelected={selectedUsers.has(user.id)}
                isCurrentUser={user.id === currentUserId}
                visiblePassword={visiblePasswords[user.id]}
                isLoadingPassword={loadingPasswords[user.id] || false}
                onSelect={onSelectUser}
                onTogglePassword={onTogglePassword}
                onView={onViewProfile}
                onEdit={onEditUser}
                onDelete={onDeleteUser}
              />
            ))}
          </tbody>
        </table>
      </div>
      
      {users.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-600">No users found.</p>
        </div>
      )}
    </div>
  );
}