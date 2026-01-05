import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const userResult = await db.execute({
      sql: "SELECT id, email, name FROM users WHERE email = ?",
      args: [email],
    });

    if (userResult.rows.length === 0) {
      // Don't reveal if email exists or not for security
      return NextResponse.json(
        { message: "If an account with that email exists, we've sent a password reset link." },
        { status: 200 }
      );
    }

    const user = userResult.rows[0];
    const resetToken = randomUUID();
    const resetExpires = Date.now() + 3600000; // 1 hour from now

    // Store reset token in database
    await db.execute({
      sql: "UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE id = ?",
      args: [resetToken, resetExpires, user.id],
    });

    // Send password reset email
    const { sendPasswordResetEmail } = await import("@/lib/email");
    await sendPasswordResetEmail(email, user.name as string, resetToken);

    return NextResponse.json(
      { message: "If an account with that email exists, we've sent a password reset link." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}