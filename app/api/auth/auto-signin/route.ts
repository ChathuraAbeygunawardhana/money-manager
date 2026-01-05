import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Auto-login token is required" },
        { status: 400 }
      );
    }

    // Find user with valid auto-login token
    const result = await db.execute({
      sql: "SELECT * FROM users WHERE email_verification_token = ? AND email_verification_expires > ? AND email_verified = 1",
      args: [token, Math.floor(Date.now() / 1000)],
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired auto-login token" },
        { status: 400 }
      );
    }

    const user = result.rows[0];

    // Clear the auto-login token
    await db.execute({
      sql: "UPDATE users SET email_verification_token = NULL, email_verification_expires = NULL WHERE id = ?",
      args: [user.id],
    });

    // Return user data for client-side sign-in
    return NextResponse.json({
      message: "Auto-login token validated",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Auto sign-in error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}