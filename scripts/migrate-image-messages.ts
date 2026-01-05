import { config } from 'dotenv';
import { createClient } from '@libsql/client';

// Load environment variables
config({ path: '.env.local' });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function migrateImageMessages() {
  try {
    console.log('Adding image support to messages table...');
    
    // Add image_url and message_type columns to messages table
    await db.execute(`
      ALTER TABLE messages ADD COLUMN image_url TEXT
    `);
    
    await db.execute(`
      ALTER TABLE messages ADD COLUMN message_type TEXT DEFAULT 'text' CHECK(message_type IN ('text', 'image'))
    `);
    
    // Also add to direct_messages table
    await db.execute(`
      ALTER TABLE direct_messages ADD COLUMN image_url TEXT
    `);
    
    await db.execute(`
      ALTER TABLE direct_messages ADD COLUMN message_type TEXT DEFAULT 'text' CHECK(message_type IN ('text', 'image'))
    `);
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrateImageMessages();