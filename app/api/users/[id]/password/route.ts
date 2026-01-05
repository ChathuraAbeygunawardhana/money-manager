import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { decryptPassword, isBcryptHash, isEncryptedPassword } from "@/lib/crypto";

// GET user password (admin only)
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
      return NextResponse.json({ error: "Only admins can view passwords" }, { status: 403 });
    }

    const { id } = await params;

    const result = await db.execute({
      sql: "SELECT password FROM users WHERE id = ?",
      args: [id],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const storedPassword = result.rows[0].password as string;
    let actualPassword: string;

    console.log('Password format check:', {
      password: storedPassword.substring(0, 20) + '...',
      isBcrypt: isBcryptHash(storedPassword),
      isEncrypted: isEncryptedPassword(storedPassword),
      length: storedPassword.length
    });

    if (isBcryptHash(storedPassword)) {
      // For bcrypt hashes, we can't recover the original password
      actualPassword = "Legacy bcrypt hash - cannot decrypt";
    } else if (isEncryptedPassword(storedPassword)) {
      // Decrypt the password
      try {
        actualPassword = decryptPassword(storedPassword);
      } catch (error) {
        console.error('Decryption error:', error);
        actualPassword = "Failed to decrypt password";
      }
    } else {
      // If it's neither bcrypt nor our encrypted format, it might be plain text (legacy)
      actualPassword = storedPassword.length > 50 ? "Unknown password format" : storedPassword;
    }

    return NextResponse.json({ password: actualPassword });
  } catch (error) {
    console.error("Get user password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}