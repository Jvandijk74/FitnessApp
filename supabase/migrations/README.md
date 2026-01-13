# Database Migrations

This directory contains SQL migration files for the FitnessApp database.

## Latest Migration: 006_nutrition_tables.sql

This migration adds the nutrition tracking functionality to the application.

### What it does:
1. Adds user profile fields to the `users` table:
   - `age` (integer)
   - `weight_kg` (numeric)
   - `height_cm` (numeric)
   - `gender` (text: 'male', 'female', 'other')
   - `activity_level` (text: 'sedentary', 'light', 'moderate', 'active', 'very_active')

2. Creates `nutrition_goals` table for daily calorie and macro targets

3. Creates `nutrition_logs` table for meal tracking

4. Adds indexes for better query performance

5. Creates triggers for automatic timestamp updates

## How to Apply Migrations

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `006_nutrition_tables.sql`
4. Paste into the SQL editor
5. Click **Run** to execute the migration

### Option 2: Supabase CLI
If you have the Supabase CLI installed:

```bash
# Make sure you're logged in
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Apply all pending migrations
supabase db push
```

### Option 3: Manual SQL Execution
If you have direct database access:

```bash
psql -h your-host -U your-user -d your-database -f supabase/migrations/006_nutrition_tables.sql
```

## Verifying the Migration

After running the migration, verify it worked by checking:

1. **Check if columns were added:**
   ```sql
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'users'
   AND column_name IN ('age', 'weight_kg', 'height_cm', 'gender', 'activity_level');
   ```

2. **Check if new tables exist:**
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_name IN ('nutrition_goals', 'nutrition_logs');
   ```

3. **Verify demo user data:**
   ```sql
   SELECT id, age, weight_kg, height_cm, gender, activity_level
   FROM users
   WHERE id = 'demo-user';
   ```

## Troubleshooting

### Error: "column already exists"
This is safe to ignore - the migration uses `ADD COLUMN IF NOT EXISTS`.

### Error: "table already exists"
This is safe to ignore - the migration uses `CREATE TABLE IF NOT EXISTS`.

### Error: "permission denied"
Make sure you have the correct database permissions. You may need admin/superuser access to run DDL statements.

### Profile fields not saving
Check the browser console and server logs for detailed error messages. The application now includes comprehensive logging to help debug issues.

Look for logs with these prefixes:
- `[getUserProfile]` - When fetching user data
- `[updateUserProfile]` - When saving profile changes
- `[calculateBMR]` - When calculating nutrition requirements
- `[ProfileSettings]` - UI component logs

## Database Schema After Migration

```
users
├── id (text, primary key)
├── email (text, unique)
├── threshold_pace (numeric)
├── threshold_hr (numeric)
├── age (integer)              ← NEW
├── weight_kg (numeric)         ← NEW
├── height_cm (numeric)         ← NEW
├── gender (text)               ← NEW
├── activity_level (text)       ← NEW
└── created_at (timestamptz)

nutrition_goals                 ← NEW TABLE
├── id (uuid, primary key)
├── user_id (text, foreign key → users)
├── daily_calories (integer)
├── protein_grams (integer)
├── carbs_grams (integer)
├── fat_grams (integer)
├── notes (text)
├── created_at (timestamptz)
└── updated_at (timestamptz)

nutrition_logs                  ← NEW TABLE
├── id (uuid, primary key)
├── user_id (text, foreign key → users)
├── log_date (date)
├── meal_type (text: breakfast/lunch/dinner/snack)
├── meal_name (text)
├── calories (integer)
├── protein_grams (numeric)
├── carbs_grams (numeric)
├── fat_grams (numeric)
├── notes (text)
└── created_at (timestamptz)
```

## Need Help?

If you encounter issues:
1. Check the browser console for error messages
2. Check the server logs for detailed error information
3. Verify your Supabase connection is working
4. Ensure you have the correct database permissions
