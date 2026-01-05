import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

// DELETE /api/inbox/[userId]/delete - Delete entire conversation with a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId: otherUserId } = await params;
    const currentUserId = session.user.id;

    // Verify the other user exists
    const otherUser = await db.execute({
      sql: "SELECT id FROM users WHERE id = ?",
      args: [otherUserId],
    });

    if (otherUser.rows.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Delete all messages between the two users
    await db.execute({
      sql: `
        DELETE FROM direct_messages 
        WHERE (sender_id = ? AND recipient_id = ?) 
           OR (sender_id = ? AND recipient_id = ?)
      `,
      args: [currentUserId, otherUserId, otherUserId, currentUserId],
    });

    return NextResponse.json({ 
      success: true, 
      message: "Conversation deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 }
    );
  }
}