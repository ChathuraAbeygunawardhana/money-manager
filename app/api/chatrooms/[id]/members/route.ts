import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: chatroomId } = await params;

    // Check if user is a member of this chatroom (or is admin)
    if (session.user.role !== "admin") {
      const membership = await db.execute({
        sql: "SELECT 1 FROM chatroom_members WHERE chatroom_id = ? AND user_id = ?",
        args: [chatroomId, session.user.id],
      });

      if (membership.rows.length === 0) {
        return NextResponse.json({ error: "Not a member of this chatroom" }, { status: 403 });
      }
    }

    // Get all members of the chatroom
    const members = await db.execute({
      sql: `
        SELECT 
          u.id,
          u.name,
          u.email,
          u.role,
          cm.joined_at
        FROM chatroom_members cm
        JOIN users u ON cm.user_id = u.id
        WHERE cm.chatroom_id = ?
        ORDER BY u.name ASC
      `,
      args: [chatroomId],
    });

    return NextResponse.json({ members: members.rows });
  } catch (error) {
    console.error("Error fetching chatroom members:", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}