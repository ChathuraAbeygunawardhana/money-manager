"use client";

import { useState, useEffect } from "react";

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
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/money/accounts");
      if (!response.ok) throw new Error("Failed to fetch accounts");
      const data = await response.json();
      setAccounts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const createAccount = async (accountData: Omit<Account, "id" | "created_at" | "updated_at" | "is_active">) => {
    try {
      const response = await fetch("/api/money/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(accountData),
      });
      if (!response.ok) throw new Error("Failed to create account");
      await fetchAccounts();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
      return false;
    }
  };

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    try {
      const response = await fetch(`/api/money/accounts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update account");
      await fetchAccounts();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update account");
      return false;
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      const response = await fetch(`/api/money/accounts/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete account");
      await fetchAccounts();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account");
      return false;
    }
  };

  return {
    accounts,
    loading,
    error,
    refetch: fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
  };
}

export function useCategories(type?: "income" | "expense") {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const url = type ? `/api/money/categories?type=${type}` : "/api/money/categories";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [type]);

  const createCategory = async (categoryData: Omit<Category, "id" | "created_at" | "is_active">) => {
    try {
      const response = await fetch("/api/money/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData),
      });
      if (!response.ok) throw new Error("Failed to create category");
      await fetchCategories();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create category");
      return false;
    }
  };

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
    createCategory,
  };
}

export function useDashboard(periodDays: number = 30) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/money/dashboard?period=${periodDays}`);
      if (!response.ok) throw new Error("Failed to fetch dashboard data");
      const dashboardData = await response.json();
      setData(dashboardData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [periodDays]);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboard,
  };
}

export function useMoneyInit() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeMoney = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/money/init", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to initialize money manager");
      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to initialize";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    initializeMoney,
    loading,
    error,
  };
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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
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
      const data = await response.json();
      setTransactions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [JSON.stringify(filters)]);

  const createTransaction = async (transactionData: {
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
    try {
      const response = await fetch("/api/money/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionData),
      });
      if (!response.ok) throw new Error("Failed to create transaction");
      await fetchTransactions();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create transaction");
      return false;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const response = await fetch(`/api/money/transactions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update transaction");
      await fetchTransactions();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update transaction");
      return false;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const response = await fetch(`/api/money/transactions/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete transaction");
      await fetchTransactions();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete transaction");
      return false;
    }
  };

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
}