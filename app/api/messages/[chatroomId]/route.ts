import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { randomUUID } from "crypto";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ chatroomId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatroomId } = await params;

    // Admins can view all messages, regular users need to be members
    if (session.user.role !== "admin") {
      const membership = await db.execute({
        sql: "SELECT 1 FROM chatroom_members WHERE chatroom_id = ? AND user_id = ?",
        args: [chatroomId, session.user.id],
      });

      if (membership.rows.length === 0) {
        return NextResponse.json({ error: "Not a member of this chatroom" }, { status: 403 });
      }
    }

    const result = await db.execute({
      sql: `
        SELECT m.*, u.name as user_name, u.profile_picture
        FROM messages m
        JOIN users u ON m.user_id = u.id
        WHERE m.chatroom_id = ?
        ORDER BY m.created_at ASC
      `,
      args: [chatroomId],
    });

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ chatroomId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatroomId } = await params;
    const { content, message_type = 'text', image_url } = await request.json();

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    if (message_type === 'image' && !image_url) {
      return NextResponse.json({ error: "Image URL is required for image messages" }, { status: 400 });
    }

    // Admins can send messages to all chatrooms, regular users need to be members
    if (session.user.role !== "admin") {
      const membership = await db.execute({
        sql: "SELECT 1 FROM chatroom_members WHERE chatroom_id = ? AND user_id = ?",
        args: [chatroomId, session.user.id],
      });

      if (membership.rows.length === 0) {
        return NextResponse.json({ error: "Not a member of this chatroom" }, { status: 403 });
      }
    }

    const messageId = randomUUID();

    await db.execute({
      sql: "INSERT INTO messages (id, chatroom_id, user_id, content, message_type, image_url) VALUES (?, ?, ?, ?, ?, ?)",
      args: [messageId, chatroomId, session.user.id, content, message_type, image_url || null],
    });

    const result = await db.execute({
      sql: `
        SELECT m.*, u.name as user_name, u.profile_picture
        FROM messages m
        JOIN users u ON m.user_id = u.id
        WHERE m.id = ?
      `,
      args: [messageId],
    });

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ chatroomId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can clear messages
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { chatroomId } = await params;

    // Get the count of messages before deletion for response
    const countResult = await db.execute({
      sql: "SELECT COUNT(*) as count FROM messages WHERE chatroom_id = ?",
      args: [chatroomId],
    });

    const messageCount = countResult.rows[0]?.count || 0;

    // Delete all messages in the chatroom
    await db.execute({
      sql: "DELETE FROM messages WHERE chatroom_id = ?",
      args: [chatroomId],
    });

    return NextResponse.json({ 
      success: true, 
      deletedCount: messageCount,
      message: `Cleared ${messageCount} messages from chatroom` 
    });
  } catch (error) {
    console.error("Clear messages error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
