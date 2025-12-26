-- Users
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  threshold_pace numeric,
  threshold_hr numeric,
  created_at timestamptz default now()
);

-- Plans
create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  week_start date not null,
  structure jsonb not null,
  prescriptions jsonb not null,
  created_at timestamptz default now()
);

-- Workouts (generic)
create table if not exists workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  plan_id uuid references plans(id) on delete cascade,
  day text not null,
  type text not null check (type in ('run', 'strength')),
  created_at timestamptz default now()
);

-- Logged runs
create table if not exists run_logged (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  plan_id uuid references plans(id) on delete set null,
  day text not null,
  distance_km numeric not null,
  duration_minutes integer not null,
  avg_hr integer,
  max_hr integer,
  rpe integer,
  source text default 'manual' check (source in ('manual', 'strava')),
  created_at timestamptz default now()
);

-- Strength exercises prescriptions/logs
create table if not exists strength_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
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
  user_id uuid references users(id) on delete cascade,
  date date not null,
  score numeric not null,
  notes text,
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- Insights
create table if not exists insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  title text not null,
  detail text not null,
  created_at timestamptz default now()
);

-- Strava connections
create table if not exists strava_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  access_token text not null,
  refresh_token text not null,
  athlete_id bigint,
  created_at timestamptz default now()
);
