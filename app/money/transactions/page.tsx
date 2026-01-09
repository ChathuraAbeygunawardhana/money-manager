"use client";

import { useState } from "react";
import { useTransactions, useAccounts, useCategories, useDeleteTransaction } from "@/lib/hooks/useMoney";
import Card from "../../components/atoms/Card";
import Button from "../../components/atoms/Button";
import Input from "../../components/atoms/Input";
import TransactionModal from "../../components/TransactionModal";
import InitializationGuide from "../../components/InitializationGuide";

export default function TransactionsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; transactionId: string; description: string }>({
    show: false,
    transactionId: "",
    description: "",
  });

  const { data: transactions = [], isLoading: loading, error, refetch } = useTransactions();
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  
  const deleteTransactionMutation = useDeleteTransaction();

  // Create a combined list of all categories for filtering
  const allCategories = ["all", ...Array.from(new Set(categories.map(c => c.name)))];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesCategory = selectedCategory === "all" || transaction.category_name === selectedCategory;
    return matchesCategory;
  });

  const totalIncome = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const formatAmount = (amount: number, type: string) => {
    const formatted = Math.abs(amount).toFixed(2);
    return type === "income" ? `+Rs.${formatted}` : `-Rs.${formatted}`;
  };

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (transaction: any) => {
    setDeleteConfirm({
      show: true,
      transactionId: transaction.id,
      description: transaction.description,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteTransactionMutation.mutateAsync(deleteConfirm.transactionId);
      setDeleteConfirm({ show: false, transactionId: "", description: "" });
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">Track and manage your financial transactions</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Transaction
        </Button>
      </div>

      {/* Initialization Guide */}
      <InitializationGuide />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error.message}</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Income</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">+Rs.{totalIncome.toFixed(2)}</p>
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
                  <p className="text-2xl font-bold text-red-600 mt-2">-Rs.{totalExpenses.toFixed(2)}</p>
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
                  <p className="text-sm font-medium text-gray-600">Net Balance</p>
                  <p className={`text-2xl font-bold mt-2 ${
                    (totalIncome - totalExpenses) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    Rs.{(totalIncome - totalExpenses).toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-6 mb-6">
            <div className="flex gap-2 flex-wrap">
              {allCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                    selectedCategory === category
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category === "all" ? "All" : category}
                </button>
              ))}
            </div>
          </Card>

          {/* Transactions List */}
          <Card className="overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredTransactions.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-gray-500 mb-4">No transactions found</p>
                  <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                    Add Your First Transaction
                  </Button>
                </div>
              ) : (
                filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          transaction.type === "income" ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {transaction.type === "income" ? (
                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                            </svg>
                          ) : (
                            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{transaction.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {transaction.category_name && (
                              <>
                                <span className="text-sm text-gray-600">{transaction.category_name}</span>
                                <span className="text-gray-400">•</span>
                              </>
                            )}
                            <span className="text-sm text-gray-600">{transaction.account_name}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-600">{formatDate(transaction.date)}</span>
                          </div>
                          {transaction.tags && transaction.tags.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {transaction.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          transaction.type === "income" ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatAmount(transaction.amount, transaction.type)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <button 
                            onClick={() => handleEdit(transaction)}
                            className="text-gray-600 hover:text-gray-900 cursor-pointer" 
                            title="Edit transaction"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(transaction)}
                            className="text-gray-600 hover:text-red-600 cursor-pointer" 
                            title="Delete transaction"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </>
      )}

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        onSuccess={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        editingTransaction={editingTransaction}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Delete Transaction</h2>
            <p className="text-gray-600 mb-8">
              Are you sure you want to delete <span className="font-semibold text-gray-900">{deleteConfirm.description}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirm({ show: false, transactionId: "", description: "" })}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-900 border border-gray-300 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}