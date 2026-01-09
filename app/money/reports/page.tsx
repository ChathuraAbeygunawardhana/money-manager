"use client";

import React, { useState } from "react";
import { useDashboard, useAccounts, useCategories, useFilteredReports } from "@/lib/hooks/useMoney";
import Card from "../../components/atoms/Card";
import Button from "../../components/atoms/Button";
import InitializationGuide from "../../components/InitializationGuide";
import CustomDropdown from "../../components/CustomDropdown";

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [filters, setFilters] = useState({
    dateRange: 'custom' as 'custom' | 'preset',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    category: 'all',
    account: 'all',
    transactionType: 'expense' as 'all' | 'income' | 'expense', // Default to expense
    showFilters: false
  });
  
  // Separate state for applied filters
  const [appliedFilters, setAppliedFilters] = useState({
    dateRange: 'custom' as 'custom' | 'preset',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    category: 'all',
    account: 'all',
    transactionType: 'expense' as 'all' | 'income' | 'expense'
  });
  
  // Flag to prevent auto-selection after manual clearing
  const [hasManuallyCleared, setHasManuallyCleared] = useState(false);
  
  const { data, isLoading: loading, error } = useDashboard(selectedPeriod);
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  
  // Set default account to main checking when accounts are loaded
  const mainCheckingAccount = React.useMemo(() => 
    accounts.find(account => account.name === "Main Checking"), 
    [accounts]
  );
  
  // Update filters when accounts are loaded and no account is selected yet
  React.useEffect(() => {
    if (mainCheckingAccount && appliedFilters.account === 'all' && !hasManuallyCleared) {
      const newFilters = { ...appliedFilters, account: mainCheckingAccount.id };
      setAppliedFilters(newFilters);
      setFilters(prev => ({ ...prev, account: mainCheckingAccount.id }));
    }
  }, [mainCheckingAccount, appliedFilters.account, hasManuallyCleared]);
  
  const hasActiveFilters = React.useMemo(() => 
    appliedFilters.category !== 'all' || 
    appliedFilters.account !== 'all' || 
    appliedFilters.transactionType !== 'all',
    [appliedFilters.category, appliedFilters.account, appliedFilters.transactionType]
  );
  
  // Memoize filter parameters to prevent unnecessary API calls
  const filterParams = React.useMemo(() => ({
    startDate: appliedFilters.startDate,
    endDate: appliedFilters.endDate,
    account: appliedFilters.account,
    category: appliedFilters.category,
    transactionType: appliedFilters.transactionType,
    minAmount: '',
    maxAmount: ''
  }), [appliedFilters.startDate, appliedFilters.endDate, appliedFilters.account, appliedFilters.category, appliedFilters.transactionType]);
  
  // Always call useFilteredReports, but enable it only when filters are active
  const { 
    data: filteredData, 
    isLoading: filteredLoading, 
    error: filteredError 
  } = useFilteredReports(filterParams);

  // Memoize report data selection to prevent unnecessary re-renders
  const reportData = React.useMemo(() => 
    hasActiveFilters ? filteredData : data,
    [hasActiveFilters, filteredData, data]
  );
  
  const reportLoading = React.useMemo(() => 
    hasActiveFilters ? filteredLoading : loading,
    [hasActiveFilters, filteredLoading, loading]
  );
  
  const reportError = React.useMemo(() => 
    hasActiveFilters ? filteredError : error,
    [hasActiveFilters, filteredError, error]
  );

  const periodOptions = React.useMemo(() => [
    { value: "7", label: "Last 7 days" },
    { value: "30", label: "Last 30 days" },
    { value: "90", label: "Last 90 days" },
    { value: "365", label: "Last year" }
  ], []);

  const accountOptions = React.useMemo(() => [
    { value: "all", label: "All Accounts" },
    ...accounts.map(account => ({
      value: account.id,
      label: account.name === "Main Checking" ? "Checking" : account.name
    }))
  ], [accounts]);

  const categoryOptions = React.useMemo(() => [
    { value: "all", label: "All Categories" },
    ...categories.map(category => ({
      value: category.id,
      label: category.name
    }))
  ], [categories]);

  const transactionTypeOptions = React.useMemo(() => [
    { value: "all", label: "All Types" },
    { value: "income", label: "Income Only" },
    { value: "expense", label: "Expenses Only" }
  ], []);

  const handleFilterChange = React.useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const applyFilters = React.useCallback(() => {
    setAppliedFilters({
      dateRange: filters.dateRange,
      startDate: filters.startDate,
      endDate: filters.endDate,
      category: filters.category,
      account: filters.account,
      transactionType: filters.transactionType
    });
  }, [filters]);

  const clearFilters = React.useCallback(() => {
    const defaultFilters = {
      dateRange: 'custom' as 'custom' | 'preset',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      category: 'all',
      account: 'all',
      transactionType: 'expense' as 'all' | 'income' | 'expense'
    };
    
    // Keep the filter panel open when clearing
    setFilters({
      ...defaultFilters,
      showFilters: filters.showFilters // Preserve the current showFilters state
    });
    setAppliedFilters(defaultFilters);
    setHasManuallyCleared(true); // Prevent auto-selection after clearing
  }, [filters.showFilters]);

  // Memoize transaction data check - moved before early returns
  const hasTransactions = React.useMemo(() => 
    hasActiveFilters 
      ? (reportData?.summary?.transaction_count > 0)
      : (reportData?.transactions?.total_income > 0 || reportData?.transactions?.total_expenses > 0),
    [hasActiveFilters, reportData]
  );
  
  const expensesByCategory = React.useMemo(() => 
    hasActiveFilters 
      ? (reportData?.top_categories || [])
      : (reportData?.top_categories || []),
    [hasActiveFilters, reportData]
  );
  
  // Memoize adjusted data calculation
  const adjustedData = React.useMemo(() => {
    const transactionData = hasActiveFilters ? reportData?.summary : reportData?.transactions;
    
    return transactionData ? {
      ...transactionData,
      total_income: appliedFilters.transactionType === 'expense' ? 0 : transactionData.total_income,
      total_expenses: appliedFilters.transactionType === 'income' ? 0 : transactionData.total_expenses,
      income_count: appliedFilters.transactionType === 'expense' ? 0 : transactionData.income_count,
      expense_count: appliedFilters.transactionType === 'income' ? 0 : transactionData.expense_count,
      net_income: appliedFilters.transactionType === 'expense' ? -transactionData.total_expenses :
                  appliedFilters.transactionType === 'income' ? transactionData.total_income :
                  transactionData.net_income
    } : null;
  }, [hasActiveFilters, reportData, appliedFilters.transactionType]);
  
  // Memoize insights generation
  const insights = React.useMemo(() => {
    const insightsList = [];
    
    if (adjustedData && adjustedData.total_expenses > adjustedData.total_income) {
      insightsList.push({
        type: "warning",
        title: "Spending Alert",
        message: `You spent Rs.${(adjustedData.total_expenses - adjustedData.total_income).toFixed(2)} more than you earned this period.`
      });
    }
    if (expensesByCategory.length > 0) {
      const topCategory = expensesByCategory[0];
      insightsList.push({
        type: "info",
        title: "Top Spending Category",
        message: `${topCategory.name} accounts for Rs.${topCategory.total_spent.toFixed(2)} of your expenses.`
      });
    }
    if (adjustedData && adjustedData.net_income > 0) {
      insightsList.push({
        type: "success",
        title: "Positive Cash Flow",
        message: `You saved Rs.${adjustedData.net_income.toFixed(2)} this period. Great job!`
      });
    }
    
    return insightsList;
  }, [adjustedData, expensesByCategory]);

  if (reportLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (reportError) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{reportError.message}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="p-6 lg:p-8">
        <InitializationGuide />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Analyze your spending patterns and financial insights</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Filter Toggle */}
          <Button 
            variant={filters.showFilters ? "primary" : "secondary"}
            onClick={() => setFilters(prev => ({ ...prev, showFilters: !prev.showFilters }))}
            className="cursor-pointer"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {hasActiveFilters && <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-2 h-2"></span>}
            Filters
          </Button>
          
          {/* Period Selector */}
          <CustomDropdown
            options={periodOptions}
            value={selectedPeriod.toString()}
            onChange={(value) => setSelectedPeriod(Number(value))}
            className="w-48"
          />
          
          <Button variant="primary" className="cursor-pointer">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            Export Report
          </Button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {filters.showFilters && (
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Advanced Filters</h2>
            <span className="text-sm text-gray-500">Configure filters and click "Apply Filters" to update the report</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date Range - Takes up more space */}
            <div className="space-y-2 lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Date Range</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all duration-200 text-sm h-[50px] min-w-[160px]"
                />
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all duration-200 text-sm h-[50px] min-w-[160px]"
                />
              </div>
            </div>

            {/* Account Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Account</label>
              <CustomDropdown
                options={accountOptions}
                value={filters.account}
                onChange={(value) => handleFilterChange('account', value)}
                placeholder="Select account"
              />
            </div>
          </div>

          {/* Second row for Category and Transaction Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Category Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <CustomDropdown
                options={categoryOptions}
                value={filters.category}
                onChange={(value) => handleFilterChange('category', value)}
                placeholder="Select category"
              />
            </div>

            {/* Transaction Type Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <CustomDropdown
                options={transactionTypeOptions}
                value={filters.transactionType}
                onChange={(value) => handleFilterChange('transactionType', value)}
                placeholder="Select type"
              />
            </div>
          </div>

          {/* Apply Filters Button */}
          <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
            <div className="flex gap-3">
              <Button 
                variant="ghost" 
                onClick={clearFilters} 
                className="cursor-pointer"
              >
                Clear All
              </Button>
              <Button 
                variant="primary" 
                onClick={applyFilters} 
                className="cursor-pointer"
              >
                Apply Filters
              </Button>
            </div>
          </div>

          {/* Filter Summary */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                {appliedFilters.account !== 'all' && (
                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                    Account: {accountOptions.find(a => a.value === appliedFilters.account)?.label}
                    <button 
                      onClick={() => {
                        setFilters(prev => ({ ...prev, account: 'all' }));
                        setAppliedFilters(prev => ({ ...prev, account: 'all' }));
                      }}
                      className="ml-1 text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                )}
                {appliedFilters.category !== 'all' && (
                  <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md">
                    Category: {categoryOptions.find(c => c.value === appliedFilters.category)?.label}
                    <button 
                      onClick={() => {
                        setFilters(prev => ({ ...prev, category: 'all' }));
                        setAppliedFilters(prev => ({ ...prev, category: 'all' }));
                      }}
                      className="ml-1 text-green-600 hover:text-green-800 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                )}
                {appliedFilters.transactionType !== 'all' && (
                  <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-md">
                    Type: {transactionTypeOptions.find(t => t.value === appliedFilters.transactionType)?.label}
                    <button 
                      onClick={() => {
                        setFilters(prev => ({ ...prev, transactionType: 'all' }));
                        setAppliedFilters(prev => ({ ...prev, transactionType: 'all' }));
                      }}
                      className="ml-1 text-purple-600 hover:text-purple-800 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </Card>
      )}

      {!hasTransactions ? (
        /* Empty State */
        <Card className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No data to analyze yet</h3>
          <p className="text-gray-600 mb-6">Add some transactions to see detailed reports and spending insights</p>
          <Button variant="primary" onClick={() => window.location.href = '/money/transactions'} className="cursor-pointer">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Your First Transaction
          </Button>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Income Card - Hide when expense filter is active */}
            {filters.transactionType !== 'expense' && (
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Income</p>
                    <p className="text-2xl font-bold text-green-600 mt-2">Rs.{adjustedData?.total_income?.toFixed(2) || '0.00'}</p>
                    <p className="text-sm text-gray-500 mt-1">{adjustedData?.income_count || 0} transactions</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                  </div>
                </div>
              </Card>
            )}

            {/* Transactions Dropdown - Show when expense filter is active */}
            {filters.transactionType === 'expense' && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Expense Transactions</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{adjustedData?.expense_count || 0}</p>
                    <p className="text-sm text-gray-500 mt-1">Total transactions</p>
                  </div>
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                {/* Transactions Dropdown */}
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {reportData?.transactions?.slice(0, 5).map((transaction: any, index: number) => (
                    <div key={index} className="flex items-center justify-between py-1 text-sm border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: transaction.category_color || '#6B7280' }}
                        ></div>
                        <span className="text-gray-900 truncate max-w-[120px]">{transaction.description}</span>
                      </div>
                      <span className="text-red-600 font-medium">-Rs.{transaction.amount.toFixed(2)}</span>
                    </div>
                  ))}
                  {reportData?.transactions?.length > 5 && (
                    <div className="text-xs text-gray-500 text-center pt-1">
                      +{reportData.transactions.length - 5} more transactions
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Total Expenses Card - Hide when income filter is active */}
            {filters.transactionType !== 'income' && (
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-600 mt-2">Rs.{adjustedData?.total_expenses?.toFixed(2) || '0.00'}</p>
                    <p className="text-sm text-gray-500 mt-1">{adjustedData?.expense_count || 0} transactions</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                    </svg>
                  </div>
                </div>
              </Card>
            )}

            {/* Income Transactions Dropdown - Show when income filter is active */}
            {filters.transactionType === 'income' && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Income Transactions</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{adjustedData?.income_count || 0}</p>
                    <p className="text-sm text-gray-500 mt-1">Total transactions</p>
                  </div>
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                {/* Transactions Dropdown */}
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {reportData?.transactions?.slice(0, 5).map((transaction: any, index: number) => (
                    <div key={index} className="flex items-center justify-between py-1 text-sm border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: transaction.category_color || '#6B7280' }}
                        ></div>
                        <span className="text-gray-900 truncate max-w-[120px]">{transaction.description}</span>
                      </div>
                      <span className="text-green-600 font-medium">+Rs.{transaction.amount.toFixed(2)}</span>
                    </div>
                  ))}
                  {reportData?.transactions?.length > 5 && (
                    <div className="text-xs text-gray-500 text-center pt-1">
                      +{reportData.transactions.length - 5} more transactions
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Net Income Card - Show when all types or no specific filter */}
            {filters.transactionType === 'all' && (
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Net Income</p>
                    <p className={`text-2xl font-bold mt-2 ${(adjustedData?.net_income || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(adjustedData?.net_income || 0) >= 0 ? '+' : ''}Rs.{adjustedData?.net_income?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {(adjustedData?.net_income || 0) >= 0 ? 'Surplus' : 'Deficit'}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    (adjustedData?.net_income || 0) >= 0 ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <svg className={`h-6 w-6 ${(adjustedData?.net_income || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Spending by Category */}
          {expensesByCategory.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {filters.transactionType === 'income' ? 'Income by Category' : 
                 filters.transactionType === 'expense' ? 'Expenses by Category' : 
                 'Transactions by Category'}
              </h2>
              <div className="space-y-4">
                {expensesByCategory.map((category: any, index: number) => {
                  const totalAmount = filters.transactionType === 'income' ? 
                    (adjustedData?.total_income || 0) : 
                    filters.transactionType === 'expense' ? 
                    (adjustedData?.total_expenses || 0) : 
                    ((adjustedData?.total_income || 0) + (adjustedData?.total_expenses || 0));
                  
                  const percentage = totalAmount > 0 
                    ? (category.total_spent / totalAmount) * 100 
                    : 0;
                  
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <div>
                          <p className="font-medium text-gray-900">{category.name}</p>
                          <p className="text-sm text-gray-600">{category.transaction_count} transactions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">Rs.{category.total_spent.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">{percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Insights */}
          {insights.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Financial Insights</h2>
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${
                    insight.type === 'warning' ? 'bg-red-50 border-red-400' :
                    insight.type === 'success' ? 'bg-green-50 border-green-400' :
                    'bg-blue-50 border-blue-400'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        insight.type === 'warning' ? 'bg-red-100' :
                        insight.type === 'success' ? 'bg-green-100' :
                        'bg-blue-100'
                      }`}>
                        {insight.type === 'warning' ? (
                          <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        ) : insight.type === 'success' ? (
                          <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{insight.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{insight.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Spending Trend */}
          {reportData?.spending_trend && reportData.spending_trend.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Spending Trend</h2>
              <div className="space-y-3">
                {reportData.spending_trend.slice(-7).map((trend: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="text-sm font-medium text-gray-900">{trend.date}</div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-green-600">+Rs.{trend.income.toFixed(2)}</div>
                      <div className="text-sm text-red-600">-Rs.{trend.expenses.toFixed(2)}</div>
                      <div className={`text-sm font-medium ${trend.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trend.net >= 0 ? '+' : ''}Rs.{trend.net.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Report Tips */}
      <Card className="p-6 mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Report Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
              <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Spending Analysis</h3>
              <p className="text-sm text-gray-600">See where your money goes by category</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
              <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Trends & Insights</h3>
              <p className="text-sm text-gray-600">Track spending patterns over time</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shrink-0">
              <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Smart Alerts</h3>
              <p className="text-sm text-gray-600">Get notified about unusual spending</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}