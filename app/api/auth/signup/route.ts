import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { encryptPassword } from "@/lib/crypto";
import { sendVerificationEmail } from "@/lib/email";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  try {
    // Check for required environment variables
    const missingEnvVars = [];
    if (!process.env.TURSO_DATABASE_URL) missingEnvVars.push('TURSO_DATABASE_URL');
    if (!process.env.TURSO_AUTH_TOKEN) missingEnvVars.push('TURSO_AUTH_TOKEN');
    if (!process.env.PASSWORD_ENCRYPTION_KEY) missingEnvVars.push('PASSWORD_ENCRYPTION_KEY');
    
    if (missingEnvVars.length > 0) {
      console.error('Missing required environment variables:', missingEnvVars);
      return NextResponse.json(
        { error: `Server configuration error: Missing ${missingEnvVars.join(', ')}` },
        { status: 500 }
      );
    }

    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists in either users or pending_users tables
    let existingUser;
    try {
      const [userCheck, pendingCheck] = await Promise.all([
        db.execute({
          sql: "SELECT id FROM users WHERE email = ?",
          args: [email],
        }),
        db.execute({
          sql: "SELECT id FROM pending_users WHERE email = ?",
          args: [email],
        })
      ]);
      
      if (userCheck.rows.length > 0) {
        return NextResponse.json(
          { error: "User already exists and is verified" },
          { status: 400 }
        );
      }
      
      if (pendingCheck.rows.length > 0) {
        // User exists in pending_users, resend verification email
        const pendingUser = pendingCheck.rows[0];
        const newVerificationToken = randomUUID();
        const newVerificationExpires = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 24 hours
        
        try {
          // Update the pending user with new verification token and expiry
          await db.execute({
            sql: "UPDATE pending_users SET email_verification_token = ?, email_verification_expires = ? WHERE email = ?",
            args: [newVerificationToken, newVerificationExpires, email],
          });
          
          // Send new verification email
          await sendVerificationEmail(email, newVerificationToken);
          
          return NextResponse.json(
            { 
              message: "A new verification email has been sent. Please check your email to verify your account.",
              requiresVerification: true
            },
            { status: 200 }
          );
        } catch (resendError) {
          console.error('Failed to resend verification email:', resendError);
          return NextResponse.json(
            { error: "Failed to resend verification email. Please try again." },
            { status: 500 }
          );
        }
      }
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { error: "Database connection error" },
        { status: 500 }
      );
    }

    let encryptedPassword;
    try {
      encryptedPassword = encryptPassword(password);
    } catch (cryptoError) {
      console.error('Password encryption failed:', cryptoError);
      return NextResponse.json(
        { error: "Server configuration error: Password encryption failed" },
        { status: 500 }
      );
    }
    const userId = randomUUID();
    const verificationToken = randomUUID();
    const verificationExpires = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 24 hours

    // Create pending user (not in main users table until verified)
    try {
      await db.execute({
        sql: "INSERT INTO pending_users (id, email, password, name, role, email_verification_token, email_verification_expires) VALUES (?, ?, ?, ?, ?, ?, ?)",
        args: [userId, email, encryptedPassword, name, "user", verificationToken, verificationExpires],
      });
    } catch (insertError) {
      console.error('Pending user creation failed:', insertError);
      return NextResponse.json(
        { error: "Failed to create user account" },
        { status: 500 }
      );
    }

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail the signup if email fails, but log it
    }

    return NextResponse.json(
      { 
        message: "User created successfully. Please check your email to verify your account.",
        user: {
          id: userId,
          email,
          name,
          role: "user",
          emailVerified: false
        },
        requiresVerification: true
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
