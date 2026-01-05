import dotenv from 'dotenv';
import { createClient } from '@libsql/client';

// Load environment variables
dotenv.config({ path: '.env.local' });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function addMessageColumns() {
  try {
    console.log('Adding message_type and image_url columns to messages table...');
    
    // Add message_type column
    try {
      await db.execute(`
        ALTER TABLE messages ADD COLUMN message_type TEXT DEFAULT 'text' CHECK(message_type IN ('text', 'image'))
      `);
      console.log('✅ Successfully added message_type column');
    } catch (error: any) {
      if (error.message.includes('duplicate column name')) {
        console.log('✅ message_type column already exists');
      } else {
        throw error;
      }
    }

    // Add image_url column
    try {
      await db.execute(`
        ALTER TABLE messages ADD COLUMN image_url TEXT
      `);
      console.log('✅ Successfully added image_url column');
    } catch (error: any) {
      if (error.message.includes('duplicate column name')) {
        console.log('✅ image_url column already exists');
      } else {
        throw error;
      }
    }

    console.log('✅ Message columns migration completed successfully');
  } catch (error: any) {
    console.error('❌ Error adding message columns:', error);
    throw error;
  }
}

addMessageColumns()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });