-- Workout Templates System
-- This migration creates all tables needed for the training plan/template system

-- Exercise Library (if not exists)
create table if not exists exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  muscle_group text not null check (muscle_group in ('Legs', 'Chest', 'Back', 'Shoulders', 'Arms', 'Core', 'Full Body')),
  description text,
  created_at timestamptz default now()
);

-- Week-Long Workout Templates (7-day reusable training plans)
create table if not exists workout_templates (
  id uuid primary key default gen_random_uuid(),
  user_id text references users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz default now()
);

-- Workout Template Days (days within a 7-day template)
create table if not exists workout_template_days (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references workout_templates(id) on delete cascade,
  day_of_week text not null check (day_of_week in ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  type text not null check (type in ('strength', 'run', 'rest')),
  notes text,
  created_at timestamptz default now(),
  unique(template_id, day_of_week)
);

-- Workout Template Exercises (exercises within each template day)
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

-- Create indexes
create index if not exists idx_workout_templates_user on workout_templates(user_id);
create index if not exists idx_workout_template_days_template on workout_template_days(template_id);
create index if not exists idx_workout_template_exercises_day on workout_template_exercises(day_id);
create index if not exists idx_user_active_templates_user_date on user_active_templates(user_id, week_start_date);

-- Seed exercise library (if not already seeded)
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
