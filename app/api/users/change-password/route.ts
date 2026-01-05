import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { decryptPassword, isBcryptHash, isEncryptedPassword } from "@/lib/crypto";

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: "Current password and new password are required" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ message: "New password must be at least 6 characters long" }, { status: 400 });
    }

    // Get current user data
    const userResult = await db.execute({
      sql: "SELECT password FROM users WHERE id = ?",
      args: [session.user.id]
    });

    if (userResult.rows.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const user = userResult.rows[0] as any;

    // Verify current password (handle both bcrypt and encrypted passwords)
    let isCurrentPasswordValid = false;
    
    if (isBcryptHash(user.password)) {
      // Handle existing bcrypt hashes
      isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    } else if (isEncryptedPassword(user.password)) {
      // Handle encrypted passwords
      try {
        const decryptedPassword = decryptPassword(user.password);
        isCurrentPasswordValid = currentPassword === decryptedPassword;
      } catch (error) {
        isCurrentPasswordValid = false;
      }
    }
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ message: "Current password is incorrect" }, { status: 400 });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.execute({
      sql: "UPDATE users SET password = ? WHERE id = ?",
      args: [hashedNewPassword, session.user.id]
    });

    return NextResponse.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}