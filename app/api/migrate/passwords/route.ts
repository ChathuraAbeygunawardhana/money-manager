import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { encryptPassword, isBcryptHash } from "@/lib/crypto";

// POST migrate passwords (admin only)
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Only admins can migrate passwords" }, { status: 403 });
    }

    console.log("🔄 Starting password migration...");

    // Get all users with bcrypt hashes
    const result = await db.execute({
      sql: "SELECT id, email, name, password FROM users",
      args: [],
    });

    const users = result.rows;
    let migratedCount = 0;
    const defaultPassword = "password123"; // Default password for all users

    for (const user of users) {
      const storedPassword = user.password as string;
      
      if (isBcryptHash(storedPassword)) {
        console.log(`📝 Migrating user: ${user.email}`);
        
        const encryptedPassword = encryptPassword(defaultPassword);
        
        await db.execute({
          sql: "UPDATE users SET password = ? WHERE id = ?",
          args: [encryptedPassword, user.id],
        });
        
        migratedCount++;
      } else {
        console.log(`✅ User ${user.email} already has encrypted password`);
      }
    }

    const message = `Migration completed! Total users: ${users.length}, Migrated: ${migratedCount}. Default password: ${defaultPassword}`;
    console.log(message);

    return NextResponse.json({ 
      success: true,
      totalUsers: users.length,
      migratedCount,
      defaultPassword,
      message
    });

  } catch (error) {
    console.error("❌ Error during migration:", error);
    return NextResponse.json({ error: "Migration failed" }, { status: 500 });
  }
}