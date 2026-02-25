# Quick Start Guide

## 30-Second Setup

1. **Create `.env.local`:**
   ```bash
   echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:3001" > .env.local
   ```

2. **Start Backend:**
   ```bash
   # In your backend directory
   npm run start:dev
   ```

3. **Start Frontend:**
   ```bash
   npm install
   npm run dev
   ```

4. **Visit http://localhost:3000**

## What Happens

1. Click "Sign in with Google"
2. You'll be redirected to backend's Google OAuth
3. After Google login, you're redirected back
4. Token is saved, you can use the app

## Key Files

| File | Purpose |
|------|---------|
| `lib/auth.ts` | Token management |
| `providers/session-provider.tsx` | Global auth state |
| `app/login/page.tsx` | Login page |
| `app/auth/callback/page.tsx` | OAuth callback handler |
| `hooks/useTemplates.ts`, `useAssessments.ts` | API with auth |

## Environment Variables

**Required:**
- `NEXT_PUBLIC_BACKEND_URL` - Your backend URL (e.g., http://localhost:3001)

That's it! The backend handles Google OAuth, user creation, and JWT generation.

## API Flow

```
Frontend → Next.js API Route → Backend API
  (with JWT token)
```

## Debugging

See **BACKEND_INTEGRATION.md** for detailed troubleshooting.

```bash
# Check backend is running
curl http://localhost:3001/docs  # Swagger docs

# Check frontend can reach backend
curl http://localhost:3000/api/templates
```

## Next: Customize

- Modify login UI in `app/login/page.tsx`
- Add new API routes in `app/api/`
- Create new hooks following `hooks/useTemplates.ts` pattern
- Add pages and wrap with `<ProtectedLayout>`
