/**
 * Migration Runner Script
 *
 * This script reads SQL migration files and provides instructions for manual execution.
 *
 * Usage: node scripts/run-migrations.js
 */

const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

console.log('\n==============================================');
console.log('SUPABASE MIGRATION RUNNER');
console.log('==============================================\n');

// Get all migration files
const files = fs.readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort();

if (files.length === 0) {
  console.log('No migration files found in supabase/migrations/');
  process.exit(0);
}

console.log(`Found ${files.length} migration file(s):\n`);

files.forEach((file, index) => {
  console.log(`${index + 1}. ${file}`);
});

console.log('\n==============================================');
console.log('HOW TO APPLY MIGRATIONS:');
console.log('==============================================\n');

console.log('1. Go to your Supabase project dashboard');
console.log('2. Navigate to: SQL Editor');
console.log('3. Create a new query');
console.log('4. Copy and paste the SQL from each migration file below');
console.log('5. Execute each migration in order\n');

console.log('==============================================');
console.log('MIGRATION SQL:');
console.log('==============================================\n');

files.forEach((file, index) => {
  const filePath = path.join(migrationsDir, file);
  const sql = fs.readFileSync(filePath, 'utf-8');

  console.log(`\n--- START: ${file} ---\n`);
  console.log(sql);
  console.log(`\n--- END: ${file} ---\n`);
});

console.log('\n==============================================');
console.log('After running these migrations, your database will have:');
console.log('- workout_templates (7-day reusable templates)');
console.log('- workout_template_days (days within templates)');
console.log('- workout_template_exercises (exercises per day)');
console.log('- day_templates (single-day reusable workouts)');
console.log('- day_template_exercises (exercises for day templates)');
console.log('- scheduled_workouts (workouts for specific dates)');
console.log('- scheduled_workout_exercises (exercises for scheduled workouts)');
console.log('- user_active_templates (active template tracking)');
console.log('- exercise library (pre-seeded exercises)');
console.log('==============================================\n');
