import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

// Default user ID for demo purposes (same as transactions API)
const DEFAULT_USER_ID = "demo-user-123";

export async function GET(request: NextRequest) {
  try {
    // For now, using the demo user ID to match the transactions system
    // In the future, this should use: const session = await auth();
    const userId = DEFAULT_USER_ID;

    const { searchParams } = new URL(request.url);
    const months = parseInt(searchParams.get("months") || "12"); // Default to 12 months

    // Get monthly spending data for the last N months
    // Query transactions directly since they already have user_id
    const sql = `
      SELECT 
        strftime('%Y-%m', datetime(t.date, 'unixepoch')) as month_key,
        strftime('%Y', datetime(t.date, 'unixepoch')) as year,
        strftime('%m', datetime(t.date, 'unixepoch')) as month_num,
        SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) as total_expenses,
        SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) as total_income,
        COUNT(CASE WHEN t.type = 'expense' THEN 1 END) as expense_count,
        COUNT(CASE WHEN t.type = 'income' THEN 1 END) as income_count
      FROM transactions t
      WHERE t.user_id = ?
        AND t.date >= strftime('%s', datetime('now', '-' || ? || ' months'))
      GROUP BY strftime('%Y-%m', datetime(t.date, 'unixepoch'))
      ORDER BY month_key DESC
    `;

    const result = await db.execute({
      sql,
      args: [userId, months.toString()]
    });

    const monthlyData = result.rows.map((row: any) => ({
      month_key: row.month_key,
      year: parseInt(row.year),
      month_num: parseInt(row.month_num),
      total_expenses: parseFloat(row.total_expenses) || 0,
      total_income: parseFloat(row.total_income) || 0,
      expense_count: parseInt(row.expense_count) || 0,
      income_count: parseInt(row.income_count) || 0,
      net_income: (parseFloat(row.total_income) || 0) - (parseFloat(row.total_expenses) || 0)
    }));

    // Fill in missing months with zero data and add proper month names
    const filledData = [];
    const now = new Date();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    for (let i = 0; i < months; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = monthNames[date.getMonth()];
      
      const existingData = monthlyData.find(d => d.month_key === monthKey);
      
      if (existingData) {
        filledData.push({
          ...existingData,
          month_name: monthName,
          display_name: `${monthName} ${date.getFullYear()}`
        });
      } else {
        filledData.push({
          month_key: monthKey,
          year: date.getFullYear(),
          month_num: date.getMonth() + 1,
          month_name: monthName,
          display_name: `${monthName} ${date.getFullYear()}`,
          total_expenses: 0,
          total_income: 0,
          expense_count: 0,
          income_count: 0,
          net_income: 0
        });
      }
    }

    // Sort by month_key (most recent first)
    filledData.sort((a, b) => b.month_key.localeCompare(a.month_key));

    return NextResponse.json(filledData);
  } catch (error) {
    console.error("Error fetching monthly spending:", error);
    return NextResponse.json(
      { error: "Failed to fetch monthly spending data" },
      { status: 500 }
    );
  }
}