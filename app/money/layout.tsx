"use client";

import { useState } from "react";
import MoneyManagerSidebar from "../components/MoneyManagerSidebar";

export default function MoneyLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <MoneyManagerSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div className="flex-1 h-screen flex flex-col overflow-hidden">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden fixed top-4 left-4 z-30 p-2 bg-white rounded-lg shadow-md border border-gray-200 cursor-pointer"
        >
          <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight ml-12 lg:ml-0">
                Welcome to MoneyTracker
              </h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}