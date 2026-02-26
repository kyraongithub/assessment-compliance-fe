# RegXperience Frontend

A Next.js frontend application for the RegXperience compliance assessment platform. Built with **App Router**, **TanStack React Query**, and **shadcn/ui**.

## Architecture Overview

This frontend follows a clean architecture pattern with separation of concerns:

```
app/                          # Next.js App Router pages & layouts
├── api/                      # API routes (proxies to backend)
├── templates/                # Templates listing & management pages
├── assessments/              # Assessment pages
└── page.tsx                  # Home page

components/                   # Reusable UI components
├── templates/                # Template-specific components
├── assessments/              # Assessment-specific components
└── ui/                       # shadcn/ui base components

hooks/                        # Custom React Query hooks
├── useTemplates.ts           # Template data fetching
└── useAssessments.ts         # Assessment & submission data fetching

providers/                    # Context providers
└── query-provider.tsx        # React Query configuration

lib/                          # Utility functions
utils.ts                      # Common utilities
```

## Key Technologies

| Technology               | Purpose                                              |
| ------------------------ | ---------------------------------------------------- |
| **Next.js 16**           | Framework with App Router & API Routes               |
| **React 19**             | UI library                                           |
| **TanStack React Query** | Client-side data fetching, caching & synchronization |
| **shadcn/ui**            | High-quality UI components                           |
| **TypeScript**           | Type safety                                          |

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Components                         │
│         (e.g., TemplatesList, AssessmentForm)              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ (import & use)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Custom Hooks (React Query)                     │
│      useTemplates(), useAssessments(), etc.                │
│                                                             │
│  - useQuery() for fetching data                            │
│  - useMutation() for modifying data                        │
│  - Automatic caching & revalidation                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ (fetch calls)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         Next.js API Routes (BFF Pattern)                   │
│      /api/templates, /api/assessments, etc.                │
│                                                             │
│  - Proxy requests to backend                              │
│  - Handle authentication headers                           │
│  - Forward errors gracefully                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ (forward request)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│          Backend API (NestJS/Node.js)                      │
│   NEXT_PUBLIC_BACKEND_URL environment variable                     │
│                                                             │
│  - /templates (GET) - List all templates                   │
│  - /templates/:id (GET) - Get template details             │
│  - /templates/upload (POST) - Upload PDF                   │
│  - /assessments (GET/POST) - Assessments CRUD              │
│  - /submissions (PUT) - Save submissions                   │
│  - /submissions/:id/review (PUT) - Review submission       │
└─────────────────────────────────────────────────────────────┘
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This will install:

- `@tanstack/react-query` - Data fetching and caching
- All shadcn/ui components
- Next.js 16 and React 19

### 2. Environment Variables

Create a `.env.local` file:

```bash
# Backend API URL (default: http://localhost:3001)
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

**Important:** The frontend API routes proxy to this backend URL. Make sure your backend is running before testing.

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Project Structure

### Custom Hooks (`hooks/`)

These hooks encapsulate all data fetching logic using React Query:

#### `useTemplates.ts`

```typescript
// Fetch all templates
useTemplates() -> { data, isLoading, error }

// Fetch single template
useTemplate(templateId) -> { data, isLoading, error }

// Upload PDF and process
useUploadTemplate() -> { mutate, isPending }
```

#### `useAssessments.ts`

```typescript
// Fetch user assessments
useAssessments() -> { data, isLoading, error }

// Fetch single assessment
useAssessment(assessmentId) -> { data, isLoading, error }

// Create assessment from template
useCreateAssessment() -> { mutate, isPending }

// Save submission response
useUpdateSubmission() -> { mutate, isPending }

// Review submission (admin)
useReviewSubmission() -> { mutate, isPending }
```

### API Routes (`app/api/`)

All routes follow the BFF (Backend for Frontend) pattern:

```
GET  /api/templates              -> GET {NEXT_PUBLIC_BACKEND_URL}/templates
GET  /api/templates/[id]         -> GET {NEXT_PUBLIC_BACKEND_URL}/templates/[id]
POST /api/templates/upload       -> POST {NEXT_PUBLIC_BACKEND_URL}/templates/upload

GET  /api/assessments            -> GET {NEXT_PUBLIC_BACKEND_URL}/assessments
POST /api/assessments            -> POST {NEXT_PUBLIC_BACKEND_URL}/assessments
GET  /api/assessments/[id]       -> GET {NEXT_PUBLIC_BACKEND_URL}/assessments/[id]

