import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Default user ID for demo purposes (no authentication required)
const DEFAULT_USER_ID = "demo-user-123";

// GET /api/money/transactions/[id] - Get a specific transaction
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await db.execute({
      sql: `
        SELECT 
          t.*, 
          a.name as account_name, a.type as account_type,
          c.name as category_name, c.color as category_color, c.icon as category_icon
        FROM transactions t
        LEFT JOIN accounts a ON t.account_id = a.id
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.id = ? AND t.user_id = ?
      `,
      args: [id, DEFAULT_USER_ID]
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const transaction = {
      ...result.rows[0],
      tags: JSON.parse(result.rows[0].tags as string || "[]")
    };

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/money/transactions/[id] - Update a transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Get existing transaction
    const existingResult = await db.execute({
      sql: "SELECT * FROM transactions WHERE id = ? AND user_id = ?",
      args: [id, DEFAULT_USER_ID]
    });

    if (existingResult.rows.length === 0) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const existingTransaction = existingResult.rows[0];
    const {
      account_id,
      category_id,
      type,
      amount,
      description,
      date,
      tags,
      notes,
      is_recurring,
      recurring_frequency,
      recurring_end_date
    } = body;

    const updates = [];
    const args = [];

    // Track balance changes
    let oldAmount = existingTransaction.amount as number;
    let oldType = existingTransaction.type as string;
    let oldAccountId = existingTransaction.account_id as string;
    let newAmount = amount !== undefined ? amount : oldAmount;
    let newType = type !== undefined ? type : oldType;
    let newAccountId = account_id !== undefined ? account_id : oldAccountId;

    if (account_id !== undefined) {
      // Verify new account belongs to user
      const accountCheck = await db.execute({
        sql: "SELECT id FROM accounts WHERE id = ? AND user_id = ? AND is_active = 1",
        args: [account_id, DEFAULT_USER_ID]
      });
      if (accountCheck.rows.length === 0) {
        return NextResponse.json({ error: "Account not found" }, { status: 404 });
      }
      updates.push("account_id = ?");
      args.push(account_id);
    }

    if (category_id !== undefined) {
      if (category_id) {
        // Verify category belongs to user
        const categoryCheck = await db.execute({
          sql: "SELECT id FROM categories WHERE id = ? AND user_id = ? AND is_active = 1",
          args: [category_id, DEFAULT_USER_ID]
        });
        if (categoryCheck.rows.length === 0) {
          return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }
      }
      updates.push("category_id = ?");
      args.push(category_id);
    }

    if (type !== undefined) {
      if (!["income", "expense", "transfer"].includes(type)) {
        return NextResponse.json({ 
          error: "Type must be 'income', 'expense', or 'transfer'" 
        }, { status: 400 });
      }
      updates.push("type = ?");
      args.push(type);
    }

    if (amount !== undefined) {
      updates.push("amount = ?");
      args.push(amount);
    }

    if (description !== undefined) {
      updates.push("description = ?");
      args.push(description);
    }

    if (date !== undefined) {
      updates.push("date = ?");
      args.push(Math.floor(new Date(date).getTime() / 1000));
    }

    if (tags !== undefined) {
      updates.push("tags = ?");
      args.push(JSON.stringify(tags));
    }

    if (notes !== undefined) {
      updates.push("notes = ?");
      args.push(notes);
    }

    if (is_recurring !== undefined) {
      updates.push("is_recurring = ?");
      args.push(is_recurring ? 1 : 0);
    }

    if (recurring_frequency !== undefined) {
      updates.push("recurring_frequency = ?");
      args.push(recurring_frequency);
    }

    if (recurring_end_date !== undefined) {
      updates.push("recurring_end_date = ?");
      args.push(recurring_end_date ? Math.floor(new Date(recurring_end_date).getTime() / 1000) : null);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const now = Math.floor(Date.now() / 1000);
    updates.push("updated_at = ?");
    args.push(now);
    args.push(id);
    args.push(DEFAULT_USER_ID);

    await db.execute({
      sql: `UPDATE transactions SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`,
      args
    });

    // Update account balances if amount, type, or account changed
    if (amount !== undefined || type !== undefined || account_id !== undefined) {
      // Reverse old transaction effect
      const oldBalanceChange = oldType === "expense" ? oldAmount : -oldAmount;
      await db.execute({
        sql: "UPDATE accounts SET balance = balance + ?, updated_at = ? WHERE id = ?",
        args: [oldBalanceChange, now, oldAccountId]
      });

      // Apply new transaction effect
      const newBalanceChange = newType === "expense" ? -newAmount : newAmount;
      await db.execute({
        sql: "UPDATE accounts SET balance = balance + ?, updated_at = ? WHERE id = ?",
        args: [newBalanceChange, now, newAccountId]
      });
    }

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
      args: [id]
    });

    const transaction = {
      ...result.rows[0],
      tags: JSON.parse(result.rows[0].tags as string || "[]")
    };

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Error updating transaction:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/money/transactions/[id] - Delete a transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get transaction details before deletion
    const existingResult = await db.execute({
      sql: "SELECT * FROM transactions WHERE id = ? AND user_id = ?",
      args: [id, DEFAULT_USER_ID]
    });

    if (existingResult.rows.length === 0) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const transaction = existingResult.rows[0];
    const now = Math.floor(Date.now() / 1000);

    // Reverse the transaction's effect on account balance
    const balanceChange = transaction.type === "expense" ? 
      transaction.amount as number : -(transaction.amount as number);
    
    await db.execute({
      sql: "UPDATE accounts SET balance = balance + ?, updated_at = ? WHERE id = ?",
      args: [balanceChange, now, transaction.account_id]
    });

    // Delete the transaction
    await db.execute({
      sql: "DELETE FROM transactions WHERE id = ? AND user_id = ?",
      args: [id, DEFAULT_USER_ID]
    });

    return NextResponse.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}