"use client";

import Card from "../../components/atoms/Card";
import Button from "../../components/atoms/Button";

export default function BudgetsPage() {
  const budgets = [
    {
      id: 1,
      category: "Food & Dining",
      budgeted: 600,
      spent: 450,
      remaining: 150,
      color: "bg-gray-500",
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 5M7 13l-1.5 5m0 0h9m-9 0a2 2 0 104 0m5 0a2 2 0 104 0" />
        </svg>
      )
    },
    {
      id: 2,
      category: "Transportation",
      budgeted: 400,
      spent: 280,
      remaining: 120,
      color: "bg-green-500",
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
        </svg>
      )
    },
    {
      id: 3,
      category: "Entertainment",
      budgeted: 200,
      spent: 180,
      remaining: 20,
      color: "bg-red-500",
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h2a1 1 0 011 1v3" />
        </svg>
      )
    },
    {
      id: 4,
      category: "Utilities",
      budgeted: 350,
      spent: 320,
      remaining: 30,
      color: "bg-gray-500",
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      id: 5,
      category: "Health & Fitness",
      budgeted: 150,
      spent: 50,
      remaining: 100,
      color: "bg-red-500",
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    },
    {
      id: 6,
      category: "Shopping",
      budgeted: 300,
      spent: 420,
      remaining: -120,
      color: "bg-red-500",
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      )
    }
  ];

  const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.budgeted, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const totalRemaining = totalBudgeted - totalSpent;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
          <p className="text-gray-600 mt-1">Plan and track your spending by category</p>
        </div>
        <Button variant="primary">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Budget
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Budgeted</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">${totalBudgeted.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-red-600 mt-2">${totalSpent.toFixed(2)}</p>
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
              <p className="text-sm font-medium text-gray-600">Remaining</p>
              <p className={`text-2xl font-bold mt-2 ${
                totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ${totalRemaining.toFixed(2)}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              totalRemaining >= 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <svg className={`h-6 w-6 ${
                totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Budget Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.map((budget) => {
          const percentage = (budget.spent / budget.budgeted) * 100;
          const isOverBudget = budget.spent > budget.budgeted;
          
          return (
            <Card key={budget.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    budget.color.replace('bg-', 'bg-').replace('-500', '-100')
                  }`}>
                    <div className={budget.color.replace('bg-', 'text-')}>
                      {budget.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{budget.category}</h3>
                    <p className="text-sm text-gray-600">
                      ${budget.spent} of ${budget.budgeted}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-gray-600 hover:text-gray-900 cursor-pointer" title="Edit budget">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button className="text-gray-600 hover:text-red-600 cursor-pointer" title="Delete budget">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      isOverBudget ? 'bg-red-500' : budget.color
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className={`text-sm font-medium ${
                    isOverBudget ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {percentage.toFixed(0)}% used
                  </span>
                  <span className={`text-sm font-medium ${
                    budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {budget.remaining >= 0 ? '$' + budget.remaining.toFixed(2) + ' left' : '$' + Math.abs(budget.remaining).toFixed(2) + ' over'}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex justify-between items-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  isOverBudget 
                    ? 'bg-red-100 text-red-800' 
                    : percentage > 80 
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                }`}>
                  {isOverBudget ? 'Over Budget' : percentage > 80 ? 'Nearly Full' : 'On Track'}
                </span>
                <Button variant="ghost" size="sm">
                  View Details
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Budget Tips */}
      <Card className="p-6 mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Budget Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
              <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Track Daily</h3>
              <p className="text-sm text-gray-600">Review your spending daily to stay on track</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
              <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Set Alerts</h3>
              <p className="text-sm text-gray-600">Get notified when you're close to limits</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
              <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Review Monthly</h3>
              <p className="text-sm text-gray-600">Adjust budgets based on spending patterns</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}