-- Scheduled Workouts: Individual workouts planned for specific dates
-- This allows users to schedule workouts on any day, separate from weekly templates

create table if not exists scheduled_workouts (
  id uuid primary key default gen_random_uuid(),
  user_id text references users(id) on delete cascade,
  workout_date date not null,
  workout_type text not null check (workout_type in ('strength', 'run', 'rest')),
  name text not null,
  description text,

  -- Running workout fields
  run_duration_minutes integer,
  run_distance_km decimal(10,2),
  run_intensity text,
  run_target_pace text,
  run_target_rpe integer check (run_target_rpe between 1 and 10),

  -- Template reference (if this workout comes from a template day)
  template_day_id uuid references workout_template_days(id) on delete set null,

  -- Completion tracking
  completed boolean default false,
  completed_at timestamptz,

  -- AI feedback after completion
  ai_feedback text,
  ai_feedback_generated_at timestamptz,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  unique(user_id, workout_date)
);

-- Scheduled Workout Exercises: Exercises for a scheduled workout
create table if not exists scheduled_workout_exercises (
  id uuid primary key default gen_random_uuid(),
  scheduled_workout_id uuid references scheduled_workouts(id) on delete cascade,
  exercise_id uuid references exercises(id) on delete cascade,
  exercise_name text not null,
  muscle_group text,
  sets integer not null,
  reps text not null,
  tempo text not null,
  rest text not null,
  target_rpe text,
  target_rir text,
  notes text,
  order_index integer not null default 0,

  -- Logged performance
  logged_sets jsonb, -- Array of {weight, reps, rpe, rir}
  completed boolean default false,

  created_at timestamptz default now()
);

-- Single Day Templates: Reusable workout templates for individual days
create table if not exists day_templates (
  id uuid primary key default gen_random_uuid(),
  user_id text references users(id) on delete cascade,
  name text not null,
  description text,
  workout_type text not null check (workout_type in ('strength', 'run', 'rest')),

  -- Running template fields
  run_duration_minutes integer,
  run_distance_km decimal(10,2),
  run_intensity text,
  run_target_pace text,
  run_target_rpe integer check (run_target_rpe between 1 and 10),

  is_favorite boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Day Template Exercises: Exercises for a day template
create table if not exists day_template_exercises (
  id uuid primary key default gen_random_uuid(),
  day_template_id uuid references day_templates(id) on delete cascade,
  exercise_id uuid references exercises(id) on delete cascade,
  exercise_name text not null,
  muscle_group text,
  sets integer not null,
  reps text not null,
  tempo text not null,
  rest text not null,
  target_rpe text,
  target_rir text,
  notes text,
  order_index integer not null default 0,
  created_at timestamptz default now()
);

-- Workout Progress Tracking: Track performance across repeated workouts
create table if not exists workout_progress (
  id uuid primary key default gen_random_uuid(),
  user_id text references users(id) on delete cascade,
  workout_name text not null, -- Name of the workout for grouping
  completed_date date not null,
  total_volume decimal(10,2), -- For strength: total kg lifted
  average_rpe decimal(3,1), -- Average RPE across all sets
  duration_minutes integer,
  notes text,
  created_at timestamptz default now(),

  unique(user_id, workout_name, completed_date)
);

-- Create indexes for better query performance
create index if not exists idx_scheduled_workouts_user_date on scheduled_workouts(user_id, workout_date);
create index if not exists idx_scheduled_workouts_date on scheduled_workouts(workout_date);
create index if not exists idx_day_templates_user on day_templates(user_id);
create index if not exists idx_workout_progress_user_name on workout_progress(user_id, workout_name);

-- Add updated_at trigger for scheduled_workouts
create or replace function update_scheduled_workouts_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger scheduled_workouts_updated_at
  before update on scheduled_workouts
  for each row
  execute function update_scheduled_workouts_updated_at();

-- Add updated_at trigger for day_templates
create or replace function update_day_templates_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger day_templates_updated_at
  before update on day_templates
  for each row
  execute function update_day_templates_updated_at();
