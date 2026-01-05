import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { randomUUID } from "crypto";
import { encryptPassword } from "@/lib/crypto";

// GET all users (admin only)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Only admins can view users" }, { status: 403 });
    }

    const result = await db.execute({
      sql: `
        SELECT id, email, name, role, age, gender, orientation, profile_picture, created_at
        FROM users
        ORDER BY created_at DESC
      `,
      args: [],
    });

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// CREATE new user (admin only)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Only admins can create users" }, { status: 403 });
    }

    const { email, password, name, role, profile_picture } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, password, and name are required" }, { status: 400 });
    }

    if (role && !["admin", "user"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Check if user already exists
    const existing = await db.execute({
      sql: "SELECT id FROM users WHERE email = ?",
      args: [email],
    });

    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 });
    }

    const userId = randomUUID();
    const encryptedPassword = encryptPassword(password);

    await db.execute({
      sql: "INSERT INTO users (id, email, password, name, role, profile_picture) VALUES (?, ?, ?, ?, ?, ?)",
      args: [userId, email, encryptedPassword, name, role || "user", profile_picture || null],
    });

    return NextResponse.json(
      { id: userId, email, name, role: role || "user", profile_picture: profile_picture || null },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