PUT  /api/submissions            -> PUT {NEXT_PUBLIC_BACKEND_URL}/submissions
PUT  /api/submissions/[id]/review -> PUT {NEXT_PUBLIC_BACKEND_URL}/submissions/[id]/review
```

### Components

#### Template Components (`components/templates/`)

- **`templates-list.tsx`** - Displays all templates with status badges
  - Uses `useTemplates()` hook
  - Shows template details and start assessment button
  - Handles loading and error states

- **`upload-template.tsx`** - Drag-and-drop PDF upload
  - Uses `useUploadTemplate()` hook
  - File validation (PDF only)
  - Drag & drop support
  - Toast notifications

#### Assessment Components (`components/assessments/`)

- **`assessments-list.tsx`** - Lists user assessments
  - Uses `useAssessments()` hook
  - Shows assessment status
  - Links to assessment detail page

- **`assessment-form.tsx`** - Compliance assessment form
  - Uses `useAssessment()` and `useTemplate()` hooks
  - Displays requirements by category
  - Collects implementation details and evidence links
  - Uses `useUpdateSubmission()` for saving

### Pages

- **`/`** - Home page with feature overview
- **`/templates`** - Browse and upload templates
- **`/assessments`** - View user assessments
- **`/assessments/[id]`** - Assessment detail and form

## React Query Configuration

The `QueryProvider` in `providers/query-provider.tsx` configures React Query with:

```typescript
{
  staleTime: 1000 * 60 * 5,      // Data fresh for 5 minutes
  gcTime: 1000 * 60 * 10,        // Keep cache for 10 minutes after unused
  retry: 1,                       // Retry failed requests once
}
```

This means:

- Data is automatically refetched when it becomes stale
- Queries are automatically garbage collected after 10 minutes
- Failed requests are retried once automatically
- Components automatically share cached data

## Usage Examples

### Using a Custom Hook in a Component

```typescript
'use client'

import { useTemplates } from '@/hooks/useTemplates'

export function MyComponent() {
  const { data, isLoading, error } = useTemplates()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return <div>{data?.map(t => <p key={t.id}>{t.title}</p>)}</div>
}
```

### Mutating Data

```typescript
'use client'

import { useUpdateSubmission } from '@/hooks/useAssessments'

export function SaveButton() {
  const { mutate, isPending } = useUpdateSubmission()

  const handleSave = () => {
    mutate(
      {
        assessmentId: 'abc123',
        requirementId: 'req456',
        implementationDetail: 'We do this by...',
        evidenceLink: 'https://...',
      },
      {
        onSuccess: () => console.log('Saved!'),
        onError: (err) => console.error(err),
      }
    )
  }

  return <button onClick={handleSave} disabled={isPending}>
    {isPending ? 'Saving...' : 'Save'}
  </button>
}
```

## API Proxy Pattern

Each API route is a thin proxy that:

1. **Accepts client request** - from React component via fetch
2. **Validates input** - checks file types, required fields
3. **Forwards request** - to backend with auth headers
4. **Handles errors** - gracefully returns errors
5. **Returns response** - JSON to client

Example:

```typescript
// /app/api/templates/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const response = await fetch(`${BACKEND_URL}/templates/${id}`, {
    headers: {
      Authorization: request.headers.get("authorization") || "",
    },
  });

  return NextResponse.json(await response.json());
}
```

## Best Practices Implemented

✅ **Separation of Concerns**

- Hooks handle data fetching
- Components handle rendering
- API routes handle proxying

✅ **Type Safety**

- Full TypeScript support
- Interfaces for all data types
- Type-safe hook returns

✅ **Error Handling**

- Try-catch blocks in API routes
- Error state handling in components
- User-friendly error messages

✅ **Loading States**

- Spinner components during fetch
- Disabled buttons during mutations
- Skeleton/placeholder content

✅ **Caching & Performance**

- React Query automatic caching
- Query invalidation on mutations
- Stale-while-revalidate pattern

✅ **Accessibility**

- Semantic HTML (buttons, labels, links)
- ARIA attributes where needed
- Keyboard navigation support

## Troubleshooting

### "Failed to fetch" errors

1. Check `NEXT_PUBLIC_BACKEND_URL` environment variable
2. Ensure backend is running at that URL
3. Check browser console for CORS errors
4. Verify authentication headers if needed

### React Query cache issues

- Clear browser cache and restart dev server
- Check React Query DevTools: `npx react-query-devtools`
- Verify `queryKey` in hooks matches the endpoint

### Components not updating

- Ensure you're using `'use client'` directive in client components
- Check that mutations call `queryClient.invalidateQueries()`
- Verify data is being returned from API

## Resources

- [Next.js App Router Documentation](https://nextjs.org/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [shadcn/ui Components](https://ui.shadcn.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
