# Developer Quick Reference Guide

## Quick Start (5 minutes)

### 1. Setup

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your backend URL
npm run dev
```

### 2. Open Browser

- Frontend: http://localhost:3000
- Backend should be running at: http://localhost:3001 (or your NEXT_PUBLIC_BACKEND_URL)

### 3. Start Coding

- Edit components in `components/`
- Edit pages in `app/`
- Edit hooks in `hooks/`

---

## Adding a New Feature

### Step 1: Create the Hook

```typescript
// hooks/useMyFeature.ts
import { useQuery, useMutation } from "@tanstack/react-query";

export function useMyFeature(id: string) {
  return useQuery({
    queryKey: ["myFeature", id],
    queryFn: async () => {
      const res = await fetch(`/api/my-feature/${id}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!id, // Only run if id exists
  });
}
```

### Step 2: Create the API Route

```typescript
// app/api/my-feature/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const response = await fetch(`${BACKEND_URL}/my-feature/${id}`, {
      headers: {
        Authorization: request.headers.get("authorization") || "",
      },
    });

    if (!response.ok) throw new Error(`Backend returned ${response.status}`);
    return NextResponse.json(await response.json());
  } catch (error) {
    console.error("[API] GET /my-feature/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
```

### Step 3: Create the Component

```typescript
'use client'

import { useMyFeature } from '@/hooks/useMyFeature'
import { Loader2 } from 'lucide-react'

export function MyFeatureComponent({ id }: { id: string }) {
  const { data, isLoading, error } = useMyFeature(id)

  if (isLoading) return <Loader2 className="animate-spin" />
  if (error) return <div>Error loading feature</div>

  return <div>{data?.title}</div>
}
```

### Step 4: Use in a Page

```typescript
// app/my-feature/page.tsx
import { MyFeatureComponent } from '@/components/my-feature'

export default function MyFeaturePage() {
  return (
    <div>
      <h1>My Feature</h1>
      <MyFeatureComponent id="123" />
    </div>
  )
}
```

---

## Common Tasks

### Display a List with React Query

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'

export function ItemList() {
  const { data: items, isLoading } = useQuery({
    queryKey: ['items'],
    queryFn: () => fetch('/api/items').then(r => r.json()),
  })

  return (
    <ul>
      {items?.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  )
}
```

### Handle Form Submission

```typescript
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'

export function MyForm() {
  const [title, setTitle] = useState('')
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: { title: string }) => {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create')
      return res.json()
    },
    onSuccess: () => {
      toast.success('Created!')
      setTitle('')
      // Refetch the list
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
    onError: () => {
      toast.error('Failed to create')
    },
  })

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      mutate({ title })
    }}>
      <input value={title} onChange={e => setTitle(e.target.value)} />
      <button disabled={isPending} type="submit">
        {isPending ? 'Creating...' : 'Create'}
      </button>
    </form>
  )
}
```

### Show Loading and Error States

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'

export function MyComponent() {
  const { data, isLoading, error, isError } = useQuery({
    queryKey: ['data'],
    queryFn: () => fetch('/api/data').then(r => r.json()),
  })

  if (isLoading) {
    return <Loader2 className="animate-spin" />
  }

  if (isError) {
    return <div className="text-red-500">Error: {error?.message}</div>
  }

  return <div>{data?.name}</div>
}
```

### Dependent Queries

```typescript
export function UserProfile({ userId }: { userId: string }) {
  // First query
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetch(`/api/users/${userId}`).then(r => r.json()),
  })

  // Second query waits for first
  const { data: posts } = useQuery({
    queryKey: ['posts', user?.id],
    queryFn: () => fetch(`/api/posts?userId=${user.id}`).then(r => r.json()),
    enabled: !!user?.id, // Only run if user exists
  })

  return (
    <div>
      <h1>{user?.name}</h1>
      {posts?.map(post => <div key={post.id}>{post.title}</div>)}
    </div>
  )
}
```

### File Upload

```typescript
'use client'

import { useMutation } from '@tanstack/react-query'
import { useRef } from 'react'

export function FileUpload() {
  const inputRef = useRef<HTMLInputElement>(null)

  const { mutate, isPending } = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      return res.json()
    },
  })

  return (
    <input
      ref={inputRef}
      type="file"
      onChange={(e) => {
        if (e.target.files?.[0]) {
          mutate(e.target.files[0])
        }
      }}
      disabled={isPending}
    />
  )
}
```

---

## API Route Pattern

All API routes follow this pattern:

```typescript
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export async function GET(request: NextRequest) {
  try {
    // 1. Get request data
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    // 2. Validate
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    // 3. Call backend
    const response = await fetch(`${BACKEND_URL}/resource/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: request.headers.get("authorization") || "",
      },
    });

    // 4. Handle backend errors
    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    // 5. Return to frontend
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/resource`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: request.headers.get("authorization") || "",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error("Backend error");

    return NextResponse.json(await response.json(), { status: 201 });
  } catch (error) {
    console.error("[API] POST error:", error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
```

---

## File Structure Guide

### New Hook?

Add to `hooks/useMyFeature.ts`

### New API Endpoint?

Add to `app/api/my-feature/route.ts`

### New Page?

Add to `app/my-feature/page.tsx`

### New Reusable Component?

Add to `components/my-feature/component-name.tsx`

### One-off Component (only for one page)?

Keep in the same page file or co-locate with the feature

---

## Debugging

### React Query DevTools

```bash
npm install @tanstack/react-query-devtools
```

```typescript
// providers/query-provider.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

### Console Logs

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ["items"],
  queryFn: async () => {
    const res = await fetch("/api/items");
    console.log("API Response:", res);
    return res.json();
  },
});

useEffect(() => {
  console.log("Data updated:", data);
}, [data]);
```

### Check Network Requests

- Open DevTools → Network tab
- See all requests to `/api/*`
- Click to see request/response body

---

## TypeScript Tips

### Define Data Types

```typescript
export interface Template {
  id: string;
  title: string;
  status: "PROCESSING" | "AVAILABLE" | "FAILED";
}

export function useTemplate(id: string) {
  return useQuery<Template>({
    queryKey: ["template", id],
    queryFn: () => fetch(`/api/templates/${id}`).then((r) => r.json()),
  });
}
```

### Use zod for Validation

```typescript
import { z } from "zod";

const TemplateSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(["PROCESSING", "AVAILABLE", "FAILED"]),
});

type Template = z.infer<typeof TemplateSchema>;
```

---

## Common Errors

| Error                  | Fix                                    |
| ---------------------- | -------------------------------------- |
| "Failed to fetch"      | Check NEXT_PUBLIC_BACKEND_URL env var  |
| Component not updating | Use `'use client'` directive           |
| Query not refetching   | Call `queryClient.invalidateQueries()` |
| TypeScript errors      | Check types match interfaces           |
| Infinite requests      | Check `enabled` condition on query     |

---

## Performance Tips

1. **Enable query caching** - Data is cached automatically
2. **Use `enabled` condition** - Don't fetch when not needed
3. **Debounce search** - Use `useEffect` with delay for search inputs
4. **Paginate large lists** - Don't load all at once
5. **Use React.memo** - Prevent unnecessary re-renders
6. **Split code** - Pages are automatically code-split

---

## Useful Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

---

## Resources

- [React Query Docs](https://tanstack.com/query/latest)
- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

---

## Need Help?

1. Check existing hooks in `hooks/`
2. Check similar components in `components/`
3. Check similar API routes in `app/api/`
4. Read ARCHITECTURE.md for detailed explanations
5. Check browser DevTools → Network & Console tabs
