import dotenv from 'dotenv';
import { createClient } from '@libsql/client';

// Load environment variables
dotenv.config({ path: '.env.local' });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function addProfilePictureColumn() {
  try {
    console.log('Adding profile_picture column to users table...');
    
    await db.execute(`
      ALTER TABLE users ADD COLUMN profile_picture TEXT
    `);
    
    console.log('✅ Successfully added profile_picture column to users table');
  } catch (error: any) {
    if (error.message.includes('duplicate column name')) {
      console.log('✅ profile_picture column already exists');
    } else {
      console.error('❌ Error adding profile_picture column:', error);
      throw error;
    }
  }
}

addProfilePictureColumn()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });