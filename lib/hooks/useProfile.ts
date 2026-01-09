import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
  profile_picture: string | null;
}

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

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<ProfileInfoData> => {
      const res = await fetch("/api/profile");
      
      if (!res.ok) {
        throw new Error("Failed to fetch profile");
      }
      
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUserProfile(userId: string, enabled = true) {
  return useQuery({
    queryKey: ["userProfile", userId],
    queryFn: async (): Promise<UserProfile> => {
      const res = await fetch(`/api/users/${userId}/profile`);
      
      if (!res.ok) {
        throw new Error("Failed to fetch user profile");
      }
      
      return res.json();
    },
    enabled: enabled && !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["profile-info"] });
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
  const queryClient = useQueryClient();

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["profile-info"] });
    },
  });
}