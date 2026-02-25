# RegXperience Frontend Architecture

This document explains the architecture and design patterns used in the RegXperience frontend.

## Overview

The RegXperience frontend is a **full-stack Next.js application** that follows the **Backend-for-Frontend (BFF) pattern**. This means:

1. **React components** (client-side) use custom hooks
2. **Custom hooks** (client-side) call Next.js API routes
3. **API routes** (server-side) proxy requests to the backend
4. **Backend** serves the actual data and business logic

This architecture provides several benefits:

- ✅ Decoupled frontend from backend (can be deployed independently)
- ✅ Centralized error handling and authentication
- ✅ Ability to transform data before sending to frontend
- ✅ Built-in rate limiting and security at the API gateway layer
- ✅ Server-side caching opportunities

## Technology Stack

### Frontend (Client-Side)

- **React 19** - UI library with hooks
- **Next.js 16 (App Router)** - Framework & routing
- **TanStack React Query** - Data fetching, caching, synchronization
- **shadcn/ui** - Pre-built UI components
- **TypeScript** - Type safety

### Backend (Server-Side)

- **Next.js API Routes** - REST endpoints (BFF pattern)
- **Node.js** - JavaScript runtime

### External API

- **RegXperience Backend** - NestJS/Node.js API
  - PostgreSQL database
  - BullMQ for queue processing
  - OpenAI for AI features
  - Pusher for real-time events

## Data Flow Diagram

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                             FRONTEND LAYER                                   │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ React Components (Client-Side - Browser)                              │ │
│  │                                                                        │ │
│  │  - TemplatesList                                                     │ │
│  │  - UploadTemplate                                                    │ │
│  │  - AssessmentsList                                                   │ │
│  │  - AssessmentForm                                                    │ │
│  │                                                                        │ │
│  │  (All marked with 'use client' directive)                            │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                     │                                        │
│                                     │ import & call                          │
│                                     ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ Custom Hooks (Client-Side - React Query)                             │ │
│  │                                                                        │ │
│  │  useTemplates()          ──┐                                         │ │
│  │  useTemplate(id)         ──┤                                         │ │
│  │  useUploadTemplate()     ──┤                                         │ │
│  │  useAssessments()        ──┤                                         │ │
│  │  useAssessment(id)       ──┤  fetch() to /api/...                   │ │
│  │  useCreateAssessment()   ──┤                                         │ │
│  │  useUpdateSubmission()   ──┤                                         │ │
│  │  useReviewSubmission()   ──┘                                         │ │
│  │                                                                        │ │
│  │ - Manages query cache                                                │ │
│  │ - Handles loading/error states                                       │ │
│  │ - Invalidates queries on mutations                                   │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
                 Network Request               (HTTP/JSON)
                    │                                 │
┌───────────────────────────────────────────────────────────────────────────────┐
│                         NEXT.JS API LAYER (BFF)                              │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ API Routes (Server-Side - Node.js)                                    │ │
│  │                                                                        │ │
│  │  POST   /api/templates/upload          req ──→ fetch ──→ backend     │ │
│  │  GET    /api/templates                 req ──→ fetch ──→ backend     │ │
│  │  GET    /api/templates/[id]            req ──→ fetch ──→ backend     │ │
│  │                                                                        │ │
│  │  POST   /api/assessments               req ──→ fetch ──→ backend     │ │
│  │  GET    /api/assessments               req ──→ fetch ──→ backend     │ │
│  │  GET    /api/assessments/[id]          req ──→ fetch ──→ backend     │ │
│  │                                                                        │ │
│  │  PUT    /api/submissions               req ──→ fetch ──→ backend     │ │
│  │  PUT    /api/submissions/[id]/review   req ──→ fetch ──→ backend     │ │
│  │                                                                        │ │
│  │ Each route:                                                          │ │
│  │ 1. Receives request from frontend                                    │ │
│  │ 2. Validates input                                                   │ │
│  │ 3. Forwards to backend with auth headers                             │ │
│  │ 4. Handles errors gracefully                                         │ │
│  │ 5. Returns response to frontend                                      │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ HTTP Request to NEXT_PUBLIC_BACKEND_URL
                                     ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                        BACKEND API LAYER                                      │
