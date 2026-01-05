import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { isBcryptHash, isEncryptedPassword } from "@/lib/crypto";

// GET debug password info (admin only)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Only admins can debug passwords" }, { status: 403 });
    }

    const result = await db.execute({
      sql: "SELECT id, email, password FROM users LIMIT 5",
      args: [],
    });

    const users = result.rows.map(user => ({
      id: user.id,
      email: user.email,
      passwordFormat: {
        isBcrypt: isBcryptHash(user.password as string),
        isEncrypted: isEncryptedPassword(user.password as string),
        raw: (user.password as string).substring(0, 20) + "..."
      }
    }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Debug passwords error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}