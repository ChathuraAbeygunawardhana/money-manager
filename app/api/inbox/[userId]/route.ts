import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

// GET /api/inbox/[userId] - Get messages between current user and specified user
export async function GET(
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

    // Get messages between the two users
    const messages = await db.execute({
      sql: `
        SELECT 
          dm.id,
          dm.content,
          dm.sender_id,
          dm.recipient_id,
          dm.read_at,
          dm.created_at,
          dm.message_type,
          dm.image_url,
          u.name as sender_name,
          u.profile_picture
        FROM direct_messages dm
        JOIN users u ON u.id = dm.sender_id
        WHERE (dm.sender_id = ? AND dm.recipient_id = ?) 
           OR (dm.sender_id = ? AND dm.recipient_id = ?)
        ORDER BY dm.created_at ASC
      `,
      args: [currentUserId, otherUserId, otherUserId, currentUserId],
    });

    // Mark messages as read (messages sent to current user from other user)
    await db.execute({
      sql: `
        UPDATE direct_messages 
        SET read_at = unixepoch() 
        WHERE sender_id = ? AND recipient_id = ? AND read_at IS NULL
      `,
      args: [otherUserId, currentUserId],
    });

    return NextResponse.json(messages.rows);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST /api/inbox/[userId] - Send a message to specified user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId: recipientId } = await params;
    const senderId = session.user.id;
    const { content, messageType = 'text', imageUrl } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    // Validate message type
    if (!['text', 'image'].includes(messageType)) {
      return NextResponse.json(
        { error: "Invalid message type" },
        { status: 400 }
      );
    }

    // For image messages, ensure imageUrl is provided
    if (messageType === 'image' && !imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required for image messages" },
        { status: 400 }
      );
    }

    // Verify recipient exists
    const recipient = await db.execute({
      sql: "SELECT id FROM users WHERE id = ?",
      args: [recipientId],
    });

    if (recipient.rows.length === 0) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      );
    }

    // Create the message
    const messageId = crypto.randomUUID();
    await db.execute({
      sql: `
        INSERT INTO direct_messages (id, sender_id, recipient_id, content, message_type, image_url)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      args: [messageId, senderId, recipientId, content.trim(), messageType, imageUrl || null],
    });

    // Get the created message with sender info
    const message = await db.execute({
      sql: `
        SELECT 
          dm.id,
          dm.content,
          dm.sender_id,
          dm.recipient_id,
          dm.read_at,
          dm.created_at,
          dm.message_type,
          dm.image_url,
          u.name as sender_name,
          u.profile_picture
        FROM direct_messages dm
        JOIN users u ON u.id = dm.sender_id
        WHERE dm.id = ?
      `,
      args: [messageId],
    });

    return NextResponse.json(message.rows[0]);
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}