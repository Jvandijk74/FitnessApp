-- Add scheduled_workout_id column to run_logged table to link logged runs with planned workouts
-- This allows users to see actual performance data for their planned workouts

ALTER TABLE run_logged
ADD COLUMN IF NOT EXISTS scheduled_workout_id uuid REFERENCES scheduled_workouts(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_run_logged_scheduled_workout_id
ON run_logged(scheduled_workout_id);

-- Add comment to explain the column purpose
COMMENT ON COLUMN run_logged.scheduled_workout_id IS 'Links logged run to a planned workout in the schedule';
