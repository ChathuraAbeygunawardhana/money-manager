"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useChatrooms, useCreateChatroom, useJoinChatroom, useUpdateChatroom, useDeleteChatroom } from "@/lib/hooks/useChatrooms";
import { useQueryClient } from "@tanstack/react-query";
import { useNotification } from "@/lib/hooks/useNotification";
import { usePrefetch } from "@/lib/hooks/usePrefetch";
import { Button, Input, Textarea } from "../components/atoms";
import { FormModal, ConfirmationModal, ChatroomCard } from "../components/molecules";


export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: chatrooms = [], isLoading } = useChatrooms();
  const createChatroom = useCreateChatroom();
  const joinChatroom = useJoinChatroom();
  const updateChatroom = useUpdateChatroom();
  const deleteChatroom = useDeleteChatroom();

  const { showNotification } = useNotification();
  const { prefetchMessages } = usePrefetch();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDesc, setNewRoomDesc] = useState("");

  const [editRoom, setEditRoom] = useState<{ id: string; name: string; description: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string; name: string }>({
    show: false,
    id: "",
    name: "",
  });
  const [clearConfirm, setClearConfirm] = useState<{ show: boolean; id: string; name: string }>({
    show: false,
    id: "",
    name: "",
  });

  const [openingChatId, setOpeningChatId] = useState<string | null>(null);



  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const handleCreateChatroom = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createChatroom.mutateAsync({ name: newRoomName, description: newRoomDesc });
      setNewRoomName("");
      setNewRoomDesc("");
      setShowCreateModal(false);
      showNotification("Chatroom created successfully");
    } catch (error: any) {
      showNotification(error.message, "error");
    }
  };

  const handleJoinChatroom = async (id: string) => {
    try {
      await joinChatroom.mutateAsync(id);
      showNotification("Joined chatroom successfully");
    } catch (error) {
      showNotification("Failed to join chatroom", "error");
    }
  };



  const handleEditChatroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRoom) return;

    try {
      await updateChatroom.mutateAsync({
        chatroomId: editRoom.id,
        data: { name: editRoom.name, description: editRoom.description }
      });
      setEditRoom(null);
      showNotification("Chatroom updated successfully");
    } catch (error: any) {
      showNotification(error.message, "error");
    }
  };

  const handleDeleteChatroom = async () => {
    try {
      await deleteChatroom.mutateAsync(deleteConfirm.id);
      setDeleteConfirm({ show: false, id: "", name: "" });
      showNotification("Chatroom deleted successfully");
    } catch (error: any) {
      showNotification(error.message, "error");
    }
  };

  const handleClearMessages = async () => {
    try {
      const response = await fetch(`/api/messages/${clearConfirm.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to clear messages");
      }

      // Invalidate chatrooms query to update message counts
      queryClient.invalidateQueries({ queryKey: ["chatrooms"] });
      
      setClearConfirm({ show: false, id: "", name: "" });
      showNotification("All messages cleared successfully");
    } catch (error: any) {
      showNotification(error.message || "Failed to clear messages", "error");
    }
  };

  const handleOpenChat = async (roomId: string) => {
    setOpeningChatId(roomId);
    // Prefetch messages immediately when user clicks
    prefetchMessages(roomId);
    // Navigate immediately without delay
    router.push(`/chat/${roomId}`);
  };

  const handleChatroomHover = (roomId: string) => {
    // Prefetch messages on hover for instant loading
    prefetchMessages(roomId);
  };



  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const isAdmin = session?.user?.role === "admin";

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                {isAdmin ? "Chatrooms" : "Your Chatrooms"}
              </h1>
            </div>
            {isAdmin && (
              <Button onClick={() => setShowCreateModal(true)}>
                Create Chatroom
              </Button>
            )}
          </div>

          {!isAdmin ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chatrooms.map((room) => (
                <ChatroomCard
                  key={room.id}
                  id={room.id}
                  name={room.name}
                  description={room.description}
                  creatorName={room.creator_name}
                  isMember={Boolean(room.is_member)}
                  isOpening={openingChatId === room.id}
                  messageCount={room.message_count}
                  onJoin={handleJoinChatroom}
                  onOpen={handleOpenChat}
                  onHover={handleChatroomHover}
                />
              ))}

              {chatrooms.length === 0 && (
                <div className="text-center py-16 col-span-full">
                  <p className="text-gray-600">No chatrooms yet. Create one to get started!</p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chatrooms.map((room) => (
                <ChatroomCard
                  key={room.id}
                  id={room.id}
                  name={room.name}
                  description={room.description}
                  creatorName={room.creator_name}
                  isMember={Boolean(room.is_member)}
                  isAdmin={isAdmin}
                  isOpening={openingChatId === room.id}
                  messageCount={room.message_count}
                  onJoin={handleJoinChatroom}
                  onOpen={handleOpenChat}
                  onEdit={setEditRoom}
                  onDelete={(id, name) => setDeleteConfirm({ show: true, id, name })}
                  onClear={(id, name) => setClearConfirm({ show: true, id, name })}
                  onHover={handleChatroomHover}
                />
              ))}

              {chatrooms.length === 0 && (
                <div className="text-center py-16 col-span-full">
                  <p className="text-gray-600">No chatrooms yet. Create one to get started!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <FormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateChatroom}
        title="Create Chatroom"
        submitText={createChatroom.isPending ? "Creating..." : "Create"}
        isLoading={createChatroom.isPending}
      >
        <Input
          label="Room Name"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
          required
          placeholder="General Chat"
        />
        <Textarea
          label="Description"
          value={newRoomDesc}
          onChange={(e) => setNewRoomDesc(e.target.value)}
          placeholder="A place for general discussions"
        />
      </FormModal>

      <FormModal
        isOpen={!!editRoom}
        onClose={() => setEditRoom(null)}
        onSubmit={handleEditChatroom}
        title="Edit Chatroom"
        submitText={updateChatroom.isPending ? "Saving..." : "Save Changes"}
        isLoading={updateChatroom.isPending}
      >
        {editRoom && (
          <>
            <Input
              label="Room Name"
              value={editRoom.name}
              onChange={(e) => setEditRoom({ ...editRoom, name: e.target.value })}
              required
              placeholder="General Chat"
            />
            <Textarea
              label="Description"
              value={editRoom.description}
              onChange={(e) => setEditRoom({ ...editRoom, description: e.target.value })}
              placeholder="A place for general discussions"
            />
          </>
        )}
      </FormModal>

      <ConfirmationModal
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, id: "", name: "" })}
        onConfirm={handleDeleteChatroom}
        title="Delete Chatroom"
        message={`Are you sure you want to delete ${deleteConfirm.name}? This will permanently delete all messages and cannot be undone.`}
        confirmText={deleteChatroom.isPending ? "Deleting..." : "Delete"}
        isLoading={deleteChatroom.isPending}
        variant="danger"
      />

      <ConfirmationModal
        isOpen={clearConfirm.show}
        onClose={() => setClearConfirm({ show: false, id: "", name: "" })}
        onConfirm={handleClearMessages}
        title="Clear All Messages"
        message={`Are you sure you want to clear all messages in ${clearConfirm.name}? This action cannot be undone.`}
        confirmText="Clear All"
        variant="danger"
      />
    </div>
  );
}
