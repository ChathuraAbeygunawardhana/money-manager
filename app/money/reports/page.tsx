"use client";

import { useState } from "react";
import Card from "../../components/atoms/Card";
import Button from "../../components/atoms/Button";
import CustomDropdown from "../../components/CustomDropdown";

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const periods = [
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "quarter", label: "This Quarter" },
    { value: "year", label: "This Year" }
  ];

  const expensesByCategory = [
    { category: "Food & Dining", amount: 450, percentage: 32, color: "bg-red-500" },
    { category: "Transportation", amount: 280, percentage: 20, color: "bg-green-500" },
    { category: "Shopping", amount: 420, percentage: 30, color: "bg-red-500" },
    { category: "Utilities", amount: 120, percentage: 8, color: "bg-gray-500" },
    { category: "Entertainment", amount: 140, percentage: 10, color: "bg-gray-400" }
  ];

  const monthlyTrends = [
    { month: "Aug", income: 4200, expenses: 2800 },
    { month: "Sep", income: 4200, expenses: 3100 },
    { month: "Oct", income: 4500, expenses: 2900 },
    { month: "Nov", income: 4200, expenses: 3200 },
    { month: "Dec", income: 4200, expenses: 2850 },
    { month: "Jan", income: 4200, expenses: 2650 }
  ];

  const insights = [
    {
      type: "positive",
      title: "Great Progress!",
      description: "You've reduced your spending by 15% compared to last month",
      icon: (
        <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      type: "warning",
      title: "Watch Your Shopping",
      description: "Shopping expenses are 40% higher than your budget allows",
      icon: (
        <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      )
    },
    {
      type: "info",
      title: "Savings Opportunity",
      description: "You could save $200/month by reducing dining out expenses",
      icon: (
        <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-600 mt-1">Analyze your spending patterns and financial health</p>
        </div>
        <div className="flex items-center gap-4">
          <CustomDropdown
            options={periods}
            value={selectedPeriod}
            onChange={setSelectedPeriod}
            className="w-48"
          />
          <Button variant="primary">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Worth</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">$12,450</p>
              <p className="text-sm text-green-600 mt-1">+8.5% from last month</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Savings Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">32%</p>
              <p className="text-sm text-green-600 mt-1">Above average</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Daily Spend</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">$85.50</p>
              <p className="text-sm text-red-600 mt-1">+12% from last month</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Budget Adherence</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">78%</p>
              <p className="text-sm text-red-600 mt-1">Room for improvement</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Expense Breakdown */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Expenses by Category</h2>
          <div className="space-y-4">
            {expensesByCategory.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
                  <span className="text-sm font-medium text-gray-900">{item.category}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-16 text-right">
                    ${item.amount}
                  </span>
                  <span className="text-sm text-gray-600 w-8 text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Monthly Trends */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Income vs Expenses</h2>
          <div className="space-y-4">
            {monthlyTrends.map((month, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-gray-900 w-12">{month.month}</span>
                <div className="flex-1 mx-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-3 relative">
                      <div 
                        className="h-3 bg-green-500 rounded-full"
                        style={{ width: `${(month.income / 5000) * 100}%` }}
                      ></div>
                      <div 
                        className="h-3 bg-red-500 rounded-full absolute top-0"
                        style={{ width: `${(month.expenses / 5000) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-green-600">+${month.income}</div>
                  <div className="text-sm font-semibold text-red-600">-${month.expenses}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Income</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Expenses</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Insights */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Financial Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {insights.map((insight, index) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${
              insight.type === 'positive' ? 'bg-green-50 border-green-500' :
              insight.type === 'warning' ? 'bg-red-50 border-red-500' :
              'bg-gray-50 border-gray-500'
            }`}>
              <div className="flex items-start gap-3">
                <div className="shrink-0">
                  {insight.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{insight.title}</h3>
                  <p className="text-sm text-gray-600">{insight.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Export Options */}
      <Card className="p-6 mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Export Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="secondary" className="justify-start">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export as PDF
          </Button>
          <Button variant="secondary" className="justify-start">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export as CSV
          </Button>
          <Button variant="secondary" className="justify-start">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            Share Report
          </Button>
        </div>
      </Card>
    </div>
  );
}