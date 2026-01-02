# Strava Connection Fix Summary

## Issues Identified and Fixed

### Critical Issues (Causing 500 Error)

#### 1. ✅ Invalid NextResponse.redirect() Usage
**Problem:** The callback route used a relative path in `NextResponse.redirect()`, which requires an absolute URL in Next.js 14.
```typescript
// BEFORE (causing 500 error)
return NextResponse.redirect(`/dashboard?connected=strava`);

// AFTER (fixed)
return NextResponse.redirect(new URL(`/dashboard?connected=strava`, origin));
```

#### 2. ✅ Invalid User ID / Foreign Key Constraint
**Problem:** The callback defaulted to `'demo-user'` (a string), but the database expects a UUID that references `users(id)`.
```typescript
// BEFORE
const userId = searchParams.get('user') || 'demo-user';

// AFTER
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';
const userId = searchParams.get('user') || DEMO_USER_ID;
```
**Additional Fix:** Created `supabase/seed.sql` to insert the demo user with proper UUID.

### Medium Priority Issues

#### 3. ✅ Incomplete Upsert Logic
**Problem:** The upsert operation didn't specify a conflict target, causing duplicate connections.
```typescript
// BEFORE
await supabase.from('strava_connections').upsert({...})

// AFTER
await supabase.from('strava_connections').upsert(
  {...},
  { onConflict: 'user_id' }
)
```
**Additional Fix:** Added `unique(user_id)` constraint to database schema.

#### 4. ✅ Missing Error Handling
**Problem:** No try-catch blocks in auth/callback routes, leading to generic 500 errors.
```typescript
// AFTER
try {
  // ... handle OAuth flow
} catch (error) {
  console.error('Strava callback error:', error);
  return NextResponse.redirect(
    new URL(`/dashboard?error=connection_failed&details=${encodeURIComponent(errorMessage)}`, origin)
  );
}
```

### Security & Data Issues

#### 5. ✅ Missing CSRF Protection
**Problem:** No state parameter validation for OAuth flow.
**Fix:**
- Created `lib/strava/state.ts` with state generation and validation
- Auth route now generates and stores state in secure HTTP-only cookie
- Callback route validates state before processing

#### 6. ✅ Missing Athlete Data Storage
**Problem:** The `handleTokenExchange` retrieved athlete data but didn't store it.
**Fix:**
- Updated `saveConnection()` to store `athlete_id` and `expires_at`
- Added these fields to database schema

## Files Created

1. **`supabase/seed.sql`** - Seeds demo user with proper UUID
2. **`lib/strava/state.ts`** - CSRF protection utilities
3. **`lib/constants.ts`** - Centralized constants (DEMO_USER_ID)
4. **`STRAVA_FIX_SUMMARY.md`** - This documentation

## Files Modified

1. **`supabase/schema.sql`**
   - Added `unique(user_id)` constraint to `strava_connections`
   - Added `expires_at` and `updated_at` fields

2. **`lib/strava/oauth.ts`**
   - Updated `buildAuthRedirectUrl()` to accept state parameter
   - Enhanced `handleTokenExchange()` with better error handling and athlete data
   - Fixed `saveConnection()` to store all token data with proper upsert

3. **`app/api/strava/auth/route.ts`**
   - Added state generation and storage
   - Added error handling

4. **`app/api/strava/callback/route.ts`**
   - Complete rewrite with comprehensive error handling
   - State validation (CSRF protection)
   - Absolute URL redirects
   - Proper UUID for demo user
   - Error messages passed to dashboard

5. **`app/(app)/dashboard/page.tsx`**
   - Updated to use proper UUID constant

## Database Setup Required

Run these commands to set up the database:

```sql
-- Apply schema (creates tables with new constraints)
\i supabase/schema.sql

-- Seed demo user
\i supabase/seed.sql
```

Or via Supabase CLI:
```bash
supabase db reset  # Reset and apply all migrations
```

## Testing Checklist

- [ ] Click "Connect Strava" on homepage
- [ ] Verify redirect to Strava with state parameter in URL
- [ ] Authorize the application on Strava
- [ ] Verify successful redirect to dashboard with `?connected=strava`
- [ ] Check database for `strava_connections` record with:
  - Correct `user_id` (UUID)
  - Valid `access_token` and `refresh_token`
  - `athlete_id` populated
  - `expires_at` timestamp set
- [ ] Try connecting again - should update existing record (not create duplicate)

## Security Improvements

1. **CSRF Protection**: State parameter prevents cross-site request forgery
2. **HTTP-only Cookies**: State stored securely, not accessible to JavaScript
3. **Error Logging**: All errors logged to console for debugging
4. **User Feedback**: Errors passed to dashboard via query parameters

## Next Steps for Production

1. Replace demo user system with proper authentication (e.g., Supabase Auth, NextAuth)
2. Implement token refresh logic using `refresh_token` before `expires_at`
3. Add user interface to display connection status
4. Add "Disconnect Strava" functionality
5. Consider upgrading Next.js (current version 14.1.0 has security vulnerabilities)
6. Add rate limiting for OAuth endpoints
7. Store encrypted tokens (currently stored as plain text)

## Technical Details

### OAuth Flow
1. User clicks "Connect Strava"
2. App generates random state, stores in cookie
3. App redirects to Strava with `client_id`, `redirect_uri`, `scope`, and `state`
4. User authorizes on Strava
5. Strava redirects back with `code` and `state`
6. App validates `state` matches cookie (CSRF check)
7. App exchanges `code` for access/refresh tokens via Strava API
8. App stores tokens in database with unique constraint on `user_id`
9. App redirects user to dashboard with success message

### Error Handling
All possible error scenarios are handled:
- Missing authorization code
- Invalid/missing state (CSRF attack)
- Strava API errors during token exchange
- Database errors during connection save
- User denies authorization on Strava

Each error redirects to dashboard with descriptive query parameters.
