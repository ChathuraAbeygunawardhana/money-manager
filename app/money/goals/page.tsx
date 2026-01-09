"use client";

import Card from "../../components/atoms/Card";
import Button from "../../components/atoms/Button";

export default function GoalsPage() {
  const goals = [
    {
      id: 1,
      title: "Emergency Fund",
      description: "Build 6 months of expenses as emergency fund",
      targetAmount: 15000,
      currentAmount: 8500,
      deadline: "2025-12-31",
      category: "Safety",
      color: "bg-gray-500",
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      id: 2,
      title: "Vacation Fund",
      description: "Save for a 2-week European vacation",
      targetAmount: 5000,
      currentAmount: 2800,
      deadline: "2025-07-01",
      category: "Lifestyle",
      color: "bg-green-500",
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 3,
      title: "New Car",
      description: "Save for a reliable used car",
      targetAmount: 20000,
      currentAmount: 5200,
      deadline: "2026-03-01",
      category: "Transportation",
      color: "bg-red-500",
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
        </svg>
      )
    },
    {
      id: 4,
      title: "Home Down Payment",
      description: "20% down payment for first home",
      targetAmount: 50000,
      currentAmount: 12000,
      deadline: "2027-01-01",
      category: "Housing",
      color: "bg-red-500",
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    }
  ];

  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const overallProgress = (totalCurrentAmount / totalTargetAmount) * 100;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Goals</h1>
          <p className="text-gray-600 mt-1">Track your progress towards financial milestones</p>
        </div>
        <Button variant="primary">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Goal
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Goal Amount</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">${totalTargetAmount.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Amount Saved</p>
              <p className="text-2xl font-bold text-green-600 mt-2">${totalCurrentAmount.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overall Progress</p>
              <p className="text-2xl font-bold text-gray-600 mt-2">{overallProgress.toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {goals.map((goal) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          const remaining = goal.targetAmount - goal.currentAmount;
          const daysUntilDeadline = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          return (
            <Card key={goal.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    goal.color.replace('bg-', 'bg-').replace('-500', '-100')
                  }`}>
                    <div className={goal.color.replace('bg-', 'text-')}>
                      {goal.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{goal.title}</h3>
                    <p className="text-sm text-gray-600">{goal.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-gray-600 hover:text-gray-900 cursor-pointer" title="Edit goal">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button className="text-gray-600 hover:text-red-600 cursor-pointer" title="Delete goal">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Progress Section */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Progress</span>
                  <span className="text-sm font-medium text-gray-900">{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${goal.color}`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Goal Details */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Current Amount</p>
                  <p className="text-lg font-semibold text-gray-900">${goal.currentAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Target Amount</p>
                  <p className="text-lg font-semibold text-gray-900">${goal.targetAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Remaining</p>
                  <p className="text-lg font-semibold text-red-600">${remaining.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Days Left</p>
                  <p className={`text-lg font-semibold ${
                    daysUntilDeadline > 365 ? 'text-green-600' : 
                    daysUntilDeadline > 90 ? 'text-gray-600' : 'text-red-600'
                  }`}>
                    {daysUntilDeadline} days
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button variant="primary" size="sm" className="flex-1">
                  Add Money
                </Button>
                <Button variant="secondary" size="sm" className="flex-1">
                  View Details
                </Button>
              </div>

              {/* Category Badge */}
              <div className="mt-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  goal.category === 'Safety' ? 'bg-gray-100 text-gray-800' :
                  goal.category === 'Lifestyle' ? 'bg-green-100 text-green-800' :
                  goal.category === 'Transportation' ? 'bg-red-100 text-red-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {goal.category}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Goal Tips */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Goal Setting Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
              <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Be Specific</h3>
              <p className="text-sm text-gray-600">Set clear, measurable targets</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
              <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Set Deadlines</h3>
              <p className="text-sm text-gray-600">Create urgency with time limits</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shrink-0">
              <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Automate</h3>
              <p className="text-sm text-gray-600">Set up automatic transfers</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
              <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Track Progress</h3>
              <p className="text-sm text-gray-600">Review regularly and adjust</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}