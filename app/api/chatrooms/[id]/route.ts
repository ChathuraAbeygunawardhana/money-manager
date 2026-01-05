import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Only admins can edit chatrooms" }, { status: 403 });
    }

    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const { id } = await params;

    await db.execute({
      sql: "UPDATE chatrooms SET name = ?, description = ? WHERE id = ?",
      args: [name, description || "", id],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update chatroom error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Only admins can delete chatrooms" }, { status: 403 });
    }

    const { id } = await params;

    // Delete messages first (foreign key constraint)
    await db.execute({
      sql: "DELETE FROM messages WHERE chatroom_id = ?",
      args: [id],
    });

    // Delete chatroom members
    await db.execute({
      sql: "DELETE FROM chatroom_members WHERE chatroom_id = ?",
      args: [id],
    });

    // Delete the chatroom
    await db.execute({
      sql: "DELETE FROM chatrooms WHERE id = ?",
      args: [id],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete chatroom error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
