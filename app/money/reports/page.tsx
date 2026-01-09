"use client";

import { useState } from "react";
import { useDashboard } from "@/lib/hooks/useMoney";
import Card from "../../components/atoms/Card";
import Button from "../../components/atoms/Button";
import InitializationGuide from "../../components/InitializationGuide";
import CustomDropdown from "../../components/CustomDropdown";

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const { data, isLoading: loading, error } = useDashboard(selectedPeriod);

  const periodOptions = [
    { value: "7", label: "Last 7 days" },
    { value: "30", label: "Last 30 days" },
    { value: "90", label: "Last 90 days" },
    { value: "365", label: "Last year" }
  ];

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
          <p className="text-red-600 mb-4">{error.message}</p>
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

  // Check if we have any transaction data
  const hasTransactions = data.transactions.total_income > 0 || data.transactions.total_expenses > 0;
  const expensesByCategory = data.top_categories || [];
  
  // Generate insights based on the data
  const insights = [];
  if (data.transactions.total_expenses > data.transactions.total_income) {
    insights.push({
      type: "warning",
      title: "Spending Alert",
      message: `You spent Rs.${(data.transactions.total_expenses - data.transactions.total_income).toFixed(2)} more than you earned this period.`
    });
  }
  if (data.top_categories.length > 0) {
    const topCategory = data.top_categories[0];
    insights.push({
      type: "info",
      title: "Top Spending Category",
      message: `${topCategory.name} accounts for Rs.${topCategory.total_spent.toFixed(2)} of your expenses.`
    });
  }
  if (data.transactions.net_income > 0) {
    insights.push({
      type: "success",
      title: "Positive Cash Flow",
      message: `You saved Rs.${data.transactions.net_income.toFixed(2)} this period. Great job!`
    });
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
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Income</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">Rs.{data.transactions.total_income.toFixed(2)}</p>
                  <p className="text-sm text-gray-500 mt-1">{data.transactions.income_count} transactions</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600 mt-2">Rs.{data.transactions.total_expenses.toFixed(2)}</p>
                  <p className="text-sm text-gray-500 mt-1">{data.transactions.expense_count} transactions</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                  </svg>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Net Income</p>
                  <p className={`text-2xl font-bold mt-2 ${data.transactions.net_income >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {data.transactions.net_income >= 0 ? '+' : ''}Rs.{data.transactions.net_income.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {data.transactions.net_income >= 0 ? 'Surplus' : 'Deficit'}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  data.transactions.net_income >= 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <svg className={`h-6 w-6 ${data.transactions.net_income >= 0 ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </Card>
          </div>

          {/* Spending by Category */}
          {expensesByCategory.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Spending by Category</h2>
              <div className="space-y-4">
                {expensesByCategory.map((category: any, index: number) => {
                  const percentage = data.transactions.total_expenses > 0 
                    ? (category.total_spent / data.transactions.total_expenses) * 100 
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
          {data.spending_trend && data.spending_trend.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Spending Trend</h2>
              <div className="space-y-3">
                {data.spending_trend.slice(-7).map((trend: any, index: number) => (
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