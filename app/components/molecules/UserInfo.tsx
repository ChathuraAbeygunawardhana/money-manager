"use client";

import { useSession } from "next-auth/react";
import { useProfile } from "@/lib/hooks/useProfile";
import ProfilePicture from "../ProfilePicture";

export interface UserInfoProps {
  name: string;
  email: string;
  showAvatar?: boolean;
}

export default function UserInfo({ name, email, showAvatar = true }: UserInfoProps) {
  const { data: session } = useSession();
  const { data: profile } = useProfile();

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {showAvatar && (
        <ProfilePicture 
          src={profile?.profile_picture} 
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