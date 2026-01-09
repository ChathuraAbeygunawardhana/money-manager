import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Default user ID for demo purposes (no authentication required)
const DEFAULT_USER_ID = "demo-user-123";

// GET /api/money/dashboard - Get dashboard overview data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30"; // days
    const periodDays = parseInt(period);
    const startDate = Math.floor((Date.now() - (periodDays * 24 * 60 * 60 * 1000)) / 1000);

    // Get account balances
    const accountsResult = await db.execute({
      sql: `
        SELECT 
          SUM(CASE WHEN type IN ('checking', 'savings', 'cash') THEN balance ELSE 0 END) as liquid_assets,
          SUM(CASE WHEN type = 'investment' THEN balance ELSE 0 END) as investments,
          SUM(CASE WHEN type = 'credit' THEN -balance ELSE 0 END) as debt,
          SUM(balance) as net_worth
        FROM accounts 
        WHERE user_id = ? AND is_active = 1
      `,
      args: [DEFAULT_USER_ID]
    });

    // Get income and expenses for the period
    const transactionsResult = await db.execute({
      sql: `
        SELECT 
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
          COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count,
          COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count
        FROM transactions 
        WHERE user_id = ? AND date >= ?
      `,
      args: [DEFAULT_USER_ID, startDate]
    });

    // Get top spending categories
    const categoriesResult = await db.execute({
      sql: `
        SELECT 
          c.name, c.color, c.icon,
          SUM(t.amount) as total_spent,
          COUNT(t.id) as transaction_count
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = ? AND t.type = 'expense' AND t.date >= ?
        GROUP BY c.id, c.name, c.color, c.icon
        ORDER BY total_spent DESC
        LIMIT 5
      `,
      args: [DEFAULT_USER_ID, startDate]
    });

    // Get recent transactions
    const recentTransactionsResult = await db.execute({
      sql: `
        SELECT 
          t.id, t.type, t.amount, t.description, t.date,
          a.name as account_name,
          c.name as category_name, c.color as category_color, c.icon as category_icon
        FROM transactions t
        LEFT JOIN accounts a ON t.account_id = a.id
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = ?
        ORDER BY t.date DESC, t.created_at DESC
        LIMIT 10
      `,
      args: [DEFAULT_USER_ID]
    });

    // Get budget status
    const budgetsResult = await db.execute({
      sql: `
        SELECT 
          b.id, b.name, b.amount, b.period, b.alert_threshold,
          c.name as category_name, c.color as category_color,
          COALESCE(SUM(CASE 
            WHEN t.type = 'expense' AND t.date >= b.start_date 
            AND (b.end_date IS NULL OR t.date <= b.end_date)
            THEN t.amount 
            ELSE 0 
          END), 0) as spent_amount
        FROM budgets b
        LEFT JOIN categories c ON b.category_id = c.id
        LEFT JOIN transactions t ON (b.category_id IS NULL OR t.category_id = b.category_id) 
          AND t.user_id = b.user_id
        WHERE b.user_id = ? AND b.is_active = 1
        GROUP BY b.id
        ORDER BY (spent_amount / b.amount) DESC
        LIMIT 5
      `,
      args: [DEFAULT_USER_ID]
    });

    // Get financial goals progress
    const goalsResult = await db.execute({
      sql: `
        SELECT 
          id, name, target_amount, current_amount, target_date, category, priority
        FROM financial_goals 
        WHERE user_id = ? AND is_active = 1
        ORDER BY priority DESC, target_date ASC
        LIMIT 5
      `,
      args: [DEFAULT_USER_ID]
    });

    // Get daily spending trend for the period
    const spendingTrendResult = await db.execute({
      sql: `
        SELECT 
          DATE(t.date, 'unixepoch') as date,
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
        FROM transactions t
        WHERE t.user_id = ? AND t.date >= ?
        GROUP BY DATE(t.date, 'unixepoch')
        ORDER BY date DESC
        LIMIT 30
      `,
      args: [DEFAULT_USER_ID, startDate]
    });

    const accounts = accountsResult.rows[0] || {
      liquid_assets: 0,
      investments: 0,
      debt: 0,
      net_worth: 0
    };

    const transactions = transactionsResult.rows[0] || {
      total_income: 0,
      total_expenses: 0,
      income_count: 0,
      expense_count: 0
    };

    const dashboardData = {
      period_days: periodDays,
      accounts: {
        liquid_assets: Number(accounts.liquid_assets) || 0,
        investments: Number(accounts.investments) || 0,
        debt: Number(accounts.debt) || 0,
        net_worth: Number(accounts.net_worth) || 0
      },
      transactions: {
        total_income: Number(transactions.total_income) || 0,
        total_expenses: Number(transactions.total_expenses) || 0,
        net_income: (Number(transactions.total_income) || 0) - (Number(transactions.total_expenses) || 0),
        income_count: Number(transactions.income_count) || 0,
        expense_count: Number(transactions.expense_count) || 0
      },
      top_categories: categoriesResult.rows.map(row => ({
        ...row,
        total_spent: Number(row.total_spent),
        transaction_count: Number(row.transaction_count)
      })),
      recent_transactions: recentTransactionsResult.rows.map(row => ({
        ...row,
        amount: Number(row.amount)
      })),
      budgets: budgetsResult.rows.map(row => ({
        ...row,
        amount: Number(row.amount),
        spent_amount: Number(row.spent_amount),
        percentage_used: Number(row.amount) > 0 ? (Number(row.spent_amount) / Number(row.amount)) * 100 : 0,
        alert_threshold: Number(row.alert_threshold)
      })),
      goals: goalsResult.rows.map(row => ({
        ...row,
        target_amount: Number(row.target_amount),
        current_amount: Number(row.current_amount),
        percentage_complete: Number(row.target_amount) > 0 ? (Number(row.current_amount) / Number(row.target_amount)) * 100 : 0
      })),
      spending_trend: spendingTrendResult.rows.map(row => ({
        date: row.date,
        income: Number(row.income) || 0,
        expenses: Number(row.expenses) || 0,
        net: (Number(row.income) || 0) - (Number(row.expenses) || 0)
      }))
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}