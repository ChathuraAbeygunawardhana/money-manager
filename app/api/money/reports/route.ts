import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Default user ID for demo purposes
const DEFAULT_USER_ID = "demo-user-123";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get filter parameters
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");
    const accountId = searchParams.get("account_id");
    const categoryId = searchParams.get("category_id");
    const transactionType = searchParams.get("transaction_type");
    const minAmount = searchParams.get("min_amount");
    const maxAmount = searchParams.get("max_amount");

    // Build the base query
    let sql = `
      SELECT 
        t.id, t.type, t.amount, t.description, t.date, t.tags, t.notes,
        t.created_at,
        a.name as account_name, a.type as account_type,
        c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.id
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ?
    `;
    
    const args = [DEFAULT_USER_ID];

    // Apply filters
    if (startDate) {
      sql += " AND t.date >= ?";
      args.push(Math.floor(new Date(startDate).getTime() / 1000).toString());
    }

    if (endDate) {
      sql += " AND t.date <= ?";
      args.push(Math.floor(new Date(endDate + " 23:59:59").getTime() / 1000).toString());
    }

    if (accountId && accountId !== "all") {
      sql += " AND t.account_id = ?";
      args.push(accountId);
    }

    if (categoryId && categoryId !== "all") {
      sql += " AND t.category_id = ?";
      args.push(categoryId);
    }

    if (transactionType && transactionType !== "all") {
      sql += " AND t.type = ?";
      args.push(transactionType);
    }

    if (minAmount) {
      sql += " AND t.amount >= ?";
      args.push(parseFloat(minAmount).toString());
    }

    if (maxAmount) {
      sql += " AND t.amount <= ?";
      args.push(parseFloat(maxAmount).toString());
    }

    sql += " ORDER BY t.date DESC, t.created_at DESC";

    const result = await db.execute({ sql, args });

    const transactions = result.rows.map((row: any) => ({
      id: row.id,
      type: row.type,
      amount: parseFloat(row.amount),
      description: row.description,
      date: parseInt(row.date),
      tags: row.tags ? JSON.parse(row.tags) : [],
      notes: row.notes,
      created_at: parseInt(row.created_at),
      account_name: row.account_name,
      account_type: row.account_type,
      category_name: row.category_name,
      category_color: row.category_color,
      category_icon: row.category_icon,
    }));

    // Calculate summary statistics
    const totalIncome = transactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const netIncome = totalIncome - totalExpenses;

    // Group by category for spending/income analysis
    let categoryTransactions = transactions.filter(t => t.category_name);
    
    // Filter by transaction type if specified
    if (transactionType && transactionType !== "all") {
      categoryTransactions = categoryTransactions.filter(t => t.type === transactionType);
    }
    
    const categorySpending = categoryTransactions
      .reduce((acc: any, t) => {
        const key = t.category_name;
        if (!acc[key]) {
          acc[key] = {
            name: t.category_name,
            color: t.category_color,
            icon: t.category_icon,
            total_spent: 0,
            transaction_count: 0,
            type: t.type
          };
        }
        acc[key].total_spent += t.amount;
        acc[key].transaction_count += 1;
        return acc;
      }, {});

    const topCategories = Object.values(categorySpending)
      .sort((a: any, b: any) => b.total_spent - a.total_spent);

    // Group by month for trend analysis
    const monthlyTrend = transactions.reduce((acc: any, t) => {
      const date = new Date(t.date * 1000);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          date: monthKey,
          income: 0,
          expenses: 0,
          net: 0
        };
      }
      
      if (t.type === "income") {
        acc[monthKey].income += t.amount;
      } else if (t.type === "expense") {
        acc[monthKey].expenses += t.amount;
      }
      
      acc[monthKey].net = acc[monthKey].income - acc[monthKey].expenses;
      return acc;
    }, {});

    const spendingTrend = Object.values(monthlyTrend)
      .sort((a: any, b: any) => b.date.localeCompare(a.date));

    return NextResponse.json({
      transactions,
      summary: {
        total_income: totalIncome,
        total_expenses: totalExpenses,
        net_income: netIncome,
        income_count: transactions.filter(t => t.type === "income").length,
        expense_count: transactions.filter(t => t.type === "expense").length,
        transaction_count: transactions.length
      },
      top_categories: topCategories,
      spending_trend: spendingTrend,
      period_info: {
        start_date: startDate,
        end_date: endDate,
        filters_applied: {
          account: accountId !== "all" ? accountId : null,
          category: categoryId !== "all" ? categoryId : null,
          transaction_type: transactionType !== "all" ? transactionType : null,
          min_amount: minAmount ? parseFloat(minAmount) : null,
          max_amount: maxAmount ? parseFloat(maxAmount) : null
        }
      }
    });

  } catch (error) {
    console.error("Error fetching filtered reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports data" },
      { status: 500 }
    );
  }
}