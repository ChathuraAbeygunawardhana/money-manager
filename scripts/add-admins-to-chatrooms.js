const { createClient } = require('@libsql/client');
const { config } = require('dotenv');
const path = require('path');

// Load environment variables
config({ path: path.resolve(__dirname, '../.env.local') });
config({ path: path.resolve(__dirname, '../.env.development.local') });

async function addAdminsToChatrooms() {
  try {
    console.log('Connecting to database...');
    
    const db = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    console.log('Fetching all admins...');
    
    // Get all admin users
    const admins = await db.execute({
      sql: "SELECT id, email FROM users WHERE role = 'admin'",
      args: [],
    });

    if (admins.rows.length === 0) {
      console.log('No admin users found');
      process.exit(0);
    }

    console.log(`Found ${admins.rows.length} admin(s)`);

    // Get all chatrooms
    const chatrooms = await db.execute({
      sql: "SELECT id, name FROM chatrooms",
      args: [],
    });

    if (chatrooms.rows.length === 0) {
      console.log('No chatrooms found');
      process.exit(0);
    }

    console.log(`Found ${chatrooms.rows.length} chatroom(s)`);
    console.log('Adding admins to all chatrooms...');

    let addedCount = 0;
    let skippedCount = 0;

    // Add each admin to each chatroom
    for (const admin of admins.rows) {
      for (const chatroom of chatrooms.rows) {
        // Check if already a member
        const existing = await db.execute({
          sql: "SELECT 1 FROM chatroom_members WHERE chatroom_id = ? AND user_id = ?",
          args: [chatroom.id, admin.id],
        });

        if (existing.rows.length === 0) {
          await db.execute({
            sql: "INSERT INTO chatroom_members (chatroom_id, user_id) VALUES (?, ?)",
            args: [chatroom.id, admin.id],
          });
          addedCount++;
        } else {
          skippedCount++;
        }
      }
    }

    console.log('✓ Done!');
    console.log(`  Added: ${addedCount} memberships`);
    console.log(`  Skipped: ${skippedCount} (already members)`);
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

addAdminsToChatrooms();
