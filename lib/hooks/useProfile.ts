import { useMutation, useQuery } from "@tanstack/react-query";

interface UpdateProfileData {
  name: string;
  email: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

interface ProfileInfoData {
  age: number | null;
  gender: string | null;
  height: number | null;
  weight: number | null;
  bio: string | null;
  orientation: string | null;
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update profile");
      }

      return res.json();
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: ChangePasswordData) => {
      const res = await fetch("/api/users/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to change password");
      }

      return res.json();
    },
  });
}

export function useProfileInfo() {
  return useQuery({
    queryKey: ["profile-info"],
    queryFn: async (): Promise<ProfileInfoData> => {
      const res = await fetch("/api/profile");
      
      if (!res.ok) {
        throw new Error("Failed to fetch profile info");
      }
      
      return res.json();
    },
  });
}

export function useUpdateProfileInfo() {
  return useMutation({
    mutationFn: async (data: ProfileInfoData) => {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update profile info");
      }

      return res.json();
    },
  });
}