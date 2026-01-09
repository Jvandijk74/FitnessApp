-- Add strava_activity_id column to run_logged table
-- This column stores the unique Strava activity ID for synced activities

ALTER TABLE run_logged
ADD COLUMN IF NOT EXISTS strava_activity_id TEXT;

-- Add index for faster lookups by Strava activity ID
CREATE INDEX IF NOT EXISTS idx_run_logged_strava_activity_id
ON run_logged(strava_activity_id);

-- Add source column if it doesn't exist (to distinguish manual vs Strava entries)
ALTER TABLE run_logged
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

-- Add comment explaining the columns
COMMENT ON COLUMN run_logged.strava_activity_id IS 'Unique Strava activity ID for synced activities';
COMMENT ON COLUMN run_logged.source IS 'Source of the activity: manual or strava';
