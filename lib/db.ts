import { createClient } from '@libsql/client';

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export async function initDatabase() {
  // Table for pending user registrations (before email verification)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS pending_users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'user')),
      email_verification_token TEXT NOT NULL,
      email_verification_expires INTEGER NOT NULL,
      resend_count INTEGER DEFAULT 0,
      last_resend_time INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (unixepoch())
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'user')),
      age INTEGER,
      gender TEXT,
      height REAL,
      weight REAL,
      profile_picture TEXT,
      bio TEXT,
      email_verified INTEGER DEFAULT 1,
      email_verification_token TEXT,
      email_verification_expires INTEGER,
      password_reset_token TEXT,
      password_reset_expires INTEGER,
      created_at INTEGER DEFAULT (unixepoch())
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS chatrooms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_by TEXT NOT NULL,
      created_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      chatroom_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      message_type TEXT DEFAULT 'text' CHECK(message_type IN ('text', 'image')),
      image_url TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (chatroom_id) REFERENCES chatrooms(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS chatroom_members (
      chatroom_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      joined_at INTEGER DEFAULT (unixepoch()),
      PRIMARY KEY (chatroom_id, user_id),
      FOREIGN KEY (chatroom_id) REFERENCES chatrooms(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);



  await db.execute(`
    CREATE TABLE IF NOT EXISTS problem_reports (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      chatroom_id TEXT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'resolved', 'dismissed')),
      created_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (chatroom_id) REFERENCES chatrooms(id) ON DELETE SET NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS direct_messages (
      id TEXT PRIMARY KEY,
      sender_id TEXT NOT NULL,
      recipient_id TEXT NOT NULL,
      content TEXT NOT NULL,
      read_at INTEGER,
      created_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (sender_id) REFERENCES users(id),
      FOREIGN KEY (recipient_id) REFERENCES users(id)
    )
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_direct_messages_recipient 
    ON direct_messages(recipient_id, created_at DESC)
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_direct_messages_sender 
    ON direct_messages(sender_id, created_at DESC)
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_direct_messages_conversation 
    ON direct_messages(sender_id, recipient_id, created_at DESC)
  `);

  // Add rate limiting columns to existing pending_users table if they don't exist
  try {
    await db.execute(`
      ALTER TABLE pending_users 
      ADD COLUMN resend_count INTEGER DEFAULT 0
    `);
  } catch (error: any) {
    if (!error.message?.includes("duplicate column name")) {
      console.error("Error adding resend_count column:", error);
    }
  }

  try {
    await db.execute(`
      ALTER TABLE pending_users 
      ADD COLUMN last_resend_time INTEGER DEFAULT 0
    `);
  } catch (error: any) {
    if (!error.message?.includes("duplicate column name")) {
      console.error("Error adding last_resend_time column:", error);
    }
  }

  // Add password reset columns to existing users table if they don't exist
  try {
    await db.execute(`
      ALTER TABLE users 
      ADD COLUMN password_reset_token TEXT
    `);
  } catch (error: any) {
    if (!error.message?.includes("duplicate column name")) {
      console.error("Error adding password_reset_token column:", error);
    }
  }

  try {
    await db.execute(`
      ALTER TABLE users 
      ADD COLUMN password_reset_expires INTEGER
    `);
  } catch (error: any) {
    if (!error.message?.includes("duplicate column name")) {
      console.error("Error adding password_reset_expires column:", error);
    }
  }

  // Add orientation column to existing users table if it doesn't exist
  try {
    await db.execute(`
      ALTER TABLE users 
      ADD COLUMN orientation TEXT
    `);
  } catch (error: any) {
    if (!error.message?.includes("duplicate column name")) {
      console.error("Error adding orientation column:", error);
    }
  }

  // Money Manager Tables
  await db.execute(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('checking', 'savings', 'credit', 'investment', 'cash')),
      balance REAL DEFAULT 0,
      currency TEXT DEFAULT 'USD',
      is_active INTEGER DEFAULT 1,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      color TEXT DEFAULT '#6B7280',
      icon TEXT DEFAULT 'folder',
      is_active INTEGER DEFAULT 1,
      created_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      account_id TEXT NOT NULL,
      category_id TEXT,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense', 'transfer')),
      amount REAL NOT NULL,
      description TEXT,
      date INTEGER NOT NULL,
      is_recurring INTEGER DEFAULT 0,
      recurring_frequency TEXT CHECK(recurring_frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
      recurring_end_date INTEGER,
      tags TEXT, -- JSON array of tags
      notes TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      category_id TEXT,
      name TEXT NOT NULL,
      amount REAL NOT NULL,
      period TEXT NOT NULL CHECK(period IN ('weekly', 'monthly', 'yearly')),
      start_date INTEGER NOT NULL,
      end_date INTEGER,
      is_active INTEGER DEFAULT 1,
      alert_threshold REAL DEFAULT 0.8, -- Alert when 80% of budget is used
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS financial_goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      target_amount REAL NOT NULL,
      current_amount REAL DEFAULT 0,
      target_date INTEGER,
      category TEXT CHECK(category IN ('emergency_fund', 'vacation', 'house', 'car', 'education', 'retirement', 'other')),
      priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high')),
      is_active INTEGER DEFAULT 1,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better performance
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_transactions_user_date 
    ON transactions(user_id, date DESC)
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_transactions_account 
    ON transactions(account_id, date DESC)
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_transactions_category 
    ON transactions(category_id, date DESC)
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_budgets_user_period 
    ON budgets(user_id, start_date, end_date)
  `);
}
