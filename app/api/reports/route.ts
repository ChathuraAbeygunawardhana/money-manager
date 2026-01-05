import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { randomUUID } from "crypto";

// GET - Fetch all problem reports (admin only)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await db.execute(`
      SELECT 
        pr.id,
        pr.title,
        pr.description,
        pr.status,
        pr.created_at,
        pr.chatroom_id,
        u.name as user_name,
        u.email as user_email,
        c.name as chatroom_name
      FROM problem_reports pr
      JOIN users u ON pr.user_id = u.id
      LEFT JOIN chatrooms c ON pr.chatroom_id = c.id
      ORDER BY pr.created_at DESC
    `);

    return NextResponse.json({ reports: result.rows });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}

// POST - Submit a new problem report
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, chatroomId } = await request.json();

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const reportId = randomUUID();
    await db.execute({
      sql: `INSERT INTO problem_reports (id, user_id, chatroom_id, title, description) VALUES (?, ?, ?, ?, ?)`,
      args: [reportId, session.user.id, chatroomId || null, title, description],
    });

    return NextResponse.json({ success: true, reportId });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
  }
}
