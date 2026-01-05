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
}
