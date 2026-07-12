const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function check() {
  const { Client } = require('pg');
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const res = await client.query(`SELECT tablename, policyname, cmd FROM pg_policies WHERE schemaname = 'storage'`);
  console.log("Policies:");
  console.table(res.rows);
  await client.end();
}
check();
