"use client";

import { useState, useEffect } from "react";
import { useAccounts, useCategories } from "@/lib/hooks/useMoney";
import Button from "./atoms/Button";
import Input from "./atoms/Input";
import CustomDropdown from "./CustomDropdown";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editingTransaction?: any;
}

export default function TransactionModal({ isOpen, onClose, onSuccess, editingTransaction }: TransactionModalProps) {
  const [formData, setFormData] = useState({
    account_id: "",
    category_id: "",
    type: "expense" as "income" | "expense",
    amount: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    tags: [] as string[],
    notes: ""
  });
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { accounts } = useAccounts();
  const { categories } = useCategories(formData.type);

  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        // Populate form with existing transaction data
        setFormData({
          account_id: editingTransaction.account_id || "",
          category_id: editingTransaction.category_id || "",
          type: editingTransaction.type || "expense",
          amount: editingTransaction.amount?.toString() || "",
          description: editingTransaction.description || "",
          date: editingTransaction.date 
            ? new Date(editingTransaction.date * 1000).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          tags: editingTransaction.tags || [],
          notes: editingTransaction.notes || ""
        });
      } else {
        // Reset form for new transaction
        setFormData({
          account_id: "",
          category_id: "",
          type: "expense",
          amount: "",
          description: "",
          date: new Date().toISOString().split('T')[0],
          tags: [],
          notes: ""
        });
      }
      setTagInput("");
      setError(null);
    }
  }, [isOpen, editingTransaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const parsedAmount = parseFloat(formData.amount);
      
      // Client-side validation
      if (!formData.account_id) {
        setError("Please select an account");
        return;
      }
      
      if (!formData.amount || isNaN(parsedAmount) || parsedAmount <= 0) {
        setError("Please enter a valid amount greater than 0");
        return;
      }
      
      if (!formData.description.trim()) {
        setError("Please enter a description");
        return;
      }

      const requestData = {
        ...formData,
        amount: parsedAmount,
      };

      console.log("Submitting transaction data:", requestData);

      const url = editingTransaction 
        ? `/api/money/transactions/${editingTransaction.id}`
        : "/api/money/transactions";
      
      const method = editingTransaction ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create transaction");
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.target === e.currentTarget) {
      e.preventDefault();
      handleAddTag();
    }
  };

  if (!isOpen) return null;

  // Prepare dropdown options
  const accountOptions = [
    { value: "", label: "Select an account" },
    ...accounts.map(account => ({
      value: account.id,
      label: `${account.name} (${account.type})`
    }))
  ];

  const categoryOptions = [
    { value: "", label: "Select a category" },
    ...categories.map(category => ({
      value: category.id,
      label: category.name
    }))
  ];

  return (
    <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            {editingTransaction ? "Edit Transaction" : "Add Transaction"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 cursor-pointer"
            title="Close"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type - Full width */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <div className="flex gap-2 max-w-md">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: "expense", category_id: "" }))}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  formData.type === "expense"
                    ? "bg-red-100 text-red-700 border-2 border-red-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent"
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: "income", category_id: "" }))}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  formData.type === "income"
                    ? "bg-green-100 text-green-700 border-2 border-green-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent"
                }`}
              >
                Income
              </button>
            </div>
          </div>

          {/* Main form fields in 3 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <CustomDropdown
              label="Account *"
              options={accountOptions}
              value={formData.account_id}
              onChange={(value) => setFormData(prev => ({ ...prev, account_id: value }))}
              placeholder="Select an account"
            />

            <CustomDropdown
              label="Category"
              options={categoryOptions}
              value={formData.category_id}
              onChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
              placeholder="Select a category"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Description and Date in 2 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <Input
                placeholder="Enter transaction description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Tags and Notes in 2 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add a tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim()}
                  className="shrink-0"
                >
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-md"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-gray-500 hover:text-gray-700 cursor-pointer"
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                placeholder="Additional notes (optional)"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                rows={4}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 max-w-md mx-auto">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Transaction"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}