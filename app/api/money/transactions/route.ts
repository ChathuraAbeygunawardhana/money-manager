import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { randomUUID } from "crypto";

// Default user ID for demo purposes (no authentication required)
const DEFAULT_USER_ID = "demo-user-123";

// GET /api/money/transactions - Get transactions for the demo user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("account_id");
    const categoryId = searchParams.get("category_id");
    const type = searchParams.get("type");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let sql = `
      SELECT 
        t.id, t.type, t.amount, t.description, t.date, t.tags, t.notes,
        t.is_recurring, t.recurring_frequency, t.recurring_end_date,
        t.created_at, t.updated_at,
        a.name as account_name, a.type as account_type,
        c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.id
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ?
    `;
    const args: (string | number)[] = [DEFAULT_USER_ID];

    if (accountId) {
      sql += " AND t.account_id = ?";
      args.push(accountId);
    }

    if (categoryId) {
      sql += " AND t.category_id = ?";
      args.push(categoryId);
    }

    if (type && ["income", "expense", "transfer"].includes(type)) {
      sql += " AND t.type = ?";
      args.push(type);
    }

    if (startDate) {
      sql += " AND t.date >= ?";
      args.push(parseInt(startDate));
    }

    if (endDate) {
      sql += " AND t.date <= ?";
      args.push(parseInt(endDate));
    }

    sql += " ORDER BY t.date DESC, t.created_at DESC LIMIT ? OFFSET ?";
    args.push(limit, offset);

    const result = await db.execute({ sql, args });

    // Parse tags JSON for each transaction
    const transactions = result.rows.map(row => ({
      ...row,
      tags: row.tags ? JSON.parse(row.tags as string) : []
    }));

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/money/transactions - Create a new transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      account_id,
      category_id,
      type,
      amount,
      description,
      date,
      tags = [],
      notes,
      is_recurring = false,
      recurring_frequency,
      recurring_end_date
    } = body;

    if (!account_id || !type || !amount || isNaN(amount) || amount <= 0 || !date) {
      return NextResponse.json({ 
        error: "Account ID, type, amount (greater than 0), and date are required" 
      }, { status: 400 });
    }

    if (!["income", "expense", "transfer"].includes(type)) {
      return NextResponse.json({ 
        error: "Type must be 'income', 'expense', or 'transfer'" 
      }, { status: 400 });
    }

    // Verify account belongs to user
    const accountCheck = await db.execute({
      sql: "SELECT id FROM accounts WHERE id = ? AND user_id = ? AND is_active = 1",
      args: [account_id, DEFAULT_USER_ID]
    });

    if (accountCheck.rows.length === 0) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Verify category belongs to user (if provided)
    if (category_id) {
      const categoryCheck = await db.execute({
        sql: "SELECT id FROM categories WHERE id = ? AND user_id = ? AND is_active = 1",
        args: [category_id, DEFAULT_USER_ID]
      });

      if (categoryCheck.rows.length === 0) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
    }

    const transactionId = randomUUID();
    const now = Math.floor(Date.now() / 1000);
    const transactionDate = Math.floor(new Date(date).getTime() / 1000);

    await db.execute({
      sql: `
        INSERT INTO transactions (
          id, user_id, account_id, category_id, type, amount, description, 
          date, tags, notes, is_recurring, recurring_frequency, recurring_end_date,
          created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        transactionId, DEFAULT_USER_ID, account_id, category_id || null, type, amount, 
        description, transactionDate, JSON.stringify(tags), notes || null, 
        is_recurring ? 1 : 0, recurring_frequency || null, 
        recurring_end_date ? Math.floor(new Date(recurring_end_date).getTime() / 1000) : null,
        now, now
      ]
    });

    // Update account balance
    const balanceChange = type === "expense" ? -amount : amount;
    await db.execute({
      sql: "UPDATE accounts SET balance = balance + ?, updated_at = ? WHERE id = ?",
      args: [balanceChange, now, account_id]
    });

    const result = await db.execute({
      sql: `
        SELECT 
          t.*, 
          a.name as account_name, a.type as account_type,
          c.name as category_name, c.color as category_color, c.icon as category_icon
        FROM transactions t
        LEFT JOIN accounts a ON t.account_id = a.id
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.id = ?
      `,
      args: [transactionId]
    });

    const transaction = {
      ...result.rows[0],
      tags: JSON.parse(result.rows[0].tags as string || "[]")
    };

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}