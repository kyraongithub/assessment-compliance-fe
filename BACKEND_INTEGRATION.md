# Backend Integration Guide

## Overview

This frontend integrates directly with the RegXperience backend's Google OAuth authentication. **The backend handles all authentication** - the frontend simply stores and sends the JWT token returned by the backend.

## Architecture

```
┌─────────────────────┐
│   Frontend (You)    │
├─────────────────────┤
│ Login Page          │
│  └─ Redirects to    │
│     Backend OAuth   │
└─────────────────────┘
         ↓
┌─────────────────────┐
│ Backend (/auth)     │
├─────────────────────┤
│ Google OAuth        │
│ Create/Find User    │
│ Issue JWT Token     │
└─────────────────────┘
         ↓
┌─────────────────────┐
│ Callback Handler    │
├─────────────────────┤
│ Parse Token & User  │
│ Save to localStorage│
│ Redirect to Home    │
└─────────────────────┘
```

## How It Works

### 1. Login Flow

1. User clicks "Sign in with Google" on `/login`
2. Frontend redirects to backend's OAuth endpoint:
   ```
   {BACKEND_URL}/auth/google?redirect_url=http://localhost:3000/auth/callback
   ```
3. Backend handles Google OAuth
4. Backend creates/updates user in database
5. Backend generates JWT token
6. Backend redirects to `/auth/callback` with token and user info in URL params

### 2. Callback Handling

The `/auth/callback` page:
- Extracts token and user from URL parameters
- Saves to localStorage (client-side)
- Redirects to home page

### 3. API Requests

All API requests include the JWT token:
```typescript
// From hooks (useTemplates, useAssessments, etc.)
const token = getAuthToken() // From localStorage
const response = await fetch('/api/templates', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

### 4. Backend Forwarding

Next.js API routes forward the token to the backend:
```typescript
// app/api/templates/route.ts
const authHeader = request.headers.get('authorization')
const response = await fetch(`${BACKEND_URL}/templates`, {
  headers: {
    'Authorization': authHeader // Forward token
  }
})
```

## Setup Instructions

### Prerequisites

- Backend running at `http://localhost:3001` (or configured URL)
- Backend has Google OAuth configured
- Backend endpoints as documented

### 1. Configure Environment

Create `.env.local` in frontend root:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

For production:
```env
NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain.com
```

### 2. Backend Requirements

Backend must have:

- `GET /auth/google` endpoint that redirects to Google OAuth
  - Expects `redirect_url` query parameter
  - Must return JWT + user info to that URL

- `GET /auth/google/callback` to handle Google's callback

- `GET /auth/me` endpoint (optional, for fetching current user)

- All protected endpoints must accept `Authorization: Bearer {token}` header

### 3. Start Development

```bash
# Make sure backend is running at localhost:3001
npm run dev
```

Visit `http://localhost:3000`

### 4. Test Flow

1. Go to login page
2. Click "Sign in with Google"
3. You'll be redirected to backend's Google login
4. After Google auth, you'll return to frontend `/auth/callback`
5. You'll be redirected to home page
6. Token is stored in localStorage

## Token Management

### Where Token Is Stored

- **localStorage** key: `regx_auth_token`
- **localStorage** key: `regx_user_info` (user JSON)

This is suitable for development. For production, consider:
- HTTP-only cookies (more secure)
- Session-based auth
- Store in secure storage

### Getting Current Token

```typescript
import { getAuthToken, getStoredUser } from '@/lib/auth'

const token = getAuthToken() // string | null
const user = getStoredUser() // { id, email, role } | null
```

### Clearing Auth

```typescript
import { clearAuth } from '@/lib/auth'

clearAuth() // Removes all auth from localStorage
```

## API Integration

### Custom Hooks Pattern

All data hooks automatically include the auth token:

```typescript
// hooks/useTemplates.ts
export function useTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const token = getAuthToken()
      const response = await fetch('/api/templates', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      })
      if (!response.ok) throw new Error('Failed')
      return response.json()
    },
  })
}
```

### Usage in Components

```typescript
'use client'

import { useTemplates } from '@/hooks/useTemplates'

export function TemplatesList() {
  const { data: templates, isLoading } = useTemplates()
  
  if (isLoading) return <div>Loading...</div>
  
  return (
    <div>
      {templates?.map(template => (
        <div key={template.id}>{template.title}</div>
      ))}
    </div>
  )
}
```

## Authentication Context

The `SessionProvider` manages auth state globally:

```typescript
'use client'

import { useSession } from '@/providers/session-provider'

export function UserProfile() {
  const { user, isAuthenticated, signOut } = useSession()
  
  if (!isAuthenticated) return null
  
  return (
    <div>
      <p>Welcome {user?.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

## Protected Routes

The `ProtectedLayout` wrapper ensures only authenticated users can access routes:

```typescript
'use client'

import { ProtectedLayout } from '@/components/protected-layout'

export default function ProtectedPage() {
  return (
    <ProtectedLayout>
      <div>Only authenticated users see this</div>
    </ProtectedLayout>
  )
}
```

Features:
- Checks for valid token
- Redirects to `/login` if not authenticated
- Shows loading state while checking auth
- Displays user info in header
- Provides sign-out button

## Troubleshooting

### Backend Connection Error

Error: `connect ECONNREFUSED 127.0.0.1:3001`

**Solution:**
- Ensure backend is running on port 3001
- Check `NEXT_PUBLIC_BACKEND_URL` in `.env.local`
- Verify backend is listening on that port

### Callback Not Working

**Solution:**
1. Check browser console for errors
2. Verify backend is returning token in callback URL
3. Check token format: should be JWT string
4. Verify user JSON is valid

### API Requests Failing with 401

**Solution:**
1. Token might be expired or invalid
2. Sign out and sign in again
3. Check token is being sent in Authorization header
4. Verify backend accepts the token format

### User Not Saved to Database

**Solution:**
- Backend must save user on OAuth callback
- Check backend's User model is created
- Verify backend database migrations ran
- Check backend logs for errors

## File Structure

```
frontend/
├── lib/
│   └── auth.ts              # Auth utilities and token management
├── providers/
│   └── session-provider.tsx # Global auth state
├── hooks/
│   ├── useAuth.ts           # Auth hook
│   ├── useTemplates.ts      # Templates with auth
│   └── useAssessments.ts    # Assessments with auth
├── components/
│   └── protected-layout.tsx # Auth wrapper
├── app/
│   ├── login/
│   │   └── page.tsx         # Login page
│   ├── auth/
│   │   └── callback/
│   │       └── page.tsx     # OAuth callback handler
│   └── api/
│       ├── templates/       # API routes that forward to backend
│       └── assessments/
└── .env.example             # Environment config template
```

## Next Steps

1. Configure backend URL in `.env.local`
2. Ensure backend is running
3. Start frontend: `npm run dev`
4. Test login flow
5. Check API requests reach backend with token
6. Monitor backend logs for user creation

## Support

For issues:
1. Check browser console for client errors
2. Check Next.js server logs for API errors
3. Check backend logs for auth/database errors
4. Verify token format in localStorage
5. Ensure backend endpoints match documentation
