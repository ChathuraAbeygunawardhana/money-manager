"use client";

import { useState, useEffect } from "react";
import Button from "../atoms/Button";
import ProfilePictureUpload from "@/app/components/ProfilePictureUpload";
import CustomDropdown from "@/app/components/CustomDropdown";
import type { User, UpdateUserData } from "../../types";

interface EditUserModalProps {
  user: User | null;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateUserData) => Promise<void>;
}

export default function EditUserModal({ user, isLoading, onClose, onSubmit }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "user",
    profile_picture: undefined as string | undefined,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        password: "",
        name: user.name,
        role: user.role || "user",
        profile_picture: user.profile_picture || undefined,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updateData: any = {
      email: formData.email,
      name: formData.name,
      role: formData.role,
      profile_picture: formData.profile_picture,
    };
    
    if (formData.password) {
      updateData.password = formData.password;
    }

    await onSubmit(updateData);
    setFormData({ email: "", password: "", name: "", role: "user", profile_picture: undefined });
  };

  const handleClose = () => {
    onClose();
    setFormData({ email: "", password: "", name: "", role: "user", profile_picture: undefined });
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-2xl w-full p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight">Edit User</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center mb-6">
            <ProfilePictureUpload
              currentImage={formData.profile_picture}
              onImageChange={(base64Image) => setFormData({ ...formData, profile_picture: base64Image || undefined })}
              disabled={isLoading}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all duration-200"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all duration-200"
                placeholder="Leave blank to keep current"
              />
              <p className="text-xs text-gray-500 mt-1">Leave blank to keep current password</p>
            </div>
            <div>
              <CustomDropdown
                label="Role"
                options={[
                  { value: "user", label: "User" },
                  { value: "admin", label: "Admin" }
                ]}
                value={formData.role}
                onChange={(value) => setFormData({ ...formData, role: value })}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              onClick={handleClose}
              variant="secondary"
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
              className="flex-1"
            >
              Update
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}