"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import ProfilePicture from "./ProfilePicture";
import ProfilePictureUpload from "./ProfilePictureUpload";
import CustomDropdown from "./CustomDropdown";
import Button from "../admin/users/components/atoms/Button";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  age: number | null;
  gender: string | null;
  height: number | null;
  weight: number | null;
  profile_picture: string | null;
  bio: string | null;
  orientation: string | null;
  created_at: number;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName?: string;
  onUserUpdate?: () => void; // Callback to refresh user data after update
}

export default function ProfileModal({ isOpen, onClose, userId, userName, onUserUpdate }: ProfileModalProps) {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "user",
    age: "",
    gender: "male",
    height: "",
    weight: "",
    bio: "",
    orientation: "straight",
    profile_picture: undefined as string | undefined,
  });

  const isAdmin = session?.user?.role === "admin";

  useEffect(() => {
    if (isOpen && userId) {
      fetchProfile();
      setIsEditing(false); // Reset edit mode when modal opens
    }
  }, [isOpen, userId]);

  useEffect(() => {
    if (profile && isEditing) {
      setFormData({
        email: profile.email,
        password: "",
        name: profile.name,
        role: profile.role || "user",
        age: profile.age?.toString() || "",
        gender: profile.gender || "male",
        height: profile.height?.toString() || "",
        weight: profile.weight?.toString() || "",
        bio: profile.bio || "",
        orientation: profile.orientation || "straight",
        profile_picture: profile.profile_picture || undefined,
      });
    }
  }, [profile, isEditing]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/users/${userId}/profile`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError('Failed to load profile information');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setError(null);

    try {
      const updateData: any = {
        email: formData.email,
        name: formData.name,
        role: formData.role,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender || null,
        height: formData.height ? parseInt(formData.height) : null,
        weight: formData.weight ? parseInt(formData.weight) : null,
        bio: formData.bio || null,
        orientation: formData.orientation || null,
        profile_picture: formData.profile_picture,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }

      // Refresh the profile data
      await fetchProfile();
      setIsEditing(false);
      
      // Call the callback to refresh the users list
      if (onUserUpdate) {
        onUserUpdate();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setError(null);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            {isEditing ? 'Edit User Profile' : 'User Profile'}
          </h2>
          <div className="flex items-center gap-2">
            {isAdmin && !isEditing && profile && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-gray-600 hover:text-gray-900 transition-colors duration-200 cursor-pointer"
                title="Edit Profile"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                  <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 cursor-pointer"
              title="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}

        {error && (
          <div className="text-center py-4 mb-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        {profile && !loading && (
          <>
            {isEditing ? (
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="flex justify-center mb-6">
                  <ProfilePictureUpload
                    currentImage={formData.profile_picture}
                    onImageChange={(base64Image) => setFormData({ ...formData, profile_picture: base64Image || undefined })}
                    disabled={isUpdating}
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
                      disabled={isUpdating}
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
                      disabled={isUpdating}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all duration-200"
                      placeholder="Leave blank to keep current"
                      disabled={isUpdating}
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
                      disabled={isUpdating}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Age</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all duration-200"
                      min="18"
                      max="100"
                      disabled={isUpdating}
                    />
                  </div>
                  <div>
                    <CustomDropdown
                      label="Gender"
                      options={[
                        { value: "male", label: "Male" },
                        { value: "female", label: "Female" }
                      ]}
                      value={formData.gender}
                      onChange={(value) => setFormData({ ...formData, gender: value })}
                      disabled={isUpdating}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <CustomDropdown
                      label="Orientation"
                      options={[
                        { value: "straight", label: "Straight" },
                        { value: "gay", label: "Gay" },
                        { value: "lesbian", label: "Lesbian" },
                        { value: "bisexual", label: "Bisexual" },
                        { value: "other", label: "Other" }
                      ]}
                      value={formData.orientation}
                      onChange={(value) => setFormData({ ...formData, orientation: value })}
                      disabled={isUpdating}
                    />
                  </div>
                  <div></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Height (cm)</label>
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all duration-200"
                      min="100"
                      max="250"
                      disabled={isUpdating}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Weight (kg)</label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all duration-200"
                      min="30"
                      max="200"
                      disabled={isUpdating}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all duration-200"
                    rows={3}
                    disabled={isUpdating}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    onClick={handleCancelEdit}
                    variant="secondary"
                    disabled={isUpdating}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={isUpdating}
                    className="flex-1"
                  >
                    Update Profile
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="flex items-center gap-4">
                  <ProfilePicture 
                    src={profile.profile_picture} 
                    name={profile.name} 
                    size="xl"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">{profile.name}</h3>
                    {isAdmin && (
                      <p className="text-gray-600">{profile.email}</p>
                    )}
                    {profile.bio && (
                      <p className="text-gray-700 text-sm mt-1 italic">"{profile.bio}"</p>
                    )}
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full mt-1 capitalize">
                      {profile.role}
                    </span>
                  </div>
                </div>

                {/* Personal Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Age
                      </label>
                      <p className="text-gray-900">{profile.age || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender
                      </label>
                      <p className="text-gray-900 capitalize">{profile.gender || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Orientation
                      </label>
                      <p className="text-gray-900 capitalize">{profile.orientation || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Height
                      </label>
                      <p className="text-gray-900">
                        {profile.height ? `${profile.height} cm` : 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Weight
                      </label>
                      <p className="text-gray-900">
                        {profile.weight ? `${profile.weight} kg` : 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Member Since */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Member Since
                  </label>
                  <p className="text-gray-900">{formatDate(profile.created_at)}</p>
                </div>

                {/* Close Button */}
                <div className="pt-4">
                  <button
                    onClick={onClose}
                    className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}