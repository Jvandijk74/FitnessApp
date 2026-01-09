-- Strava Connections Table
-- Stores OAuth tokens and connection info for Strava integration

create table if not exists strava_connections (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users(id) on delete cascade,
  access_token text not null,
  refresh_token text not null,
  athlete_id bigint,
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

-- Create index for faster lookups
create index if not exists idx_strava_connections_user_id on strava_connections(user_id);

-- Add updated_at trigger
create or replace function update_strava_connections_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists strava_connections_updated_at on strava_connections;
create trigger strava_connections_updated_at
  before update on strava_connections
  for each row
  execute function update_strava_connections_updated_at();
