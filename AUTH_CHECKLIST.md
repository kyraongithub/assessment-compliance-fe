# Authentication Setup Checklist

Complete these steps to get authentication working.

## Phase 1: Google OAuth Setup (5-10 minutes)

- [ ] **1.1** Visit https://console.cloud.google.com/
- [ ] **1.2** Create new project named "RegXperience"
- [ ] **1.3** Go to APIs & Services → OAuth consent screen
- [ ] **1.4** Select "External" user type and fill in app info
- [ ] **1.5** Go to Credentials → Create OAuth 2.0 Client ID
- [ ] **1.6** Select "Web application" type
- [ ] **1.7** Add redirect URIs:
  - [ ] `http://localhost:3000/api/auth/callback/google`
  - [ ] (Production URI after deploying)
- [ ] **1.8** Copy Client ID and Secret

## Phase 2: Environment Variables (2 minutes)

- [ ] **2.1** Generate NextAuth secret:

  ```bash
  openssl rand -base64 32
  ```

- [ ] **2.2** Create `.env.local` file in project root:

  ```env
  NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
  NEXTAUTH_SECRET=<paste-generated-secret>
  NEXTAUTH_URL=http://localhost:3000
  GOOGLE_CLIENT_ID=<paste-from-google>
  GOOGLE_CLIENT_SECRET=<paste-from-google>
  ```

- [ ] **2.3** Verify file is NOT in git (check `.gitignore`)

## Phase 3: Install Dependencies (1 minute)

- [ ] **3.1** Run: `npm install`
- [ ] **3.2** Verify NextAuth installed: `npm list next-auth`

## Phase 4: Start Services (2 minutes)

- [ ] **4.1** Backend running at http://localhost:3001
  - [ ] Check backend health: `curl http://localhost:3001/health`
  - [ ] Or check Swagger docs: http://localhost:3001/docs

- [ ] **4.2** Frontend: `npm run dev`
  - [ ] Should start at http://localhost:3000

## Phase 5: Test Authentication (5 minutes)

- [ ] **5.1** Visit http://localhost:3000 in browser
  - [ ] Should see login page (redirected from /)

- [ ] **5.2** Click "Sign in with Google"
  - [ ] Should open Google login in popup/new tab

- [ ] **5.3** Complete Google authentication
  - [ ] You should be redirected to dashboard

- [ ] **5.4** Verify session cookie
  - [ ] Open DevTools: F12
  - [ ] Go to Application tab
  - [ ] Check Cookies → http://localhost:3000
  - [ ] Should see `next-auth.session-token`

- [ ] **5.5** Test protected routes
  - [ ] Navigate to different pages
  - [ ] Should stay logged in

- [ ] **5.6** Test sign out
  - [ ] Click user dropdown (top right)
  - [ ] Click "Sign out"
  - [ ] Should redirect to /login

## Phase 6: Test API Integration (3 minutes)

- [ ] **6.1** After login, visit /templates
  - [ ] Should load list of templates (or empty state if none)
  - [ ] Check browser Network tab:
    - [ ] Request to `/api/templates`
    - [ ] Should have Authorization header

- [ ] **6.2** Visit /assessments
  - [ ] Should load list of assessments
  - [ ] No errors in console

- [ ] **6.3** Check backend logs
  - [ ] Should see incoming API requests
  - [ ] No 401 unauthorized errors

## Phase 7: Test Redirect Protection (2 minutes)

- [ ] **7.1** Open DevTools Console
  - [ ] Run: `document.cookie = "next-auth.session-token=invalid"`

- [ ] **7.2** Refresh page
  - [ ] Should redirect to /login
  - [ ] This confirms middleware is working

- [ ] **7.3** Log in again
  - [ ] Cookie should be set correctly

## Phase 8: Production Preparation (5 minutes)

- [ ] **8.1** In Google Cloud Console
  - [ ] Add production redirect URI:
    - [ ] `https://your-domain.com/api/auth/callback/google`

- [ ] **8.2** Create production environment variables
  - [ ] Different Google OAuth credentials for production
  - [ ] Generate new `NEXTAUTH_SECRET`
  - [ ] Production backend URL

- [ ] **8.3** Document production secrets
  - [ ] Save credentials securely (1Password, LastPass, etc.)

- [ ] **8.4** When deploying (Vercel, etc.)
  - [ ] Add environment variables to hosting platform
  - [ ] Update `NEXTAUTH_URL` to production domain

## Common Issues & Solutions

### "Page redirects infinitely to /login"

- [ ] Check `NEXTAUTH_SECRET` is set
- [ ] Check Google credentials are correct
- [ ] Restart dev server: `npm run dev`
- [ ] Clear browser cache

### "Sign in with Google doesn't work"

- [ ] Check Google Client ID and Secret
- [ ] Verify localhost redirect URI in Google Console
- [ ] Check browser console for errors
- [ ] Ensure NEXTAUTH_URL matches your domain

### "Backend returns 401"

- [ ] Verify backend is running
- [ ] Check backend expects Authorization header
- [ ] Look at backend logs
- [ ] Verify session token is being sent

### "Session not persisting after refresh"

- [ ] Check NEXTAUTH_URL is correct
- [ ] Look for `next-auth.session-token` cookie
- [ ] Try clearing cache: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- [ ] Check NEXTAUTH_SECRET hasn't changed

### "Google OAuth redirect URI mismatch"

- [ ] In Google Cloud Console → Credentials
- [ ] Click OAuth Client ID
- [ ] Add exact redirect URI:
  - Localhost: `http://localhost:3000/api/auth/callback/google`
  - Production: `https://your-domain.com/api/auth/callback/google`

## Files to Check

If issues persist:

- [ ] `.env.local` - has all required variables
- [ ] `lib/auth.ts` - NextAuth configuration
- [ ] `middleware.ts` - route protection
- [ ] `app/login/page.tsx` - login page
- [ ] Backend `.env` - matches frontend URL

## Quick Reference

### Restart Everything

```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend
npm run dev
```

### Check Services Running

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- NextAuth session endpoint: http://localhost:3000/api/auth/session

### View Logs

- Frontend: Terminal where `npm run dev` is running
- Backend: Backend terminal
- Browser: DevTools Console (F12)

### Clear Session & Start Over

1. Delete `next-auth.session-token` cookie in browser
2. Refresh page (should redirect to /login)
3. Sign in again

### Generate New Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Completion Verification

Once complete, verify:

- ✅ Can login with Google
- ✅ Session cookie is set
- ✅ Can access protected pages
- ✅ API calls include Authorization header
- ✅ Backend receives authorized requests
- ✅ Can sign out and redirect to login
- ✅ Protected route redirects to login when not authenticated

## Next: View Full Documentation

For detailed explanations, see:

- `AUTH_SETUP.md` - Complete setup guide
- `AUTH_IMPLEMENTATION.md` - Architecture and implementation details

---

**Estimated time to complete: 15-20 minutes**
