export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  profile_picture?: string;
  created_at?: number;
  age?: number;
  gender?: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role: string;
  profile_picture?: string;
}

export interface UpdateUserData {
  email: string;
  password?: string;
  name: string;
  role: string;
  profile_picture?: string;
}

export interface BulkCreateData {
  count: number;
  gender: "male" | "female";
}

export interface DeleteConfirmState {
  show: boolean;
  userId: string;
  userName: string;
}

export interface BulkDeleteConfirmState {
  show: boolean;
  userCount: number;
}

export interface ProfileModalState {
  show: boolean;
  userId: string;
  userName: string;
}