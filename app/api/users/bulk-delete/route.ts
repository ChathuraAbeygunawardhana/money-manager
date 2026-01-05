import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

// DELETE multiple users (admin only)
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Only admins can delete users" }, { status: 403 });
    }

    const { userIds } = await request.json();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: "User IDs array is required" }, { status: 400 });
    }

    // Prevent deleting yourself
    if (userIds.includes(session.user.id)) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    // Check if all users exist
    const placeholders = userIds.map(() => "?").join(",");
    const existing = await db.execute({
      sql: `SELECT id FROM users WHERE id IN (${placeholders})`,
      args: userIds,
    });

    if (existing.rows.length !== userIds.length) {
      return NextResponse.json({ error: "One or more users not found" }, { status: 404 });
    }

    // Delete related records for all users
    // 1. Delete problem reports by these users
    await db.execute({
      sql: `DELETE FROM problem_reports WHERE user_id IN (${placeholders})`,
      args: userIds,
    });

    // 2. Delete direct messages sent by these users
    await db.execute({
      sql: `DELETE FROM direct_messages WHERE sender_id IN (${placeholders})`,
      args: userIds,
    });

    // 3. Delete direct messages received by these users
    await db.execute({
      sql: `DELETE FROM direct_messages WHERE recipient_id IN (${placeholders})`,
      args: userIds,
    });

    // 4. Delete messages by these users in chatrooms
    await db.execute({
      sql: `DELETE FROM messages WHERE user_id IN (${placeholders})`,
      args: userIds,
    });

    // 5. Delete chatroom memberships
    await db.execute({
      sql: `DELETE FROM chatroom_members WHERE user_id IN (${placeholders})`,
      args: userIds,
    });

    // 6. Delete chatrooms created by these users
    await db.execute({
      sql: `DELETE FROM chatrooms WHERE created_by IN (${placeholders})`,
      args: userIds,
    });

    // 7. Finally delete the users
    await db.execute({
      sql: `DELETE FROM users WHERE id IN (${placeholders})`,
      args: userIds,
    });

    return NextResponse.json({ 
      message: `Successfully deleted ${userIds.length} user${userIds.length > 1 ? 's' : ''}`,
      deletedCount: userIds.length
    });
  } catch (error) {
    console.error("Bulk delete users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}