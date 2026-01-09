"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Types
export interface Account {
  id: string;
  name: string;
  type: "checking" | "savings" | "credit" | "investment" | "cash";
  balance: number;
  currency: string;
  is_active: number;
  created_at: number;
  updated_at: number;
}

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string;
  is_active: number;
  created_at: number;
}

export interface Transaction {
  id: string;
  type: "income" | "expense" | "transfer";
  amount: number;
  description: string;
  date: number;
  tags: string[];
  notes?: string;
  is_recurring: number;
  recurring_frequency?: string;
  recurring_end_date?: number;
  created_at: number;
  updated_at: number;
  account_name: string;
  account_type: string;
  category_name?: string;
  category_color?: string;
  category_icon?: string;
}

export interface Budget {
  id: string;
  name: string;
  amount: number;
  period: "weekly" | "monthly" | "yearly";
  start_date: number;
  end_date?: number;
  is_active: number;
  alert_threshold: number;
  created_at: number;
  updated_at: number;
  category_name?: string;
  category_color?: string;
  category_icon?: string;
  spent_amount: number;
  percentage_used: number;
}

export interface FinancialGoal {
  id: string;
  name: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  target_date?: number;
  category?: string;
  priority: "low" | "medium" | "high";
  is_active: number;
  created_at: number;
  updated_at: number;
  percentage_complete: number;
}

export interface DashboardData {
  period_days: number;
  accounts: {
    liquid_assets: number;
    investments: number;
    debt: number;
    net_worth: number;
  };
  transactions: {
    total_income: number;
    total_expenses: number;
    net_income: number;
    income_count: number;
    expense_count: number;
  };
  top_categories: Array<{
    name: string;
    color: string;
    icon: string;
    total_spent: number;
    transaction_count: number;
  }>;
  recent_transactions: Transaction[];
  budgets: Budget[];
  goals: FinancialGoal[];
  spending_trend: Array<{
    date: string;
    income: number;
    expenses: number;
    net: number;
  }>;
}

// Custom hooks
export function useAccounts() {
  return useQuery({
    queryKey: ["money", "accounts"],
    queryFn: async () => {
      const response = await fetch("/api/money/accounts");
      if (!response.ok) throw new Error("Failed to fetch accounts");
      return response.json() as Promise<Account[]>;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes - accounts don't change frequently
    gcTime: 1000 * 60 * 30, // 30 minutes cache
    refetchOnWindowFocus: false,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accountData: Omit<Account, "id" | "created_at" | "updated_at" | "is_active">) => {
      const response = await fetch("/api/money/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(accountData),
      });
      if (!response.ok) throw new Error("Failed to create account");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["money", "accounts"] });
      queryClient.invalidateQueries({ queryKey: ["money", "dashboard"] });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Account> }) => {
      const response = await fetch(`/api/money/accounts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update account");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["money", "accounts"] });
      queryClient.invalidateQueries({ queryKey: ["money", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["money", "transactions"] });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/money/accounts/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete account");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["money", "accounts"] });
      queryClient.invalidateQueries({ queryKey: ["money", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["money", "transactions"] });
    },
  });
}

export function useCategories(type?: "income" | "expense") {
  return useQuery({
    queryKey: ["money", "categories", type],
    queryFn: async () => {
      const url = type ? `/api/money/categories?type=${type}` : "/api/money/categories";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json() as Promise<Category[]>;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes - categories change less frequently
    gcTime: 1000 * 60 * 30, // 30 minutes cache
    refetchOnWindowFocus: false,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryData: Omit<Category, "id" | "created_at" | "is_active">) => {
      const response = await fetch("/api/money/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData),
      });
      if (!response.ok) throw new Error("Failed to create category");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["money", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["money", "dashboard"] });
    },
  });
}

export function useDashboard(periodDays: number = 30) {
  return useQuery({
    queryKey: ["money", "dashboard", periodDays],
    queryFn: async () => {
      const response = await fetch(`/api/money/dashboard?period=${periodDays}`);
      if (!response.ok) throw new Error("Failed to fetch dashboard data");
      return response.json() as Promise<DashboardData>;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes - dashboard data should be relatively fresh
    gcTime: 1000 * 60 * 10, // 10 minutes cache
    refetchOnWindowFocus: false,
  });
}

export function useMoneyInit() {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/money/init", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to initialize money manager");
      return response.json();
    },
  });
}

export function useTransactions(filters?: {
  account_id?: string;
  category_id?: string;
  type?: "income" | "expense" | "transfer";
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ["money", "transactions", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters?.account_id) params.append("account_id", filters.account_id);
      if (filters?.category_id) params.append("category_id", filters.category_id);
      if (filters?.type) params.append("type", filters.type);
      if (filters?.start_date) params.append("start_date", Math.floor(new Date(filters.start_date).getTime() / 1000).toString());
      if (filters?.end_date) params.append("end_date", Math.floor(new Date(filters.end_date).getTime() / 1000).toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.offset) params.append("offset", filters.offset.toString());

      const url = `/api/money/transactions${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch transactions");
      return response.json() as Promise<Transaction[]>;
    },
    staleTime: 1000 * 60 * 3, // 3 minutes - transactions should be relatively fresh
    gcTime: 1000 * 60 * 15, // 15 minutes cache
    refetchOnWindowFocus: false,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionData: {
      account_id: string;
      category_id?: string;
      type: "income" | "expense" | "transfer";
      amount: number;
      description: string;
      date: string;
      tags?: string[];
      notes?: string;
      is_recurring?: boolean;
      recurring_frequency?: string;
      recurring_end_date?: string;
    }) => {
      const response = await fetch("/api/money/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionData),
      });
      if (!response.ok) throw new Error("Failed to create transaction");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["money", "transactions"] });
      queryClient.invalidateQueries({ queryKey: ["money", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["money", "accounts"] });
      queryClient.invalidateQueries({ queryKey: ["money", "monthly-spending"] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Transaction> }) => {
      const response = await fetch(`/api/money/transactions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update transaction");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["money", "transactions"] });
      queryClient.invalidateQueries({ queryKey: ["money", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["money", "accounts"] });
      queryClient.invalidateQueries({ queryKey: ["money", "monthly-spending"] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/money/transactions/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete transaction");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["money", "transactions"] });
      queryClient.invalidateQueries({ queryKey: ["money", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["money", "accounts"] });
      queryClient.invalidateQueries({ queryKey: ["money", "monthly-spending"] });
    },
  });
}

export function useMonthlySpending(months: number = 12) {
  return useQuery({
    queryKey: ["money", "monthly-spending", months],
    queryFn: async () => {
      const response = await fetch(`/api/money/monthly-spending?months=${months}`);
      if (!response.ok) throw new Error("Failed to fetch monthly spending data");
      return response.json() as Promise<Array<{
        month_key: string;
        year: number;
        month_num: number;
        month_name: string;
        display_name: string;
        total_expenses: number;
        total_income: number;
        expense_count: number;
        income_count: number;
        net_income: number;
      }>>;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes cache
    refetchOnWindowFocus: false,
  });
}