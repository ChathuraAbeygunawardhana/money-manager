import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await db.execute({
      sql: "SELECT 1 FROM chatroom_members WHERE chatroom_id = ? AND user_id = ?",
      args: [id, session.user.id],
    });

    if (existing.rows.length > 0) {
      return NextResponse.json({ message: "Already a member" }, { status: 200 });
    }

    await db.execute({
      sql: "INSERT INTO chatroom_members (chatroom_id, user_id) VALUES (?, ?)",
      args: [id, session.user.id],
    });

    return NextResponse.json({ message: "Joined successfully" }, { status: 200 });
  } catch (error) {
    console.error("Join chatroom error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