│                  (NestJS - separate deployment)                               │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ REST Endpoints (Business Logic)                                       │ │
│  │                                                                        │ │
│  │  POST   /templates/upload      → BullMQ queue → AI Processing        │ │
│  │  GET    /templates             → DB query                            │ │
│  │  GET    /templates/:id         → DB query                            │ │
│  │                                                                        │ │
│  │  POST   /assessments           → Create record                       │ │
│  │  GET    /assessments           → DB query                            │ │
│  │  GET    /assessments/:id       → DB query with joins                 │ │
│  │                                                                        │ │
│  │  PUT    /submissions           → Upsert record                       │ │
│  │  PUT    /submissions/:id/review → Update status                      │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                     │                                        │
│                              DB Queries                                      │
│                                     │                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ PostgreSQL Database (Prisma ORM)                                      │ │
│  │                                                                        │ │
│  │  - User                                                              │ │
│  │  - AssessmentTemplate                                               │ │
│  │  - Category                                                         │ │
│  │  - Requirement                                                      │ │
│  │  - Assessment                                                       │ │
│  │  - Submission                                                       │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ External Services                                                     │ │
│  │                                                                        │ │
│  │  - Redis (BullMQ queue)                                              │ │
│  │  - OpenAI API (AI Requirements Extraction)                           │ │
│  │  - Pusher (Real-time notifications)                                  │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────────┘
```

## File Structure

```
regxperience-frontend/
├── app/
│   ├── api/                    # Next.js API Routes (BFF)
│   │   ├── templates/
│   │   │   ├── route.ts        # GET /api/templates, POST can be added
│   │   │   ├── [id]/
│   │   │   │   └── route.ts    # GET /api/templates/[id]
│   │   │   └── upload/
│   │   │       └── route.ts    # POST /api/templates/upload
│   │   ├── assessments/
│   │   │   ├── route.ts        # GET/POST /api/assessments
│   │   │   └── [id]/
│   │   │       └── route.ts    # GET /api/assessments/[id]
│   │   └── submissions/
│   │       ├── route.ts        # PUT /api/submissions
│   │       └── [id]/
│   │           └── review/
│   │               └── route.ts # PUT /api/submissions/[id]/review
│   │
│   ├── templates/
│   │   └── page.tsx            # /templates page
│   ├── assessments/
│   │   ├── page.tsx            # /assessments page
│   │   └── [id]/
│   │       └── page.tsx        # /assessments/[id] page
│   │
│   ├── layout.tsx              # Root layout with QueryProvider
│   ├── page.tsx                # / home page
│   └── globals.css             # Global styles
│
├── components/
│   ├── templates/
│   │   ├── templates-list.tsx  # List all templates
│   │   └── upload-template.tsx # PDF upload form
│   ├── assessments/
│   │   ├── assessments-list.tsx    # List user assessments
│   │   └── assessment-form.tsx     # Assessment form with submissions
│   └── ui/                     # shadcn/ui base components
│
├── hooks/
│   ├── useTemplates.ts         # Custom React Query hooks for templates
│   └── useAssessments.ts       # Custom React Query hooks for assessments
│
├── providers/
│   └── query-provider.tsx      # React Query client provider
│
├── lib/
│   └── utils.ts                # Utility functions
│
├── public/                     # Static assets
│
├── .env.example                # Environment variables template
├── next.config.mjs             # Next.js configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies
└── README.md                   # Main documentation
```

## Detailed Component Architecture

### 1. Custom Hooks (React Query)

Custom hooks encapsulate all data fetching and state management:

```typescript
// hooks/useTemplates.ts
export function useTemplates() {
  return useQuery({
    queryKey: ["templates"],
    queryFn: () => fetch("/api/templates").then((r) => r.json()),
  });
}
```

**Benefits:**

- ✅ Single source of truth for each data type
- ✅ Automatic caching and invalidation
- ✅ Easy to test and reuse
- ✅ Standardized error handling
- ✅ Loading states built-in

### 2. API Routes (BFF Pattern)

API routes act as a backend-for-frontend layer:

```typescript
// app/api/templates/route.ts
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/templates`, {
      headers: {
        Authorization: request.headers.get("authorization") || "",
      },
    });
    return NextResponse.json(await response.json());
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
```

**Benefits:**

- ✅ Centralized error handling
- ✅ Request validation
- ✅ Response transformation
- ✅ Authentication/authorization checks
- ✅ CORS handling
- ✅ Rate limiting (can be added)

### 3. React Components

Components use hooks and render UI:

```typescript
'use client'

import { useTemplates } from '@/hooks/useTemplates'

export function TemplatesList() {
  const { data, isLoading, error } = useTemplates()

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />

  return (
    <div>
      {data?.map(template => (
        <TemplateCard key={template.id} template={template} />
      ))}
    </div>
  )
}
```

**Benefits:**

- ✅ Clean separation: hooks handle data, components handle rendering
- ✅ Easy to test
- ✅ Reusable across multiple pages
- ✅ Consistent error and loading states

## Data Fetching Flow

### Example: Loading Templates

1. **Component renders** with `useTemplates()` hook
2. **React Query checks cache** - is there fresh data?
   - If yes: return cached data immediately
   - If no: proceed to step 3
3. **Hook calls** `fetch('/api/templates')`
4. **Browser sends** GET request to `/api/templates`
5. **Next.js API route** receives request and validates
6. **API route calls** `fetch('${BACKEND_URL}/templates')`
7. **Backend processes** the request and returns data
8. **API route** returns response to browser
9. **React Query** receives data and updates cache
10. **Component** re-renders with new data
11. **User sees** the templates

### Example: Mutation (Updating Data)

