import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Default user ID for demo purposes (no authentication required)
const DEFAULT_USER_ID = "demo-user-123";

// GET /api/money/accounts/[id] - Get a specific account
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await db.execute({
      sql: `
        SELECT * FROM accounts 
        WHERE id = ? AND user_id = ? AND is_active = 1
      `,
      args: [id, DEFAULT_USER_ID]
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching account:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/money/accounts/[id] - Update an account
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, type, balance, currency } = body;

    // Verify account exists and belongs to user
    const existingAccount = await db.execute({
      sql: "SELECT id FROM accounts WHERE id = ? AND user_id = ? AND is_active = 1",
      args: [id, DEFAULT_USER_ID]
    });

    if (existingAccount.rows.length === 0) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const updates = [];
    const args = [];

    if (name !== undefined) {
      updates.push("name = ?");
      args.push(name);
    }
    if (type !== undefined) {
      const validTypes = ["checking", "savings", "credit", "investment", "cash"];
      if (!validTypes.includes(type)) {
        return NextResponse.json({ error: "Invalid account type" }, { status: 400 });
      }
      updates.push("type = ?");
      args.push(type);
    }
    if (balance !== undefined) {
      updates.push("balance = ?");
      args.push(balance);
    }
    if (currency !== undefined) {
      updates.push("currency = ?");
      args.push(currency);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    updates.push("updated_at = ?");
    args.push(Math.floor(Date.now() / 1000));
    args.push(id);
    args.push(DEFAULT_USER_ID);

    await db.execute({
      sql: `UPDATE accounts SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`,
      args
    });

    const result = await db.execute({
      sql: "SELECT * FROM accounts WHERE id = ?",
      args: [id]
    });

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating account:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/money/accounts/[id] - Soft delete an account
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify account exists and belongs to user
    const existingAccount = await db.execute({
      sql: "SELECT id FROM accounts WHERE id = ? AND user_id = ? AND is_active = 1",
      args: [id, DEFAULT_USER_ID]
    });

    if (existingAccount.rows.length === 0) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Soft delete the account
    await db.execute({
      sql: "UPDATE accounts SET is_active = 0, updated_at = ? WHERE id = ? AND user_id = ?",
      args: [Math.floor(Date.now() / 1000), id, DEFAULT_USER_ID]
    });

    return NextResponse.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}