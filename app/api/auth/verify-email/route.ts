import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    // Find pending user with this verification token
    const result = await db.execute({
      sql: "SELECT * FROM pending_users WHERE email_verification_token = ? AND email_verification_expires > ?",
      args: [token, Math.floor(Date.now() / 1000)],
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    const pendingUser = result.rows[0];

    // Move user from pending_users to users table
    await db.execute({
      sql: "INSERT INTO users (id, email, password, name, role, email_verified, created_at) VALUES (?, ?, ?, ?, ?, 1, ?)",
      args: [pendingUser.id, pendingUser.email, pendingUser.password, pendingUser.name, pendingUser.role, Math.floor(Date.now() / 1000)],
    });

    // Remove from pending_users table
    await db.execute({
      sql: "DELETE FROM pending_users WHERE id = ?",
      args: [pendingUser.id],
    });

    // Generate a temporary auto-login token (valid for 5 minutes)
    const autoLoginToken = crypto.randomUUID();
    const autoLoginExpires = Math.floor(Date.now() / 1000) + (5 * 60); // 5 minutes
    
    // Store the auto-login token temporarily in the now-verified user
    await db.execute({
      sql: "UPDATE users SET email_verification_token = ?, email_verification_expires = ? WHERE id = ?",
      args: [autoLoginToken, autoLoginExpires, pendingUser.id],
    });

    return NextResponse.json({
      message: "Email verified successfully",
      autoLoginToken,
      user: {
        id: pendingUser.id,
        email: pendingUser.email,
        name: pendingUser.name,
        role: pendingUser.role,
        verified: true
      }
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find pending user by email
    const result = await db.execute({
      sql: "SELECT * FROM pending_users WHERE email = ?",
      args: [email],
    });

    if (result.rows.length === 0) {
      // Check if user is already verified
      const verifiedUser = await db.execute({
        sql: "SELECT * FROM users WHERE email = ?",
        args: [email],
      });
      
      if (verifiedUser.rows.length > 0) {
        return NextResponse.json(
          { error: "Email is already verified" },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: "No pending registration found for this email" },
        { status: 404 }
      );
    }

    const pendingUser = result.rows[0];
    const currentTime = Math.floor(Date.now() / 1000);

    // Check rate limiting
    const resendCount = (pendingUser.resend_count as number) || 0;
    const lastResendTime = (pendingUser.last_resend_time as number) || 0;
    const oneHourInSeconds = 60 * 60;

    // If user has sent 2 emails and less than 1 hour has passed
    if (resendCount >= 2 && (currentTime - lastResendTime) < oneHourInSeconds) {
      const timeRemaining = oneHourInSeconds - (currentTime - lastResendTime);
      const minutesRemaining = Math.ceil(timeRemaining / 60);
      
      return NextResponse.json(
        { 
          error: `You've reached the limit of 2 verification emails. Please wait ${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''} before trying again.`,
          timeRemaining,
          minutesRemaining
        },
        { status: 429 }
      );
    }

    // Reset count if more than 1 hour has passed
    const newResendCount = (currentTime - lastResendTime) >= oneHourInSeconds ? 1 : resendCount + 1;

    // Generate new verification token
    const token = crypto.randomUUID();
    const expires = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 24 hours

    await db.execute({
      sql: "UPDATE pending_users SET email_verification_token = ?, email_verification_expires = ?, resend_count = ?, last_resend_time = ? WHERE id = ?",
      args: [token, expires, newResendCount, currentTime, pendingUser.id],
    });

    // Send verification email (we'll implement this next)
    const { sendVerificationEmail } = await import("@/lib/email");
    await sendVerificationEmail(email, token);

    return NextResponse.json({
      message: "Verification email sent successfully",
      remainingAttempts: 2 - newResendCount
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}