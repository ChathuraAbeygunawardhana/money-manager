import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

// GET /api/inbox - Get all conversations for the current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get all conversations with the latest message and unread count
    const conversations = await db.execute({
      sql: `
        WITH latest_messages AS (
          SELECT 
            CASE 
              WHEN sender_id = ? THEN recipient_id 
              ELSE sender_id 
            END as other_user_id,
            MAX(created_at) as last_message_time,
            CASE 
              WHEN message_type = 'image' THEN '📷 Image'
              ELSE content
            END as last_message_content,
            sender_id as last_sender_id
          FROM direct_messages 
          WHERE sender_id = ? OR recipient_id = ?
          GROUP BY other_user_id
        ),
        unread_counts AS (
          SELECT 
            sender_id as other_user_id,
            COUNT(*) as unread_count
          FROM direct_messages 
          WHERE recipient_id = ? AND read_at IS NULL
          GROUP BY sender_id
        )
        SELECT 
          u.id,
          u.name,
          u.email,
          u.profile_picture,
          lm.last_message_time,
          lm.last_message_content,
          lm.last_sender_id,
          COALESCE(uc.unread_count, 0) as unread_count
        FROM latest_messages lm
        JOIN users u ON u.id = lm.other_user_id
        LEFT JOIN unread_counts uc ON uc.other_user_id = u.id
        ORDER BY lm.last_message_time DESC
      `,
      args: [userId, userId, userId, userId],
    });

    return NextResponse.json(conversations.rows);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}