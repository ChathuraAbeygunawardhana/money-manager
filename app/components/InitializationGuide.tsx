"use client";

import { useState, useEffect } from "react";
import { useMoneyInit } from "@/lib/hooks/useMoney";
import Button from "./atoms/Button";
import Card from "./atoms/Card";

export default function InitializationGuide() {
  const mutation = useMoneyInit();
  const [moneyInitialized, setMoneyInitialized] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      checkInitializationStatus();
    }
  }, [mounted]);

  const checkInitializationStatus = async () => {
    try {
      // Check if money manager is initialized by trying to fetch accounts
      const accountsResponse = await fetch("/api/money/accounts");
      if (accountsResponse.ok) {
        const accounts = await accountsResponse.json();
        setMoneyInitialized(accounts.length > 0);
      }
    } catch (error) {
      console.error("Error checking initialization status:", error);
      setMoneyInitialized(false);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleInitializeMoney = async () => {
    try {
      await mutation.mutateAsync();
      setMoneyInitialized(true);
    } catch (error) {
      console.error("Failed to initialize money manager:", error);
    }
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  if (checkingStatus) {
    return (
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          <span className="ml-2 text-gray-600">Checking setup status...</span>
        </div>
      </Card>
    );
  }

  if (!moneyInitialized) {
    return (
      <Card className="p-6 mb-6 bg-yellow-50 border-yellow-200">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center shrink-0">
            <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">Setup Required</h3>
            <p className="text-yellow-700 mb-4">
              Welcome! Let's set up your money manager with default categories and your first account.
            </p>
            {mutation.error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{mutation.error.message}</p>
              </div>
            )}
            <Button 
              variant="primary" 
              onClick={handleInitializeMoney}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Setting up..." : "Initialize Money Manager"}
            </Button>
            <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
              <p className="text-sm text-yellow-800">
                This will create:
              </p>
              <ul className="text-sm text-yellow-800 mt-2 list-disc list-inside">
                <li>23 default categories (income & expense)</li>
                <li>A main checking account</li>
                <li>All the database tables needed</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return null;
}