"use client";

import Avatar from "../atoms/Avatar";
import Badge from "../atoms/Badge";
import PasswordToggle from "../molecules/PasswordToggle";
import UserActions from "../molecules/UserActions";
import type { User } from "../../types";

interface UserTableRowProps {
  user: User;
  isSelected: boolean;
  isCurrentUser: boolean;
  visiblePassword?: string;
  isLoadingPassword: boolean;
  onSelect: (userId: string) => void;
  onTogglePassword: (userId: string) => Promise<void>;
  onView: (userId: string, userName: string) => void;
  onEdit: (user: User) => void;
  onDelete: (userId: string, userName: string) => void;
}

export default function UserTableRow({
  user,
  isSelected,
  isCurrentUser,
  visiblePassword,
  isLoadingPassword,
  onSelect,
  onTogglePassword,
  onView,
  onEdit,
  onDelete
}: UserTableRowProps) {
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(user.id)}
            disabled={isCurrentUser}
            className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="ml-3 text-sm font-medium text-gray-900">{user.name}</div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-600">{user.email}</div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-600">{user.age || "N/A"}</div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-600 capitalize">{user.gender || "N/A"}</div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <Avatar 
          src={user.profile_picture} 
          alt={`${user.name}'s profile`} 
          size="md"
        />
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <PasswordToggle
          userId={user.id}
          onToggle={onTogglePassword}
          isVisible={!!visiblePassword}
          isLoading={isLoadingPassword}
          password={visiblePassword}
        />
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant={user.role === "admin" ? "admin" : "user"}>
          {user.role || "user"}
        </Badge>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {formatDate(user.created_at)}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <UserActions
          userId={user.id}
          userName={user.name}
          isCurrentUser={isCurrentUser}
          onView={onView}
          onEdit={() => onEdit(user)}
          onDelete={onDelete}
        />
      </td>
    </tr>
  );
}