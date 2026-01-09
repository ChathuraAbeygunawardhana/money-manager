import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { randomUUID } from "crypto";

// Default user ID for demo purposes (no authentication required)
const DEFAULT_USER_ID = "demo-user-123";

// GET /api/money/accounts - Get all accounts for the demo user
export async function GET() {
  try {
    const result = await db.execute({
      sql: `
        SELECT 
          id, name, type, balance, currency, is_active, created_at, updated_at
        FROM accounts 
        WHERE user_id = ? AND is_active = 1
        ORDER BY created_at DESC
      `,
      args: [DEFAULT_USER_ID]
    });

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/money/accounts - Create a new account
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, balance = 0, currency = "USD" } = body;

    if (!name || !type) {
      return NextResponse.json({ error: "Name and type are required" }, { status: 400 });
    }

    const validTypes = ["checking", "savings", "credit", "investment", "cash"];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid account type" }, { status: 400 });
    }

    const accountId = randomUUID();
    const now = Math.floor(Date.now() / 1000);

    await db.execute({
      sql: `
        INSERT INTO accounts (id, user_id, name, type, balance, currency, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [accountId, DEFAULT_USER_ID, name, type, balance, currency, now, now]
    });

    const result = await db.execute({
      sql: "SELECT * FROM accounts WHERE id = ?",
      args: [accountId]
    });

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error creating account:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}