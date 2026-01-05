const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
const { config } = require('dotenv');
const path = require('path');

// Load environment variables
config({ path: path.resolve(__dirname, '../.env.local') });
config({ path: path.resolve(__dirname, '../.env.development.local') });

async function seedAdmin() {
  try {
    console.log('Connecting to database...');
    
    const db = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    const email = "admin@gmail.com";
    const password = "test";
    const name = "Admin";
    const role = "admin";

    console.log('Checking if admin user already exists...');
    
    // Check if admin already exists
    const existingUser = await db.execute({
      sql: "SELECT id FROM users WHERE email = ?",
      args: [email],
    });

    if (existingUser.rows.length > 0) {
      console.log('✓ Admin user already exists');
      console.log('Email: admin@gmail.com');
      console.log('Password: test');
      process.exit(0);
    }

    console.log('Creating admin user...');
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = randomUUID();

    await db.execute({
      sql: "INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)",
      args: [userId, email, hashedPassword, name, role],
    });

    console.log('✓ Admin user created successfully!');
    console.log('');
    console.log('Admin Credentials:');
    console.log('  Email: admin@gmail.com');
    console.log('  Password: test');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding admin:', error.message);
    process.exit(1);
  }
}

seedAdmin();
