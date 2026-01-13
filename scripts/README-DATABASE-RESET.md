# Database Reset Instructions

This guide will help you reset and recreate your Supabase database with the latest schema.

## ⚠️ WARNING
**This operation will delete ALL existing data in your database!**

Make sure you have a backup if you have any important data.

## Option 1: Using Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Reset Script**
   - Copy the entire contents of `scripts/reset-database.sql`
   - Paste into the SQL Editor
   - Click "Run" or press Cmd/Ctrl + Enter

4. **Verify Success**
   - You should see: "Database reset completed successfully!"
   - Check that 60 exercises were inserted
   - Verify demo user was created

## Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Make sure you're in the project directory
cd /home/user/FitnessApp

# Run the reset script
supabase db reset

# Or apply the migration
psql $DATABASE_URL -f scripts/reset-database.sql
```

## Option 3: Using psql Directly

If you have direct database access:

```bash
# Get your DATABASE_URL from .env.local
# Then run:
psql "your-database-url" -f scripts/reset-database.sql
```

## What This Does

The reset script will:

1. **Drop all existing tables** (in correct order respecting foreign keys)
2. **Recreate all tables** with the latest schema:
   - Users
   - Plans, Workouts, Run/Strength logs
   - Readiness, Insights
   - Strava connections
   - **Exercise library** (NEW)
   - **Workout templates** (NEW)
   - **Template days and exercises** (NEW)
   - **User active templates** (NEW)
3. **Seed exercise library** with 60+ exercises across 7 muscle groups
4. **Create demo user** for testing

## Post-Reset Steps

After resetting the database:

1. **Test the Create Training page**
   - Navigate to `/create-training`
   - Verify exercises load correctly
   - Create a sample template

2. **Test the Training Plan page**
   - Navigate to `/plan`
   - Check if your template appears
   - Try logging a workout

3. **Verify Volume Tracking**
   - Check that muscle group volumes are calculated
   - Verify progressive overload metrics

## Troubleshooting

### "Permission denied" error
- Make sure you have admin access to the database
- Check your Supabase project settings

### "Relation already exists" error
- The DROP commands should handle this
- If persists, manually drop tables from Supabase dashboard

### Exercises not showing in Create Training page
- Check the exercises table was populated: `SELECT COUNT(*) FROM exercises;`
- Should return 60 rows
- If 0, re-run just the INSERT statements

### Demo user not found
- Check users table: `SELECT * FROM users;`
- Manually insert if needed:
  ```sql
  INSERT INTO users (id, email, threshold_pace, threshold_hr)
  VALUES ('demo-user', 'demo@fitness.app', 4.9, 170)
  ON CONFLICT (id) DO NOTHING;
  ```

## Rolling Back

If something goes wrong, you can:

1. Re-run the reset script (it's idempotent)
2. Restore from a backup if you created one
3. Use the original `supabase/schema.sql` file

## Need Help?

If you encounter issues:
- Check Supabase logs in the dashboard
- Verify your database connection in `.env.local`
- Check the browser console for API errors
