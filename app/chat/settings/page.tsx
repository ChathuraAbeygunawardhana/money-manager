"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/lib/hooks/useNotification";
import { useUpdateProfile, useChangePassword, useProfileInfo, useUpdateProfileInfo } from "@/lib/hooks/useProfile";
import ProfilePicture from "@/app/components/ProfilePicture";
import ProfilePictureUpload from "@/app/components/ProfilePictureUpload";
import CustomDropdown from "@/app/components/CustomDropdown";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const { showNotification } = useNotification();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const { data: profileInfo, refetch: refetchProfileInfo } = useProfileInfo();
  const updateProfileInfo = useUpdateProfileInfo();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileData, setProfileData] = useState({
    age: null as number | null,
    gender: null as string | null,
    height: null as number | null,
    weight: null as number | null,
    bio: null as string | null,
    orientation: null as string | null,
    profile_picture: null as string | null,
  });
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [isUpdatingPicture, setIsUpdatingPicture] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (profileInfo) {
      setProfileData(profileInfo);
    }
  }, [profileInfo]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/profile');
          if (response.ok) {
            const userData = await response.json();
            setProfilePicture(userData.profile_picture || '');
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, [session?.user?.id]);

  // Remove the additional effect that was checking session profile_picture

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateProfile.mutateAsync({
        name: formData.name,
        email: formData.email,
      });

      // Update the session with new data
      await update({
        name: formData.name,
        email: formData.email,
      });

      setIsEditing(false);
      showNotification("Profile updated successfully");
    } catch (error: any) {
      showNotification(error.message, "error");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      showNotification("New passwords don't match", "error");
      return;
    }

    if (formData.newPassword.length < 6) {
      showNotification("Password must be at least 6 characters long", "error");
      return;
    }

    try {
      await changePassword.mutateAsync({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      
      showNotification("Password changed successfully");
    } catch (error: any) {
      showNotification(error.message, "error");
    }
  };

  const handleCancel = () => {
    setFormData({
      name: session?.user?.name || "",
      email: session?.user?.email || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsEditing(false);
  };

  const handleSaveProfileInfo = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateProfileInfo.mutateAsync(profileData);
      await refetchProfileInfo();
      setIsEditingProfile(false);
      showNotification("Profile information updated successfully");
    } catch (error: any) {
      showNotification(error.message, "error");
    }
  };

  const handleProfileInputChange = (field: keyof typeof profileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value === '' ? null : (field === 'gender' || field === 'bio' || field === 'orientation' ? value : Number(value))
    }));
  };

  const handleCancelProfileInfo = () => {
    if (profileInfo) {
      setProfileData(profileInfo);
    }
    setIsEditingProfile(false);
  };

  const handleProfilePictureChange = async (webpImage: string | null) => {
    if (!session?.user?.id) return;

    setIsUpdatingPicture(true);
    try {
      // Update profile with new picture
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: session?.user?.name,
          profile_picture: webpImage,
        }),
      });

      if (response.ok) {
        // Update local state immediately
        setProfilePicture(webpImage || '');
        showNotification('Profile picture updated successfully');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile picture');
      }
    } catch (error) {
      console.error('Profile picture update error:', error);
      showNotification('Failed to update profile picture. Please try again.', 'error');
      
      // Reset the profile picture to the previous state on error
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const userData = await response.json();
          setProfilePicture(userData.profile_picture || '');
        }
      } catch (resetError) {
        console.error('Failed to reset profile picture:', resetError);
      }
    } finally {
      setIsUpdatingPicture(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
                Settings
              </h1>
              <p className="text-gray-600">
                Manage your account settings and preferences
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Picture Section */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Profile Picture</h2>
                  <p className="text-sm text-gray-600 mt-1">Upload and manage your profile picture</p>
                </div>
                
                <div className="p-6">
                  <ProfilePictureUpload
                    currentImage={profilePicture}
                    onImageChange={handleProfilePictureChange}
                    disabled={isUpdatingPicture}
                  />
                </div>
              </div>

              {/* Profile Settings */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 cursor-pointer"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                {!isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <p className="text-gray-900">{session.user.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <p className="text-gray-900">{session.user.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <p className="text-gray-900 capitalize">{session.user?.role}</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all duration-200"
                        required
                      />
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="flex-1 px-4 py-3 bg-gray-100 text-gray-900 border border-gray-300 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={updateProfile.isPending}
                        className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {updateProfile.isPending ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

              {/* Personal Information */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm lg:col-span-2">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                    <p className="text-sm text-gray-600 mt-1">Add your personal details (optional)</p>
                  </div>
                  {!isEditingProfile && (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 cursor-pointer"
                    >
                      Edit Info
                    </button>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                {!isEditingProfile ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Age
                      </label>
                      <p className="text-gray-900">{profileData.age || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender
                      </label>
                      <p className="text-gray-900 capitalize">{profileData.gender || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Orientation
                      </label>
                      <p className="text-gray-900 capitalize">{profileData.orientation || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Height (cm)
                      </label>
                      <p className="text-gray-900">{profileData.height || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Weight (kg)
                      </label>
                      <p className="text-gray-900">{profileData.weight || 'Not specified'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bio
                      </label>
                      <p className="text-gray-900">{profileData.bio || 'Not specified'}</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSaveProfileInfo} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                          Age
                        </label>
                        <input
                          id="age"
                          type="number"
                          min="1"
                          max="150"
                          value={profileData.age || ''}
                          onChange={(e) => handleProfileInputChange('age', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all duration-200"
                          placeholder="Enter your age"
                        />
                      </div>
                      <CustomDropdown
                        label="Gender"
                        id="gender"
                        options={[
                          { value: "", label: "Select gender" },
                          { value: "male", label: "Male" },
                          { value: "female", label: "Female" },
                          { value: "other", label: "Other" }
                        ]}
                        value={profileData.gender || ''}
                        onChange={(value) => handleProfileInputChange('gender', value)}
                      />
                      <CustomDropdown
                        label="Orientation"
                        id="orientation"
                        options={[
                          { value: "", label: "Select orientation" },
                          { value: "straight", label: "Straight" },
                          { value: "gay", label: "Gay" },
                          { value: "lesbian", label: "Lesbian" },
                          { value: "bisexual", label: "Bisexual" },
                          { value: "other", label: "Other" }
                        ]}
                        value={profileData.orientation || ''}
                        onChange={(value) => handleProfileInputChange('orientation', value)}
                      />
                      <div>
                        <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-2">
                          Height (cm)
                        </label>
                        <input
                          id="height"
                          type="number"
                          min="50"
                          max="300"
                          step="0.1"
                          value={profileData.height || ''}
                          onChange={(e) => handleProfileInputChange('height', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all duration-200"
                          placeholder="Enter height in cm"
                        />
                      </div>
                      <div>
                        <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                          Weight (kg)
                        </label>
                        <input
                          id="weight"
                          type="number"
                          min="20"
                          max="500"
                          step="0.1"
                          value={profileData.weight || ''}
                          onChange={(e) => handleProfileInputChange('weight', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all duration-200"
                          placeholder="Enter weight in kg"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                        Bio (max 50 characters)
                      </label>
                      <textarea
                        id="bio"
                        value={profileData.bio || ''}
                        onChange={(e) => handleProfileInputChange('bio', e.target.value)}
                        maxLength={50}
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all duration-200 resize-none"
                        placeholder="Tell us a bit about yourself..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {(profileData.bio || '').length}/50 characters
                      </p>
                    </div>
                    <div className="flex gap-4 pt-4 md:col-span-2">
                      <button
                        type="button"
                        onClick={handleCancelProfileInfo}
                        className="flex-1 px-4 py-3 bg-gray-100 text-gray-900 border border-gray-300 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={updateProfileInfo.isPending}
                        className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {updateProfileInfo.isPending ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

              {/* Password Settings */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm lg:col-span-2">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Update your password to keep your account secure
                </p>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all duration-200"
                      required
                      minLength={6}
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all duration-200"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={changePassword.isPending || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
                      className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {changePassword.isPending ? "Changing Password..." : "Change Password"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}