# RegXperience Frontend - Setup Checklist

Use this checklist to ensure your environment is properly configured.

## ✅ Initial Setup

- [ ] Clone the repository (or download the files)
- [ ] Navigate to project directory: `cd regxperience-frontend`
- [ ] Ensure Node.js 18+ is installed: `node --version`
- [ ] Ensure npm/pnpm is installed: `npm --version` or `pnpm --version`

## ✅ Dependencies

- [ ] Run `npm install` to install all dependencies
- [ ] Verify installation: `npm list @tanstack/react-query`
- [ ] Should see: `@tanstack/react-query@5.51.0` (or higher)

## ✅ Environment Configuration

- [ ] Copy template: `cp .env.example .env.local`
- [ ] Edit `.env.local` and set:
  ```bash
  NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
  ```
- [ ] Verify backend URL matches your API server location
- [ ] For production, use your production domain

## ✅ Backend Setup

- [ ] Verify backend API is running
- [ ] Check backend URL: `curl http://localhost:3001/templates`
- [ ] Should return JSON (or auth error, but not "connection refused")
- [ ] If using different port, update `NEXT_PUBLIC_BACKEND_URL`

## ✅ Development Server

- [ ] Start dev server: `npm run dev`
- [ ] Should see: "▲ Next.js 16.1.6"
- [ ] Should see: "Local: http://localhost:3000"
- [ ] Open browser to http://localhost:3000
- [ ] Should see: RegXperience home page

## ✅ Verify Functionality

### Home Page

- [ ] Loads without errors
- [ ] Contains three feature cards
- [ ] Links work (Templates, Assessments, etc.)

### Templates Page (`/templates`)

- [ ] Loads without console errors
- [ ] Upload section is visible
- [ ] Templates list appears (may be empty)
- [ ] Can see loading spinner while fetching

### API Integration

- [ ] Open DevTools (F12) → Network tab
- [ ] Visit `/templates`
- [ ] Should see requests to `/api/templates`
- [ ] Request should show Status 200 (success)

## ✅ TypeScript Check

- [ ] No TypeScript errors in console
- [ ] Run: `npx tsc --noEmit` (optional)
- [ ] Should see: "Found X errors" (should be 0)

## ✅ File Structure

Verify these directories exist:

```
regxperience-frontend/
├── app/
│   ├── api/
│   ├── templates/
│   ├── assessments/
│   ├── page.tsx
│   └── layout.tsx
├── components/
│   ├── templates/
│   ├── assessments/
│   └── ui/
├── hooks/
│   ├── useTemplates.ts
│   └── useAssessments.ts
├── providers/
│   └── query-provider.tsx
├── lib/
│   └── utils.ts
└── public/
```

- [ ] `app/` directory exists
- [ ] `components/` directory exists
- [ ] `hooks/` directory exists
- [ ] `providers/` directory exists
- [ ] `public/` directory exists

## ✅ Key Files Verification

- [ ] `package.json` - Dependencies listed
- [ ] `.env.local` - Backend URL configured
- [ ] `app/layout.tsx` - Imports QueryProvider
- [ ] `hooks/useTemplates.ts` - Hook definition exists
- [ ] `app/api/templates/route.ts` - API route exists
- [ ] `components/templates/templates-list.tsx` - Component exists

## ✅ React Query Setup

- [ ] QueryProvider wraps app in `layout.tsx`
- [ ] Hooks use `useQuery` and `useMutation`
- [ ] Queries have `queryKey` arrays
- [ ] API routes forward to backend

## ✅ Component Rendering

Test each major component:

### TemplatesList

- [ ] Renders without error
- [ ] Shows loading state initially
- [ ] Fetches from `/api/templates`
- [ ] Displays templates (or empty state)

### UploadTemplate

- [ ] Drag & drop area visible
- [ ] Select file button works
- [ ] File input accepts .pdf

### AssessmentsList

- [ ] Renders without error
- [ ] Fetches from `/api/assessments`
- [ ] Shows empty state if no assessments

## ✅ Error Handling

- [ ] API route error handling works
- [ ] Component error boundaries display
- [ ] Loading states show spinner
- [ ] Error messages display gracefully

## ✅ Browser Compatibility

- [ ] Chrome/Chromium: ✓ Works
- [ ] Firefox: ✓ Works
- [ ] Safari: ✓ Works
- [ ] Edge: ✓ Works

## ✅ Mobile Responsiveness

- [ ] Page layout adjusts on small screens
- [ ] Typography is readable on mobile
- [ ] Buttons are touch-friendly
- [ ] Open DevTools → Toggle device toolbar (Ctrl+Shift+M)

## ✅ Console Check

Open DevTools (F12) → Console tab and verify:

- [ ] No red errors
- [ ] No "Failed to fetch" warnings
- [ ] No TypeScript errors
- [ ] No 404 errors

## ✅ Network Tab Check

Open DevTools → Network tab and verify:

### Requests to `/api/templates`

