import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/db/server-client';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const supabase = await getServerSupabase();

    // Get all migration files
    const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort(); // Alphabetical order ensures correct execution

    const results = [];

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      console.log(`[Migration] Running ${file}...`);

      try {
        // Execute the SQL directly
        // Note: Supabase JS client doesn't have a direct SQL execution method,
        // so we'll use the RPC approach or direct table creation

        // For now, log that we would run it
        results.push({
          file,
          status: 'pending',
          message: 'Migration file loaded (manual execution required via Supabase dashboard)'
        });

        console.log(`[Migration] ${file} - would execute ${sql.length} characters of SQL`);
      } catch (error) {
        console.error(`[Migration] Error in ${file}:`, error);
        results.push({
          file,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Migrations processed. Note: SQL execution requires Supabase dashboard or CLI.',
      migrations: results,
      instructions: [
        '1. Copy the SQL from supabase/migrations/*.sql files',
        '2. Go to your Supabase project dashboard',
        '3. Navigate to SQL Editor',
        '4. Paste and execute each migration file in order:',
        ...files.map(f => `   - ${f}`)
      ]
    });
  } catch (error) {
    console.error('[Migration] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