1. **User clicks** "Save" button in form
2. **Component calls** `updateSubmission()` mutation
3. **React Query** sets `isPending` to true
4. **Hook calls** `fetch('/api/submissions', { method: 'PUT', body: ... })`
5. **Browser sends** PUT request to `/api/submissions`
6. **Next.js API route** validates and forwards to backend
7. **Backend** saves the submission and returns updated record
8. **API route** returns success response
9. **React Query** invalidates related queries (e.g., `assessments`)
10. **Related queries** automatically refetch
11. **Components** re-render with new data
12. **User sees** success toast notification

## Query Keys Strategy

React Query uses `queryKey` arrays to organize cache:

```typescript
// Templates queries
["templates"][("template", id)][ // List of all templates // Single template details
  // Assessments queries
  "assessments"
][("assessment", id)][ // List of user assessments // Single assessment details
  // Submissions
  ("submission", id)
]; // Single submission
```

When mutating data, we invalidate related queries:

```typescript
// After uploading a template
queryClient.invalidateQueries({ queryKey: ["templates"] });

// After updating submission
queryClient.invalidateQueries({ queryKey: ["assessment", assessmentId] });
queryClient.invalidateQueries({ queryKey: ["assessments"] });
```

## Error Handling Strategy

### Frontend Level

```typescript
const { data, error, isLoading } = useTemplates()

if (error) {
  return <ErrorAlert message="Failed to load templates" />
}
```

### API Route Level

```typescript
try {
  const response = await fetch(...)
  if (!response.ok) throw new Error(...)
  return NextResponse.json(data)
} catch (error) {
  return NextResponse.json(
    { error: 'Failed to fetch' },
    { status: 500 }
  )
}
```

### User Feedback

```typescript
mutate(data, {
  onSuccess: () => toast.success("Saved!"),
  onError: () => toast.error("Failed to save"),
});
```

## Performance Optimizations

### 1. Query Caching

```typescript
staleTime: 1000 * 60 * 5; // 5 min - data stays fresh
gcTime: 1000 * 60 * 10; // 10 min - keep in memory
```

### 2. Code Splitting

Each page is a separate bundle loaded on demand.

### 3. Image Optimization

Next.js automatically optimizes images.

### 4. Hydration

API responses are cached to prevent unnecessary refetches.

## Security Considerations

1. **Authentication Headers** - API routes forward auth headers to backend
2. **CORS** - Configured in backend API
3. **Validation** - API routes validate file types, sizes
4. **Error Messages** - Generic messages to users, detailed logs internally

## Testing Strategy

### Unit Tests (Hooks)

```typescript
describe("useTemplates", () => {
  it("should fetch templates", async () => {
    // Mock fetch
    // Test hook behavior
  });
});
```

### Integration Tests (Components)

```typescript
describe("TemplatesList", () => {
  it("should display templates", async () => {
    // Render component
    // Mock API responses
    // Assert templates are displayed
  });
});
```

### E2E Tests

```typescript
describe("Template Workflow", () => {
  it("should create assessment from template", async () => {
    // Visit /templates
    // Click start assessment
    // Verify assessment created
  });
});
```

## Deployment

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm run start
```

### Environment Variables

Set `NEXT_PUBLIC_BACKEND_URL` to your production backend URL.

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
CMD ["npm", "start"]
```

## Common Patterns

### Fetching Related Data

```typescript
const { data: assessment } = useAssessment(id);
const { data: template } = useTemplate(assessment?.templateId);

// Second query waits for first to have data
```

### Optimistic Updates

```typescript
mutate(data, {
  onMutate: async (data) => {
    // Optimistically update cache
    await queryClient.cancelQueries({ queryKey: ["submissions"] });
    const prev = queryClient.getQueryData(["submissions"]);
    queryClient.setQueryData(["submissions"], (old) => [...old, data]);
    return { prev };
  },
  onError: (err, _, ctx) => {
    // Rollback on error
    queryClient.setQueryData(["submissions"], ctx?.prev);
  },
});
```

### Infinite Queries (Pagination)

```typescript
const { data, hasNextPage, fetchNextPage } = useInfiniteQuery({
  queryKey: ["templates"],
  queryFn: ({ pageParam }) => fetch(`/api/templates?page=${pageParam}`),
  initialPageParam: 1,
  getNextPageParam: (last) => last.nextPage,
});
```

## Troubleshooting

### Query not updating after mutation

- ✅ Ensure `queryClient.invalidateQueries()` is called
- ✅ Verify `queryKey` matches exactly

### Stale data showing

- ✅ Check `staleTime` configuration
- ✅ Manually call `refetch()` if needed

### API route not forwarding headers

- ✅ Verify `Authorization` header is being passed
- ✅ Check CORS configuration on backend

### Components not re-rendering

- ✅ Ensure component has `'use client'` directive
- ✅ Check that hook is being called
- ✅ Verify QueryProvider is wrapping the component tree

## Future Enhancements

1. **Caching** - Add Redis caching in API routes
2. **Rate Limiting** - Implement rate limiting middleware
3. **Request Logging** - Log all API requests for debugging
4. **Monitoring** - Add error tracking (Sentry)
5. **Analytics** - Track user behavior
6. **Offline Support** - Add service workers for offline access
7. **Real-time Updates** - WebSocket connection for live notifications
