"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import ProfilePicture from "../ProfilePicture";

export interface UserInfoProps {
  name: string;
  email: string;
  showAvatar?: boolean;
}

export default function UserInfo({ name, email, showAvatar = true }: UserInfoProps) {
  const { data: session } = useSession();
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/profile');
          if (response.ok) {
            const userData = await response.json();
            setProfilePicture(userData.profile_picture);
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, [session?.user?.id]);

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {showAvatar && (
        <ProfilePicture 
          src={profilePicture} 
          name={name} 
          size="sm"
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
        <p className="text-xs text-gray-500 truncate">{email}</p>
      </div>
    </div>
  );
}