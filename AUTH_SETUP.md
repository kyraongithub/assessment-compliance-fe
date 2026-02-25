# Authentication Setup Guide

This RegXperience frontend uses **NextAuth.js** with **Google OAuth 2.0** for secure authentication. All API calls to the backend are protected and require authentication.

## Overview

The authentication flow:

1. User clicks "Sign in with Google" on login page
2. User authenticates via Google OAuth
3. NextAuth stores session in secure HTTP-only cookie
4. Session is automatically forwarded to backend with each API request
5. Backend validates session and returns data

## Prerequisites

- Google Cloud Project with OAuth 2.0 credentials
- Node.js 18+
- The RegXperience backend running (http://localhost:3001)

## Step 1: Create Google OAuth Credentials

### 1.1 Go to Google Cloud Console

Visit: https://console.cloud.google.com/

### 1.2 Create a New Project

- Click "Select a Project" → "NEW PROJECT"
- Name: "RegXperience"
- Click "CREATE"

### 1.3 Enable OAuth Consent Screen

- Go to **APIs & Services** → **OAuth consent screen**
- Select **External** user type
- Click "CREATE"
- Fill in:
  - App name: "RegXperience"
  - User support email: your-email@example.com
  - Developer contact email: your-email@example.com
- Click "SAVE AND CONTINUE"

### 1.4 Create OAuth 2.0 Client ID

- Go to **APIs & Services** → **Credentials**
- Click "CREATE CREDENTIALS" → "OAuth client ID"
- Application type: **Web application**
- Name: "RegXperience Frontend"
- Authorized redirect URIs:
  - `http://localhost:3000/api/auth/callback/google` (local development)
  - `https://your-domain.com/api/auth/callback/google` (production)
- Click "CREATE"
- Copy the **Client ID** and **Client Secret**

## Step 2: Configure Environment Variables

### 2.1 Generate NextAuth Secret

```bash
# Generate a secure random secret
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2.2 Update `.env.local` (or `.env` in development)

```env
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# NextAuth Configuration
NEXTAUTH_SECRET=<paste-generated-secret-here>
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=<paste-your-client-id>
GOOGLE_CLIENT_SECRET=<paste-your-client-secret>
```

## Step 3: Test Authentication

### 3.1 Start the Frontend

```bash
npm run dev
```

The app should start at http://localhost:3000

### 3.2 Try to Access Protected Routes

Visit: http://localhost:3000

You should be redirected to the login page.

### 3.3 Sign in with Google

- Click "Sign in with Google"
- Complete Google authentication
- You should be redirected to the dashboard

### 3.4 Verify Session

- Open browser DevTools (F12)
- Go to **Application** → **Cookies**
- You should see `next-auth.session-token` cookie

## Step 4: Backend Configuration

Make sure the backend is configured with the same user authentication:

1. Backend must accept the JWT token from the frontend
2. Backend should have its own Google OAuth configured (if needed)
3. Backend protects all endpoints with authentication

Backend expects authorization header:

```
Authorization: Bearer <session-token>
```

## Step 5: Production Deployment

### 5.1 Update Environment Variables

On your hosting platform (Vercel, AWS, etc.):

```env
NEXTAUTH_SECRET=<your-prod-secret>
NEXTAUTH_URL=https://your-app-domain.com
GOOGLE_CLIENT_ID=<production-client-id>
GOOGLE_CLIENT_SECRET=<production-client-secret>
NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain.com
```

### 5.2 Google OAuth Production Setup

In Google Cloud Console:

- Go to **Credentials**
- Edit your OAuth Client ID
- Add authorized redirect URI:
  ```
  https://your-app-domain.com/api/auth/callback/google
  ```

### 5.3 Update NextAuth URL

When deploying to production:

- Change `NEXTAUTH_URL` to your actual domain
- This is used for OAuth callback URL validation

## Troubleshooting

### "Failed to sign in" Error

1. Check Google Client ID and Secret are correct
2. Verify `NEXTAUTH_SECRET` is set
3. Check browser console for detailed error
4. Ensure backend is running

### "NEXTAUTH_SECRET not set" Error

1. Add `NEXTAUTH_SECRET` to `.env.local`
2. Restart dev server: `npm run dev`

### "Redirect URI mismatch" Error

1. In Google Cloud Console → Credentials
2. Edit the OAuth Client ID
3. Add/verify the callback URL matches your app URL

### Backend Returns 401 Unauthorized

1. Check backend is configured to accept Google OAuth
2. Verify session token is being sent in Authorization header
3. Check backend logs for authentication errors

### Session Not Persisting

1. Check cookies are enabled in browser
2. Look for `next-auth.session-token` cookie in DevTools
3. Verify `NEXTAUTH_URL` matches your app URL

## Architecture

### Session Flow

```
User → Login Page
   ↓
User Clicks "Sign in with Google"
   ↓
NextAuth (/api/auth/signin/google)
   ↓
Google OAuth (user authorizes)
   ↓
NextAuth Creates Session
   ↓
Session Stored in HTTP-only Cookie
   ↓
User Redirected to Dashboard
```

### API Call Flow

```
Component → useTemplates Hook
   ↓
React Query → /api/templates (Frontend API)
   ↓
Frontend API Route (app/api/templates/route.ts)
   - Gets session from cookies
   - Forwards request to backend with Authorization header
   ↓
Backend API
   - Validates session/JWT
   - Returns data
   ↓
Response → Component
```

## Security Features

✅ **HTTP-only Cookies**: Session tokens stored securely
✅ **CSRF Protection**: NextAuth includes CSRF tokens
✅ **Secure Sessions**: Encrypted session data
✅ **OAuth 2.0**: Industry standard authentication
✅ **JWT Tokens**: Backend can validate tokens independently

## Files Reference

- **`lib/auth.ts`**: NextAuth configuration
- **`app/api/auth/[...nextauth]/route.ts`**: NextAuth API route
- **`providers/session-provider.tsx`**: React context for session
- **`hooks/useAuth.ts`**: Custom hook to access session
- **`middleware.ts`**: Route protection middleware
- **`app/login/page.tsx`**: Login page

## Next Steps

1. Configure Google OAuth credentials (Step 1-2)
2. Set environment variables (Step 2)
3. Start backend and frontend
4. Test login flow
5. Deploy to production

For more info on NextAuth.js, see: https://authjs.dev/
For more info on Google OAuth, see: https://developers.google.com/identity/protocols/oauth2
