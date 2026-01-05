#!/usr/bin/env tsx

import dotenv from "dotenv";
import { createClient } from '@libsql/client';

dotenv.config({ path: ".env.local" });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function migrateInbox() {
  try {
    console.log("Adding direct messages table...");

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

    console.log("✅ Direct messages table and indexes created successfully!");
  } catch (error) {
    console.error("❌ Error creating direct messages table:", error);
    process.exit(1);
  }
}

migrateInbox();