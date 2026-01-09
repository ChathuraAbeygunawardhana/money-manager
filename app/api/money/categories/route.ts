import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { randomUUID } from "crypto";

// Default user ID for demo purposes (no authentication required)
const DEFAULT_USER_ID = "demo-user-123";

// GET /api/money/categories - Get all categories for the demo user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // 'income' or 'expense'

    let sql = `
      SELECT id, name, type, color, icon, is_active, created_at
      FROM categories 
      WHERE user_id = ? AND is_active = 1
    `;
    const args = [DEFAULT_USER_ID];

    if (type && (type === "income" || type === "expense")) {
      sql += " AND type = ?";
      args.push(type);
    }

    sql += " ORDER BY name ASC";

    const result = await db.execute({ sql, args });

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/money/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, color = "#6B7280", icon = "folder" } = body;

    if (!name || !type) {
      return NextResponse.json({ error: "Name and type are required" }, { status: 400 });
    }

    if (!["income", "expense"].includes(type)) {
      return NextResponse.json({ error: "Type must be 'income' or 'expense'" }, { status: 400 });
    }

    const categoryId = randomUUID();
    const now = Math.floor(Date.now() / 1000);

    await db.execute({
      sql: `
        INSERT INTO categories (id, user_id, name, type, color, icon, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      args: [categoryId, DEFAULT_USER_ID, name, type, color, icon, now]
    });

    const result = await db.execute({
      sql: "SELECT * FROM categories WHERE id = ?",
      args: [categoryId]
    });

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}