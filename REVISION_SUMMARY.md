# Authentication Revision Summary

## What Changed

The authentication system has been **completely refactored** to integrate directly with the backend's Google OAuth, eliminating the duplicate NextAuth implementation that was preventing user data from being saved to the backend database.

## Problems Solved

### Before
- ❌ NextAuth creating separate authentication layer
- ❌ Backend's Google OAuth endpoints not being used
- ❌ Users not being saved to backend database
- ❌ Frontend and backend auth systems conflicting
- ❌ Complex multi-layer auth setup

### After
- ✅ Backend handles all authentication
- ✅ Frontend redirects directly to backend's OAuth endpoints
- ✅ Users created/updated in backend database
- ✅ Single source of truth for auth (backend)
- ✅ Simple, straightforward integration

## How It Works Now

```
User clicks Login
    ↓
Frontend redirects to: Backend's /auth/google endpoint
    ↓
Backend handles Google OAuth
    ↓
Backend creates/finds user in database
    ↓
Backend generates JWT token
    ↓
Backend redirects to: Frontend's /auth/callback?token=xxx&user=yyy
    ↓
Frontend saves token & user to localStorage
    ↓
Frontend includes token in all API requests to backend
```

## Files Changed

### Removed
- `lib/session.ts` - No longer needed
- `middleware.ts` - No longer needed  
- NextAuth dependency from `package.json`

### Updated
- `lib/auth.ts` - Simple token management (no NextAuth)
- `providers/session-provider.tsx` - Uses localStorage instead of NextAuth
- `hooks/useAuth.ts` - Simplified wrapper
- `hooks/useTemplates.ts` - Added auth token to all requests
- `hooks/useAssessments.ts` - Added auth token to all requests
- `app/login/page.tsx` - Redirects to backend OAuth
- `app/layout.tsx` - Uses new SessionProvider
- `.env.example` - Only needs `NEXT_PUBLIC_BACKEND_URL`

### Added
- `app/auth/callback/page.tsx` - Handles OAuth callback from backend

## Authentication Flow

### Login
1. User visits `/login`
2. Clicks "Sign in with Google"
3. Frontend redirects to: `{BACKEND_URL}/auth/google?redirect_url=http://localhost:3000/auth/callback`
4. Backend handles Google OAuth
5. Backend saves user to database
6. Backend redirects to: `http://localhost:3000/auth/callback?token=JWT_TOKEN&user={"id":"...","email":"..."}`
7. Frontend parses and saves token to localStorage
8. User is logged in!

### API Requests
1. Component needs data (e.g., templates)
2. Hook calls: `fetch('/api/templates', { headers: { 'Authorization': `Bearer ${token}` } })`
3. Next.js API route forwards to backend with token
4. Backend validates token and returns data
5. Frontend displays data

### Sign Out
1. User clicks sign out
2. Frontend clears localStorage
3. User redirected to login

## Setup (Just One Step)

```bash
# Create .env.local
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:3001" > .env.local

# Start backend (ensures it's running)
# Start frontend
npm run dev
```

That's it! No more NextAuth config, no NEXTAUTH_SECRET, no Google OAuth credentials needed in frontend.

## Benefits

✅ **Simpler** - One authentication system instead of two
✅ **Reliable** - Backend is source of truth
✅ **User Data** - Users properly saved to database
✅ **Maintainable** - Easy to understand the flow
✅ **Secure** - JWT tokens from backend
✅ **API Pattern** - All hooks follow same auth pattern

## Backend Integration

The backend must provide:

1. **`GET /auth/google`** - Initiates Google OAuth
   - Query param: `redirect_url` (where to send token after login)
   - Returns: Redirect to Google login

2. **`GET /auth/google/callback`** - Handles Google's callback
   - Creates/updates user in database
   - Generates JWT token
   - Redirects to `redirect_url` with `?token=JWT&user=JSON`

3. **Protected Endpoints** - Accept `Authorization: Bearer TOKEN` header
   - All routes: `/templates`, `/assessments`, `/submissions`

## Testing

1. Start backend: `npm run start:dev` (in backend directory)
2. Start frontend: `npm run dev`
3. Visit http://localhost:3000
4. Click "Sign in with Google"
5. Complete Google login
6. You should be logged in and see templates/assessments
7. Check browser DevTools → Storage → localStorage:
   - `regx_auth_token` - Your JWT
   - `regx_user_info` - Your user info

## Environment Variables

Only need one in frontend:

```env
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

That's all! Google OAuth credentials are in the backend.

## Migration Notes

If you had tokens from the old NextAuth system:
1. Clear localStorage
2. Sign in again through new flow
3. You'll get new JWT tokens from backend

## What's the Same

- All API routes still work the same
- All React Query hooks still work the same
- All components still work the same
- ProtectedLayout still protects routes
- All UIs unchanged

## What's Different

- Auth is now **much simpler** internally
- Token comes from **backend** (not NextAuth)
- User data **automatically saved** to backend database
- Single **source of truth** for auth

## Next Steps

1. Make sure backend is running
2. Create `.env.local` with `NEXT_PUBLIC_BACKEND_URL`
3. Run `npm run dev`
4. Test login flow
5. Check backend logs to confirm user is saved
6. Build your app on top!