```
✓ Status: 200
✓ Method: GET
✓ Response: JSON array
```

### Requests to backend

```
✓ Status: 200 (or expected backend response)
✓ Method: GET/POST/PUT
✓ Headers include Authorization (if set)
```

## ✅ Production Build

- [ ] Run: `npm run build`
- [ ] Should complete without errors
- [ ] `.next/` directory created
- [ ] Run: `npm run start`
- [ ] Should start production server
- [ ] Should be accessible at http://localhost:3000

## ✅ Documentation

- [ ] README.md - Read main documentation
- [ ] ARCHITECTURE.md - Understand architecture
- [ ] DEVELOPER_GUIDE.md - Read quick reference
- [ ] PROJECT_STRUCTURE.md - Know file locations

## ✅ Git Setup (Optional)

- [ ] `git init` - Initialize git repo
- [ ] `.gitignore` includes:
  - [ ] `node_modules/`
  - [ ] `.next/`
  - [ ] `.env.local`
  - [ ] `.env.production.local`
- [ ] `git add .` - Stage files
- [ ] `git commit -m "Initial commit"` - First commit

## ✅ Deployment Prep

For deploying to production:

- [ ] Update `NEXT_PUBLIC_BACKEND_URL` for production
- [ ] Set environment variables in hosting platform
- [ ] Ensure backend API is accessible from production
- [ ] Enable CORS on backend if needed
- [ ] Test production build locally
- [ ] Configure custom domain if needed

## ✅ Troubleshooting

If you encounter issues:

### "Failed to fetch" errors

```
□ Check NEXT_PUBLIC_BACKEND_URL in .env.local
□ Verify backend is running
□ Check backend URL is correct
□ Check CORS settings on backend
□ Check firewall/proxy settings
```

### Port already in use

```
□ Run on different port: npm run dev -- -p 3001
□ Or kill process using port 3000
```

### TypeScript errors

```
□ Run: npm install (reinstall dependencies)
□ Check tsconfig.json is present
□ Delete .next folder and rebuild
```

### Components not rendering

```
□ Check 'use client' directive is present
□ Verify hook is being called
□ Check browser console for errors
□ Verify QueryProvider is in layout.tsx
```

### React Query not working

```
□ Verify @tanstack/react-query is installed
□ Check QueryProvider is wrapping app
□ Verify useQuery/useMutation syntax
□ Check queryKey format (should be array)
```

## ✅ Performance Baseline

After setup, check these metrics:

- [ ] Home page loads in < 2 seconds
- [ ] Templates page API call < 500ms
- [ ] No console errors or warnings
- [ ] Lighthouse score > 80 (run: npm run build + audit)

## ✅ Testing Basics

Manual testing checklist:

### Templates Flow

- [ ] Visit `/templates`
- [ ] See template list (empty or with data)
- [ ] Try uploading a file
- [ ] See loading state

### Assessments Flow

- [ ] Visit `/assessments`
- [ ] See assessments list (empty or with data)
- [ ] Click on an assessment (if available)
- [ ] See assessment details

### Navigation

- [ ] Home → Templates link works
- [ ] Home → Assessments link works
- [ ] Header navigation works
- [ ] Back buttons work

## ✅ Final Verification

Before starting development:

```bash
# 1. All dependencies installed
npm list @tanstack/react-query
npm list next
npm list react

# 2. Development server runs
npm run dev
# Should show: ▲ Next.js 16.1.6 ready in 2.5s

# 3. Production build succeeds
npm run build
# Should complete successfully

# 4. No TypeScript errors
npx tsc --noEmit
# Should show no errors

# 5. All pages load
# http://localhost:3000 - Home
# http://localhost:3000/templates - Templates
# http://localhost:3000/assessments - Assessments
```

## ✅ Documentation Review

Ensure you've read:

- [ ] README.md - Project overview & setup
- [ ] ARCHITECTURE.md - Technical architecture
- [ ] DEVELOPER_GUIDE.md - Quick reference
- [ ] PROJECT_STRUCTURE.md - File organization

## ✅ Ready to Develop!

If all checkboxes are completed, you're ready to:

1. ✅ Start the dev server: `npm run dev`
2. ✅ Open browser: `http://localhost:3000`
3. ✅ Begin coding!

## Quick Reference

### Common Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linter
npm install          # Install dependencies
```

### Key Files to Edit

- Pages: `app/**/*.tsx`
- Components: `components/**/*.tsx`
- Hooks: `hooks/*.ts`
- API Routes: `app/api/**/*.ts`

### Key Directories

- Pages: `/app`
- Components: `/components`
- Hooks: `/hooks`
- Providers: `/providers`
- API: `/app/api`

### Environment Setup

- Copy: `cp .env.example .env.local`
- Edit: `NEXT_PUBLIC_BACKEND_URL=...`

---

**Status**: ⏳ Setup in progress
**Last Updated**: Today

Once complete, mark this as:
**Status**: ✅ Ready for Development
