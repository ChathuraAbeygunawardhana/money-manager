const { createClient } = require('@libsql/client');
const { config } = require('dotenv');
const path = require('path');

// Load environment variables
config({ path: path.resolve(__dirname, '../.env.local') });
config({ path: path.resolve(__dirname, '../.env.development.local') });

async function migrateAddRole() {
  try {
    console.log('Connecting to database...');
    
    const db = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    console.log('Checking if role column exists...');
    
    // Check if role column already exists
    try {
      await db.execute({
        sql: "SELECT role FROM users LIMIT 1",
        args: [],
      });
      console.log('✓ Role column already exists');
      process.exit(0);
    } catch (error) {
      // Column doesn't exist, proceed with migration
      console.log('Adding role column to users table...');
    }

    // Add role column with default value 'user'
    await db.execute({
      sql: "ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'user'))",
      args: [],
    });

    console.log('✓ Role column added successfully!');
    console.log('');
    console.log('You can now run: npm run seed:admin');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Error during migration:', error.message);
    process.exit(1);
  }
}

migrateAddRole();
