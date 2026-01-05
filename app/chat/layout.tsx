"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminSidebar from "../components/AdminSidebar";
import UserSidebar from "../components/UserSidebar";

import { useSubmitReport } from "@/lib/hooks/useReports";
import { useNotification } from "@/lib/hooks/useNotification";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showNotification } = useNotification();
  const submitReportMutation = useSubmitReport();

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [reportDescription, setReportDescription] = useState("");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);



  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);



  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim() || !reportDescription.trim()) return;

    try {
      await submitReportMutation.mutateAsync({
        title: reportTitle,
        description: reportDescription,
      });
      setShowReportModal(false);
      setReportTitle("");
      setReportDescription("");
      showNotification("Report submitted successfully");
    } catch (error) {
      showNotification("Failed to submit report", "error");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  const isAdmin = session?.user?.role === "admin";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {isAdmin && <AdminSidebar />}
      {!isAdmin && (
        <UserSidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
      )}
      
      <div className="flex-1 h-screen flex flex-col overflow-hidden">
        {/* Mobile Menu Button for Regular Users */}
        {!isAdmin && (
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden fixed top-4 left-4 z-30 p-2 bg-white rounded-lg border border-gray-200 shadow-lg cursor-pointer hover:bg-gray-50 transition-all duration-200"
            aria-label="Toggle menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isSidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        )}

        {/* Header for All Users */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 shrink-0">
          <div className="flex justify-between items-center">
            <div className={!isAdmin ? "ml-12 lg:ml-0" : ""}>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">
                {isAdmin ? "Admin Dashboard" : `Welcome, ${session?.user?.name}`}
              </h1>
            </div>
            <div className="flex gap-2">
              {!isAdmin && (
                <button
                  onClick={() => setShowReportModal(true)}
                  className="px-3 lg:px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 cursor-pointer text-sm"
                >
                  <span className="hidden lg:inline">Report Problem</span>
                  <span className="lg:hidden">Report</span>
                </button>
              )}
              <button
                onClick={() => router.push("/")}
                className="px-3 lg:px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 cursor-pointer text-sm"
              >
                <span className="hidden lg:inline">Home</span>
                <span className="lg:hidden">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>



      {/* Report Problem Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Report a Problem</h2>
            <form onSubmit={handleReportSubmit}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="Brief description of the issue"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all duration-200"
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Provide more details about the problem..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all duration-200 resize-none"
                  required
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowReportModal(false);
                    setReportTitle("");
                    setReportDescription("");
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-900 border border-gray-300 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitReportMutation.isPending}
                  className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {submitReportMutation.isPending ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}