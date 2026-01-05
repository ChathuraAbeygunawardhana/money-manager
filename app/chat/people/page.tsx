"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useUsers } from "@/lib/hooks/useUsers";
import { useSendDirectMessage } from "@/lib/hooks/useInbox";
import ProfileModal from "@/app/components/ProfileModal";
import ProfilePicture from "@/app/components/ProfilePicture";
import CustomDropdown from "@/app/components/CustomDropdown";
import { SearchInput, AgeRangeFilter } from "@/app/components/shared";

export default function PeoplePage() {
  const { data: session } = useSession();
  const { data: users = [], isLoading } = useUsers();
  const router = useRouter();
  const sendMessage = useSendDirectMessage();
  
  const isAdmin = session?.user?.role === "admin";
  
  const [showMessageModal, setShowMessageModal] = useState<{
    show: boolean;
    userId: string;
    userName: string;
  }>({
    show: false,
    userId: "",
    userName: "",
  });
  const [showProfileModal, setShowProfileModal] = useState<{
    show: boolean;
    userId: string;
    userName: string;
  }>({
    show: false,
    userId: "",
    userName: "",
  });
  const [messageContent, setMessageContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [ageFilter, setAgeFilter] = useState<{ min: string; max: string }>({ min: "", max: "" });
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [orientationFilter, setOrientationFilter] = useState<string>("all");

  // Filter out current user from the list
  const otherUsers = users.filter(user => user.id !== session?.user?.id);
  
  // Apply search and filters
  const filteredUsers = useMemo(() => {
    return otherUsers.filter(user => {
      // Search filter (name or email - but only search email for admins)
      const matchesSearch = searchQuery.trim() === "" || 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (isAdmin && user.email.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Age filter
      const userAge = user.age || 0;
      const minAge = ageFilter.min ? parseInt(ageFilter.min) : 0;
      const maxAge = ageFilter.max ? parseInt(ageFilter.max) : Infinity;
      const matchesAge = userAge >= minAge && userAge <= maxAge;
      
      // Gender filter
      const matchesGender = genderFilter === "all" || 
        (user.gender && user.gender.toLowerCase() === genderFilter.toLowerCase());
      
      // Orientation filter
      const matchesOrientation = orientationFilter === "all" || 
        (user.orientation && user.orientation.toLowerCase() === orientationFilter.toLowerCase());
      
      return matchesSearch && matchesAge && matchesGender && matchesOrientation;
    });
  }, [otherUsers, searchQuery, ageFilter, genderFilter, orientationFilter]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim() || !showMessageModal.userId) return;

    setIsSending(true);
    try {
      await sendMessage.mutateAsync({
        userId: showMessageModal.userId,
        content: messageContent.trim(),
      });
      
      // Close modal and redirect to inbox
      setShowMessageModal({ show: false, userId: "", userName: "" });
      setMessageContent("");
      router.push("/chat/inbox");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleStartConversation = (userId: string, userName: string) => {
    setShowMessageModal({ show: true, userId, userName });
  };

  const handleGoToInbox = (userId: string) => {
    router.push(`/chat/inbox?user=${userId}`);
  };

  const handleViewProfile = (userId: string, userName: string) => {
    setShowProfileModal({ show: true, userId, userName });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col h-full">
        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">People</h1>
              </div>
            </div>
            <div className="text-gray-600">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 flex flex-col h-full">
        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">People</h1>
              </div>
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {/* Search Input */}
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder={isAdmin ? "Search by name or email..." : "Search by name..."}
                  label="Search People"
                  id="search"
                  className="md:col-span-2 xl:col-span-2"
                />

                {/* Age Filter */}
                <AgeRangeFilter
                  minAge={ageFilter.min}
                  maxAge={ageFilter.max}
                  onMinAgeChange={(min) => setAgeFilter(prev => ({ ...prev, min }))}
                  onMaxAgeChange={(max) => setAgeFilter(prev => ({ ...prev, max }))}
                />

                {/* Gender Filter */}
                <CustomDropdown
                  label="Gender"
                  id="gender"
                  options={[
                    { value: "all", label: "All Genders" },
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                    { value: "other", label: "Other" }
                  ]}
                  value={genderFilter}
                  onChange={setGenderFilter}
                />

                {/* Orientation Filter */}
                <CustomDropdown
                  label="Orientation"
                  id="orientation"
                  options={[
                    { value: "all", label: "All Orientations" },
                    { value: "straight", label: "Straight" },
                    { value: "gay", label: "Gay" },
                    { value: "lesbian", label: "Lesbian" },
                    { value: "bisexual", label: "Bisexual" },
                    { value: "other", label: "Other" }
                  ]}
                  value={orientationFilter}
                  onChange={setOrientationFilter}
                />
              </div>

              {/* Clear Filters Button */}
              {(searchQuery || ageFilter.min || ageFilter.max || genderFilter !== "all" || orientationFilter !== "all") && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setAgeFilter({ min: "", max: "" });
                      setGenderFilter("all");
                      setOrientationFilter("all");
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 cursor-pointer text-sm"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>

            {/* Results Count */}
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Showing {filteredUsers.length} of {otherUsers.length} people
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <div key={user.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center gap-4 mb-4">
                    <ProfilePicture 
                      src={user.profile_picture} 
                      name={user.name} 
                      size="lg"
                      className="shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-lg font-medium text-gray-900 truncate">{user.name}</div>
                      {isAdmin && (
                        <div className="text-sm text-gray-500 truncate">{user.email}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewProfile(user.id, user.name)}
                      className="flex-1 px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 cursor-pointer text-sm"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => handleGoToInbox(user.id)}
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-900 border border-gray-300 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 cursor-pointer text-sm"
                    >
                      Chat
                    </button>
                    <button
                      onClick={() => handleStartConversation(user.id, user.name)}
                      className="flex-1 px-3 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 cursor-pointer text-sm"
                    >
                      Message
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredUsers.length === 0 && otherUsers.length > 0 && (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-gray-600 text-lg mb-2">No people match your filters</p>
                <p className="text-gray-500 text-sm">Try adjusting your search or filter criteria</p>
              </div>
            )}

            {otherUsers.length === 0 && (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-gray-600 text-lg">No other users found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Send Message Modal */}
      {showMessageModal.show && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">
              Send Message to {showMessageModal.userName}
            </h2>
            <form onSubmit={handleSendMessage}>
              <div className="mb-6">
                <textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Type your message..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                  required
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowMessageModal({ show: false, userId: "", userName: "" });
                    setMessageContent("");
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-900 border border-gray-300 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!messageContent.trim() || isSending}
                  className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200"
                >
                  {isSending ? "Sending..." : "Send"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal.show}
        onClose={() => setShowProfileModal({ show: false, userId: "", userName: "" })}
        userId={showProfileModal.userId}
        userName={showProfileModal.userName}
      />
    </>
  );
}