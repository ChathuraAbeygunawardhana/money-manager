import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { encryptPassword } from "@/lib/crypto";

// GET single user (admin only)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Only admins can view users" }, { status: 403 });
    }

    const { id } = await params;

    const result = await db.execute({
      sql: "SELECT id, email, name, role, age, gender, height, weight, bio, orientation, profile_picture, created_at FROM users WHERE id = ?",
      args: [id],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// UPDATE user (admin only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Only admins can update users" }, { status: 403 });
    }

    const { id } = await params;
    const { email, password, name, role, age, gender, height, weight, bio, orientation, profile_picture } = await request.json();

    // Check if user exists
    const existing = await db.execute({
      sql: "SELECT id FROM users WHERE id = ?",
      args: [id],
    });

    if (existing.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (role && !["admin", "user"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Validate orientation options
    if (orientation && !['gay', 'straight', 'lesbian', 'bisexual', 'other'].includes(orientation)) {
      return NextResponse.json({ error: "Invalid orientation value" }, { status: 400 });
    }

    // Build update query dynamically
    const updates: string[] = [];
    const args: any[] = [];

    if (email !== undefined) {
      // Check if email is already taken by another user
      const emailCheck = await db.execute({
        sql: "SELECT id FROM users WHERE email = ? AND id != ?",
        args: [email, id],
      });
      if (emailCheck.rows.length > 0) {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 });
      }
      updates.push("email = ?");
      args.push(email);
    }

    if (password !== undefined) {
      const encryptedPassword = encryptPassword(password);
      updates.push("password = ?");
      args.push(encryptedPassword);
    }

    if (name !== undefined) {
      updates.push("name = ?");
      args.push(name);
    }

    if (role !== undefined) {
      updates.push("role = ?");
      args.push(role);
    }

    if (profile_picture !== undefined) {
      updates.push("profile_picture = ?");
      args.push(profile_picture);
    }

    if (age !== undefined) {
      updates.push("age = ?");
      args.push(age);
    }

    if (gender !== undefined) {
      updates.push("gender = ?");
      args.push(gender);
    }

    if (height !== undefined) {
      updates.push("height = ?");
      args.push(height);
    }

    if (weight !== undefined) {
      updates.push("weight = ?");
      args.push(weight);
    }

    if (bio !== undefined) {
      updates.push("bio = ?");
      args.push(bio);
    }

    if (orientation !== undefined) {
      updates.push("orientation = ?");
      args.push(orientation);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    args.push(id);

    await db.execute({
      sql: `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
      args,
    });

    // Fetch updated user
    const result = await db.execute({
      sql: "SELECT id, email, name, role, age, gender, height, weight, bio, orientation, profile_picture, created_at FROM users WHERE id = ?",
      args: [id],
    });

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE user (admin only)
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
      return NextResponse.json({ error: "Only admins can delete users" }, { status: 403 });
    }

    const { id } = await params;

    // Check if user exists
    const existing = await db.execute({
      sql: "SELECT id FROM users WHERE id = ?",
      args: [id],
    });

    if (existing.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent deleting yourself
    if (id === session.user.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    // Delete related records first (foreign key constraints)
    // 1. Delete problem reports by this user
    await db.execute({
      sql: "DELETE FROM problem_reports WHERE user_id = ?",
      args: [id],
    });

    // 2. Delete direct messages sent by this user
    await db.execute({
      sql: "DELETE FROM direct_messages WHERE sender_id = ?",
      args: [id],
    });

    // 3. Delete direct messages received by this user
    await db.execute({
      sql: "DELETE FROM direct_messages WHERE recipient_id = ?",
      args: [id],
    });

    // 4. Delete messages by this user in chatrooms
    await db.execute({
      sql: "DELETE FROM messages WHERE user_id = ?",
      args: [id],
    });

    // 5. Delete chatroom memberships
    await db.execute({
      sql: "DELETE FROM chatroom_members WHERE user_id = ?",
      args: [id],
    });

    // 6. Delete chatrooms created by this user (this will cascade to messages)
    await db.execute({
      sql: "DELETE FROM chatrooms WHERE created_by = ?",
      args: [id],
    });

    // 7. Finally delete the user
    await db.execute({
      sql: "DELETE FROM users WHERE id = ?",
      args: [id],
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
