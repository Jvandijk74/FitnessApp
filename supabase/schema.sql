-- Users
create table if not exists users (
  id text primary key,
  email text unique,
  threshold_pace numeric,
  threshold_hr numeric,
  created_at timestamptz default now()
);

-- Plans
create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  user_id text references users(id) on delete cascade,
  week_start date not null,
  structure jsonb not null,
  prescriptions jsonb not null,
  created_at timestamptz default now()
);

-- Workouts (generic)
create table if not exists workouts (
  id uuid primary key default gen_random_uuid(),
  user_id text references users(id) on delete cascade,
  plan_id uuid references plans(id) on delete cascade,
  day text not null,
  type text not null check (type in ('run', 'strength')),
  created_at timestamptz default now()
);

-- Logged runs
create table if not exists run_logged (
  id uuid primary key default gen_random_uuid(),
  user_id text references users(id) on delete cascade,
  plan_id uuid references plans(id) on delete set null,
  day text not null,
  distance_km numeric not null,
  duration_minutes integer not null,
  avg_hr integer,
  max_hr integer,
  rpe integer,
  source text default 'manual' check (source in ('manual', 'strava')),
  activity_date timestamptz default now(),
  created_at timestamptz default now()
);

-- Strength exercises prescriptions/logs
create table if not exists strength_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id text references users(id) on delete cascade,
  plan_id uuid references plans(id) on delete set null,
  day text not null,
  name text not null,
  sets text not null,
  tempo text not null,
  rest text not null,
  target_rpe text not null,
  created_at timestamptz default now()
);

create table if not exists strength_sets_logged (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid references strength_exercises(id) on delete cascade,
  weight numeric not null,
  reps integer not null,
  rpe integer,
  rir integer,
  created_at timestamptz default now()
);

-- Readiness metrics
create table if not exists readiness (
  id uuid primary key default gen_random_uuid(),
  user_id text references users(id) on delete cascade,
  date date not null,
  score numeric not null,
  notes text,
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- Insights
create table if not exists insights (
  id uuid primary key default gen_random_uuid(),
  user_id text references users(id) on delete cascade,
  title text not null,
  detail text not null,
  created_at timestamptz default now()
);

-- Strava connections
create table if not exists strava_connections (
  id uuid primary key default gen_random_uuid(),
  user_id text references users(id) on delete cascade,
  access_token text not null,
  refresh_token text not null,
  athlete_id bigint,
  created_at timestamptz default now(),
  unique(user_id)
);

-- Exercise Library (master list of exercises with muscle group categorization)
create table if not exists exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  muscle_group text not null check (muscle_group in ('Legs', 'Chest', 'Back', 'Shoulders', 'Arms', 'Core', 'Full Body')),
  description text,
  created_at timestamptz default now()
);

