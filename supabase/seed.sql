-- Seed data for development
-- Create demo user with fixed UUID for consistency
INSERT INTO users (id, email, threshold_pace, threshold_hr, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'demo@example.com',
  4.9,
  170,
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Note: In production, you should use proper authentication
-- and create users through your auth flow
