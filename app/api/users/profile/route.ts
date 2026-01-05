import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ message: "Name and email are required" }, { status: 400 });
    }

    // Check if email is already taken by another user
    const existingUser = await db.execute({
      sql: "SELECT id FROM users WHERE email = ? AND id != ?",
      args: [email, session.user.id]
    });

    if (existingUser.rows.length > 0) {
      return NextResponse.json({ message: "Email is already taken" }, { status: 400 });
    }

    // Update user profile
    await db.execute({
      sql: "UPDATE users SET name = ?, email = ? WHERE id = ?",
      args: [name, email, session.user.id]
    });

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}