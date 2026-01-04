# Database Migration Setup

## Problem Identified

The templates are not being saved because **the required database tables don't exist yet**. The template tables were defined in `supabase/schema.sql` but were never created as migrations.

## What's Missing

These tables need to be created in your Supabase database:

1. **Week-Long Templates:**
   - `workout_templates`
   - `workout_template_days`
   - `workout_template_exercises`
   - `user_active_templates`

2. **Single-Day Templates:**
   - `day_templates`
   - `day_template_exercises`

3. **Scheduled Workouts:**
   - `scheduled_workouts`
   - `scheduled_workout_exercises`

4. **Exercise Library:**
   - `exercises` (with pre-seeded exercises)

## How to Fix

### Option 1: Run Migrations via Supabase Dashboard (Recommended)

1. **Open your Supabase project dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar

3. **Run Migration 1: Workout Templates**
   - Click "New Query"
   - Copy the entire contents of `supabase/migrations/004_workout_templates.sql`
   - Paste into the SQL editor
   - Click "Run" or press Cmd/Ctrl + Enter

4. **Run Migration 2: Scheduled Workouts**
   - Click "New Query"
   - Copy the entire contents of `supabase/migrations/005_scheduled_workouts.sql`
   - Paste into the SQL editor
   - Click "Run"

5. **Verify Tables Were Created**
   - Go to "Table Editor" in the left sidebar
   - You should see all the new tables listed

### Option 2: Use the Migration Script

```bash
# Generate migration SQL
node scripts/run-migrations.js

# Copy the output SQL and execute in Supabase dashboard
```

## After Running Migrations

Once the migrations are complete, your app will be able to:

✅ **Save Week-Long Templates**
- Create a 7-day training plan
- Activate it for specific weeks
- Reuse across multiple weeks

✅ **Save Single-Day Templates**
- Create reusable workout templates (e.g., "Leg Day", "Easy 5K Run")
- Browse template library
- Schedule templates for specific dates

✅ **Schedule Workouts**
- Schedule workouts for specific dates
- View scheduled workouts in Dashboard carousel
- See workouts in Training Plan page (Monday-Sunday order)
- Log workouts and get AI feedback

## Testing After Migration

1. **Go to Create Training page**
2. **Try creating a week template:**
   - Select "Week Template" mode
   - Add exercises to Monday
   - Click "Save Training Template"
   - Should show success message ✅

3. **Try creating a day template:**
   - Select "Single Day" mode
   - Fill in workout details
   - Click "Save Template"
   - Should show success message ✅

4. **Try browsing templates:**
   - Select "Browse Templates" mode
   - Your saved templates should appear

5. **Try scheduling a workout:**
   - Select "Schedule" mode
   - Pick a template
   - Choose a date
   - Should schedule successfully ✅

6. **Check Dashboard:**
   - Go to Dashboard
   - Scheduled workouts should appear in the carousel

7. **Check Training Plan page:**
   - Go to Training Plan
   - Scheduled workouts should appear in Monday-Sunday order

## Migration Files

- `supabase/migrations/004_workout_templates.sql` - Week-long templates + exercises
- `supabase/migrations/005_scheduled_workouts.sql` - Single-day templates + scheduled workouts

## Need Help?

If you encounter any errors during migration:
1. Check the error message in Supabase dashboard
2. Verify you're running migrations in order (004 before 005)
3. Check that the `users` table exists (required for foreign keys)
4. Try running each `CREATE TABLE` statement individually
