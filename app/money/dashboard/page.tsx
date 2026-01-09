"use client";

import { useDashboard } from "@/lib/hooks/useMoney";
import Card from "../../components/atoms/Card";
import Button from "../../components/atoms/Button";
import InitializationGuide from "../../components/InitializationGuide";

export default function DashboardPage() {
  const { data, loading, error } = useDashboard(30);

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 lg:p-8">
        <InitializationGuide />
      </div>
    );
  }

  const stats = [
    {
      title: "Net Worth",
      value: `$${data.accounts.net_worth.toFixed(2)}`,
      change: data.transactions.net_income >= 0 ? `+$${data.transactions.net_income.toFixed(2)}` : `-$${Math.abs(data.transactions.net_income).toFixed(2)}`,
      changeType: data.transactions.net_income >= 0 ? "positive" as const : "negative" as const,
      icon: (
        <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    },
    {
      title: "Monthly Income",
      value: `$${data.transactions.total_income.toFixed(2)}`,
      change: `${data.transactions.income_count} transactions`,
      changeType: "positive" as const,
      icon: (
        <svg className="h-8 w-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
        </svg>
      )
    },
    {
      title: "Monthly Expenses",
      value: `$${data.transactions.total_expenses.toFixed(2)}`,
      change: `${data.transactions.expense_count} transactions`,
      changeType: "negative" as const,
      icon: (
        <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
        </svg>
      )
    },
    {
      title: "Liquid Assets",
      value: `$${data.accounts.liquid_assets.toFixed(2)}`,
      change: `Available now`,
      changeType: "positive" as const,
      icon: (
        <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    }
  ];

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Initialization Guide */}
      <InitializationGuide />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className={`text-sm mt-1 ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </p>
              </div>
              <div className="shrink-0">
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Transactions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
            <Button variant="ghost" size="sm" onClick={() => window.location.href = '/money/transactions'}>
              View All
            </Button>
          </div>
          <div className="space-y-4">
            {data.recent_transactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No transactions yet</p>
                <Button variant="primary" onClick={() => window.location.href = '/money/transactions'}>
                  Add Your First Transaction
                </Button>
              </div>
            ) : (
              data.recent_transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'income' ? (
                        <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-600">
                        {transaction.category_name || 'Uncategorized'} • {formatDate(transaction.date)}
                      </p>
                    </div>
                  </div>
                  <div className={`font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Budget Overview */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Budget Overview</h2>
            <Button variant="ghost" size="sm" onClick={() => window.location.href = '/money/budgets'}>
              Manage
            </Button>
          </div>
          <div className="space-y-6">
            {data.budgets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No budgets set up yet</p>
                <Button variant="primary" onClick={() => window.location.href = '/money/budgets'}>
                  Create Your First Budget
                </Button>
              </div>
            ) : (
              data.budgets.slice(0, 4).map((budget) => {
                const percentage = budget.percentage_used;
                const isOverBudget = percentage > 100;
                const isNearLimit = percentage > (budget.alert_threshold * 100);
                
                return (
                  <div key={budget.id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{budget.name}</span>
                      <span className="text-sm text-gray-600">
                        ${budget.spent_amount.toFixed(2)} / ${budget.amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          isOverBudget ? 'bg-red-500' : 
                          isNearLimit ? 'bg-red-500' : 
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className={`text-xs mt-1 ${
                      isOverBudget ? 'text-red-600' : 
                      isNearLimit ? 'text-red-600' : 
                      'text-gray-500'
                    }`}>
                      {percentage.toFixed(0)}% used
                      {isOverBudget && ' (Over budget!)'}
                      {isNearLimit && !isOverBudget && ' (Near limit)'}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* Top Spending Categories */}
      {data.top_categories.length > 0 && (
        <div className="mt-8">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Top Spending Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.top_categories.slice(0, 6).map((category) => (
                <div key={category.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{category.name}</p>
                    <p className="text-sm text-gray-600">{category.transaction_count} transactions</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">-${category.total_spent.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            variant="primary" 
            className="h-20 flex-col"
            onClick={() => window.location.href = '/money/transactions'}
          >
            <svg className="h-6 w-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Transaction
          </Button>
          <Button 
            variant="secondary" 
            className="h-20 flex-col"
            onClick={() => window.location.href = '/money/budgets'}
          >
            <svg className="h-6 w-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Create Budget
          </Button>
          <Button 
            variant="secondary" 
            className="h-20 flex-col"
            onClick={() => window.location.href = '/money/goals'}
          >
            <svg className="h-6 w-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Set Goal
          </Button>
          <Button 
            variant="secondary" 
            className="h-20 flex-col"
            onClick={() => window.location.href = '/money/reports'}
          >
            <svg className="h-6 w-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            View Report
          </Button>
        </div>
      </div>
    </div>
  );
}