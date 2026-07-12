const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  const sql = fs.readFileSync('supabase/restaurants-theme-color.sql', 'utf8');
  await client.query(sql);
  console.log('Migration executed successfully.');
  await client.end();
}

run().catch(console.error);
