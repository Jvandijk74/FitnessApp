#!/usr/bin/env node

/**
 * Database Reset Script
 *
 * This script resets the Supabase database by:
 * 1. Reading the reset-database.sql file
 * 2. Executing it against your Supabase instance
 *
 * Usage: node scripts/reset-db.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

async function resetDatabase() {
  console.log('🔄 Starting database reset...\n');

  // Create Supabase client with service role key
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Read SQL file
  const sqlPath = path.join(__dirname, 'reset-database.sql');

  if (!fs.existsSync(sqlPath)) {
    console.error('❌ Error: reset-database.sql not found');
    console.error(`Expected path: ${sqlPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('📝 SQL script loaded');
  console.log('⚠️  WARNING: This will delete ALL existing data!\n');

  // Give user a chance to cancel (wait 3 seconds)
  console.log('Starting in 3 seconds... Press Ctrl+C to cancel\n');
  await new Promise(resolve => setTimeout(resolve, 3000));

  try {
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📊 Executing ${statements.length} SQL statements...\n`);

    let executed = 0;
    let errors = 0;

    for (const statement of statements) {
      // Skip comments and empty lines
      if (statement.startsWith('--') || statement.trim().length === 0) {
        continue;
      }

      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: statement + ';'
        });

        if (error) {
          // Many DROP statements will error if table doesn't exist - that's OK
          if (!statement.toUpperCase().includes('DROP')) {
            console.error(`⚠️  Error executing statement: ${error.message}`);
            console.error(`   Statement: ${statement.substring(0, 100)}...`);
            errors++;
          }
        } else {
          executed++;
          if (statement.toUpperCase().includes('CREATE TABLE')) {
            const tableName = statement.match(/create table (?:if not exists )?(\w+)/i)?.[1];
            console.log(`✅ Created table: ${tableName}`);
          }
        }
      } catch (err) {
        if (!statement.toUpperCase().includes('DROP')) {
          console.error(`❌ Exception: ${err.message}`);
          errors++;
        }
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Executed: ${executed} statements`);
    if (errors > 0) {
      console.log(`   ⚠️  Errors: ${errors}`);
    }

    // Verify setup
    console.log('\n🔍 Verifying setup...');

    const { data: exercises, error: exError } = await supabase
      .from('exercises')
      .select('count');

    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*');

    if (!exError && exercises) {
      console.log(`✅ Exercises table: ${exercises.length} rows`);
    }

    if (!userError && users) {
      console.log(`✅ Users table: ${users.length} user(s)`);
      users.forEach(user => {
        console.log(`   - ${user.email} (${user.id})`);
      });
    }

    console.log('\n🎉 Database reset completed successfully!');
    console.log('\nNext steps:');
    console.log('  1. Navigate to /create-training to build a workout');
    console.log('  2. Create and activate a template');
    console.log('  3. View it on /plan page');

  } catch (error) {
    console.error('\n❌ Fatal error during reset:');
    console.error(error.message);
    console.error('\nTry running the SQL manually in Supabase dashboard instead.');
    process.exit(1);
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\n🛑 Reset cancelled by user');
  process.exit(0);
});

// Run the reset
resetDatabase().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
