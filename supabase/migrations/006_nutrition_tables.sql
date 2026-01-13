-- Add user profile fields for nutrition calculations
alter table users add column if not exists age integer;
alter table users add column if not exists weight_kg numeric;
alter table users add column if not exists height_cm numeric;
alter table users add column if not exists gender text check (gender in ('male', 'female', 'other'));
alter table users add column if not exists activity_level text default 'moderate' check (activity_level in ('sedentary', 'light', 'moderate', 'active', 'very_active'));

-- Nutrition Goals: User's daily nutrition targets
create table if not exists nutrition_goals (
  id uuid primary key default gen_random_uuid(),
  user_id text references users(id) on delete cascade unique,
  daily_calories integer not null,
  protein_grams integer not null,
  carbs_grams integer not null,
  fat_grams integer not null,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Nutrition Logs: Daily meal logging
create table if not exists nutrition_logs (
  id uuid primary key default gen_random_uuid(),
  user_id text references users(id) on delete cascade,
  log_date date not null,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  meal_name text not null,
  calories integer not null,
  protein_grams numeric not null default 0,
  carbs_grams numeric not null default 0,
  fat_grams numeric not null default 0,
  notes text,
  created_at timestamptz default now()
);

-- Create indexes for better query performance
create index if not exists idx_nutrition_logs_user_date on nutrition_logs(user_id, log_date);
create index if not exists idx_nutrition_goals_user on nutrition_goals(user_id);

-- Add updated_at trigger for nutrition_goals
create or replace function update_nutrition_goals_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger nutrition_goals_updated_at
  before update on nutrition_goals
  for each row
  execute function update_nutrition_goals_updated_at();

-- Update demo user with sample profile data
update users
set age = 30, weight_kg = 75, height_cm = 180, gender = 'male', activity_level = 'active'
where id = 'demo-user';
