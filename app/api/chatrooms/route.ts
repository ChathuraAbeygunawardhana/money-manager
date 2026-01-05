import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { randomUUID } from "crypto";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Admins are members of all chatrooms
    const isAdmin = session.user.role === "admin";

    const result = await db.execute({
      sql: `
        SELECT c.*, u.name as creator_name,
        CASE 
          WHEN ? = 1 THEN 1
          ELSE EXISTS(SELECT 1 FROM chatroom_members WHERE chatroom_id = c.id AND user_id = ?)
        END as is_member,
        COALESCE(m.message_count, 0) as message_count
        FROM chatrooms c
        JOIN users u ON c.created_by = u.id
        LEFT JOIN (
          SELECT chatroom_id, COUNT(*) as message_count
          FROM messages
          GROUP BY chatroom_id
        ) m ON c.id = m.chatroom_id
        ORDER BY c.created_at DESC
      `,
      args: [isAdmin ? 1 : 0, session.user.id],
    });

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Get chatrooms error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Only admins can create chatrooms" }, { status: 403 });
    }

    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const chatroomId = randomUUID();

    await db.execute({
      sql: "INSERT INTO chatrooms (id, name, description, created_by) VALUES (?, ?, ?, ?)",
      args: [chatroomId, name, description || "", session.user.id],
    });

    // Add the creating admin as a member
    await db.execute({
      sql: "INSERT INTO chatroom_members (chatroom_id, user_id) VALUES (?, ?)",
      args: [chatroomId, session.user.id],
    });

    // Add all other admins as members
    const admins = await db.execute({
      sql: "SELECT id FROM users WHERE role = 'admin' AND id != ?",
      args: [session.user.id],
    });

    for (const admin of admins.rows) {
      await db.execute({
        sql: "INSERT INTO chatroom_members (chatroom_id, user_id) VALUES (?, ?)",
        args: [chatroomId, admin.id],
      });
    }

    return NextResponse.json({ id: chatroomId, name, description }, { status: 201 });
  } catch (error) {
    console.error("Create chatroom error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
