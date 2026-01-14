-- Allow Multiple Workouts Per Day
-- Removes the unique constraint that prevents users from scheduling
-- multiple workouts (e.g., strength + run) on the same date

-- Drop the unique constraint on (user_id, workout_date)
alter table scheduled_workouts
  drop constraint if exists scheduled_workouts_user_id_workout_date_key;

-- The existing index idx_scheduled_workouts_user_date can remain as it's
-- useful for query performance without enforcing uniqueness
