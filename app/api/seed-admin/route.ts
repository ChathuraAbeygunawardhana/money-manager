import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { encryptPassword } from "@/lib/crypto";
import { randomUUID } from "crypto";

export async function POST() {
  try {
    const email = "admin@gmail.com";
    const password = "test";
    const name = "Admin";
    const role = "admin";

    // Check if admin already exists
    const existingUser = await db.execute({
      sql: "SELECT id FROM users WHERE email = ?",
      args: [email],
    });

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { message: "Admin user already exists" },
        { status: 200 }
      );
    }

    const encryptedPassword = encryptPassword(password);
    const userId = randomUUID();

    await db.execute({
      sql: "INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)",
      args: [userId, email, encryptedPassword, name, role],
    });

    return NextResponse.json(
      { 
        message: "Admin user created successfully",
        credentials: {
          email: "admin@gmail.com",
          password: "test"
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error seeding admin:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