-- Workout Templates (user's saved workout plans)
create table if not exists workout_templates (
  id uuid primary key default gen_random_uuid(),
  user_id text references users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz default now()
);

-- Workout Template Days (days within a template)
create table if not exists workout_template_days (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references workout_templates(id) on delete cascade,
  day_of_week text not null check (day_of_week in ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  type text not null check (type in ('strength', 'run', 'rest')),
  notes text,
  created_at timestamptz default now(),
  unique(template_id, day_of_week)
);

-- Workout Template Exercises (exercises within each day)
create table if not exists workout_template_exercises (
  id uuid primary key default gen_random_uuid(),
  day_id uuid references workout_template_days(id) on delete cascade,
  exercise_id uuid references exercises(id) on delete cascade,
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

-- User Active Templates (which template is active for a user in a given week)
create table if not exists user_active_templates (
  id uuid primary key default gen_random_uuid(),
  user_id text references users(id) on delete cascade,
  template_id uuid references workout_templates(id) on delete cascade,
  week_start_date date not null,
  created_at timestamptz default now(),
  unique(user_id, week_start_date)
);

-- Seed exercise library with common exercises
insert into exercises (name, muscle_group, description) values
  -- Legs
  ('Barbell Back Squat', 'Legs', 'Compound lower body exercise'),
  ('Hack Squat', 'Legs', 'Machine squat variation'),
  ('Goblet Squat', 'Legs', 'Dumbbell squat for quads'),
  ('Belt Squat', 'Legs', 'Belt squat machine'),
  ('Leg Press', 'Legs', 'Machine leg press'),
  ('Romanian Deadlift', 'Legs', 'Hip hinge for hamstrings'),
  ('Split Squat', 'Legs', 'Single leg squat variation'),
  ('Bulgarian Split Squat', 'Legs', 'Rear foot elevated split squat'),
  ('Leg Curl', 'Legs', 'Hamstring isolation'),
  ('Seated Leg Curl', 'Legs', 'Hamstring isolation machine'),
  ('Leg Extension', 'Legs', 'Quad isolation'),
  ('Hip Thrust', 'Legs', 'Glute focused exercise'),
  ('Lunge', 'Legs', 'Walking or stationary lunge'),

  -- Chest
  ('Barbell Bench Press', 'Chest', 'Compound pressing movement'),
  ('Incline Dumbbell Press', 'Chest', 'Upper chest focus'),
  ('Decline Bench Press', 'Chest', 'Lower chest focus'),
  ('Machine Chest Press', 'Chest', 'Machine pressing'),
  ('Cable Chest Fly', 'Chest', 'Chest isolation'),
  ('Dumbbell Fly', 'Chest', 'Chest isolation with dumbbells'),
  ('Push-up', 'Chest', 'Bodyweight chest exercise'),

  -- Back
  ('Barbell Row', 'Back', 'Compound pulling movement'),
  ('Chest-Supported Row', 'Back', 'Supported row variation'),
  ('Seated Row', 'Back', 'Cable or machine row'),
  ('Cable Row', 'Back', 'Cable rowing variation'),
  ('Lat Pulldown', 'Back', 'Lat focused pull'),
  ('Pull-up', 'Back', 'Bodyweight back exercise'),
  ('Chin-up', 'Back', 'Underhand pull-up'),
  ('T-Bar Row', 'Back', 'Angled barbell row'),
  ('Single Arm Dumbbell Row', 'Back', 'Unilateral back work'),

  -- Shoulders
  ('Overhead Press', 'Shoulders', 'Compound shoulder press'),
  ('Seated Dumbbell Shoulder Press', 'Shoulders', 'Dumbbell shoulder press'),
  ('Lateral Raise', 'Shoulders', 'Side delt isolation'),
  ('Front Raise', 'Shoulders', 'Front delt isolation'),
  ('Rear Delt Fly', 'Shoulders', 'Rear delt isolation'),
  ('Arnold Press', 'Shoulders', 'Rotational shoulder press'),
  ('Face Pull', 'Shoulders', 'Rear delt and upper back'),

  -- Arms
  ('Barbell Curl', 'Arms', 'Bicep exercise'),
  ('Dumbbell Curl', 'Arms', 'Bicep isolation'),
  ('Cable Curl', 'Arms', 'Cable bicep curl'),
  ('Hammer Curl', 'Arms', 'Neutral grip bicep curl'),
  ('Tricep Pushdown', 'Arms', 'Tricep isolation'),
  ('Rope Pushdown', 'Arms', 'Cable tricep extension'),
  ('Overhead Tricep Extension', 'Arms', 'Tricep stretch exercise'),
  ('Skull Crusher', 'Arms', 'Lying tricep extension'),
  ('Close Grip Bench Press', 'Arms', 'Compound tricep movement'),

  -- Core
  ('Plank', 'Core', 'Isometric core exercise'),
  ('Abdominal Crunch', 'Core', 'Basic crunch movement'),
  ('Cable Crunch', 'Core', 'Weighted crunch variation'),
  ('Hanging Knee Raise', 'Core', 'Lower ab exercise'),
  ('Hanging Leg Raise', 'Core', 'Advanced lower ab exercise'),
  ('Reverse Crunch', 'Core', 'Lower ab focused'),
  ('Weighted Reverse Crunch', 'Core', 'Weighted lower ab exercise'),
  ('Oblique Woodchopper', 'Core', 'Rotational core exercise'),
  ('Cable Woodchopper', 'Core', 'Cable rotational movement'),
  ('Russian Twist', 'Core', 'Rotational ab exercise'),
  ('Side Plank', 'Core', 'Oblique focused plank'),

  -- Full Body
  ('Deadlift', 'Full Body', 'Compound hip hinge'),
  ('Burpee', 'Full Body', 'Full body conditioning'),
  ('Thruster', 'Full Body', 'Squat to press')
on conflict (name) do nothing;

-- Insert demo user
insert into users (id, email, threshold_pace, threshold_hr)
values ('demo-user', 'demo@fitness.app', 4.9, 170)
on conflict (id) do nothing;
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
