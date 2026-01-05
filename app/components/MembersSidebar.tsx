"use client";

import { useChatroomMembers } from "@/lib/hooks/useChatroomMembers";
import { useSession } from "next-auth/react";

interface MembersSidebarProps {
  chatroomId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function MembersSidebar({ chatroomId, isOpen, onClose }: MembersSidebarProps) {
  const { data: members = [], isLoading, error } = useChatroomMembers(chatroomId, isOpen);
  const { data: session } = useSession();

  if (!isOpen) return null;

  const isAdmin = session?.user?.role === "admin";
  
  // Filter out admin accounts from the members list
  const nonAdminMembers = members.filter(member => member.role !== 'admin');

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col shrink-0 animate-in slide-in-from-right duration-300 md:relative fixed right-0 top-0 h-full z-50 md:z-auto shadow-xl md:shadow-none">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 tracking-tight">
          Members
        </h2>
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-900 cursor-pointer"
          title="Close members panel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-100 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-600 text-sm">Failed to load members</p>
          </div>
        ) : nonAdminMembers.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No members found</p>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
              {nonAdminMembers.length} {nonAdminMembers.length === 1 ? 'Member' : 'Members'}
            </div>
            {nonAdminMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                {/* Avatar */}
                <div className="h-10 w-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-medium text-sm">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                
                {/* Member Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {member.name}
                    </p>
                    {member.role === 'admin' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {isAdmin ? member.email : `Joined ${member.joined_at ? new Date(Number(member.joined_at) * 1000).toLocaleDateString() : 'Recently'}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}