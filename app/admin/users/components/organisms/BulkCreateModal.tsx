"use client";

import { useState } from "react";
import Button from "../atoms/Button";
import CustomDropdown from "@/app/components/CustomDropdown";
import type { BulkCreateData } from "../../types";

interface BulkCreateModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (data: BulkCreateData) => Promise<void>;
}

export default function BulkCreateModal({ isOpen, isLoading, onClose, onSubmit }: BulkCreateModalProps) {
  const [formData, setFormData] = useState({
    count: 10,
    gender: "female" as "male" | "female",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    setFormData({ count: 10, gender: "female" });
  };

  const handleClose = () => {
    onClose();
    setFormData({ count: 10, gender: "female" });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-md w-full p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight">Bulk Create Users</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Number of Users</label>
            <input
              type="number"
              min="1"
              max="100"
              value={formData.count}
              onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) || 1 })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all duration-200"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Maximum 100 users per batch</p>
          </div>
          
          <CustomDropdown
            label="Gender"
            options={[
              { value: "female", label: "Female" },
              { value: "male", label: "Male" }
            ]}
            value={formData.gender}
            onChange={(value) => setFormData({ ...formData, gender: value as "male" | "female" })}
          />
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Generated User Details:</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Names: Random {formData.gender} names from predefined list</li>
              <li>• Email: name + 3 random numbers @gmail.com</li>
              <li>• Age: Random between 18-35 years</li>
              <li>• Height & Weight: Realistic values based on gender</li>
              <li>• Bio: Professional descriptions</li>
              <li>• Profile Picture: {formData.gender === 'female' ? 'Random from available images' : 'None (male users)'}</li>
              <li>• Password: password123 (default)</li>
              <li>• Role: User</li>
            </ul>
          </div>
          
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              onClick={handleClose}
              variant="secondary"
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
              className="flex-1"
            >
              {isLoading ? "Creating..." : `Create ${formData.count} Users`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}