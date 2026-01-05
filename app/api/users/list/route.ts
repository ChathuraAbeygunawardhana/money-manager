import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

// Get all users (excluding current user)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For regular users, exclude admin accounts from the list
    const isAdmin = session.user.role === "admin";
    const roleFilter = isAdmin ? "" : "AND u.role != 'admin'";

    const result = await db.execute({
      sql: `
        SELECT 
          u.id,
          u.name,
          u.profile_picture,
          u.age,
          u.gender,
          u.orientation
        FROM users u
        WHERE u.id != ? ${roleFilter}
        ORDER BY u.name ASC
      `,
      args: [session.user.id],
    });

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}